import React, { createContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import PrivateRoute from './Components/PrivateRoute/PrivateRoute';
import Appointment from './Pages/Appointment';
import Login from './Pages/Authentication/Login';
import Contacts from './Pages/Contacts';
import AddDoctor from './Pages/Dashboard/AddDoctor';
import AddReview from './Pages/Dashboard/AddReview';
import DashBoardAppointments from './Pages/Dashboard/Appointments';
import Dashboard from './Pages/Dashboard/Dashboard';
import PatientAppointment from './Pages/Dashboard/PatientAppointment';
import PatientPrescription from './Pages/Dashboard/PatientPrescription';
import Patients from './Pages/Dashboard/Patients';
import Prescriptions from './Pages/Dashboard/Prescriptions';
import Home from './Pages/Home';
import NotFound from './Pages/NotFound';
import Reviews from './Pages/Reviews';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
export const DataContext = createContext();
export const CalenderContext = createContext();

function App() {
	const [ loggedInUser, setLoggedInUser ] = useState(() => {
		// Try to get user from localStorage first
		const savedUser = localStorage.getItem('loggedInUser');
		return savedUser ? JSON.parse(savedUser) : {};
	});
	const [ allAppointments, setAllAppointments ] = useState([]);
	const [ allBookedAppointments, setAllBookedAppointments ] = useState([]);
	const [ allPatients, setAllPatients ] = useState([]);
	const [ date, setDate ] = useState(new Date());
	const [ preLoaderVisibility, setPreLoaderVisibility ] = useState(true);

	// Listen to Firebase auth state changes
	useEffect(() => {
		const auth = getAuth();
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				// User is signed in
				const userData = {
					isSignedIn: true,
					email: user.email,
					name: user.displayName,
					success: true,
					error: ''
				};
				setLoggedInUser(userData);
				localStorage.setItem('loggedInUser', JSON.stringify(userData));
			} else {
				// User is signed out
				setLoggedInUser({});
				localStorage.removeItem('loggedInUser');
			}
		});

		// Cleanup subscription
		return () => unsubscribe();
	}, []);

	// Load all Doctors Information
	useEffect(() => {
		const fetchDoctors = async () => {
			try {
				const response = await fetch(`${process.env.REACT_APP_BASE_URL}/doctors`);
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				const data = await response.json();
				setAllAppointments(data);
				setPreLoaderVisibility(false);
			} catch (error) {
				console.error("Failed to fetch doctors:", error);
				setPreLoaderVisibility(false);
				// Optionally set some error state here
			}
		};

		fetchDoctors();
	}, [allAppointments.length]);

	// Load all Appointments and Patients Information
	useEffect(() => {
		const fetchAppointments = async () => {
			try {
				const response = await fetch(`${process.env.REACT_APP_BASE_URL}/bookedAppointments`);
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				const data = await response.json();
				setAllBookedAppointments(data);
			} catch (error) {
				console.log(error);
				console.error("Failed to fetch appointments:", error);
				// Optionally set some error state here
			}
		};

		fetchAppointments();
	}, [allBookedAppointments.length]);

	const contextData = {
		loggedInUser,
		setLoggedInUser,
		allAppointments,
		setAllAppointments,
		allBookedAppointments,
		setAllBookedAppointments,
		allPatients,
		setAllPatients,
		preLoaderVisibility
	};
	const calenderContextValue = { date, setDate };

	return (
		<DataContext.Provider value={contextData}>
			<CalenderContext.Provider value={calenderContextValue}>
				<Router>
					<Switch>
						<Route exact path="/">
							<Home />
						</Route>
						<Route path="/appointment">
							<Appointment />
						</Route>
						<Route path="/reviews">
							<Reviews />
						</Route>
						<Route path="/contact">
							<Contacts />
						</Route>
						<Route exact path="/dashboard">
							<Login />
						</Route>
						<PrivateRoute path="/dashboard/dashboard">
							<Dashboard />
						</PrivateRoute>
						<PrivateRoute path="/dashboard/appointment">
							<DashBoardAppointments />
						</PrivateRoute>
						<PrivateRoute path="/dashboard/patients">
							<Patients />
						</PrivateRoute>
						<PrivateRoute path="/dashboard/prescriptions">
							<Prescriptions />
						</PrivateRoute>
						<PrivateRoute path="/dashboard/doctors">
							<AddDoctor />
						</PrivateRoute>
						<PrivateRoute path="/dashboard/my-appointment">
							<PatientAppointment />
						</PrivateRoute>
						<PrivateRoute path="/dashboard/my-prescriptions">
							<PatientPrescription />
						</PrivateRoute>
						<PrivateRoute path="/dashboard/reviews">
							<AddReview />
						</PrivateRoute>
						<Route path="*">
							<NotFound />
						</Route>
					</Switch>
				</Router>
			</CalenderContext.Provider>
		</DataContext.Provider>
	);
}

export default App;
