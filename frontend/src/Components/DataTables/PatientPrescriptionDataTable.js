import { faNotesMedical, faStethoscope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useState } from 'react';
import Modal from 'react-modal';
import { DataContext } from '../../App';
import './PatientPrescriptionDataTable.css';

const PatientPrescriptionDataTable = () => {
	const ContextData = useContext(DataContext);
	const [ selectAppointment, setSelectAppointment ] = useState(null);
	const [ selectDoctor, setSelectDoctor ] = useState(null);
	const [ modalIsOpen, setModalIsOpen ] = useState(false);
	const [ diseaseModalIsOpen, setDiseaseModalIsOpen ] = useState(false);

	const openPrescriptionModal = (apId, docId) => {
		setModalIsOpen(true);
		const selectedAp = ContextData.allBookedAppointments.find((ap) => ap._id === apId);
		const selectedDoc = ContextData.allAppointments.find((ap) => ap.id === docId);
		setSelectAppointment(selectedAp);
		setSelectDoctor(selectedDoc);
	};

	const openDataDiseaseModal = (apId, docId) => {
		setDiseaseModalIsOpen(true);
		const selectedAp = ContextData.allBookedAppointments.find((ap) => ap._id === apId);
		const selectedDoc = ContextData.allAppointments.find((ap) => ap.id === docId);
		setSelectAppointment(selectedAp);
		setSelectDoctor(selectedDoc);
	};

	// Filter only login patients appointments
	const appointmentsOfThePatient = ContextData.allBookedAppointments.filter(
		(ap) => ap.patientInfo && ContextData.loggedInUser && ap.patientInfo.email === ContextData.loggedInUser.email
	);

	let srNo = 1;

	return (
		<div className="sjsu-prescription-table">
			<table className="sjsu-table">
				<thead>
					<tr>
						<th className="text-left" scope="col">
							Sr No
						</th>
						<th scope="col">
							Date
						</th>
						<th scope="col">
							Time
						</th>
						<th scope="col">
							Appointment ID
						</th>
						<th scope="col">
							Disease
						</th>
						<th className="text-center" scope="col">
							Prescription
						</th>
					</tr>
				</thead>
				<tbody>
					{appointmentsOfThePatient.map((ap) => (
						<tr>
							<td>{srNo++}</td>
							<td>{ap.date}</td>
							<td>{ap.time}</td>
							<td>{`#${ap._id.substr(0, 9)}`}</td>
							<td>
								<button
									onClick={() => openDataDiseaseModal(ap._id, ap.apId)}
									className="sjsu-btn-disease"
								>
									<FontAwesomeIcon icon={faStethoscope} /> VIEW
								</button>
							</td>

							<td className="text-center">
								{ap.prescription ? (
									<button
										onClick={() => openPrescriptionModal(ap._id, ap.apId)}
										className="sjsu-btn-view"
									>
										<FontAwesomeIcon icon={faNotesMedical} /> View
									</button>
								) : (
									<span className="sjsu-not-added">
										Not Added
									</span>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<Modal
				isOpen={diseaseModalIsOpen}
				onRequestClose={() => setDiseaseModalIsOpen(false)}
				id="modal-responsive"
				style={{
					overlay: {
						backgroundColor: 'rgba(0, 0, 0, 0.75)'
					},
					content: {
						top: '50%',
						left: '50%',
						right: 'auto',
						bottom: 'auto',
						marginRight: '-50%',
						width: '50%',
						transform: 'translate(-50%, -50%)',
						borderRadius: '8px',
						border: '2px solid #E5A823',
						padding: '0'
					}
				}}
			>
				{selectAppointment && (
					<div>
						<div className="sjsu-modal-header">
							<h5>{selectAppointment.patientInfo?.name || 'Patient'}'s Disease</h5>
						</div>
						<form className="px-5 my-3 sjsu-modal-body">
							<div className="sjsu-doctor-info">
								<p className="mb-2">
									<small>Appointment To</small>
								</p>
								<h6 className="sjsu-doctor-name mb-2">{selectDoctor?.name || 'Doctor'}</h6>
								<p className="sjsu-doctor-category mb-4">{selectDoctor?.category || 'Specialist'}</p>
							</div>

						<div className="form-group row">
							<textarea
								type="text"
								defaultValue={
									selectAppointment.disease ? (
										selectAppointment.disease
									) : (
										selectAppointment.patientInfo?.problem || 'No problem specified'
									)
								}
								name="problem"
								className="form-control col-12"
								rows="3"
								disabled={true}
							/>
						</div>
							<div className="form-group text-right">
								<button
									className="sjsu-btn-close"
									onClick={() => setDiseaseModalIsOpen(false)}
								>
									CLOSE
								</button>
							</div>
						</form>
					</div>
				)}
			</Modal>

			<Modal
				isOpen={modalIsOpen}
				onRequestClose={() => setModalIsOpen(false)}
				id="modal-responsive"
				style={{
					overlay: {
						backgroundColor: 'rgba(0, 0, 0, 0.75)'
					},
					content: {
						top: '50%',
						left: '50%',
						right: 'auto',
						bottom: 'auto',
						marginRight: '-50%',
						width: '50%',
						transform: 'translate(-50%, -50%)',
						borderRadius: '8px',
						border: '2px solid #E5A823',
						padding: '0'
					}
				}}
			>
				<div>
					<div className="sjsu-modal-header">
						<h5>Prescription Details</h5>
					</div>
					<div className="px-5 py-3 sjsu-modal-body">
					{selectDoctor && (
						<div className="sjsu-doctor-info">
							<h5 className="sjsu-doctor-name">{selectDoctor?.name || 'Doctor'}</h5>
							<h6 className="sjsu-doctor-category">{selectDoctor?.category || 'Specialist'}</h6>
							<p className="my-0">
								<small>{selectDoctor?.designation || ''}</small>
							</p>
							<p className="my-0">
								<small>{selectDoctor?.department || ''}</small>
							</p>
							<p>
								<small>{selectDoctor?.hospital || 'SJSU Health Center'}</small>
							</p>
						</div>
					)}

					{selectAppointment && (
						<div>
							<div className="sjsu-patient-info">
								<span>
									<strong>{selectAppointment.patientInfo?.name || 'Patient'}</strong>
								</span>
								<span>Gender: {selectAppointment.patientInfo?.gender || 'Not specified'}</span>
								<span>Age: {selectAppointment.patientInfo?.age || 'N/A'}</span>
							</div>

							<div className="sjsu-prescription-content">
								{selectAppointment.prescription && (
									<table className="sjsu-table">
										{selectAppointment.prescription.length &&
											selectAppointment.prescription.map((prescript, index) => (
												<tr>
													<td>{index + 1}.</td>
													<td>{prescript.medicine}</td>
													<td>{prescript.doge}</td>
													<td>{prescript.days} Days</td>
												</tr>
											))}
									</table>
								)}
							</div>

							<div className="d-flex justify-content-end">
								<button
									className="sjsu-btn-close"
									onClick={() => setModalIsOpen(false)}
								>
									CLOSE
								</button>
							</div>
						</div>
					)}
				</div>
				</div>
			</Modal>
		</div>
	);
};

export default PatientPrescriptionDataTable;
