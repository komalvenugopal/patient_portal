import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import logo from '../../assets/images/logos/SJSU University monogram_Web_Blue.png';
import './Login.css';

const LoginForm = (props) => {
	const { toggleUser, validation, submit, errors, resetPassword } = props;
	const [ show, setShow ] = useState(false);

	const [ resetEmail, setResetEmail ] = useState({
		email: ''
	});

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const handleBlur = (e) => {
		const newUserInfo = { ...resetEmail };
		newUserInfo[e.target.name] = e.target.value;
		setResetEmail(newUserInfo);
	};

	const handleResetPassword = () => {
		resetPassword(resetEmail.email);
		setShow(false);
	};

	return (
		<div className="tg-form login">
			<div className="sjsu-logo-container">
				<img src={logo} alt="SJSU Logo" className="sjsu-logo" />
				<h3 className="sjsu-title">SJSU TeleHealth</h3>
			</div>

			<form onSubmit={submit}>
				<div className="form-group">
					<label htmlFor="email">Email Address</label>
					<input 
						type="email" 
						className="form-control" 
						id="email"
						placeholder="your.name@sjsu.edu" 
						name="email" 
						onBlur={validation} 
						aria-describedby="emailHelp"
					/>
					{errors.email.length > 0 && <p className="error-msg">{errors.email}</p>}
				</div>

				<div className="form-group">
					<label htmlFor="password">Password</label>
					<input
						type="password"
						className="form-control"
						id="password"
						placeholder="Enter your password"
						name="password"
						onBlur={validation}
					/>
					{errors.password.length > 0 && <p className="error-msg">{errors.password}</p>}
				</div>

				<div className="form-group forgot-pass mb-3 d-flex justify-content-between align-items-center">
					<div className="custom-control custom-checkbox">
						<input type="checkbox" className="custom-control-input" id="rememberUser" />
						<label className="custom-control-label" htmlFor="rememberUser">
							Remember me
						</label>
					</div>
					<p className="forget-text mb-0" onClick={handleShow}>
						Forgot password?
					</p>
				</div>

				<button type="submit" className="btn btn-primary btn-block">
					Sign In
				</button>
			</form>

			<div className="register-login mt-3">
				New to SJSU TeleHealth?
				<button className="toggle-form-btn ml-2" onClick={toggleUser}>
					Create an account
				</button>
			</div>

			<Modal show={show} onHide={handleClose}>
				<Modal.Header closeButton style={{ backgroundColor: '#0055A2', color: 'white' }}>
					<Modal.Title>Reset Password</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p className="mb-3">Enter your SJSU email address and we'll send you a password reset link.</p>
					<div className="form-group">
						<label htmlFor="resetEmail">Email Address</label>
						<input
							type="email"
							id="resetEmail"
							className="form-control"
							placeholder="your.name@sjsu.edu"
							name="email"
							onBlur={handleBlur}
						/>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleClose} style={{ backgroundColor: '#e74c3c', borderColor: '#e74c3c' }}>
						Close
					</Button>
					<Button variant="primary" onClick={handleResetPassword} style={{ backgroundColor: '#0055A2', borderColor: '#0055A2' }}>
						Send Reset Link
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default LoginForm;
