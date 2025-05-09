import React from 'react';
import './Contact.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhoneAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Contact = () => {
    return (
       <section className="contact">
           <div className="container">
               <div className="section-header text-center mb-5">
                    <h5>Contact Us</h5>
                    <h1>Connect with SJSU TeleHealth</h1>
               </div>
               <div className="row">
                   <div className="col-lg-7 mx-auto">
                       <div className="contact-form">
                           <form>
                               <div className="form-group">
                                   <input 
                                       type="email" 
                                       className="form-control" 
                                       placeholder="Your Email Address *" 
                                       required
                                   />
                               </div>
                               <div className="form-group">
                                   <input 
                                       type="text" 
                                       className="form-control" 
                                       placeholder="Subject *" 
                                       required
                                   />
                               </div>
                               <div className="form-group">
                                   <textarea 
                                       className="form-control" 
                                       placeholder="Your Message *" 
                                       rows="5"
                                       required
                                   ></textarea>
                               </div>
                               <div className="form-group text-center">
                                   <button type="submit" className="contact-form-button">Send Message</button>
                               </div>
                           </form>
                       </div>
                   </div>
               </div>
               
               <div className="contact-info-container">
                   <div className="row justify-content-center">
                       <div className="col-md-4 col-lg-3 mb-3 mb-md-0">
                           <div className="contact-info-item">
                               <div className="contact-info-icon">
                                   <FontAwesomeIcon icon={faMapMarkerAlt} />
                               </div>
                               <div className="contact-info-text">
                                   <p>One Washington Square<br />San Jose, CA 95192</p>
                               </div>
                           </div>
                       </div>
                       <div className="col-md-4 col-lg-3 mb-3 mb-md-0">
                           <div className="contact-info-item">
                               <div className="contact-info-icon">
                                   <FontAwesomeIcon icon={faPhoneAlt} />
                               </div>
                               <div className="contact-info-text">
                                   <p><a href="tel:+14089246122">(408) 924-6122</a></p>
                               </div>
                           </div>
                       </div>
                       <div className="col-md-4 col-lg-3 mb-3 mb-md-0">
                           <div className="contact-info-item">
                               <div className="contact-info-icon">
                                   <FontAwesomeIcon icon={faEnvelope} />
                               </div>
                               <div className="contact-info-text">
                                   <p><a href="mailto:telehealth@sjsu.edu">telehealth@sjsu.edu</a></p>
                               </div>
                           </div>
                       </div>
                   </div>
               </div>
           </div>
       </section>
    );
};

export default Contact;