import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from '../../App';

const AppointmentDataTable = () => {
    const { allBookedAppointments } = useContext(DataContext);

    /**
     * Join a meeting by creating a Zoom meeting and opening it in a new tab
     * @param {Object} appointment - The appointment object with the date and time
     * @returns {Promise<void>}
     */
    const handleJoinMeeting = async (appointment) => {
        try {
            // Parse date and time more carefully
            const [startHour, startMinute, amPm] = appointment.time.split(/[:\s]/);
            let hours = parseInt(startHour, 10);
            
            // Convert to 24-hour format
            if (amPm.toUpperCase() === 'PM' && hours !== 12) {
                hours += 12;
            } else if (amPm.toUpperCase() === 'AM' && hours === 12) {
                hours = 0;
            }

            // Create date object and handle timezone
            const [year, month, day] = appointment.date.split('-');
            const meetingDate = new Date(
                parseInt(year, 10),
                parseInt(month, 10) - 1, // Month is 0-based
                parseInt(day, 10),
                hours,
                parseInt(startMinute, 10)
            );

            // Ensure valid date before converting to ISO
            if (isNaN(meetingDate.getTime())) {
                throw new Error('Invalid date/time values');
            }

            const startTime = meetingDate.toISOString();
            console.log('Formatted start time:', startTime); // Debug log

            // First create the meeting
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/start_meeting`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appointmentId: appointment._id,
                    topic: `${appointment.patientInfo.name}-${appointment.apId}`,
                    startTime,
                    duration: 60
                })
            });
            const data = await response.json();
            
            if (!data.success) {
                console.error('Failed to create meeting:', data.error);
                return;
            }

            // Open meeting in new tab
            window.open(data.meeting.joinUrl, '_blank', 'noopener,noreferrer');

            // Wait 5 seconds for meeting to open before creating bot
            setTimeout(async () => {
                try {
                    const botResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/create_meeting_bot`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            appointmentId: appointment._id
                        })
                    });
                    
                    const botData = await botResponse.json();
                    if (!botData.success) {
                        console.error('Failed to create meeting bot:', botData.error);
                    }

                    // Start polling for transcript after 30 seconds
                    setTimeout(async () => {
                        try {
                            const transcriptResponse = await fetch(
                                `${process.env.REACT_APP_BASE_URL}/get_transcript/${appointment._id}`
                            );
                            const transcriptData = await transcriptResponse.json();
                            
                            if (transcriptData.success) {
                                console.log('Transcript retrieved successfully');
                            } else {
                                console.error('Failed to get transcript:', transcriptData.error);
                            }
                        } catch (transcriptError) {
                            console.error('Error getting transcript:', transcriptError);
                        }
                    }, 30000); // Wait 30 seconds before getting transcript

                } catch (botError) {
                    console.error('Error creating meeting bot:', botError);
                }
            }, 5000);

        } catch (error) {
            console.error('Error starting meeting:', error);
        }
    };

    // Add a function to display the transcript
    const ViewTranscript = ({ appointmentId }) => {
        const [transcript, setTranscript] = useState('');
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);

        useEffect(() => {
            const getTranscript = async () => {
                try {
                    setLoading(true);
                    const response = await fetch(
                        `${process.env.REACT_APP_BASE_URL}/get_transcript/${appointmentId}`
                    );
                    const data = await response.json();
                    
                    if (data.success) {
                        setTranscript(data.transcript);
                    } else {
                        setError(data.error);
                    }
                } catch (err) {
                    setError('Failed to fetch transcript');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };

            if (appointmentId) {
                getTranscript();
            }
        }, [appointmentId]);

        if (loading) return <div>Loading transcript...</div>;
        if (error) return <div>Error: {error}</div>;
        if (!transcript) return <div>No transcript available</div>;

        return (
            <div className="transcript-viewer">
                <pre className="transcript-text">
                    {transcript}
                </pre>
            </div>
        );
    };

    // Add some CSS for the transcript viewer
    const styles = `
    .transcript-viewer {
        margin-top: 20px;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background-color: #f9f9f9;
    }

    .transcript-text {
        white-space: pre-wrap;
        font-family: monospace;
        font-size: 14px;
        line-height: 1.5;
        max-height: 300px;
        overflow-y: auto;
    }
    `;

    return (
        <div className="table-responsive">
            <table className="table table-borderless">
                <thead>
                    <tr>
                        <th className="text-secondary">Sr No</th>
                        <th className="text-secondary">Date</th>
                        <th className="text-secondary">Time</th>
                        <th className="text-secondary">Name</th>
                        <th className="text-secondary">Appointment</th>
                        <th className="text-secondary">Status</th>
                        <th className="text-secondary">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {allBookedAppointments.map((appointment, index) => (
                        <tr key={appointment._id}>
                            <td>{index + 1}</td>
                            <td>{appointment.date}</td>
                            <td>{appointment.time}</td>
                            <td>{appointment.patientInfo.name}</td>
                            <td>{appointment.apId}</td>
                            <td>
                                <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                                    {appointment.status}
                                </span>
                            </td>
                            <td>
                                {appointment.meetLink && (
                                    <button
                                        onClick={() => handleJoinMeeting(appointment)}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Join Meeting
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'bg-warning';
        case 'confirmed':
            return 'bg-success';
        case 'cancelled':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
};

export default AppointmentDataTable;