import React from 'react';
import services from '../../Data/services';
import Service from '../Service/Service';
import './Services.css';

const Services = () => {
    return (
        <section className="services mb-5 pt-0">
            <div className="container">
                <div className="section-header text-center">
                    <h5 className="section-subtitle">SJSU TeleHealth Services</h5>
                    <h1 className="section-title">Services We Provide</h1>
                </div>
                <div className="row mt-5 pt-3">
                    {
                        services.map((service, index) => <Service key={index} service={service} />)
                    }
                </div>
            </div>
        </section>
    );
};

export default Services;