import React from 'react';
import infos from '../../Data/infos';
import InfoCard from '../InfoCard/InfoCard';
import './Infos.css';
const Infos = () => {
    return (
        <div className="infos">
            <div className="container">
                <div className="row mt-5 g-5">
                    {infos.map((info, index) => (
                        <div className="col-md-4 mb-4" key={index}>
                            <InfoCard info={info}/>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Infos;