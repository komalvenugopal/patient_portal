import React, { useContext, useEffect, useState } from 'react';
import { DataContext } from '../../App';
import PatientStatistics from '../../Components/Dashboard/PatientStatistics';
import Sidebar from '../../Components/Dashboard/Sidebar';
import Statistics from '../../Components/Dashboard/Statistics';
import AppointmentDataTable from '../../Components/DataTables/AppointmentDataTable';
import DataTable from '../../Components/DataTables/DataTable';
import PatientAppointmentPaymentTable from '../../Components/DataTables/PatientAppointmentPaymentTable';
import { CopilotPopup } from "@copilotkit/react-ui";

const Dashboard = () => {
	const { loggedInUser, allPatients } = useContext(DataContext);
	const [userAppointments, setUserAppointments] = useState([]);
	const [coPilotInstruction, setCoPilotInstruction] = useState(`You are assisting the user about his appointments, medicine, prescriptions, patients, doctors, recent health history.`);

	useEffect(() => {
		window.scrollTo(0, 0);

		// Fetch all appointments
		fetch(`${process.env.REACT_APP_BASE_URL}/bookedAppointments`)
			.then((res) => res.json())
			.then(async (data) => {
				// Filter appointments for the logged-in user
				const filteredAppointments = data.filter(ap => ap.patientInfo.email === loggedInUser.email);
				console.log("Filtered appointments for user:", filteredAppointments);

				// Fetch doctor information for each appointment
				const appointmentsWithDoctorInfo = await Promise.all(filteredAppointments.map(async (appointment) => {
					const doctorResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/doctors/${appointment.apId}`);
					const doctorInfo = await doctorResponse.json();
					return { 
						...appointment, 
						doctorInfo: {
							category: doctorInfo.category,
							name: doctorInfo.name,
							education: doctorInfo.education,
							designation: doctorInfo.designation,
							department: doctorInfo.department,
							hospital: doctorInfo.hospital
						}
					};
				}));

				setCoPilotInstruction(`You are assisting the user about his appointments, medicine, prescriptions, patients, doctors, recent health history. Here are the user appointment details: ${JSON.stringify(appointmentsWithDoctorInfo)}`);
				setUserAppointments(appointmentsWithDoctorInfo);
			})
			.catch((error) => console.error('Error fetching appointments:', error));
	}, [loggedInUser.email]);

	const patientUser = allPatients.find((ap) => ap.email === loggedInUser.email);

	return (
		<>
			<div className="container-fluid row">
				<Sidebar />
				<div id="responsive-dashboard" className="col-md-10 p-4 pr-5" style={{ position: 'absolute', right: 0, backgroundColor: '#F4FDFB' }}>
					<h5>Dashboard</h5>
					{!patientUser ? (
						<>
							<Statistics />
							<DataTable tableName="Recent Appointments">
								<AppointmentDataTable />
							</DataTable>
						</>
					) : (
						<>
							<PatientStatistics />
							<DataTable tableName="Recent Appointments">
								<PatientAppointmentPaymentTable appointments={userAppointments} />
							</DataTable>
						</>
					)}
				</div>
			</div>
			{console.log("User Appointments:", coPilotInstruction)}
			<CopilotPopup
				instructions={coPilotInstruction}
				labels={{
					title: "Healthcare Assistant",
					initial: "Need any help?",
				}}
			/>
		</>
	);
};

export default Dashboard;