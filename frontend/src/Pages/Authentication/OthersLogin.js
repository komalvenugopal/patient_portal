import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebookF } from '@fortawesome/free-brands-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './Login.css';

const LoginWithOthers = (props) => {
	const { google, facebook } = props;
	return (
		<div className="tg-thirdparty-login">
			<div className="form-divider">
				<div className="divider-text">or continue with</div>
			</div>
			<div className="social-buttons">
				<button className="btn social-btn google-btn" onClick={google}>
					<FontAwesomeIcon icon={faGoogle} size="lg" className="mr-2" />
					<span>Google</span>
				</button>
				<button className="btn social-btn facebook-btn" onClick={facebook}>
					<FontAwesomeIcon icon={faFacebookF} size="lg" className="mr-2" />
					<span>Facebook</span>
				</button>
			</div>
			<Link to="/" className="return-link">
				<FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
				Return to Homepage
			</Link>
		</div>
	);
};

export default LoginWithOthers;