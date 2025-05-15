import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Tab, Tabs, Badge, Alert, Spinner } from 'react-bootstrap';
// Use correct imports with consistent casing
import VisitSummaries from './VisitSummaries';
import HealthInsights from './HealthInsights';
import MedicalHistory from './MedicalHistory';
import PatientProfileHeader from './PatientProfileHeader';
import axios from 'axios';

const PatientProfileView = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/patient-profile/${id}`);
        if (response.data.success) {
          const profileData = response.data.data;
          setProfile(profileData);
          
          // Fetch insights separately if they don't exist
          if (!profileData.aiGeneratedInsights) {
            fetchInsights(profileData._id);
          }
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
    
    const fetchInsights = async (profileId) => {
      try {
        setInsightsLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/patient-profile/${profileId}/insights`);
        if (response.data.success) {
          setInsights(response.data.data);
          // Update the profile with the insights
          setProfile(prevProfile => ({
            ...prevProfile,
            aiGeneratedInsights: response.data.data
          }));
        }
      } catch (err) {
        console.error('Error fetching insights:', err);
      } finally {
        setInsightsLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary" />
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

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Patient Profile</h4>
              {profile.aiGeneratedInsights?.overallHealth && (
                <Badge 
                  bg={
                    profile.aiGeneratedInsights.overallHealth.score >= 70 ? 'success' : 
                    profile.aiGeneratedInsights.overallHealth.score >= 40 ? 'warning' : 'danger'
                  }
                  className="fs-6"
                >
                  Health Score: {profile.aiGeneratedInsights.overallHealth.score}
                </Badge>
              )}
            </Card.Header>
            <Card.Body>
              <PatientProfileHeader profile={profile} />

              <Tabs defaultActiveKey="visits" className="mb-3">
                <Tab eventKey="visits" title="Visit Summaries">
                  <VisitSummaries visits={profile.visits || []} />
                </Tab>
                <Tab eventKey="insights" title="Health Insights">
                  {insightsLoading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" variant="primary" size="sm" />
                      <p className="mt-2">Generating health insights...</p>
                    </div>
                  ) : (
                    <HealthInsights insights={profile.aiGeneratedInsights} />
                  )}
                </Tab>
                <Tab eventKey="history" title="Medical History">
                  <MedicalHistory 
                    medicalHistory={profile.medicalHistory || {}} 
                    basicInfo={profile.basicInfo || {}}
                  />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientProfileView;
