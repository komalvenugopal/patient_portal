import React from 'react';
import { Link } from 'react-router-dom';
import wellnessCenterImg from '../../assets/images/photos/sjsu-wellness-center-closeshot.jpg';
import './AppointmentBanner.css';

const AppointmentBanner = () => {
	return (
		<section className="appointment-banner">
			<div className="sjsu-pattern"></div>
			<div className="container">
				<div className="row">
					<div className="col-lg-5 d-none d-lg-block">
						<div className="appointment-banner-image-container">
							<img 
								src={wellnessCenterImg} 
								alt="SJSU Student Wellness Center" 
								className="appointment-banner-image"
							/>
						</div>
					</div>
					<div className="col-lg-7">
						<div className="appointment-banner-content">
							<h5 className="appointment-banner-subtitle">SJSU TeleHealth Appointments</h5>
							<h1 className="appointment-banner-title">
								Connect with SJSU Health Providers
							</h1>
							<p className="appointment-banner-description">
								Access healthcare services remotely through SJSU's secure telehealth platform. 
								Our AI-powered system integrates with your student health insurance and 
								coordinates with on-campus resources at the Student Wellness Center for 
								comprehensive care.
							</p>
							<Link to="/appointment">
								<button className="appointment-banner-button">Schedule Appointment</button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default AppointmentBanner;
