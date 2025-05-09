import React, { useContext } from 'react';
import SwiperCore, { A11y, Autoplay, Navigation, Pagination, Scrollbar, Virtual } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.min.css';
import { DataContext } from '../../App';
import Doctor from '../Doctor/Doctor';
import './Doctors.css';

SwiperCore.use([ Navigation, Pagination, Scrollbar, A11y, Autoplay, Virtual ]);

const Doctors = () => {

    const doctorsData = useContext(DataContext)
    
    return (
        <section className="doctors">
            <div className="container">
                <div className="text-center mb-5">
                    <h1 className="doctors-section-title">SJSU Health Providers</h1>
                    <p className="doctors-section-subtitle">Meet our experienced telehealth team</p>
                </div>
                
                <div className="doctors-view">
                    <Swiper
                        spaceBetween={30}
                        slidesPerView={3}
                        navigation
                        autoplay={{ delay: 5000 }}
                        breakpoints={{
                            // when window width is >= 320px
                            320: {
                                slidesPerView: 1,
                                spaceBetween: 20
                            },
                            // when window width is >= 768px
                            768: {
                                slidesPerView: 2,
                                spaceBetween: 30
                            },
                            // when window width is >= 1024px
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 30
                            }
                        }}
                        key={doctorsData.allAppointments && doctorsData.allAppointments.length}
                    >
                        {doctorsData.allAppointments &&
                            doctorsData.allAppointments.map((doctorData, index) => (
                                <SwiperSlide key={index}>
                                    <Doctor key={doctorData.id} doctorsData={doctorData} />
                                </SwiperSlide>
                            ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
};

export default Doctors;