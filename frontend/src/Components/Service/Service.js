import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faPills, faUserMd, faCalendarCheck, faHeartbeat, faNotesMedical } from '@fortawesome/free-solid-svg-icons';

const Service = (props) => {
    const {name, description} = props.service;
    
    // Determine which icon to use based on the service name
    const getIcon = (serviceName) => {
        if (serviceName.toLowerCase().includes('record') || serviceName.toLowerCase().includes('upload')) {
            return faFileUpload;
        } else if (serviceName.toLowerCase().includes('medicine') || serviceName.toLowerCase().includes('prescription')) {
            return faPills;
        } else if (serviceName.toLowerCase().includes('profile') || serviceName.toLowerCase().includes('doctor')) {
            return faUserMd;
        } else if (serviceName.toLowerCase().includes('appointment') || serviceName.toLowerCase().includes('schedule')) {
            return faCalendarCheck;
        } else if (serviceName.toLowerCase().includes('health')) {
            return faHeartbeat;
        } else {
            return faNotesMedical; // Default icon
        }
    };
    
    // Split description into paragraphs for better readability
    const paragraphs = description.split('. ').filter(p => p.trim().length > 0);
    
    return (
        <div className="col-md-4 mb-5">
            <div className="service-card text-center">
                <div className="service-icon">
                    <FontAwesomeIcon icon={getIcon(name)} className="fa-icon" style={{ color: 'white', fontSize: '2.5rem' }} />
                </div>
                <h4 className="service-title">{name}</h4>
                {paragraphs.map((paragraph, index) => (
                    <p key={index} className="service-description">
                        {paragraph}{index < paragraphs.length - 1 ? '.' : ''}
                    </p>
                ))}
            </div>
        </div>
    );
};

export default Service;