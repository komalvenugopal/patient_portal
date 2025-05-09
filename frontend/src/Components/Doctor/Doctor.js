import { faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Doctors/Doctors.css';

const Doctor = ({ doctorsData }) => {
	const { img, category, name, education, designation, department, hospital } = doctorsData;
	const [ descriptionCollapse, setDescriptionCollapse ] = useState(false);

	const showMore = () => {
		setDescriptionCollapse(true);
	};

	const showLess = () => {
		setDescriptionCollapse(false);
	};

	return (
		<div className="single-doctor">
			<div className="doctor-image-container">
				{!doctorsData.image ? (
					<img className="doctor-image" src={img} alt={name} />
				) : (
					<img className="doctor-image" src={`data:image/png;base64,${doctorsData.image.img}`} alt={name} />
				)}
			</div>
			
			<div className="doctor-description">
				<span className="doctor-category">{category || 'SJSU Health Provider'}</span>
				<h4 className="doctor-name">{name}</h4>
				<span className="doctor-education">
					{descriptionCollapse ? education : education && education.length > 80 ? `${education.substr(0, 80)}...` : education}
				</span>
				{education && education.length > 80 ? descriptionCollapse ? (
					<span onClick={showLess} className="collapse-btn">
						See Less
					</span>
				) : (
					<span onClick={showMore} className="collapse-btn">
						See More
					</span>
				) : (
					<span> </span>
				)}
				<h6 className="department">{designation || 'Specialist'}</h6>
				<h6 className="department">{department || 'SJSU TeleHealth'}</h6>
				<h6 className="hospital">{hospital || 'SJSU Student Wellness Center'}</h6>
				<div className="text-center">
					<Link to="/appointment">
						<button className="appointment-button">
							<FontAwesomeIcon icon={faCalendarCheck} className="icon" /> Schedule Appointment
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Doctor;
