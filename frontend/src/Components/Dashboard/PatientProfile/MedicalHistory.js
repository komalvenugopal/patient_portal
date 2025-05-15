import React from 'react';

const MedicalHistory = ({ medicalHistory = {}, basicInfo = {} }) => {
    // Safely extract medical history data based on potentially different structures
    const allergies = medicalHistory.allergies || medicalHistory.allergy || [];
    const chronicConditions = medicalHistory.chronicConditions || medicalHistory.chronic_conditions || [];
    const pastSurgeries = medicalHistory.pastSurgeries || medicalHistory.past_surgeries || [];
    const familyHistory = medicalHistory.familyHistory || medicalHistory.family_history || [];
    
    // Format date for display
    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'Date not recorded';
            
            // Handle DD-MM-YYYY format
            if (typeof dateString === 'string' && dateString.includes('-')) {
                const parts = dateString.split('-');
                if (parts.length === 3) {
                    // Check if it's DD-MM-YYYY or YYYY-MM-DD
                    if (parts[0].length === 4) {
                        // YYYY-MM-DD
                        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                        if (!isNaN(date.getTime())) {
                            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                        }
                    } else {
                        // DD-MM-YYYY
                        const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                        if (!isNaN(date.getTime())) {
                            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                        }
                    }
                }
            }
            
            // Try direct JavaScript conversion
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            }
            
            return 'Date not recorded';
        } catch (e) {
            console.error('Date formatting error:', e);
            return 'Date not recorded';
        }
    };
    
    // Check if we have any medical history data
    const hasMedicalData = allergies.length > 0 || 
                          chronicConditions.length > 0 || 
                          pastSurgeries.length > 0 || 
                          familyHistory.length > 0 || 
                          basicInfo.height || 
                          basicInfo.weight || 
                          basicInfo.bloodGroup;

    return (
        <div className="medical-history">
            <div className="card mb-4">
                <div className="card-body">

                    
                    <div className="row">
                {/* Allergies */}
                <div className="col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h6 className="mb-3">Allergies</h6>
                            {allergies && allergies.length > 0 ? (
                                <ul className="list-group list-group-flush mt-3">
                                    {allergies.map((allergy, index) => (
                                        <li key={index} className="list-group-item px-0">
                                            {allergy}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="alert alert-info mt-3">No known allergies</div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Chronic Conditions */}
                <div className="col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h6 className="mb-3">Chronic Conditions</h6>
                            {chronicConditions && chronicConditions.length > 0 ? (
                                <ul className="list-group list-group-flush mt-3">
                                    {chronicConditions.map((condition, index) => (
                                        <li key={index} className="list-group-item px-0">
                                            {condition}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="alert alert-info mt-3">No chronic conditions recorded</div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Past Surgeries */}
                <div className="col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h6 className="mb-3">Past Surgeries</h6>
                            {pastSurgeries && pastSurgeries.length > 0 ? (
                                <div className="mt-3">
                                    {pastSurgeries.map((surgery, index) => (
                                        <div key={index} className="mb-3 pb-3 border-bottom">
                                            <h6>{typeof surgery === 'string' ? surgery : surgery.procedure || surgery.name}</h6>
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">
                                                    {typeof surgery === 'string' ? 'Date not recorded' : 
                                                     formatDate(surgery.date || surgery.datePerformed)}
                                                </span>
                                            </div>
                                            {typeof surgery !== 'string' && (surgery.notes || surgery.description) && (
                                                <p className="small mt-2">{surgery.notes || surgery.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="alert alert-info mt-3">No past surgeries recorded</div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Family History */}
                <div className="col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h6 className="mb-3">Family History</h6>
                            {familyHistory && familyHistory.length > 0 ? (
                                <ul className="list-group list-group-flush mt-3">
                                    {familyHistory.map((history, index) => (
                                        <li key={index} className="list-group-item px-0">
                                            {history}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="alert alert-info mt-3">No family history recorded</div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Basic Measurements */}
                <div className="col-md-12 mb-4">
                    <div className="card">
                        <div className="card-body">
                            <h6 className="mb-3">Basic Measurements</h6>
                            <div className="row mt-3">
                                <div className="col-md-3 mb-3">
                                    <div className="measurement-card p-3 bg-light rounded text-center">
                                        <h5 className="mb-1">{basicInfo.height || 'N/A'}</h5>
                                        <p className="text-muted mb-0">Height (cm)</p>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="measurement-card p-3 bg-light rounded text-center">
                                        <h5 className="mb-1">{basicInfo.weight || 'N/A'}</h5>
                                        <p className="text-muted mb-0">Weight (kg)</p>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="measurement-card p-3 bg-light rounded text-center">
                                        <h5 className="mb-1">{basicInfo.bloodGroup || 'N/A'}</h5>
                                        <p className="text-muted mb-0">Blood Group</p>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="measurement-card p-3 bg-light rounded text-center">
                                        <h5 className="mb-1">
                                            {basicInfo.height && basicInfo.weight ? 
                                                (() => {
                                                    const heightInMeters = parseFloat(basicInfo.height) / 100;
                                                    const weightInKg = parseFloat(basicInfo.weight);
                                                    if (!isNaN(heightInMeters) && !isNaN(weightInKg) && heightInMeters > 0) {
                                                        return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
                                                    }
                                                    return 'N/A';
                                                })() : 
                                                'N/A'
                                            }
                                        </h5>
                                        <p className="text-muted mb-0">BMI</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicalHistory;
