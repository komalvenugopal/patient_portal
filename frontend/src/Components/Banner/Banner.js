import React from 'react';
import { Link } from 'react-router-dom';
import './Banner.css';
import wellnessCenterWide from '../../assets/images/photos/sjsu-wellness-center-wide.jpg';
import wellnessCenterEntrance from '../../assets/images/photos/sjsu-wellness-center-entrance.jpg';

const Banner = () => {
	return (
		<section className="sjsu-banner-section">
			{/* Background Image with Overlay */}
			<img src={wellnessCenterWide} alt="SJSU Wellness Center" className="sjsu-banner-bg" />
			<div className="sjsu-banner-overlay"></div>
			
			<div className="container">
				<div className="row align-items-center">
					{/* Banner Content */}
					<div className="col-lg-6 sjsu-banner-content">
						<h1 className="sjsu-banner-title">
							SJSU TeleHealth: AI-Powered Healthcare for Students
						</h1>
						<h2 className="sjsu-banner-subtitle">
							Virtual care with intelligent insights
						</h2>
						<p className="sjsu-banner-description">
							Access healthcare services remotely with SJSU's innovative telehealth platform. 
							Our AI-powered system provides transcription, medical entity recognition, 
							and intelligent summaries to enhance your healthcare experience.
						</p>
						
						{/* Call to Action Button */}
						<Link className="sjsu-banner-button" to="/appointment">
							Make Appointment
						</Link>
						
						{/* Feature Highlights */}
						<div className="sjsu-banner-features">
							<div className="sjsu-banner-feature">
								<i className="fas fa-video sjsu-banner-feature-icon"></i>
								Secure Video Calls
							</div>
							<div className="sjsu-banner-feature">
								<i className="fas fa-robot sjsu-banner-feature-icon"></i>
								AI-Powered
							</div>
							<div className="sjsu-banner-feature">
								<i className="fas fa-file-medical sjsu-banner-feature-icon"></i>
								E-Prescriptions
							</div>
						</div>
					</div>
					
					{/* Banner Image */}
					<div className="col-lg-6 d-none d-lg-block">
						<div className="sjsu-banner-image-container">
							<img 
								className="sjsu-banner-image" 
								src={wellnessCenterEntrance} 
								alt="SJSU Student Wellness Center Entrance" 
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Banner;
