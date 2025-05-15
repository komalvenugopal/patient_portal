import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Badge, ProgressBar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faUser, faVenusMars, faEnvelope, faCalendarCheck, faHeartbeat } from '@fortawesome/free-solid-svg-icons';
import './DataTable.css';

const PatientProfilesDataTable = ({ patientProfiles }) => {
    // Helper function to format date
    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'No visits';
            const date = new Date(dateString);
            // Check if date is valid
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric'
            });
        } catch (e) {
            console.error("Date formatting error:", e);
            return 'Invalid Date';
        }
    };

    // Helper function to get health score from various possible locations
    const getHealthScore = (profile) => {
        return profile.aiGeneratedInsights?.overallHealth?.score || 
               profile.aiGeneratedInsights?.healthScore || 
               profile.healthScore || 
               profile.basicInfo?.healthScore || 
               profile.basicInfo?.health_score ||
               profile.basicInfo?.score ||
               'N/A';
    };

    // Helper function to get the latest visit date
    const getLatestVisitDate = (profile) => {
        if (!profile.visits || profile.visits.length === 0) return 'No visits';
        
        try {
            // Sort visits by date (newest first) and get the first one
            const sortedVisits = [...profile.visits].sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });
            
            return sortedVisits[0].date;
        } catch (e) {
            console.error("Error getting latest visit date:", e);
            return 'No visits';
        }
    };

    return (
        <div className="bg-white rounded shadow-sm p-4">

            {patientProfiles.length === 0 ? (
                <div className="alert alert-info">No patient profiles found.</div>
            ) : (
                <div className="table-responsive">
                    <Table hover className="align-middle">
                        <thead className="table-light">
                            <tr>
                                <th><FontAwesomeIcon icon={faUser} className="me-3" /> Name</th>
                                <th>Age</th>
                                <th><FontAwesomeIcon icon={faVenusMars} className="me-3" /> Gender</th>
                                <th><FontAwesomeIcon icon={faEnvelope} className="me-3" /> Email</th>
                                <th><FontAwesomeIcon icon={faCalendarCheck} className="me-3" /> Last Visit</th>
                                <th><FontAwesomeIcon icon={faHeartbeat} className="me-3" /> Health Score</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patientProfiles.map((profile) => {
                                const healthScore = getHealthScore(profile);
                                const latestVisitDate = getLatestVisitDate(profile);
                                
                                return (
                                    <tr key={profile._id}>
                                        <td>
                                            <span className="fw-medium">{profile.basicInfo?.name || 'Unknown'}</span>
                                        </td>
                                        <td>{profile.basicInfo?.age || 'N/A'}</td>
                                        <td>{profile.basicInfo?.gender || 'N/A'}</td>
                                        <td>{profile.basicInfo?.email || profile.email || 'N/A'}</td>
                                        <td>
                                            {formatDate(latestVisitDate)}
                                        </td>
                                        <td>
                                            {healthScore === 'N/A' ? (
                                                <Badge bg="secondary">Not available</Badge>
                                            ) : (
                                                <div className="d-flex align-items-center">
                                                    <ProgressBar 
                                                        now={healthScore} 
                                                        variant={
                                                            healthScore >= 70 ? 'success' : 
                                                            healthScore >= 50 ? 'info' :
                                                            healthScore >= 40 ? 'warning' : 'danger'
                                                        }
                                                        style={{ height: "10px", width: "80px" }}
                                                        className="me-2"
                                                    />
                                                    <span className={
                                                        `text-${healthScore >= 70 ? 'success' : 
                                                        healthScore >= 50 ? 'info' :
                                                        healthScore >= 40 ? 'warning' : 'danger'} fw-medium`
                                                    }>
                                                        {healthScore}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <Link 
                                                to={`/dashboard/patient-profile/${profile._id}`} 
                                                className="btn btn-sm btn-primary rounded-pill"
                                            >
                                                <FontAwesomeIcon icon={faEye} className="me-2" /> View
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default PatientProfilesDataTable;
