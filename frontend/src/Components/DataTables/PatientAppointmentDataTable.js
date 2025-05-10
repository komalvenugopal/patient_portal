import React, { useContext } from 'react';
import { CalenderContext, DataContext } from '../../App';
import './PatientAppointmentDataTable.css';

const PatientAppointmentDataTable = () => {
	const CalenderData = useContext(CalenderContext);
	const ContextData = useContext(DataContext);

	const formatedDate = `${CalenderData.date.getDate()}-${CalenderData.date.getMonth() +
		1}-${CalenderData.date.getFullYear()}`;

	// Filter only login patients appointments
	const appointmentsOfThePatient = ContextData.allBookedAppointments.filter(
		(ap) => ap.date === formatedDate && ap.patientInfo.email === ContextData.loggedInUser.email
	);

	return (
		<div className="sjsu-appointment-table">
			<div className="sjsu-appointment-header">
				<h6 className="sjsu-appointment-title">Appointments</h6>
				<div className="sjsu-date-selector">
					{CalenderData.date.getDate()} {CalenderData.date.toLocaleString('default', { month: 'short' })} ,{' '}
					{CalenderData.date.getFullYear()}
				</div>
			</div>
			{appointmentsOfThePatient.length === 0 ? (
				<div className="sjsu-no-appointments">
					<h4 className="lead">No Appointments for this Date</h4>
				</div>
			) : (
				<table className="sjsu-table">
					<thead>
						<tr>
							<th scope="col">
								Date
							</th>
							<th scope="col">
								Schedule
							</th>
							<th className="text-center" scope="col">
								Meeting Link
							</th>
						</tr>
					</thead>

					<tbody>
						{appointmentsOfThePatient.map((ap) => (
							<tr>
								<td>{ap.date}</td>
								<td>{ap.time}</td>
								<td className="text-center">
									{ap.meetLink ? (
										<button className="sjsu-meet-btn">
											<a
												href={ap.meetLink}
												target="_blank"
												rel="noopener noreferrer"
												className="sjsu-meet-link"
											>
												Open Meet
											</a>
										</button>
									) : (
										<p className="sjsu-no-link">No Meeting Link Added</p>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
};

export default PatientAppointmentDataTable;
