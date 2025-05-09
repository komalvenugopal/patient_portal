import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faMapMarkerAlt, faPhoneAlt } from '@fortawesome/free-solid-svg-icons';
import './InfoCard.css';

const InfoCard = props => {
    const {title, icon, description, bg} = props.info; 
    
    // Split description into lines if it contains newline characters
    const descriptionLines = description.split('\n');
   
    return (
        <div className="col-md-4 mb-3">
            <div className={`info-card ${bg} d-flex align-items-center rounded shadow`}>
                <div className="icon-container">
                    <FontAwesomeIcon className="info-icon" icon={
                            icon === 'clock' ? faClock :
                            icon === 'location' ? faMapMarkerAlt :
                            faPhoneAlt
                    } />
                </div>
                <div className="info-content">
                    <h6 className="info-title">{title}</h6>
                    {descriptionLines.map((line, index) => (
                        <p key={index} className="info-description">{line}</p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InfoCard;