import React, { useState, useEffect } from 'react';

const Testimonials = () => {
    const [reviews, setReviews] = useState([]);  // Initialize as empty array
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/allReviews`);
                if (!response.ok) {
                    throw new Error('Failed to fetch reviews');
                }
                const data = await response.json();
                setReviews(Array.isArray(data) ? data : []); // Ensure it's an array
            } catch (error) {
                console.error('Error fetching reviews:', error);
                setError(error.message);
                setReviews([]); // Set empty array on error
            }
        };

        fetchReviews();
    }, []);

    if (error) {
        return <div>Error loading reviews: {error}</div>;
    }

    return (
        <section className="testimonials my-5 py-5">
            <div className="container">
                <div className="section-header text-center">
                    <h5 className="text-primary text-uppercase">Testimonial</h5>
                    <h1>What Our Patients <br/> Says </h1>
                </div>
                <div className="card-deck mt-5 row">
                    {reviews && reviews.length > 0 ? (
                        reviews.map(review => (
                            <div className="card shadow-sm col-md-4 border-0" key={review._id}>
                                <div className="card-body">
                                    <p className="card-text text-center">{review.quote}</p>
                                </div>
                                <div className="card-footer d-flex  align-items-center">
                                    <img className="mx-3" src={review.img} alt="" width="60"/>
                                    <div>
                                        <h6 className="text-primary">{review.name}</h6>
                                        <p className="m-0">{review.from}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col text-center">No reviews available</div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Testimonials; 