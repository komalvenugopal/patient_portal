import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import { DataContext } from '../../App';
import sjsuLogo from '../../assets/images/logos/SJSU University monogram_Web_Blue.png';

const Header = () => {
	const { loggedInUser } = useContext(DataContext);
	const [menuOpen, setMenuOpen] = useState(false);
	const location = useLocation();
	
	// Function to check if a link is active
	const isActive = (path) => {
		return location.pathname === path ? 'active' : '';
	};
	
	// Toggle mobile menu
	const toggleMenu = () => {
		setMenuOpen(!menuOpen);
	};
	
	return (
		<header className="sjsu-header fixed-top">
			<div className="sjsu-header-container">
				{/* Logo and Title */}
				<div className="sjsu-logo-container">
					<Link to="/" className="sjsu-logo-link">
						<img src={sjsuLogo} alt="SJSU Logo" className="sjsu-logo" />
						<h1 className="sjsu-title">
							SJSU <span className="sjsu-title-divider">|</span> TeleHealth
						</h1>
					</Link>
				</div>
				
				{/* Mobile Menu Button */}
				<button 
					className="sjsu-menu-button" 
					onClick={toggleMenu}
					aria-label="Toggle navigation"
				>
					<i className="fas fa-bars"></i>
				</button>
				
				{/* Navigation */}
				<nav className={`sjsu-nav ${menuOpen ? 'open' : ''}`}>
					<ul className="sjsu-nav-list">
						<li className="sjsu-nav-item">
							<Link 
								className={`sjsu-nav-link ${isActive('/')}`} 
								to="/"
								onClick={() => setMenuOpen(false)}
							>
								Home
							</Link>
						</li>
						<li className="sjsu-nav-item">
							<Link 
								className={`sjsu-nav-link ${isActive('/appointment')}`} 
								to="/appointment"
								onClick={() => setMenuOpen(false)}
							>
								Make Appointment
							</Link>
						</li>
						<li className="sjsu-nav-item">
							<Link 
								className={`sjsu-nav-link ${isActive('/dashboard/dashboard')}`} 
								to="/dashboard/dashboard"
								onClick={() => setMenuOpen(false)}
							>
								Dashboard
							</Link>
						</li>
						<li className="sjsu-nav-item">
							<Link 
								className={`sjsu-nav-link ${isActive('/reviews')}`} 
								to="/reviews"
								onClick={() => setMenuOpen(false)}
							>
								Reviews
							</Link>
						</li>
						<li className="sjsu-nav-item">
							<Link 
								className={`sjsu-nav-link ${isActive('/contact')}`} 
								to="/contact"
								onClick={() => setMenuOpen(false)}
							>
								Contact Us
							</Link>
						</li>
						{!loggedInUser || !loggedInUser.email ? (
							<li className="sjsu-nav-item">
								<Link 
									className="sjsu-nav-link sjsu-banner-button" 
									to="/login"
									style={{ margin: '0 10px' }}
									onClick={() => setMenuOpen(false)}
								>
									Sign In
								</Link>
							</li>
						) : null}
					</ul>
					
					{/* Search Button */}
					<div className="sjsu-search-container">
						<button className="sjsu-search-button" aria-label="Search">
							<svg className="sjsu-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<circle cx="11" cy="11" r="8"></circle>
								<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
							</svg>
						</button>
					</div>
				</nav>
			</div>
		</header>
	);
};

export default Header;
