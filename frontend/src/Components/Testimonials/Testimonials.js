import React, { useEffect, useState } from 'react';
import SwiperCore, { A11y, Autoplay, Navigation, Pagination, Scrollbar, Virtual } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.min.css';
import Testimonial from '../Testimonial/Testimonial';
import './Testimonials.css';

SwiperCore.use([ Navigation, Pagination, Scrollbar, A11y, Autoplay, Virtual ]);

const Testimonials = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_BASE_URL}/allReviews`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                console.log('Testimonials data loaded:', data);
                setReviews(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching testimonials:', error);
                setError(error);
                setLoading(false);
            });
    }, []);
    
	return (
		<section className="testimonials">
			<div className="container">
				<div className="section-header">
					<h5 className="section-subtitle">Student Experiences</h5>
					<h2 className="section-title">What SJSU Students Say</h2>
					<p className="section-description">
						Hear from fellow Spartans about their experiences with SJSU TeleHealth services
					</p>
				</div>

				{loading ? (
					<div className="text-center py-5">
						<div className="spinner-border text-primary" role="status">
							<span className="sr-only">Loading...</span>
						</div>
					</div>
				) : error ? (
					<div className="alert alert-warning" role="alert">
						Unable to load student testimonials. Please check back later.
					</div>
				) : (
					<Swiper
						spaceBetween={30}
						slidesPerView={1}
						breakpoints={{
							640: {
								slidesPerView: 1,
							},
							768: {
								slidesPerView: 2,
							},
							1024: {
								slidesPerView: 3,
							},
						}}
						navigation={true}
						pagination={{ clickable: true }}
						autoplay={{ delay: 5000, disableOnInteraction: false }}
						loop={reviews.length > 3}
						key={reviews.length}
					>
						{reviews.map((review, index) => (
							<SwiperSlide key={index}>
								<Testimonial reviews={review} />
							</SwiperSlide>
						))}
					</Swiper>
				)}
			</div>
		</section>
	);
};

export default Testimonials;
