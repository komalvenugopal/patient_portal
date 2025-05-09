import React from 'react';

const Testimonial = (props) => {
	const { quote, name, from, img } = props.reviews;
	
	// Default image if none provided
	const defaultImage = 'https://i.imgur.com/8Km9tLL.png';
	
	return (
		<div className="card-deck mt-4 mb-5">
			<div className="card">
				<div className="card-body">
					<p className="card-text text-center">{quote}</p>
				</div>
				<div className="card-footer">
					<img 
						className="student-image" 
						src={img || defaultImage} 
						alt={`${name} - SJSU Student`} 
					/>
					<div className="student-info">
						<h6 className="student-name">{name}</h6>
						{from && <p className="student-details">{from}</p>}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Testimonial;
