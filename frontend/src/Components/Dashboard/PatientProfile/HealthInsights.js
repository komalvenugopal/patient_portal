import React from 'react';

const HealthInsights = ({ insights, chronicDiseaseRisks, healthMetrics, chronicDiseases }) => {
    // Ensure insights is always an object, even if undefined or null
    const safeInsights = insights || {};
    // The ENTIRE profile is passed as 'insights', need to access aiGeneratedInsights
    const aiGeneratedInsights = safeInsights.aiGeneratedInsights || {};

    // Directly access the data from the correct location in the provided JSON
    const safeChronicDiseaseRisks = aiGeneratedInsights.riskFactors || [];
    const safeHealthMetrics = aiGeneratedInsights.healthTrends || [];
    const safeRecommendedActions = aiGeneratedInsights.recommendedActions || [];
    const safeChronicDiseases = chronicDiseases || [];
    
    // Extract health score from potentially different data structures
    const healthScore = 
        (safeInsights.overallHealth && safeInsights.overallHealth.score) || 
        safeInsights.healthScore || 
        safeInsights.health_score || 
        safeInsights.score || 
        0;

    // Format health score for display
    const healthScoreColor = 
        healthScore >= 80 ? '#28a745' :  // green
        healthScore >= 60 ? '#17a2b8' :  // blue
        healthScore >= 40 ? '#ffc107' :  // yellow
                            '#dc3545';   // red

    // Format date for display
    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        } catch (e) {
            console.error('Date formatting error:', e);
            return 'N/A';
        }
    };
        
    // Check if we have any insights data
    const hasInsightsData = healthScore > 0 || 
                          safeChronicDiseaseRisks.length > 0 || 
                          safeHealthMetrics.length > 0 || 
                          (safeInsights.recommendedActions && safeInsights.recommendedActions.length > 0) ||
                          safeChronicDiseases.length > 0;

    return (
        <div className="health-insights">
            <div className="card mb-4">
                <div className="card-body">

                    
                    <div className="row">
                {/* Overall Health Score */}
                <div className="col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h6 className="mb-3">Overall Health Score</h6>
                            {healthScore > 0 ? (
                                <div className="text-center my-4">
                                    <div className="position-relative d-inline-block">
                                        <svg width="160" height="160" viewBox="0 0 160 160">
                                            <circle
                                                cx="80"
                                                cy="80"
                                                r="70"
                                                fill="none"
                                                stroke="#e9ecef"
                                                strokeWidth="12"
                                            />
                                            <circle
                                                cx="80"
                                                cy="80"
                                                r="70"
                                                fill="none"
                                                stroke={healthScoreColor}
                                                strokeWidth="12"
                                                strokeDasharray="440"
                                                strokeDashoffset={440 - (440 * healthScore / 100)}
                                                strokeLinecap="round"
                                                transform="rotate(-90 80 80)"
                                            />
                                        </svg>
                                    </div>
                                    <div className="mt-3">
                                        <h1 className="display-4 fw-bold mb-0">{healthScore}</h1>
                                        <p className="text-muted">out of 100</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="alert alert-info">No health score available</div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Chronic Disease Risk */}
                <div className="col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h6 className="mb-3">Chronic Disease Risk</h6>
                            {safeChronicDiseaseRisks.length > 0 ? (
                                <div className="mt-3">
                                    {safeChronicDiseaseRisks.map((risk, index) => {
                                        // Determine risk level from severity field first (matches actual JSON structure)
                                        const riskLevel = risk.severity || risk.riskLevel || 'Medium';
                                        
                                        // Determine risk percentage based on severity
                                        let riskPercentage;
                                        if (risk.risk) {
                                            riskPercentage = risk.risk;
                                        } else if (riskLevel === 'High') {
                                            riskPercentage = 75;
                                        } else if (riskLevel === 'Moderate') {
                                            riskPercentage = 60;
                                        } else if (riskLevel === 'Medium') {
                                            riskPercentage = 50;
                                        } else if (riskLevel === 'Low') {
                                            riskPercentage = 25;
                                        } else {
                                            riskPercentage = 50; // Default
                                        }
                                        
                                        // Determine color based on risk level
                                        const riskColor = 
                                            riskLevel === 'High' || riskPercentage > 70 ? 'danger' :
                                            (riskLevel === 'Medium' || riskLevel === 'Moderate') || riskPercentage > 40 ? 'warning' : 'success';
                                        
                                        return (
                                            <div key={index} className="mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="fw-medium" style={{fontSize: '1.05rem'}}>{risk.disease || risk.name || risk.factor || risk.condition || 'Unspecified Condition'}</span>
                                                    <span className={`badge bg-${riskColor}`}>{riskLevel}</span>
                                                </div>
                                                <div className="progress" style={{ height: '8px' }}>
                                                    <div 
                                                        className={`progress-bar bg-${riskColor}`} 
                                                        role="progressbar" 
                                                        style={{ width: `${riskPercentage}%` }} 
                                                        aria-valuenow={riskPercentage} 
                                                        aria-valuemin="0" 
                                                        aria-valuemax="100"
                                                    ></div>
                                                </div>
                                                {(risk.recommendation || risk.recommendations) && (
                                                    <small className="text-muted d-block mt-1">
                                                        {risk.recommendation || risk.recommendations}
                                                    </small>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : safeChronicDiseases.length > 0 ? (
                                <div className="mt-3">
                                    {safeChronicDiseases.map((disease, index) => (
                                        <div key={index} className="mb-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span>{typeof disease === 'string' ? disease : disease.name}</span>
                                                <span className="badge bg-danger">Diagnosed</span>
                                            </div>
                                            {typeof disease !== 'string' && disease.diagnosis_date && (
                                                <small className="text-muted d-block mt-1">
                                                    Diagnosed on: {formatDate(disease.diagnosis_date)}
                                                </small>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="alert alert-info">No chronic disease risk data available</div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Health Trends */}
                <div className="col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h6 className="mb-3">Health Metrics Trends</h6>
                            {safeHealthMetrics.length > 0 ? (
                                <div className="mt-3">
                                    {safeHealthMetrics.map((metric, index) => {
                                        // Get data array - handle different formats
                                        const metricData = metric.data || metric.values || metric.measurements || [];
                                        const metricDates = metric.dates || metric.timestamps || [];
                                        const metricName = metric.metric || metric.name || metric.type || 'Health Metric';
                                        const metricUnit = metric.unit || '';
                                        const metricTrend = metric.trend || metric.direction || '';
                                        
                                        // Skip metrics without data or with invalid data
                                        if (!Array.isArray(metricData) || metricData.length === 0) return null;
                                        
                                        // Handle string values, objects with value property, or direct numeric values
                                        const normalizeValue = value => {
                                            if (typeof value === 'object' && value !== null) {
                                                return parseFloat(value.value || value.reading || 0);
                                            }
                                            return parseFloat(value);
                                        };
                                        
                                        // Make sure all values are valid numbers
                                        const validData = metricData.map(normalizeValue).filter(value => !isNaN(value));
                                        if (validData.length === 0) return null;
                                        
                                        // Calculate min/max for scaling
                                        const min = Math.min(...validData);
                                        const max = Math.max(...validData);
                                        
                                        // Determine trend color - handle various trend descriptors
                                        let trendColor = '#17a2b8'; // Default blue
                                        if (['Improving', 'Good', 'Better', 'Positive', 'Up'].some(term => 
                                            metricTrend.toLowerCase().includes(term.toLowerCase()))) {
                                            trendColor = '#28a745'; // Green
                                        } else if (['Declining', 'Bad', 'Worse', 'Negative', 'Down'].some(term => 
                                            metricTrend.toLowerCase().includes(term.toLowerCase()))) {
                                            trendColor = '#dc3545'; // Red
                                        }
                                        
                                        return (
                                            <div key={index} className="mb-4">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span>{metricName}</span>
                                                    <small className="text-muted">{metricTrend}</small>
                                                </div>
                                                <div className="health-metric-chart">
                                                    <div className="metric-sparkline d-flex align-items-end" style={{ height: '40px' }}>
                                                        {validData.map((value, i) => {
                                                            // Safety check for valid numbers
                                                            if (isNaN(value)) return null;
                                                            
                                                            const range = max - min;
                                                            const normalizedHeight = range === 0 ? 50 : ((value - min) / range * 100);
                                                            
                                                            return (
                                                                <div 
                                                                    key={i} 
                                                                    className="sparkline-bar" 
                                                                    style={{ 
                                                                        height: `${normalizedHeight}%`, 
                                                                        backgroundColor: trendColor,
                                                                        flex: 1,
                                                                        margin: '0 1px',
                                                                        borderRadius: '1px',
                                                                        minHeight: '2px',
                                                                    }}
                                                                    title={`${metricDates && metricDates.length > i ? formatDate(metricDates[i]) : 'Date N/A'}: ${value} ${metricUnit}`}
                                                                ></div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="d-flex justify-content-between mt-1">
                                                        <small>{metricDates && metricDates.length > 0 ? formatDate(metricDates[0]) : 'Start Date N/A'}</small>
                                                        <small>{metricDates && metricDates.length > 0 ? formatDate(metricDates[metricDates.length-1]) : 'End Date N/A'}</small>
                                                    </div>
                                                    <div className="d-flex justify-content-between mt-2">
                                                        <small className="text-muted">Min: {min.toFixed(1)} {metricUnit}</small>
                                                        <small className="text-muted">Max: {max.toFixed(1)} {metricUnit}</small>
                                                    </div>
                                                    {metric.description && (
                                                        <div className="mt-2">
                                                            <small className="text-muted">{metric.description}</small>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }).filter(Boolean)}
                                </div>
                            ) : (
                                <div className="alert alert-info text-center p-4 mt-3">
                                    <i className="bi bi-graph-up me-2"></i>
                                    No health trend data available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Recommended Actions */}
                <div className="col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h6 className="mb-3">Recommended Actions</h6>
                            {safeRecommendedActions && safeRecommendedActions.length > 0 ? (
                                <ul className="list-group list-group-flush mt-3">
                                    {safeRecommendedActions.map((action, index) => {
                                        // Handle potential different data structures
                                        const actionText = action.action || action.text || action;
                                        const actionReason = action.reasoning || action.reason;
                                        const actionPriority = action.priority || 'Medium';
                                        
                                        // Determine priority badge color
                                        const priorityColor = 
                                            actionPriority === 'High' ? 'danger' :
                                            actionPriority === 'Medium' ? 'warning' : 'info';
                                        
                                        return (
                                            <li key={index} className="list-group-item px-0 py-3 border-bottom">
                                                <div className="d-flex align-items-start">
                                                    <div className="me-2 mt-1" style={{minWidth: '36px'}}>
                                                        <span className={`badge rounded-pill bg-${priorityColor} px-2 py-2`}>{index + 1}</span>
                                                    </div>
                                                    <div className="ms-1">
                                                        <p className="mb-2 fw-bold">{typeof actionText === 'string' ? actionText : 'Action Required'}</p>
                                                        {actionReason && (
                                                            <small className="text-muted d-block">{actionReason}</small>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <div className="alert alert-info">No recommended actions available</div>
                            )}
                        </div>
                    </div>
                </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthInsights;
