import React, { useContext } from 'react';
import { DataContext } from '../../App';
import SingleStatistic from './SingleStatistic';
import './PatientStatistics.css';

const PatientStatistics = () => {
	const ContextData = useContext(DataContext);

		// Filter only login patients appointments
		const appointmentsOfThePatient = ContextData.allBookedAppointments.filter(
			(ap) => ap.patientInfo && ContextData.loggedInUser && ap.patientInfo.email === ContextData.loggedInUser.email
		);
	

	const total = appointmentsOfThePatient.length;

	const pending = appointmentsOfThePatient.reduce((accu, curr) => {
		if (curr.status === 'Pending') {
			accu += 1;
		}
		return accu;
	}, 0);

	const complete = appointmentsOfThePatient.reduce((accu, curr) => {
		if (curr.visitingStatus === 'Visited') {
			accu += 1;
		}
		return accu;
	}, 0);

	const date = new Date();
	const formatedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

	const todays = appointmentsOfThePatient.reduce((accu, curr) => {
		if (curr.date === formatedDate) {
			accu += 1;
		}
		return accu;
	}, 0);

	return (
		<div className="row patient-statistics-container">
			<SingleStatistic classToAdd="sjsu-bg-primary sjsu-stat-card" data={{ title: 'Pending Appointments', count: pending }} />
			<SingleStatistic classToAdd="sjsu-bg-warning sjsu-stat-card" data={{ title: "Today's Appointments", count: todays }} />
			<SingleStatistic classToAdd="sjsu-bg-info sjsu-stat-card" data={{ title: 'Total Appointments', count: total }} />
			<SingleStatistic classToAdd="sjsu-bg-success sjsu-stat-card" data={{ title: 'Complete Appointments', count: complete }} />
		</div>
	);
};

export default PatientStatistics;
