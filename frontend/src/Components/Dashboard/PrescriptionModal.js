import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from 'react-modal';
import { DataContext } from '../../App';

const PrescriptionModal = (props) => {
    const ContextData = useContext(DataContext);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [meetingSummary, setMeetingSummary] = useState('');

    useEffect(() => {
        const patientEmail = props.selectAppointment?.patientInfo?.email || '';

        // Filter appointments based on patient email
        const appointments = patientEmail
            ? ContextData.allBookedAppointments.filter((ap) =>
                  ap.patientInfo.email.toLowerCase().includes(patientEmail.toLowerCase())
              )
            : [];

        setFilteredAppointments(appointments);

        // Directly extract meeting summaries
        if (appointments.length > 0) {
            const summaries = appointments.map((appointment) => appointment.meetSummary).join(' ');
            getMeetingSummary(summaries);
        }
    }, [props.selectAppointment, ContextData.allBookedAppointments]);

    const getMeetingSummary = async (summaries) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/getMeetSummary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: summaries }),
            });
            const data = await response.json();
            setMeetingSummary(data.summary);
        } catch (error) {
            console.error('Error getting meeting summary:', error);
        }
    };

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (newPrescript, e) => {
        e.preventDefault();

        const updatedAppointment = { ...props.selectAppointment };
        const newPrescription = updatedAppointment.prescription
            ? [...updatedAppointment.prescription, newPrescript]
            : [newPrescript];

        updatedAppointment.prescription = newPrescription;

        const updatedAppointments = ContextData.allBookedAppointments.map((appointment) =>
            appointment._id === updatedAppointment._id ? updatedAppointment : appointment
        );

        ContextData.setAllBookedAppointments(updatedAppointments);
        props.setSelectAppointment(updatedAppointment);

        fetch(`${process.env.REACT_APP_BASE_URL}/updatePrescription`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({ id: updatedAppointment._id, prescription: newPrescription }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
            })
            .catch((err) => console.error(err));

        e.target.reset();
    };

    return (
        <Modal
            isOpen={props.modalIsOpen}
            onRequestClose={() => props.setModalIsOpen(false)}
            id="modal-responsive"
            style={{
                overlay: { backgroundColor: 'rgba(130,125,125,0.75)' },
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    width: '50%',
                    transform: 'translate(-50%, -50%)',
                },
            }}
        >
            <div className="px-5 py-3">
                {/* Display meeting summary */}
                {meetingSummary && (
                    <div className="mb-4">
                        <h5>Meeting Summary</h5>
                        <p>{meetingSummary}</p>
                        <p><strong>Additional Notes:</strong> This summary is generated from meeting transcripts.</p>
                    </div>
                )}

                {/* Display filtered appointments */}
                <div className="mb-4">
                    <h5>Appointments for {props.selectAppointment?.patientInfo?.name}</h5>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {filteredAppointments.length > 0 ? (
                            filteredAppointments.map((appointment, index) => (
                                <div key={index} className="d-flex flex-column mb-2 p-2 border rounded">
                                    <span><strong>Date:</strong> {appointment.date}</span>
                                    <span><strong>Time:</strong> {appointment.time}</span>
                                    <span><strong>Status:</strong> {appointment.status}</span>
                                    <span><strong>Doctor ID:</strong> {appointment.docId}</span>
                                    <span><strong>Meeting Transcript:</strong> {appointment.meetSummary}</span>
                                </div>
                            ))
                        ) : (
                            <p>No appointments found for this patient.</p>
                        )}
                    </div>
                </div>

                {/* Add Prescription Form */}
                {props.selectAppointment && (
                    <div>
                        <div className="mb-3 mb-4 d-flex justify-content-between">
                            <span className="text-primary">{props.selectAppointment.patientInfo.name}</span>
                            <span>Gender: {props.selectAppointment.patientInfo.gender}</span>
                            <span>Age: {props.selectAppointment.patientInfo.age}</span>
                        </div>

                        <form className="row add-prescription" onSubmit={handleSubmit(onSubmit)}>
                            <div className="col-12">
                                {errors.medicine && <span className="text-danger">Medicine Name is required!<br /></span>}
                                {errors.doge && <span className="text-danger">Dosage is required!<br /></span>}
                                {errors.days && <span className="text-danger">Days are required!<br /></span>}
                            </div>
                            <input
                                className="form-control col-6"
                                {...register('medicine', { required: true })}
                                placeholder="Medicine Name"
                                type="text"
                            />
                            <select
                                {...register('doge', { required: true })}
                                className="form-control col-3"
                                name="doge"
                            >
                                <option value="1 - 1 - 1">1 - 1 - 1</option>
                                <option value="1 - 0 - 1">1 - 0 - 1</option>
                                <option value="1 - 0 - 0">1 - 0 - 0</option>
                                <option value="1 - 1 - 0">1 - 1 - 0</option>
                                <option value="0 - 1 - 1">0 - 1 - 1</option>
                                <option value="0 - 0 - 1">0 - 0 - 1</option>
                            </select>
                            <input
                                {...register('days', { required: true })}
                                name="days"
                                className="form-control col-2"
                                type="number"
                                placeholder="Days"
                            />
                            <button type="submit" className="btn btn-primary col-1">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </form>

                        {/* Display Prescription List */}
                        <div className="mt-5" style={{ height: '300px', overflow: 'auto' }}>
                            {props.selectAppointment.prescription && (
                                <table className="table table-borderless">
                                    {props.selectAppointment.prescription.map((prescript, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}.</td>
                                            <td>{prescript.medicine}</td>
                                            <td>{prescript.doge}</td>
                                            <td>{prescript.days} Days</td>
                                        </tr>
                                    ))}
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default PrescriptionModal;
