import React from 'react';
import { Link } from 'react-router-dom';
import featuredImg from '../../images/featured.png';
import './FeaturedService.css';

const FeaturedService = () => {
	return (
		<section className="featured-service">
			<div className="container">
				<div className="featured-service-content">
					<div className="row">
						<div className="col-md-7 align-self-center">
							<h2 className="featured-service-title">Are You a SJSU Healthcare Professional?</h2>
							<p className="featured-service-description">
								Join the <span className="featured-service-highlight">SJSU TeleHealth</span> platform and provide virtual consultations to our campus community. As a healthcare provider, you'll help expand accessible healthcare services to SJSU students, faculty, and staff.
							</p>
							<p className="featured-service-description">
								Our platform connects qualified healthcare professionals with the SJSU community through secure video consultations, making healthcare more accessible for all Spartans.
							</p>
							<Link to="/dashboard">
								<button className="featured-service-button">Join SJSU TeleHealth</button>
							</Link>
						</div>
						<div className="col-md-5">
							<div className="featured-service-image">
								<img src={featuredImg} alt="SJSU Healthcare Professional" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default FeaturedService;
