import React from 'react';

const PatientProfileHeader = ({ profile }) => {
    // Extract name and email from profile if basicInfo is not available
    const name = profile?.basicInfo?.name || profile?.name || 'Patient';
    const email = profile?.basicInfo?.email || profile?.email || 'N/A';
    
    // Default values to ensure we always have something to display
    const basicInfo = profile?.basicInfo || {
        name: name,
        age: profile?.age || 'N/A',
        gender: profile?.gender || 'Not specified',
        bloodGroup: 'Unknown',
        contact: profile?.contact || profile?.phone || 'N/A',
        email: email,
        emergencyContact: 'N/A',
        height: '170',
        weight: '70'
    };
    
    // If we have a profile object but no basicInfo, we'll use the defaults above
    const visits = profile?.visits || [];
    const aiGeneratedInsights = profile?.aiGeneratedInsights || {};
    const overallHealth = aiGeneratedInsights?.overallHealth || { score: 'N/A' };
    
    // Calculate BMI if height and weight are available
    let bmi = 'N/A';
    if (basicInfo.height && basicInfo.weight) {
        const heightInMeters = parseFloat(basicInfo.height) / 100;
        const weightInKg = parseFloat(basicInfo.weight);
        if (!isNaN(heightInMeters) && !isNaN(weightInKg) && heightInMeters > 0) {
            bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
        }
    }

    return (
        <div className="patient-profile-header bg-white rounded shadow-sm p-4">
            <div className="row">
                <div className="col-md-2 text-center">
                    <div className="avatar-placeholder rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto" style={{ width: '100px', height: '100px' }}>
                        <span className="text-white fs-1">
                            {basicInfo.name ? basicInfo.name.charAt(0).toUpperCase() : '?'}
                        </span>
                    </div>
                </div>
                <div className="col-md-6">
                    <h3 className="mb-1">{basicInfo.name || 'Unknown'}</h3>
                    <div className="patient-meta">
                        <div className="row mb-2">
                            <div className="col-md-4">
                                <p className="mb-1">
                                    <span className="text-muted me-2">Age:</span> 
                                    {basicInfo.age || 'N/A'} years
                                </p>
                            </div>
                            <div className="col-md-4">
                                <p className="mb-1">
                                    <span className="text-muted me-2">Gender:</span> 
                                    {basicInfo.gender || 'N/A'}
                                </p>
                            </div>
                            <div className="col-md-4">
                                <p className="mb-1">
                                    <span className="text-muted me-2">Blood Group:</span> 
                                    {basicInfo.bloodGroup || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <p className="mb-1">
                            <span className="text-muted me-2">Contact:</span> 
                            {basicInfo.contact || 'N/A'}
                        </p>
                        <p className="mb-1">
                            <span className="text-muted me-2">Email:</span> 
                            {basicInfo.email || 'N/A'}
                        </p>
                        <p className="mb-0">
                            <span className="text-muted me-2">Emergency Contact:</span> 
                            {basicInfo.emergencyContact || 'N/A'}
                        </p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="patient-stats">
                        <div className="row">
                            <div className="col-6">
                                <div className="stat-card bg-light p-3 rounded mb-3">
                                    <h6 className="text-primary mb-1">Height</h6>
                                    <p className="mb-0 fs-5">{basicInfo.height ? `${basicInfo.height} cm` : 'N/A'}</p>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="stat-card bg-light p-3 rounded mb-3">
                                    <h6 className="text-primary mb-1">Weight</h6>
                                    <p className="mb-0 fs-5">{basicInfo.weight ? `${basicInfo.weight} kg` : 'N/A'}</p>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="stat-card bg-light p-3 rounded">
                                    <h6 className="text-primary mb-1">Total Visits</h6>
                                    <p className="mb-0 fs-5">{visits.length}</p>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="stat-card bg-light p-3 rounded">
                                    <h6 className="text-primary mb-1">Health Score</h6>
                                    <p className="mb-0 fs-5">
                                        {overallHealth.score}
                                        {overallHealth.score !== 'N/A' && '/100'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="col-12 mt-3">
                                <div className="stat-card bg-light p-3 rounded">
                                    <h6 className="text-primary mb-1">BMI</h6>
                                    <p className="mb-0 fs-5">
                                        {bmi}
                                        {bmi !== 'N/A' && (
                                            <span className="ms-2 small">
                                                {parseFloat(bmi) < 18.5 ? '(Underweight)' :
                                                 parseFloat(bmi) < 25 ? '(Normal)' :
                                                 parseFloat(bmi) < 30 ? '(Overweight)' : '(Obese)'}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientProfileHeader;
