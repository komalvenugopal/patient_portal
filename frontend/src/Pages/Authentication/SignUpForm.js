import React from "react";
import './Login.css';

const SignUpForm = (props) => {
	const { toggleUser, validation, submit, errors } = props;

	return (
		<div className="tg-form signup">
			<h3>Create an Account</h3>

			<form onSubmit={submit}>
				<div className="form-group">
					<label htmlFor="name">Full Name</label>
					<input 
						type="text" 
						className="form-control" 
						id="name"
						placeholder="Enter your full name" 
						name="name" 
						onBlur={validation} 
					/>
					{errors.name.length > 0 && <p className="error-msg">{errors.name}</p>}
				</div>

				<div className="form-group">
					<label htmlFor="signup-email">SJSU Email Address</label>
					<input 
						type="email" 
						className="form-control" 
						id="signup-email"
						placeholder="your.name@sjsu.edu" 
						name="email" 
						onBlur={validation} 
						aria-describedby="emailHelp"
					/>
					<small id="emailHelp" className="form-text text-muted">Must be a valid SJSU email address</small>
					{errors.email.length > 0 && <p className="error-msg">{errors.email}</p>}
				</div>

				<div className="form-group">
					<label htmlFor="signup-password">Password</label>
					<input
						type="password"
						className="form-control"
						id="signup-password"
						placeholder="Create a password"
						name="password"
						onBlur={validation}
					/>
					<small className="form-text text-muted">Must be at least 6 characters long</small>
					{errors.password.length > 0 && <p className="error-msg">{errors.password}</p>}
				</div>

				<div className="form-group">
					<label htmlFor="confirm-password">Confirm Password</label>
					<input
						type="password"
						className="form-control"
						id="confirm-password"
						placeholder="Confirm your password"
						name="confirmPassword"
						onBlur={validation}
					/>
					{errors.confirmPassword.length > 0 && <p className="error-msg">{errors.confirmPassword}</p>}
				</div>

				<div className="form-group mt-4">
					<button type="submit" className="btn btn-primary btn-block">
						Create Account
					</button>
				</div>
			</form>

			<div className="register-login mt-3">
				Already have an account?
				<button className="btn btn-logintoggle ml-2" onClick={toggleUser}>
					Sign In
				</button>
			</div>
		</div>
	);
};

export default SignUpForm;