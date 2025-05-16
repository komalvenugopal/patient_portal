import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Tab, Tabs, Badge, Alert, Spinner, Row, Col, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartbeat, faStethoscope, faCalendarAlt, faUserMd, faNotesMedical } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './PatientProfileStyles.css';

// Import components
import VisitSummaries from './VisitSummaries';
import HealthInsights from './HealthInsights';
import MedicalHistory from './MedicalHistory';

const EnhancedPatientProfileView = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('visits');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/patient-profile/${id || 'by-email/kaushikq.ravindran@gmail.com'}`);
        if (response.data.success) {
          const profileData = response.data.data;
          console.log('Profile data fetched:', profileData);
          setProfile(profileData);
        } else {
          setError('Failed to load patient profile');
        }
      } catch (err) {
        console.error('Error fetching patient profile:', err);
        setError('Error loading patient profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="sjsu-loading-spinner">
          <Spinner animation="border" role="status" variant="primary" />
        </div>
        <p className="mt-3">Loading patient profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <Alert variant="danger" className="m-5">
        {error || 'Patient profile not found'}
      </Alert>
    );
  }

  // Calculate BMI if height and weight are available
  let bmi = 'N/A';
  let bmiCategory = '';
  if (profile.basicInfo?.height && profile.basicInfo?.weight) {
    const heightInMeters = parseFloat(profile.basicInfo.height) / 100;
    const weightInKg = parseFloat(profile.basicInfo.weight);
    if (!isNaN(heightInMeters) && !isNaN(weightInKg) && heightInMeters > 0) {
      bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
      
      // Calculate BMI category
      if (bmi < 18.5) bmiCategory = 'Underweight';
      else if (bmi < 25) bmiCategory = 'Normal';
      else if (bmi < 30) bmiCategory = 'Overweight';
      else bmiCategory = 'Obese';
    }
  }

  // Format health score for display
  const healthScore = 
    profile.aiGeneratedInsights?.overallHealth?.score || 
    profile.aiGeneratedInsights?.healthScore || 
    profile.healthScore || 
    profile.health_score ||
    profile.score ||
    profile.basicInfo?.healthScore || 
    profile.basicInfo?.health_score ||
    profile.basicInfo?.score ||
    'N/A';

  const healthScoreColor = 
    healthScore >= 80 ? 'success' :
    healthScore >= 60 ? 'info' :
    healthScore >= 40 ? 'warning' : 'danger';

  // Format date for latest visit
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'N/A';
    }
  };

  // Get the latest visit
  const latestVisit = profile.visits && profile.visits.length > 0 ? 
    [...profile.visits].sort((a, b) => {
      try {
        return new Date(b.date) - new Date(a.date);
      } catch (e) {
        console.error('Error sorting dates:', e);
        return 0;
      }
    })[0] : null;

  // Get chronic conditions
  const chronicConditions = profile.medicalHistory?.chronicConditions || [];
  
  return (
    <div className="patient-profile-container">
      {/* SJSU TeleHealth Banner */}
      <section className="sjsu-banner">
        <Container>
          <div className="sjsu-banner-content">
            <h5 className="sjsu-banner-subtitle">SJSU TeleHealth: AI-Powered Healthcare</h5>
            <h1 className="sjsu-banner-title">Health Profile</h1>
            <p className="sjsu-banner-description">
              View your comprehensive health information, visit history, and AI-generated health insights
            </p>
          </div>
        </Container>
      </section>

      <Container>
        <Card className="profile-card mb-4">
          <Card.Header className="profile-header">
            <h4 className="mb-0">Patient Health Profile</h4>
            {healthScore !== 'N/A' && (
              <Badge bg={healthScoreColor} className="health-score-badge">
                Health Score: {healthScore}
              </Badge>
            )}
          </Card.Header>
          <Card.Body>
            <div className="patient-profile-header">
              <Row>
                <Col md={4} className="mb-4">
                  <div className="avatar-container text-center">
                    <div className="avatar">
                      {profile.basicInfo?.name?.charAt(0) || profile.email?.charAt(0) || 'U'}
                    </div>
                  </div>
                </Col>
                <Col md={8} className="mb-4">
                  <h2 className="patient-name">{profile.basicInfo?.name || 'Unknown'}</h2>
                  <div className="patient-info">
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span>{profile.basicInfo?.email || profile.email || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Age:</span>
                      <span>{profile.basicInfo?.age || 'N/A'} {profile.basicInfo?.age ? 'years' : ''}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Gender:</span>
                      <span>{profile.basicInfo?.gender || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Blood Group:</span>
                      <span>{profile.basicInfo?.bloodGroup || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Contact:</span>
                      <span>{profile.basicInfo?.contact || 'Not specified'}</span>
                    </div>
                    {profile.basicInfo?.emergencyContact && (
                      <div className="info-item">
                        <span className="info-label">Emergency Contact:</span>
                        <span>{profile.basicInfo.emergencyContact}</span>
                      </div>
                    )}
                    {profile.basicInfo?.emergencyContactRelation && (
                      <div className="info-item">
                        <span className="info-label">Emergency Relation:</span>
                        <span>{profile.basicInfo.emergencyContactRelation}</span>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>

        {/* Health Summary Cards */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="profile-card h-100">
              <Card.Body className="text-center py-4">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={faStethoscope} size="lg" />
                </div>
                <h5 className="mb-3">Recent Visits</h5>
                <p>{profile.visits ? profile.visits.length : 0} total visits</p>
                <p className="text-muted">
                  Last visit: {latestVisit ? formatDate(latestVisit.date) : 'N/A'}
                </p>
                <Link to="#visits">
                  <button className="sjsu-action-button mt-2" onClick={() => setActiveTab('visits')}>
                    View Details
                  </button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="profile-card h-100">
              <Card.Body className="text-center py-4">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={faHeartbeat} size="lg" />
                </div>
                <h5 className="mb-3">Health Insights</h5>
                <p>AI-generated health assessment</p>
                <p className="text-muted">
                  Health Score: <span className={`text-${healthScoreColor} fw-bold`}>{healthScore}</span>
                </p>
                <Link to="#insights">
                  <button className="sjsu-action-button mt-2" onClick={() => setActiveTab('insights')}>
                    View Insights
                  </button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="profile-card h-100">
              <Card.Body className="text-center py-4">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={faNotesMedical} size="lg" />
                </div>
                <h5 className="mb-3">Medical History</h5>
                <p>{chronicConditions.length} chronic conditions</p>
                <p className="text-muted">
                  Complete health record management
                </p>
                <Link to="#history">
                  <button className="sjsu-action-button mt-2" onClick={() => setActiveTab('history')}>
                    View History
                  </button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabs Navigation */}
        <div className="profile-tabs-container" id={activeTab}>
          <Tabs 
            activeKey={activeTab} 
            onSelect={(k) => setActiveTab(k)}
            className="profile-tabs"
          >
            <Tab eventKey="visits" title={<><FontAwesomeIcon icon={faCalendarAlt} className="me-3" /><span style={{marginLeft: '5px'}}>Visit Summaries</span></>} className="profile-tab">
              <VisitSummaries visits={profile.visits || []} />
            </Tab>
            <Tab eventKey="insights" title={<><FontAwesomeIcon icon={faHeartbeat} className="me-3" /><span style={{marginLeft: '5px'}}>Health Insights</span></>} className="profile-tab">
              <HealthInsights 
                insights={profile} 
                chronicDiseaseRisks={[]} 
                healthMetrics={[]} 
                chronicDiseases={profile.medicalHistory?.chronicConditions || []}
              />
            </Tab>
            <Tab eventKey="history" title={<><FontAwesomeIcon icon={faNotesMedical} className="me-3" /><span style={{marginLeft: '5px'}}>Medical History</span></>} className="profile-tab">
              <MedicalHistory 
                medicalHistory={profile.medicalHistory || {}} 
                basicInfo={profile.basicInfo || {}}
              />
            </Tab>
          </Tabs>
        </div>
      </Container>
    </div>
  );
};

export default EnhancedPatientProfileView;
