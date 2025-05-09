import { faFacebookF, faTwitter, faInstagram, faYoutube, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { faUser, faPhone, faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useContext } from 'react';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import { DataContext } from '../../App';
import './Footer.css';
import FooterCol from './FooterCol';
import sjsuLogo from '../../assets/images/logos/SJSU Primary mark_Web_Blue.png';

const Footer = () => {
	const { loggedInUser } = useContext(DataContext);
	const [ modalIsOpen, setModalIsOpen ] = useState(false);

	const contactInfo = [
		{ name: 'sjsu.telehealth@sjsu.edu', link: 'mailto:sjsu.telehealth@sjsu.edu', icon: faEnvelope },
		{ name: '(408) 924-6122', link: 'tel:+14089246122', icon: faPhone },
		{ name: 'Student Health Center', link: 'https://www.sjsu.edu/studenthealth/', icon: null },
		{ name: 'Health & Wellness Resources', link: 'https://www.sjsu.edu/healthadvisories/health-wellness.php', icon: null }
	];

	const ourAddress = [
		{ name: 'Student Health Center', link: '#' },
		{ name: 'San José State University', link: '#' },
		{ name: '1 Washington Square', link: '#' },
		{ name: 'San José, CA 95192', link: '#' },
		{ name: 'View on map', link: 'https://www.google.com/maps/place/San+Jose+State+University/@37.3351874,-121.8832602,17z/', icon: faMapMarkerAlt }
	];

	const quickLinks = [
		{ name: 'Make an Appointment', link: '/appointment' },
		{ name: 'Patient Portal Login', link: '/login' },
		{ name: 'Health Services', link: '/services' },
		{ name: 'COVID-19 Information', link: 'https://www.sjsu.edu/healthadvisories/' },
		{ name: 'SJSU Home', link: 'https://www.sjsu.edu/' }
	];

	const services = [
		{ name: 'Virtual Consultations', link: '/services#virtual' },
		{ name: 'Mental Health Services', link: '/services#mental-health' },
		{ name: 'Preventive Care', link: '/services#preventive' },
		{ name: 'Immunizations', link: '/services#immunizations' },
		{ name: 'AI-Powered Summaries', link: '/services#ai-summaries' },
		{ name: 'Prescription Services', link: '/services#prescriptions' }
	];
	return (
		<>
			<footer className="footer-area">
				{/* Top section with logo and university name */}
				<div className="footer-top">
					<div className="container">
						<img src={sjsuLogo} alt="SJSU Logo" className="footer-logo" />
						<h3 className="footer-university-name">SJSU TeleHealth</h3>
						<p className="mb-3">Providing AI-powered virtual healthcare services to the SJSU community</p>
						
						<ul className="social-media list-inline">
							<li className="list-inline-item">
								<a href="https://www.facebook.com/sanjosestate" target="_blank" rel="noopener noreferrer">
									<FontAwesomeIcon className="icon" icon={faFacebookF} />
								</a>
							</li>
							<li className="list-inline-item">
								<a href="https://twitter.com/SJSU" target="_blank" rel="noopener noreferrer">
									<FontAwesomeIcon className="icon" icon={faTwitter} />
								</a>
							</li>
							<li className="list-inline-item">
								<a href="https://www.instagram.com/sjsu/" target="_blank" rel="noopener noreferrer">
									<FontAwesomeIcon className="icon" icon={faInstagram} />
								</a>
							</li>
							<li className="list-inline-item">
								<a href="https://www.youtube.com/user/sjsu" target="_blank" rel="noopener noreferrer">
									<FontAwesomeIcon className="icon" icon={faYoutube} />
								</a>
							</li>
							<li className="list-inline-item">
								<a href="https://www.linkedin.com/school/san-jose-state-university/" target="_blank" rel="noopener noreferrer">
									<FontAwesomeIcon className="icon" icon={faLinkedinIn} />
								</a>
							</li>
						</ul>
					</div>
				</div>
				
				{/* Middle section with columns */}
				<div className="footer-middle">
					<div className="container">
						<div className="row">
							<FooterCol key={1} menuTitle="Health Services" menuItems={services} />
							<FooterCol key={2} menuTitle="Quick Links" menuItems={quickLinks} />
							<FooterCol key={3} menuTitle="Contact Us" menuItems={contactInfo} />
							
							<div className="col-md-3 footer-col">
								<h6>Our Location</h6>
								<address>
									Student Health Center<br />
									San José State University<br />
									1 Washington Square<br />
									San José, CA 95192
								</address>
								
								{loggedInUser.email && (
									<button 
										className="admin-panel-button" 
										onClick={() => setModalIsOpen(true)}
									>
										<FontAwesomeIcon icon={faUser} className="me-2" />
										Admin Portal
									</button>
								)}
							</div>
						</div>
					</div>
				</div>
				
				{/* Bottom section with copyright and legal links */}
				<div className="footer-bottom">
					<div className="container">
						<div className="row">
							<div className="col-md-6">
								<div className="copyright">
									&copy; {new Date().getFullYear()} San José State University. All Rights Reserved.
									<div className="last-updated">Last updated: May 2025</div>
								</div>
							</div>
							<div className="col-md-6">
								<div className="legal-links">
									<a href="https://www.sjsu.edu/healthadvisories/privacy.php" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
									<a href="https://www.sjsu.edu/healthadvisories/terms.php" target="_blank" rel="noopener noreferrer">Terms of Use</a>
									<a href="https://www.sjsu.edu/accessibility/" target="_blank" rel="noopener noreferrer">Accessibility</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</footer>

			<Modal
				isOpen={modalIsOpen}
				onRequestClose={() => setModalIsOpen(false)}
				id="modal-responsive"
				style={{
					overlay: {
						backgroundColor: 'rgba(0, 48, 87, 0.85)'
					},
					content: {
						top: '50%',
						left: '50%',
						right: 'auto',
						bottom: 'auto',
						marginRight: '-50%',
						width: '450px',
						borderRadius: '8px',
						padding: '30px',
						transform: 'translate(-50%, -50%)',
						border: '2px solid var(--sjsu-gold)'
					}
				}}
			>
				<div className="text-center">
					<img src={sjsuLogo} alt="SJSU Logo" style={{ height: '40px', marginBottom: '20px' }} />
					<h4 className="mb-4" style={{ color: 'var(--sjsu-blue)' }}>SJSU Admin Portal</h4>
					
					<div className="alert" style={{ backgroundColor: 'rgba(0, 85, 162, 0.1)', color: 'var(--sjsu-blue)', borderColor: 'var(--sjsu-blue)', marginBottom: '20px' }}>
						<p className="mb-0">Use the following credentials to access the admin portal:</p>
					</div>
					
					<div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #e5e5e5' }}>
						<p className="mb-2"><strong>Email:</strong> admin@sjsu.edu</p>
						<p className="mb-0"><strong>Password:</strong> SJSUAdmin@2023</p>
					</div>
					
					<p style={{ color: '#6c757d', marginBottom: '20px', fontSize: '0.9rem' }}>
						You can also create a new admin account or sign in with an account that is not used for patient appointments.
					</p>
					
					<div className="d-flex justify-content-center gap-3">
						<button 
							className="btn" 
							style={{ 
								backgroundColor: '#f5f5f5', 
								color: '#333',
								border: 'none',
								padding: '8px 16px',
								borderRadius: '4px',
								marginRight: '10px'
							}}
							onClick={() => setModalIsOpen(false)}
						>
							Cancel
						</button>
						<Link to="/dashboard/dashboard">
							<button 
								className="btn" 
								style={{ 
									backgroundColor: 'var(--sjsu-gold)', 
									color: 'var(--sjsu-blue)', 
									fontWeight: '600',
									border: 'none',
									padding: '8px 16px',
									borderRadius: '4px',
									marginLeft: '10px'
								}}
							>
								Access Admin Portal
							</button>
						</Link>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default Footer;
