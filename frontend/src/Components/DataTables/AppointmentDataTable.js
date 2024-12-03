import React, { useContext } from 'react';
import { DataContext } from '../../App';

const AppointmentDataTable = () => {
    const { allBookedAppointments } = useContext(DataContext);

    const handleJoinMeeting = async (appointment) => {
        try {
            console.log(appointment);
    
            // Combine `date` and `time` into a valid ISO 8601 string
            const [startHour, startMinute, amPm] = appointment.time.split(/[:\s]/); // Split time into parts
            let hours = parseInt(startHour, 10);
            if (amPm.toUpperCase() === 'PM' && hours !== 12) {
                hours += 12; // Convert PM to 24-hour format
            } else if (amPm.toUpperCase() === 'AM' && hours === 12) {
                hours = 0; // Handle 12 AM as midnight
            }
            const formattedTime = `${String(hours).padStart(2, '0')}:${startMinute}:00`; // HH:mm:ss
            const startTime = new Date(`${appointment.date}T${formattedTime}`).toISOString();
    
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/start_meeting`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appointmentId: appointment._id,
                    topic: appointment.patientInfo.name+appointment.apId,
                    startTime,
                    duration: 60 
                })
            });
            const data = await response.json();
            console.log('Meeting started:', data);
    
            // Uncomment to open the meeting link in a new tab
            // window.open(appointment.meetLink, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('Error starting meeting:', error);
        }
    };

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