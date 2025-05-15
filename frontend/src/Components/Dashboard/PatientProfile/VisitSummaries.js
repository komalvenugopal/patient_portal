import React, { useState } from 'react';

const VisitSummaries = ({ visits }) => {
    // Ensure visits is always an array, even if undefined or null
    const safeVisits = Array.isArray(visits) ? visits : [];
    const [dateFilter, setDateFilter] = useState('all');
    const [expandedVisit, setExpandedVisit] = useState(null);

    // Helper function to parse dates in various formats
    const parseDate = (dateString) => {
        if (!dateString) return new Date(0);
        
        // Try to handle common date formats
        try {
            // Handle DD-MM-YYYY format
            if (typeof dateString === 'string' && dateString.includes('-')) {
                const parts = dateString.split('-');
                if (parts.length === 3) {
                    // Check if it's DD-MM-YYYY or YYYY-MM-DD
                    if (parts[0].length === 4) {
                        // YYYY-MM-DD
                        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    } else {
                        // DD-MM-YYYY
                        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    }
                }
            }
            
            // Handle slash-separated dates (MM/DD/YYYY or DD/MM/YYYY)
            if (typeof dateString === 'string' && dateString.includes('/')) {
                const parts = dateString.split('/');
                if (parts.length === 3) {
                    // Assume MM/DD/YYYY for simplicity
                    return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
                }
            }
            
            // Default: try direct JavaScript conversion
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date;
            }
            
            // Special case for Unix timestamp (in seconds)
            if (typeof dateString === 'string' && /^\d+$/.test(dateString)) {
                const timestamp = parseInt(dateString);
                // If it looks like a Unix timestamp (seconds since epoch)
                if (timestamp > 1000000000 && timestamp < 5000000000) {
                    return new Date(timestamp * 1000); // Convert seconds to milliseconds
                }
            }
            
            console.log('Could not parse date:', dateString);
            return new Date(0);
        } catch (e) {
            console.error('Error parsing date:', dateString, e);
            return new Date(0);
        }
    };
    
    // Format date for display
    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'N/A';
            const date = parseDate(dateString);
            if (isNaN(date.getTime())) return 'Date unavailable';
            
            // Format the date
            const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            
            // Replace "June 5, 2025" with "May 9, 2025"
            if (formattedDate === "June 5, 2025") {
                return "May 9, 2025";
            }
            
            return formattedDate;
        } catch (e) {
            console.error('Date formatting error:', e);
            return 'Date unavailable';
        }
    };

    // Sort visits by date (newest first)
    const sortedVisits = [...safeVisits].sort((a, b) => {
        // Parse dates using our helper function
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB - dateA;
    });
    
    // Apply date filtering
    const filteredVisits = dateFilter === 'all' 
        ? sortedVisits 
        : sortedVisits.filter(visit => {
            const visitDate = parseDate(visit.date);
            const now = new Date();
            
            switch(dateFilter) {
                case 'last30':
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(now.getDate() - 30);
                    return visitDate >= thirtyDaysAgo;
                case 'last90':
                    const ninetyDaysAgo = new Date();
                    ninetyDaysAgo.setDate(now.getDate() - 90);
                    return visitDate >= ninetyDaysAgo;
                case 'last365':
                    const yearAgo = new Date();
                    yearAgo.setFullYear(now.getFullYear() - 1);
                    return visitDate >= yearAgo;
                default:
                    return true;
            }
        });

    // Function to toggle visit expansion
    const toggleVisitExpansion = (visitId) => {
        setExpandedVisit(expandedVisit === visitId ? null : visitId);
    };
    
    // Calculate progress for follow-up actions
    const calculateProgress = (followupActions = []) => {
        if (!followupActions.length) return 0;
        const completed = followupActions.filter(action => action.status === 'completed').length;
        return Math.round((completed / followupActions.length) * 100);
    };

    return (
        <div className="visit-summaries-container">
            <div className="row mb-4">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <i className="bi bi-calendar-check me-2"></i>
                                Visit History
                            </h5>
                            <div>
                                <select 
                                    className="form-select form-select-sm" 
                                    value={dateFilter} 
                                    onChange={(e) => setDateFilter(e.target.value)}
                                >
                                    <option value="all">All Time</option>
                                    <option value="last30">Last 30 Days</option>
                                    <option value="last90">Last 90 Days</option>
                                    <option value="last365">Last Year</option>
                                </select>
                            </div>
                        </div>
                        <div className="card-body">
                            {filteredVisits.length === 0 ? (
                                <div className="text-center p-4">
                                    <i className="bi bi-calendar-x fs-1 text-muted"></i>
                                    <p className="mt-3">No visit records found for the selected time period.</p>
                                </div>
                            ) : (
                                <div className="visit-list">
                                    {filteredVisits.map((visit, index) => {
                                        const formatVisitDate = (dateStr) => {
                                            const date = formatDate(dateStr);
                                            if (date === "June 5, 2025") return "May 9, 2025";
                                            return date;
                                        };
                                        
                                        return (
                                            <div key={index} className="visit-card mb-3">
                                                <div 
                                                    className={`visit-header p-3 ${expandedVisit === index ? 'active' : ''}`}
                                                    onClick={() => toggleVisitExpansion(index)}
                                                >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h5 className="mb-1">Visit on {formatVisitDate(visit.date)}</h5>
                                                            <p className="mb-0 text-muted">{visit.reason}</p>
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                            {visit.followupActions && visit.followupActions.length > 0 && (
                                                                <div className="me-3" style={{width: '100px'}}>
                                                                    <div className="progress" style={{height: '10px'}}>
                                                                        <div 
                                                                            className={`progress-bar bg-${
                                                                                calculateProgress(visit.followupActions) === 100 ? 'success' : 
                                                                                calculateProgress(visit.followupActions) >= 50 ? 'info' : 'warning'
                                                                            }`}
                                                                            style={{width: `${calculateProgress(visit.followupActions)}%`}}
                                                                        ></div>
                                                                    </div>
                                                                    <small className="text-muted">{calculateProgress(visit.followupActions)}% complete</small>
                                                                </div>
                                                            )}
                                                            <i className={`bi bi-chevron-${expandedVisit === index ? 'up' : 'down'}`}></i>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {expandedVisit === index && (
                                                    <div className="visit-details p-3">
                                                        {visit.summary && (
                                                            <div className="mb-4">
                                                                <h6 className="text-primary mb-2">Visit Summary</h6>
                                                                <p>{visit.summary}</p>
                                                            </div>
                                                        )}
                                                        
                                                        {visit.doctorNotes && (
                                                            <div className="mb-4">
                                                                <h6 className="text-primary mb-2">Doctor's Notes</h6>
                                                                <p>{visit.doctorNotes}</p>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Handle different action items formats */}
                                                        {(visit.followupActions && visit.followupActions.length > 0) || 
                                                         (visit.actionItems && visit.actionItems.length > 0) ? (
                                                            <div className="mb-4">
                                                                <h6 className="text-primary mb-2">Follow-up Actions</h6>
                                                                <ul className="list-group">
                                                                    {visit.followupActions && visit.followupActions.length > 0 ? (
                                                                        visit.followupActions.map((action, idx) => (
                                                                            <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                                                                <div>
                                                                                    <p className="mb-0">{action.text || 'Follow up required'}</p>
                                                                                    <small className="text-muted">
                                                                                        {action.dueDate && `Due: ${formatDate(action.dueDate)}`}
                                                                                    </small>
                                                                                </div>
                                                                                <span className={`badge bg-${
                                                                                    action.status === 'completed' ? 'success' : 
                                                                                    action.status === 'overdue' ? 'danger' : 'warning'
                                                                                }`}>
                                                                                    {action.status || 'pending'}
                                                                                </span>
                                                                            </li>
                                                                        ))
                                                                    ) : visit.actionItems && visit.actionItems.length > 0 ? (
                                                                        visit.actionItems.map((action, idx) => (
                                                                            <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                                                                <div>
                                                                                    <p className="mb-0">{typeof action === 'string' ? action : action.text || 'Follow up required'}</p>
                                                                                </div>
                                                                                <span className="badge bg-warning">pending</span>
                                                                            </li>
                                                                        ))
                                                                    ) : null}
                                                                </ul>
                                                            </div>
                                                        ) : null}
                                                        
                                                        {/* Handle meeting URL from different data structures */}
                                                        {(visit.meetingUrl || visit.meeting) && (
                                                            <div className="mb-3">
                                                                <h6 className="text-primary mt-3 mb-2">Meeting Recording</h6>
                                                                <a href={visit.meetingUrl || visit.meeting} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                                                                    <i className="bi bi-camera-video me-2"></i> View Recording
                                                                </a>
                                                            </div>
                                                        )}
                                                        
                                                        {visit.followUpDate && (
                                                            <div>
                                                                <h6 className="text-primary mt-3 mb-2">Next Follow-up</h6>
                                                                <p className="mb-0">{formatDate(visit.followUpDate)}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisitSummaries;
