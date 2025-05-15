import pkg from 'mongodb';
const { ObjectId } = pkg;
import ragService from './ragService.js';

/**
 * Service for synchronizing appointments with patient profiles
 * This service ensures that appointments and patient profiles stay in sync
 */
class SyncService {
  constructor(db) {
    this.db = db;
    this.appointmentCollection = db.collection('appointments');
    this.patientProfileCollection = db.collection('patientProfiles');
  }

  /**
   * Convert appointment data to a visit that can be added to a patient profile
   * @param {Object} appointmentData - Appointment data
   * @returns {Object} Visit object
   */
  convertAppointmentToVisit(appointmentData) {
    // Extract relevant data from the appointment to create a visit
    const visit = {
      date: new Date(appointmentData.date || appointmentData.appointmentDate || new Date()),
      doctorId: appointmentData.doctorId || appointmentData.apId,
      appointmentId: appointmentData._id,
      chiefComplaints: appointmentData.complaints ? [appointmentData.complaints] : 
                      appointmentData.problem ? [appointmentData.problem] : [],
      summaryText: appointmentData.visitSummary || 
                  `Visit for ${appointmentData.serviceName || 'medical service'}`,
      // Convert prescription to the format expected by patient profile
      prescriptions: this._extractPrescriptions(appointmentData.prescription),
      // Add any symptoms if available
      symptoms: this._extractSymptoms(appointmentData),
      // Add meeting link if available
      meetingUrl: appointmentData.meeting || '',
      // Add transcript summary if available
      transcriptSummary: appointmentData.transcript_summary || '',
      // Add follow-up actions from meeting recording if available
      followupActions: this._extractActionItems(appointmentData.actionItems)
    };

    // If there's a follow-up date, include it
    if (appointmentData.followUpDate) {
      visit.followUpDate = new Date(appointmentData.followUpDate);
    }

    return visit;
  }

  /**
   * Extract prescriptions from appointment data
   * @param {Object} prescription - Prescription data
   * @returns {Array} Array of prescription objects
   */
  _extractPrescriptions(prescription) {
    if (!prescription) return [];

    // Check if prescription is already an array
    if (Array.isArray(prescription)) {
      return prescription.map(p => ({
        medicine: p.medicine || p.name,
        dosage: p.dosage,
        duration: parseInt(p.duration) || 7,
        instructions: p.instructions || ''
      }));
    }
    
    // If prescription is a string, parse it to extract information
    if (typeof prescription === 'string') {
      try {
        const parsed = JSON.parse(prescription);
        if (Array.isArray(parsed)) {
          return this._extractPrescriptions(parsed);
        }
        return [{
          medicine: parsed.medicine || parsed.name || 'Medication',
          dosage: parsed.dosage || 'As directed',
          duration: parseInt(parsed.duration) || 7,
          instructions: parsed.instructions || ''
        }];
      } catch (e) {
        // If parsing fails, create a simple prescription
        return [{
          medicine: 'Medication',
          dosage: 'As prescribed',
          duration: 7,
          instructions: prescription // Use the string as instructions
        }];
      }
    }

    // If prescription is an object
    if (typeof prescription === 'object') {
      return [{
        medicine: prescription.medicine || prescription.name || 'Medication',
        dosage: prescription.dosage || 'As directed',
        duration: parseInt(prescription.duration) || 7, 
        instructions: prescription.instructions || ''
      }];
    }

    return [];
  }

  /**
   * Extract symptoms from appointment data
   * @param {Object} appointmentData - Appointment data
   * @returns {Array} Array of symptom objects
   */
  _extractSymptoms(appointmentData) {
    const symptoms = [];
    
    // Check if there are symptoms in the problem/complaints field
    if (appointmentData.complaints) {
      // Try to extract symptoms from complaints
      const complaintSymptoms = this._parseSymptomText(appointmentData.complaints);
      symptoms.push(...complaintSymptoms);
    }
    
    if (appointmentData.problem && appointmentData.problem !== appointmentData.complaints) {
      // Also extract from problem if it's different from complaints
      const problemSymptoms = this._parseSymptomText(appointmentData.problem);
      
      // Add symptoms not already included
      problemSymptoms.forEach(symptom => {
        if (!symptoms.some(s => s.name.toLowerCase() === symptom.name.toLowerCase())) {
          symptoms.push(symptom);
        }
      });
    }
    
    // If the appointment has a structured symptoms array, use that
    if (appointmentData.symptoms && Array.isArray(appointmentData.symptoms)) {
      // Map to the expected structure if needed
      const structuredSymptoms = appointmentData.symptoms.map(s => {
        if (typeof s === 'string') {
          return {
            name: s,
            severity: 5, // Default medium severity
            duration: 'Unknown',
            notes: ''
          };
        }
        return {
          name: s.name || s.symptom || 'Unknown',
          severity: s.severity || 5,
          duration: s.duration || 'Unknown',
          notes: s.notes || ''
        };
      });
      
      // Add structured symptoms not already included
      structuredSymptoms.forEach(symptom => {
        if (!symptoms.some(s => s.name.toLowerCase() === symptom.name.toLowerCase())) {
          symptoms.push(symptom);
        }
      });
    }
    
    return symptoms;
  }

  /**
   * Parse symptom text to extract structured symptoms
   * @param {string} text - Text to parse for symptoms
   * @returns {Array} Array of symptom objects
   * @private
   */
  _parseSymptomText(text) {
    if (!text) return [];
    
    const symptoms = [];
    // Split by common separators
    const parts = text.split(/[,;.]/);
    
    parts.forEach(part => {
      const trimmed = part.trim();
      if (trimmed.length > 0) {
        // Try to extract severity if available
        const severityMatch = trimmed.match(/(.*?)\s+(?:severity|level|rating)?\s*[:=]?\s*(\d+)/i);
        
        if (severityMatch) {
          symptoms.push({
            name: severityMatch[1].trim(),
            severity: parseInt(severityMatch[2]),
            duration: 'Unknown',
            notes: ''
          });
        } else {
          // If no severity, just add as a symptom
          symptoms.push({
            name: trimmed,
            severity: 5, // Default medium severity
            duration: 'Unknown',
            notes: ''
          });
        }
      }
    });
    
    return symptoms;
  }

  /**
   * Extract action items from appointment data (from meeting recordings)
   * @param {Array|Object} actionItems - Action items from meeting recordings
   * @returns {Array} Formatted action items
   */
  _extractActionItems(actionItems) {
    if (!actionItems) return [];
    
    // If already an array, ensure consistent format
    if (Array.isArray(actionItems)) {
      return actionItems.map(item => {
        // If item is a string, convert to object
        if (typeof item === 'string') {
          return {
            text: item,
            assignedTo: 'patient',
            status: 'pending',
            priority: 'medium',
            createdAt: new Date(),
            source: 'meeting-recording'
          };
        }
        
        // If item is an object, ensure all fields are present
        return {
          text: item.text || item.action || item.description || 'Action item',
          assignedTo: item.assignedTo || item.assigned || 'patient',
          dueDate: item.dueDate ? new Date(item.dueDate) : null,
          status: item.status || 'pending',
          priority: item.priority || 'medium',
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          source: item.source || 'meeting-recording'
        };
      });
    }
    
    // If a single object is provided
    if (typeof actionItems === 'object') {
      return [{
        text: actionItems.text || actionItems.action || actionItems.description || 'Action item',
        assignedTo: actionItems.assignedTo || actionItems.assigned || 'patient',
        dueDate: actionItems.dueDate ? new Date(actionItems.dueDate) : null,
        status: actionItems.status || 'pending',
        priority: actionItems.priority || 'medium',
        createdAt: actionItems.createdAt ? new Date(actionItems.createdAt) : new Date(),
        source: actionItems.source || 'meeting-recording'
      }];
    }
    
    // If a string is provided (single action item)
    if (typeof actionItems === 'string') {
      return [{
        text: actionItems,
        assignedTo: 'patient',
        status: 'pending',
        priority: 'medium',
        createdAt: new Date(),
        source: 'meeting-recording'
      }];
    }
    
    return [];
  }

  /**
   * Synchronize all appointments with patient profiles
   * This is used to initially populate or update all patient profiles
   * @returns {Promise<Object>} Result of the operation
   */
  async syncAllAppointments() {
    try {
      console.log('Starting to sync all appointments with patient profiles');
      
      // Get all appointments
      const appointments = await this.appointmentCollection.find({}).toArray();
      console.log(`Found ${appointments.length} appointments to sync`);
      
      const results = {
        total: appointments.length,
        processed: 0,
        successful: 0,
        failed: 0,
        errors: []
      };

      // Process each appointment
      for (const appointment of appointments) {
        try {
          // Extract patient email from appointment
          const patientEmail = 
            appointment.patientInfo?.email || 
            appointment.email || 
            appointment.patient_email;
          
          // Skip appointments without patient email
          if (!patientEmail) {
            results.failed++;
            results.errors.push(`Appointment ${appointment._id} has no patient email`);
            continue;
          }
          
          // Sync the appointment with the patient profile
          const syncResult = await this.syncAppointmentWithProfile(appointment);
          
          if (syncResult.success) {
            results.successful++;
          } else {
            results.failed++;
            results.errors.push(`Failed to sync appointment ${appointment._id}: ${syncResult.message}`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`Error processing appointment ${appointment._id}: ${error.message}`);
          console.error(`Error processing appointment ${appointment._id}:`, error);
        }
        
        results.processed++;
      }
      
      return {
        success: true,
        message: `Processed ${results.processed} appointments. ${results.successful} successful, ${results.failed} failed.`,
        results
      };
    } catch (error) {
      console.error('Error syncing all appointments:', error);
      return {
        success: false,
        message: 'Failed to sync appointments with patient profiles',
        error: error.message
      };
    }
  }

  /**
   * Process meeting transcript and update patient profile
   * @param {string} meetingUrl - URL of the meeting
   * @param {string} transcriptSummary - Summary of the meeting transcript
   * @param {Array} actionItems - Action items extracted from the meeting
   * @returns {Promise<Object>} Result of the operation
   */
  async processMeetingData(meetingUrl, transcriptSummary, actionItems) {
    try {
      console.log(`Processing meeting data for URL: ${meetingUrl}`);
      
      // Find appointment with this meeting URL
      const appointment = await this.appointmentCollection.findOne({
        meeting: meetingUrl
      });
      
      if (!appointment) {
        console.error(`No appointment found with meeting URL: ${meetingUrl}`);
        return {
          success: false,
          message: 'No appointment found with this meeting URL'
        };
      }
      
      console.log(`Found appointment with ID: ${appointment._id}`);
      
      // Update the appointment with transcript summary and action items
      await this.appointmentCollection.updateOne(
        { _id: appointment._id },
        { 
          $set: { 
            transcript_summary: transcriptSummary,
            actionItems: actionItems
          } 
        }
      );
      
      console.log(`Updated appointment ${appointment._id} with transcript summary and action items`);
      
      // Get the updated appointment
      const updatedAppointment = await this.appointmentCollection.findOne({
        _id: appointment._id
      });
      
      // Sync with patient profile
      const syncResult = await this.syncAppointmentWithProfile(updatedAppointment);
      
      return {
        success: syncResult.success,
        message: syncResult.message,
        appointmentId: appointment._id,
        patientProfileId: syncResult.patientProfileId
      };
    } catch (error) {
      console.error('Error processing meeting data:', error);
      return {
        success: false,
        message: 'Failed to process meeting data',
        error: error.message
      };
    }
  }

  /**
   * Synchronize an appointment with the patient profile
   * This ensures that when an appointment is created or updated, the patient profile is also updated
   * @param {Object} appointmentData - Appointment data to sync
   * @returns {Promise<Object>} Result of the operation
   */
  async syncAppointmentWithProfile(appointmentData) {
    try {
      console.log(`Syncing appointment ${appointmentData._id} with patient profile`);
      
      // Extract patient email from appointment
      const patientEmail = 
        appointmentData.patientInfo?.email || 
        appointmentData.email || 
        appointmentData.patient_email;
      
      if (!patientEmail) {
        return {
          success: false,
          message: 'Appointment has no patient email'
        };
      }
      
      console.log(`Patient email: ${patientEmail}`);
      
      // Check if patient profile exists
      let patientProfile = await this.patientProfileCollection.findOne({ email: patientEmail });
      
      // Create patient profile if it doesn't exist
      if (!patientProfile) {
        console.log(`Creating new patient profile for ${patientEmail}`);
        
        const basicInfo = {
          name: appointmentData.patientInfo?.name || appointmentData.name || 'Unknown',
          age: appointmentData.patientInfo?.age || 0,
          gender: appointmentData.patientInfo?.gender || 'Unknown',
          email: patientEmail,
          contact: appointmentData.patientInfo?.phone || ''
        };
        
        // Create new patient profile
        const newProfile = {
          email: patientEmail,
          basicInfo: basicInfo,
          medicalHistory: {
            allergies: [],
            chronicConditions: [],
            pastSurgeries: [],
            familyHistory: []
          },
          visits: []
        };
        
        // Process with RAG service
        const processedProfile = await ragService.processPatientData(newProfile);
        
        // Insert into database
        const result = await this.patientProfileCollection.insertOne(processedProfile);
        patientProfile = processedProfile;
        patientProfile._id = result.insertedId;
        
        console.log(`Created new patient profile with ID ${patientProfile._id}`);
      } else {
        console.log(`Found existing patient profile for ${patientEmail}`);
      }
      
      // Convert appointment ID to ObjectId if string
      let appointmentId;
      try {
        appointmentId = typeof appointmentData._id === 'string' 
          ? new ObjectId(appointmentData._id) 
          : appointmentData._id;
      } catch (e) {
        console.error('Error converting appointment ID to ObjectId:', e);
        appointmentId = appointmentData._id;
      }
      
      // Convert the appointment to a visit
      const visit = this.convertAppointmentToVisit(appointmentData);
      
      // Add appointmentId as ObjectId
      visit.appointmentId = appointmentId;
      
      // Check if this visit already exists in the profile
      const existingVisitIndex = patientProfile.visits ? 
        patientProfile.visits.findIndex(v => 
          v.appointmentId && v.appointmentId.toString() === appointmentId.toString()) : -1;
      
      // Update existing visit or add new one
      if (existingVisitIndex > -1) {
        console.log(`Updating existing visit at index ${existingVisitIndex}`);
        
        // Update existing visit with new data while preserving existing data
        const existingVisit = patientProfile.visits[existingVisitIndex];
        
        // Merge the visits, giving priority to new data but keeping existing data if not overridden
        patientProfile.visits[existingVisitIndex] = {
          ...existingVisit,
          ...visit,
          // Keep existing transcriptSummary if new one is empty
          transcriptSummary: visit.transcriptSummary || existingVisit.transcriptSummary || '',
          // Combine follow-up actions
          followupActions: [
            ...existingVisit.followupActions || [], 
            ...visit.followupActions || []
          ].filter((item, i, arr) => {
            // Remove duplicates
            return i === arr.findIndex(t => t.text === item.text);
          })
        };
        
        // Ensure prescriptions don't have duplicates
        const seen = new Set();
        const uniquePrescriptions = [];
        
        if (Array.isArray(patientProfile.visits[existingVisitIndex].prescriptions)) {
          patientProfile.visits[existingVisitIndex].prescriptions.forEach(p => {
            if (!p) return; // Skip null or undefined prescriptions
            
            const key = `${p.medicine || ''}-${p.dosage || ''}-${p.duration || ''}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniquePrescriptions.push(p);
            }
          });
          patientProfile.visits[existingVisitIndex].prescriptions = uniquePrescriptions;
        }
      } else {
        // Add as new visit
        console.log('Adding as new visit');
        patientProfile.visits = patientProfile.visits || [];
        patientProfile.visits.push(visit);
      }
      
      // Update patient profile in database
      await this.patientProfileCollection.updateOne(
        { _id: patientProfile._id },
        { $set: { visits: patientProfile.visits } }
      );
      
      // Process the profile with the RAG service to generate embeddings and insights
      try {
        // Only process if the profile has visits
        if (patientProfile.visits && patientProfile.visits.length > 0) {
          // Generate embeddings for the latest visit
          const latestVisit = patientProfile.visits[patientProfile.visits.length - 1];
          await ragService.processVisit(latestVisit, patientProfile);
          
          // Update the profile with embeddings
          await this.patientProfileCollection.updateOne(
            { _id: patientProfile._id },
            { $set: { vectorData: patientProfile.vectorData } }
          );
        }
      } catch (ragError) {
        // Log error but don't fail the sync
        console.error('Error processing with RAG service:', ragError);
      }
      
      return {
        success: true,
        message: 'Appointment synchronized with patient profile successfully',
        patientProfileId: patientProfile._id
      };
    } catch (error) {
      console.error('Error syncing appointment with patient profile:', error);
      return {
        success: false,
        message: 'Failed to synchronize appointment with patient profile: ' + error.message,
        error: error.message
      };
    }
  }
}

export default SyncService;
