import { faFileAlt } from '@fortawesome/free-regular-svg-icons';
import {
	faCalendar,
	faGripHorizontal,
	faHeartbeat,
	faQuoteLeft, faSignOutAlt,
	faUser,
	faUserPlus,
	faUsers
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { DataContext } from '../../App';
import logo from '../../assets/images/logos/SJSU University monogram_Web_Blue.png';
import '../../assets/styles/variables.css';
import './Sidebar.css';

const Sidebar = () => {
	const { loggedInUser, setLoggedInUser, allPatients } = useContext(DataContext);

	const patientUser = allPatients.find((ap) => ap.email === loggedInUser.email);

	return (
		<div
			className="sidebar d-flex flex-column justify-content-between col-md-2 py-5 px-4"
			style={{ minHeight: '100vh', boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)' }}
		>
			<ul className="list-unstyled">
				<li>
					<Link to="/" style={{ color: 'var(--sjsu-gold, #E5A823)' }}>
						<img src={logo} alt="SJSU logo" width="40px" />
						<span className="text-white navName"> SJSU TeleHealth </span>
					</Link>
				</li>
				<li>
						<FontAwesomeIcon icon={faUser} className="text-white" />
						<span className="text-white navName ml-1">{loggedInUser.name}</span>
				</li>
				
				{!patientUser ? (
					<>
						<li>
							<Link to="/dashboard/dashboard" className="text-white">
								<FontAwesomeIcon icon={faGripHorizontal} /> <span>Dashboard</span>
							</Link>
						</li>
						<li>
							<Link to="/dashboard/appointment" className="text-white">
								<FontAwesomeIcon icon={faCalendar} /> <span>Appointment</span>
							</Link>
						</li>
						<li>
							<Link to="/dashboard/patients" className="text-white">
								<FontAwesomeIcon icon={faUsers} /> <span>Patients</span>
							</Link>
						</li>
						<li>
							<Link to="/dashboard/prescriptions" className="text-white">
								<FontAwesomeIcon icon={faFileAlt} /> <span>Prescriptions</span>
							</Link>
						</li>
						<li>
							<Link to="/dashboard/patient-profiles" className="text-white">
								<FontAwesomeIcon icon={faHeartbeat} /> <span>Patient Profiles</span>
							</Link>
						</li>
						<li>
							<Link to="/dashboard/doctors" className="text-white">
								<FontAwesomeIcon icon={faUserPlus} /> <span>Add Doctor</span>
							</Link>
						</li>
					</>
				) : (
					<>
						<li>
							<Link to="/dashboard/dashboard" className="text-white">
								<FontAwesomeIcon icon={faGripHorizontal} /> <span>Dashboard</span>
							</Link>
						</li>
						<li>
							<Link to="/dashboard/my-appointment" className="text-white">
								<FontAwesomeIcon icon={faCalendar} /> <span>My Appointment</span>
							</Link>
						</li>
						<li>
							<Link to="/dashboard/my-prescriptions" className="text-white">
								<FontAwesomeIcon icon={faFileAlt} /> <span>My Prescriptions</span>
							</Link>
						</li>
						<li>
							<Link to="/dashboard/patient-profiles" className="text-white">
								<FontAwesomeIcon icon={faHeartbeat} /> <span>Patient Profiles</span>
							</Link>
						</li>
						<li>
							<Link to="/dashboard/reviews" className="text-white">
								<FontAwesomeIcon icon={faQuoteLeft} /> <span>Add Review</span>
							</Link>
						</li>
					</>
				)}
				
			</ul>
			<div>
				<Link to="/" className="text-white logout-btn d-inline-block">
					<FontAwesomeIcon icon={faSignOutAlt} /> <span onClick={() => setLoggedInUser({})}>Logout</span>
				</Link>
			</div>
		</div>
	);
};

export default Sidebar;
