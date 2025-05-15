import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Card, Pagination, Spinner, Alert, Container, Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faUsers, faSearch } from '@fortawesome/free-solid-svg-icons';
import { DataContext } from '../../../App';
import PatientProfilesDataTable from '../../DataTables/PatientProfilesDataTable';
import '../PatientProfile/PatientProfileStyles.css';
import { useHistory } from 'react-router-dom';

const PatientProfilesList = () => {
  const ContextData = useContext(DataContext);
  const loggedInUser = ContextData.loggedInUser || {};
  const allPatients = ContextData.allPatients || [];
  const history = useHistory();
  
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirectChecked, setRedirectChecked] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Log user information for debugging
  console.log('PatientProfilesList - User Info:', {
    userEmail: loggedInUser?.email,
    userName: loggedInUser?.name,
    userRole: loggedInUser?.role,
  });

  // Function to check if user is a doctor/admin
  const isUserDoctor = () => {
    // List of known admin emails
    const knownAdminEmails = [
      'komalvenugopal@gmail.com',
      'doctor@example.com',
      'admin@example.com',
      'kaushikq.ravindran@sjsu.edu'
    ];
    
    // Check for explicit admin emails
    if (loggedInUser?.email && knownAdminEmails.includes(loggedInUser.email)) {
      console.log('User recognized as admin by email match');
      return true;
    }
    
    // Check for explicit doctor role
    if (loggedInUser?.role === 'doctor' || loggedInUser?.role === 'admin' || loggedInUser?.isDoctor === true) {
      console.log('User recognized as admin by role property');
      return true;
    }
    
    // Check email domain for doctors (not reliable but a fallback)
    if (loggedInUser?.email && (
      loggedInUser.email.includes('@doctor') || 
      loggedInUser.email.includes('@admin') ||
      loggedInUser.email.includes('@sjsu.edu')
    )) {
      console.log('User recognized as admin by email domain');
      return true;
    }
    
    console.log('User not recognized as doctor/admin');
    return false;
  };

  // Fetch all profiles (for admins only)
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5001';
      console.log('Fetching profiles from:', `${baseUrl}/api/patient-profiles?page=${pagination.page}&limit=${pagination.limit}`);
      
      const response = await axios.get(
        `${baseUrl}/api/patient-profiles?page=${pagination.page}&limit=${pagination.limit}`
      );
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        // Handle different response structures
        if (Array.isArray(response.data.data)) {
          // Handle array response
          setProfiles(response.data.data);
          setPagination({
            ...pagination,
            total: response.data.data.length,
            pages: 1
          });
        } else if (response.data.data && response.data.data.profiles) {
          // Handle object with profiles property
          setProfiles(response.data.data.profiles);
          setPagination({
            ...pagination,
            total: response.data.data.pagination?.total || response.data.data.profiles.length,
            pages: response.data.data.pagination?.pages || 1
          });
        } else if (response.data.data) {
          // Fallback to data as profiles
          setProfiles(Array.isArray(response.data.data) ? response.data.data : [response.data.data]);
          setPagination({
            ...pagination,
            total: Array.isArray(response.data.data) ? response.data.data.length : 1,
            pages: 1
          });
        } else {
          setProfiles([]);
          setError('No profiles found in API response');
        }
      } else {
        setError('Failed to load patient profiles');
      }
    } catch (err) {
      console.error('Error fetching patient profiles:', err);
      setError('Error loading patient profiles');
    } finally {
      setLoading(false);
    }
  };

  // Redirect patients to their profile on component mount
  useEffect(() => {
    if (!loggedInUser?.email) {
      console.log('No logged in user found');
      setLoading(false);
      return;
    }
    
    console.log(`Checking role for user: ${loggedInUser.email}`);
    
    // Check if user is doctor/admin first
    if (isUserDoctor()) {
      console.log('User is doctor/admin, loading all profiles');
      fetchProfiles();
      return;
    }
    
    // Only proceed with patient checks if we haven't redirected yet
    if (!redirectChecked) {
      const checkPatientProfileAndRedirect = async () => {
        try {
          setRedirectChecked(true); // Set this first to prevent multiple attempts
          const userEmail = loggedInUser?.email;
          if (!userEmail) {
            console.log('No user email found, showing all profiles');
            fetchProfiles();
            return;
          }
          
          // User is likely a patient, try to find their profile
          console.log('User appears to be a patient, looking for their profile');
          setLoading(true);
          
          // First try looking up by email directly via the dedicated endpoint
          const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5001';
          try {
            console.log(`Looking up patient profile by email: ${userEmail}`);
            const response = await axios.get(`${baseUrl}/api/patient-profile-by-email/${userEmail}`);
            
            if (response.data.success && response.data.data && response.data.data._id) {
              console.log('Found patient profile by email lookup:', response.data.data);
              history.replace(`/dashboard/patient-profile/${response.data.data._id}`);
              return;
            }
          } catch (err) {
            console.log('Error looking up profile by email:', err.message);
          }
          
          // If email lookup fails, try searching through all profiles
          try {
            console.log('Email lookup failed, searching in all profiles');
            const allProfilesResponse = await axios.get(`${baseUrl}/api/patient-profiles?limit=100`);
            
            let allProfiles = [];
            if (allProfilesResponse.data.success) {
              if (Array.isArray(allProfilesResponse.data.data)) {
                allProfiles = allProfilesResponse.data.data;
              } else if (allProfilesResponse.data.data && allProfilesResponse.data.data.profiles) {
                allProfiles = allProfilesResponse.data.data.profiles;
              }
              
              console.log(`Searching through ${allProfiles.length} profiles for email match`);
              
              // Look for matching email in any field
              const matchingProfile = allProfiles.find(profile => {
                if (!profile) return false;
                
                return (
                  (profile.email === userEmail) ||
                  (profile.basicInfo && profile.basicInfo.email === userEmail) || 
                  (profile.user && profile.user.email === userEmail) ||
                  (profile.patientInfo && profile.patientInfo.email === userEmail)
                );
              });
              
              if (matchingProfile && matchingProfile._id) {
                console.log('Found matching profile in full search:', matchingProfile);
                history.replace(`/dashboard/patient-profile/${matchingProfile._id}`);
                return;
              }
            }
          } catch (err) {
            console.log('Error searching all profiles:', err.message);
          }
          
          // If all attempts fail, just redirect to empty profile page
          console.log('Could not find matching profile after all attempts');
          history.replace('/dashboard/patient-profile');
          
        } catch (error) {
          console.error('Error in checkPatientProfileAndRedirect:', error);
          fetchProfiles(); // Fall back to showing all profiles
        } finally {
          setLoading(false);
        }
      };
      
      checkPatientProfileAndRedirect();
    }
  }, [loggedInUser, redirectChecked, history]);

  const handlePageChange = (newPage) => {
    setPagination({
      ...pagination,
      page: newPage
    });
  };

  // Sync all appointments with patient profiles
  const handleSyncProfiles = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // Get the base URL with fallback to localhost if environment variable is not set
      const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5001';
      console.log('Using API base URL:', baseUrl);
      
      // Make the API call to sync appointments
      console.log('Calling sync-appointments endpoint...');
      const response = await axios.post(`${baseUrl}/api/sync-appointments`, {}, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });
      
      console.log('Sync response:', response.data);
      
      if (response.data && response.data.success) {
        // Refresh profiles after sync
        console.log('Sync successful, refreshing profiles...');
        try {
          const profilesResponse = await axios.get(
            `${baseUrl}/api/patient-profiles?page=${pagination.page}&limit=${pagination.limit}`
          );
          
          console.log('Profiles response:', profilesResponse.data);
          
          if (profilesResponse.data && profilesResponse.data.success) {
            // Update profiles list
            setProfiles(profilesResponse.data.data.profiles || []);
            setPagination({
              ...pagination,
              total: profilesResponse.data.data.pagination?.total || 0,
              pages: profilesResponse.data.data.pagination?.pages || 1
            });
            
            // Show detailed success message
            const successCount = response.data.results?.success || 0;
            const failedCount = response.data.results?.failed || 0;
            const totalCount = successCount + failedCount;
            
            alert(`Sync completed: ${successCount} of ${totalCount} profiles updated successfully.`);
          } else {
            setError('Failed to refresh profiles after sync');
          }
        } catch (profileErr) {
          console.error('Error refreshing profiles after sync:', profileErr);
          setError('Sync was successful, but there was an error refreshing the profiles list');
        }
      } else {
        // Handle unsuccessful sync
        const errorMessage = response.data?.error || 'Failed to sync appointments with patient profiles';
        console.error('Sync failed:', errorMessage);
        setError(`Sync failed: ${errorMessage}`);
      }
    } catch (err) {
      // Handle API call errors
      console.error('Error syncing appointments:', err);
      
      // Provide more detailed error message
      let errorMessage = 'Error syncing appointments with patient profiles';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Server error (${err.response.status}): ${err.response.data?.error || err.message}`;
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response received from server. Please check if the backend is running.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = `Request error: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-profile-container">
      {/* SJSU TeleHealth Banner */}
      <section className="sjsu-banner">
        <Container>
          <div className="sjsu-banner-content">
            <h5 className="sjsu-banner-subtitle">SJSU TeleHealth: AI-Powered Healthcare</h5>
            <h1 className="sjsu-banner-title">Patient Profiles</h1>
            <p className="sjsu-banner-description">
              View and manage comprehensive health records for all patients. Profiles include visit history,
              health metrics, and AI-generated insights.
            </p>
          </div>
        </Container>
      </section>

      <Container>
        <Card className="profile-card mb-4">
          <Card.Header className="profile-header d-flex justify-content-between align-items-center">
            <div>
              <FontAwesomeIcon icon={faUsers} className="me-3" />
              <span style={{marginLeft: '5px'}}>All Patient Profiles</span>
            </div>
            <Button 
              className="sjsu-action-button" 
              onClick={handleSyncProfiles}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Syncing Profiles...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSyncAlt} className="me-3" />
                  <span style={{marginLeft: '5px'}}>Sync Profiles</span>
                </>
              )}
            </Button>
          </Card.Header>
          <Card.Body>
            {error ? (
              <Alert variant="danger">
                <FontAwesomeIcon icon={faSearch} className="me-3" />
                {error}
              </Alert>
            ) : loading ? (
              <div className="text-center py-5">
                <div className="sjsu-loading-spinner">
                  <Spinner animation="border" role="status" variant="primary" />
                </div>
                <p className="mt-3">Loading patient profiles...</p>
              </div>
            ) : (
              <>
                <PatientProfilesDataTable patientProfiles={profiles} />
                
                {/* Pagination controls */}
                {pagination.pages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination className="profile-pagination">
                      <Pagination.Prev 
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      />
                      
                      {[...Array(pagination.pages).keys()].map(page => (
                        <Pagination.Item 
                          key={page + 1} 
                          active={pagination.page === page + 1}
                          onClick={() => handlePageChange(page + 1)}
                        >
                          {page + 1}
                        </Pagination.Item>
                      ))}
                      
                      <Pagination.Next 
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PatientProfilesList;
