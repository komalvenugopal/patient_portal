import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * RAG Service for the Healthcare Assistant
 * Handles generating embeddings, storing structured data, and retrieving relevant information
 */
class RAGService {
  /**
   * Generate embeddings for text using OpenAI embeddings API
   * @param {string} text - Text to generate embeddings for
   * @returns {Promise<Array<number>>} - Vector embedding
   */
  async generateEmbedding(text) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        dimensions: 1536
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Process patient information to create structured data
   * @param {Object} patientInfo - Raw patient information
   * @returns {Promise<Object>} - Structured patient data with embeddings
   */
  async processPatientData(patientInfo) {
    try {
      // Create a text representation of the patient profile for embedding
      const profileText = this.createProfileText(patientInfo);
      
      // Generate embedding for the profile
      const profileEmbedding = await this.generateEmbedding(profileText);
      
      // Structure the data according to our schema
      const structuredData = {
        ...patientInfo,
        vectorData: {
          profileEmbedding: profileEmbedding,
          visitEmbeddings: []
        }
      };
      
      return structuredData;
    } catch (error) {
      console.error('Error processing patient data:', error);
      throw error;
    }
  }

  /**
   * Create a text representation of a patient profile for embedding
   * @param {Object} patientInfo - Patient information
   * @returns {string} - Text representation
   */
  createProfileText(patientInfo) {
    let text = '';
    
    // Add basic info
    if (patientInfo.basicInfo) {
      const basic = patientInfo.basicInfo;
      text += `Patient: ${basic.name || 'Unknown'}, ${basic.age || 'Unknown'} years old, ${basic.gender || 'Unknown'}. `;
      text += `Blood group: ${basic.bloodGroup || 'Unknown'}. `;
      text += `Height: ${basic.height || 'Unknown'}cm, Weight: ${basic.weight || 'Unknown'}kg. `;
    }
    
    // Add medical history
    if (patientInfo.medicalHistory) {
      const history = patientInfo.medicalHistory;
      text += `Medical history: `;
      if (history.allergies && history.allergies.length > 0) {
        text += `Allergies: ${history.allergies.join(', ')}. `;
      }
      if (history.chronicConditions && history.chronicConditions.length > 0) {
        text += `Chronic conditions: ${history.chronicConditions.join(', ')}. `;
      }
      if (history.pastSurgeries && history.pastSurgeries.length > 0) {
        text += `Past surgeries: ${history.pastSurgeries.map(s => `${s.procedure} (${s.date})`).join(', ')}. `;
      }
    }
    
    // Add visit information
    if (patientInfo.visits && patientInfo.visits.length > 0) {
      text += `Patient has ${patientInfo.visits.length} recorded visits. `;
      text += `Most recent visit: ${patientInfo.visits[patientInfo.visits.length - 1].date}. `;
    }
    
    return text;
  }

  /**
   * Create text representation of a visit for embedding
   * @param {Object} visit - Visit information
   * @returns {string} - Text representation
   */
  createVisitText(visit) {
    let text = `Visit on ${visit.date}. `;
    
    if (visit.chiefComplaints && visit.chiefComplaints.length > 0) {
      text += `Chief complaints: ${visit.chiefComplaints.join(', ')}. `;
    }
    
    if (visit.symptoms && visit.symptoms.length > 0) {
      text += `Symptoms: ${visit.symptoms.map(s => `${s.name} (severity: ${s.severity}/10, duration: ${s.duration})`).join(', ')}. `;
    }
    
    if (visit.diagnosis && visit.diagnosis.length > 0) {
      text += `Diagnosis: ${visit.diagnosis.map(d => d.condition).join(', ')}. `;
    }
    
    if (visit.prescriptions && visit.prescriptions.length > 0) {
      text += `Medications: ${visit.prescriptions.map(p => p.medicine).join(', ')}. `;
    }
    
    if (visit.transcriptSummary) {
      text += `Meeting summary: ${visit.transcriptSummary}. `;
    }
    
    if (visit.followupActions && visit.followupActions.length > 0) {
      text += `Follow-up actions: ${visit.followupActions.map(a => a.text).join(', ')}. `;
    }
    
    return text;
  }

  /**
   * Process a new visit and update patient profile
   * @param {Object} visit - Visit information
   * @param {Object} patientProfile - Existing patient profile
   * @returns {Promise<Object>} - Updated patient profile
   */
  async processVisit(visit, patientProfile) {
    try {
      // Create text representation of the visit
      const visitText = this.createVisitText(visit);
      
      // Generate embedding
      const visitEmbedding = await this.generateEmbedding(visitText);
      
      // Initialize vectorData if it doesn't exist
      if (!patientProfile.vectorData) {
        patientProfile.vectorData = {
          profileEmbedding: [],
          visitEmbeddings: []
        };
      }
      
      // Initialize visitEmbeddings array if it doesn't exist
      if (!patientProfile.vectorData.visitEmbeddings) {
        patientProfile.vectorData.visitEmbeddings = [];
      }
      
      // Check if embedding for this visit already exists
      const existingEmbeddingIndex = patientProfile.vectorData.visitEmbeddings
        .findIndex(e => e.visitId && e.visitId.toString() === visit._id?.toString());
      
      if (existingEmbeddingIndex > -1) {
        // Update existing embedding
        patientProfile.vectorData.visitEmbeddings[existingEmbeddingIndex] = {
          visitId: visit._id || visit.appointmentId,
          embedding: visitEmbedding
        };
      } else {
        // Add new embedding
        patientProfile.vectorData.visitEmbeddings.push({
          visitId: visit._id || visit.appointmentId,
          embedding: visitEmbedding
        });
      }
      
      // Update medical history based on this visit
      this._updateMedicalHistoryFromVisit(patientProfile, visit);
      
      // If this visit has no summary yet, generate one
      if (!visit.summaryText && visit.chiefComplaints) {
        try {
          visit.summaryText = await this.generateVisitSummary(patientProfile, visit);
        } catch (err) {
          console.error('Error generating visit summary:', err);
          // Fallback simple summary if generation fails
          visit.summaryText = `Visit for ${visit.chiefComplaints.join(', ')}`;
        }
      }
      
      return patientProfile;
    } catch (error) {
      console.error('Error processing visit:', error);
      return patientProfile; // Return original profile if processing fails
    }
  }

  /**
   * Generate a summary of a patient visit using LLM
   * @param {Object} patientProfile - Patient profile information
   * @param {Object} visit - Visit information
   * @returns {Promise<string>} - Generated summary
   */
  async generateVisitSummary(patientProfile, visit) {
    try {
      // Create a comprehensive context for the AI
      let prompt = `Summarize the following patient visit in 2-3 sentences:\n\n`;
      
      // Add patient details
      prompt += `Patient: ${patientProfile.basicInfo?.name || 'Unknown'}, `;
      prompt += `${patientProfile.basicInfo?.age || 'Unknown'} years old, `;
      prompt += `${patientProfile.basicInfo?.gender || 'Unknown'}\n\n`;
      
      // Add visit details
      prompt += `Visit Date: ${new Date(visit.date).toLocaleDateString()}\n`;
      
      if (visit.chiefComplaints && visit.chiefComplaints.length > 0) {
        prompt += `Chief Complaints: ${visit.chiefComplaints.join(', ')}\n`;
      }
      
      if (visit.symptoms && visit.symptoms.length > 0) {
        prompt += `Symptoms: ${visit.symptoms.map(s => `${s.name} (severity: ${s.severity})`).join(', ')}\n`;
      }
      
      if (visit.diagnosis && visit.diagnosis.length > 0) {
        prompt += `Diagnosis: ${visit.diagnosis.map(d => d.condition).join(', ')}\n`;
      }
      
      if (visit.prescriptions && visit.prescriptions.length > 0) {
        prompt += `Prescribed Medications: ${visit.prescriptions.map(p => `${p.medicine} (${p.dosage}, ${p.duration} days)`).join(', ')}\n`;
      }
      
      if (visit.transcriptSummary) {
        prompt += `Meeting Summary: ${visit.transcriptSummary}\n`;
      }
      
      // Add medical history if it exists
      if (patientProfile.medicalHistory) {
        prompt += `\nRelevant Medical History: ${this._formatMedicalHistory(patientProfile.medicalHistory)}\n`;
      }
      
      // Make the API call
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a medical professional summarizing patient visits concisely."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.5,
      });
      
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating visit summary:', error);
      throw error;
    }
  }

  /**
   * Format medical history for use in prompts
   * @param {Object} medicalHistory - Medical history from patient profile
   * @returns {string} - Formatted medical history text
   * @private
   */
  _formatMedicalHistory(medicalHistory) {
    let formattedHistory = '';
    
    if (medicalHistory.allergies && medicalHistory.allergies.length > 0) {
      formattedHistory += `Allergies: ${medicalHistory.allergies.join(', ')}. `;
    }
    
    if (medicalHistory.chronicConditions && medicalHistory.chronicConditions.length > 0) {
      formattedHistory += `Chronic conditions: ${medicalHistory.chronicConditions.join(', ')}. `;
    }
    
    if (medicalHistory.pastSurgeries && medicalHistory.pastSurgeries.length > 0) {
      const surgeries = medicalHistory.pastSurgeries.map(surgery => {
        let surgeryText = surgery.procedure;
        if (surgery.date) {
          // Convert to readable date
          const surgeryDate = new Date(surgery.date);
          if (!isNaN(surgeryDate.getTime())) {
            surgeryText += ` (${surgeryDate.toLocaleDateString()})`;
          }
        }
        if (surgery.notes) {
          surgeryText += ` - ${surgery.notes}`;
        }
        return surgeryText;
      });
      
      formattedHistory += `Past surgeries: ${surgeries.join('; ')}. `;
    }
    
    if (medicalHistory.familyHistory && medicalHistory.familyHistory.length > 0) {
      formattedHistory += `Family history: ${medicalHistory.familyHistory.join(', ')}.`;
    }
    
    return formattedHistory || 'No significant medical history.';
  }

  /**
   * Extract and update medical history from visit data
   * @param {Object} patientProfile - Patient profile to update
   * @param {Object} visit - Visit data to extract from
   * @private
   */
  _updateMedicalHistoryFromVisit(patientProfile, visit) {
    // Initialize medical history if it doesn't exist
    if (!patientProfile.medicalHistory) {
      patientProfile.medicalHistory = {
        allergies: [],
        chronicConditions: [],
        pastSurgeries: [],
        familyHistory: []
      };
    }
    
    // Extract chronic conditions from diagnosis
    if (visit.diagnosis && visit.diagnosis.length > 0) {
      // Init array if needed
      if (!patientProfile.medicalHistory.chronicConditions) {
        patientProfile.medicalHistory.chronicConditions = [];
      }
      
      // Get current chronic conditions
      const currentConditions = patientProfile.medicalHistory.chronicConditions || [];
      
      // Add new conditions not already in the list
      visit.diagnosis.forEach(diagnosis => {
        // Check if this might be a chronic condition
        const chronicKeywords = ['chronic', 'diabetes', 'hypertension', 'asthma', 'arthritis', 'COPD'];
        const isLikelyChronic = chronicKeywords.some(keyword => 
          diagnosis.condition.toLowerCase().includes(keyword.toLowerCase()));
        
        if (isLikelyChronic && !currentConditions.includes(diagnosis.condition)) {
          currentConditions.push(diagnosis.condition);
        }
      });
      
      // Update the profile
      patientProfile.medicalHistory.chronicConditions = currentConditions;
    }
    
    // Extract allergies if mentioned in symptoms
    if (visit.symptoms && visit.symptoms.length > 0) {
      // Init array if needed
      if (!patientProfile.medicalHistory.allergies) {
        patientProfile.medicalHistory.allergies = [];
      }
      
      // Get current allergies
      const currentAllergies = patientProfile.medicalHistory.allergies || [];
      
      // Look for allergy-related symptoms
      visit.symptoms.forEach(symptom => {
        if (symptom.name.toLowerCase().includes('allerg')) {
          // Extract potential allergen from notes if possible
          if (symptom.notes) {
            const allergyMatches = symptom.notes.match(/allerg(ic|y) to\s+([^.,;]+)/i);
            if (allergyMatches && allergyMatches[2]) {
              const allergen = allergyMatches[2].trim();
              if (!currentAllergies.includes(allergen)) {
                currentAllergies.push(allergen);
              }
            }
          }
        }
      });
      
      // Update the profile
      patientProfile.medicalHistory.allergies = currentAllergies;
    }
  }

  /**
   * Generate patient insights based on all available data
   * @param {Object} patientProfile - Patient profile with all visits
   * @returns {Promise<Object>} - AI-generated insights
   */
  async generatePatientInsights(patientProfile) {
    try {
      // Prepare a comprehensive context for the LLM
      let prompt = `Generate health insights for the following patient based on their medical history and visits. `;
      prompt += `Focus on overall health status, risks, trends, and recommended actions.\n\n`;
      
      // Add patient details
      prompt += `## Patient Information\n`;
      if (patientProfile.basicInfo) {
        const basic = patientProfile.basicInfo;
        prompt += `Name: ${basic.name || 'Unknown'}\n`;
        prompt += `Age: ${basic.age || 'Unknown'}\n`;
        prompt += `Gender: ${basic.gender || 'Unknown'}\n`;
        if (basic.bloodGroup) prompt += `Blood Group: ${basic.bloodGroup}\n`;
        if (basic.height) prompt += `Height: ${basic.height}cm\n`;
        if (basic.weight) prompt += `Weight: ${basic.weight}kg\n`;
      }
      
      // Add medical history
      prompt += `\n## Medical History\n`;
      if (patientProfile.medicalHistory) {
        prompt += this._formatMedicalHistory(patientProfile.medicalHistory);
      } else {
        prompt += 'No significant medical history recorded.';
      }
      
      // Add visits
      prompt += `\n\n## Visit History\n`;
      if (patientProfile.visits && patientProfile.visits.length > 0) {
        // Sort visits by date
        const sortedVisits = [...patientProfile.visits].sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
        
        // Add details for each visit
        sortedVisits.forEach((visit, index) => {
          const visitDate = new Date(visit.date);
          prompt += `\nVisit ${index + 1}: ${!isNaN(visitDate.getTime()) ? visitDate.toLocaleDateString() : 'Unknown date'}\n`;
          
          if (visit.chiefComplaints && visit.chiefComplaints.length > 0) {
            prompt += `- Chief Complaints: ${visit.chiefComplaints.join(', ')}\n`;
          }
          
          if (visit.diagnosis && visit.diagnosis.length > 0) {
            prompt += `- Diagnosis: ${visit.diagnosis.map(d => d.condition).join(', ')}\n`;
          }
          
          if (visit.prescriptions && visit.prescriptions.length > 0) {
            prompt += `- Medications: ${visit.prescriptions.map(p => p.medicine).join(', ')}\n`;
          }
          
          if (visit.transcriptSummary) {
            prompt += `- Summary: ${visit.transcriptSummary}\n`;
          }
        });
      } else {
        prompt += 'No visits recorded.';
      }
      
      // Instructions for output format
      prompt += `\n\nFormat your response as a JSON object with the following structure:
      {
        "overallHealth": {
          "score": (number between 0-100),
          "assessment": "(brief text)"
        },
        "chronicDiseaseRisk": [
          {
            "condition": "(disease name)",
            "risk": (number between 0-100),
            "factors": ["factor1", "factor2"]
          }
        ],
        "healthTrends": [
          {
            "metric": "(metric name)",
            "trend": "(improving/stable/declining)",
            "assessment": "(brief text)"
          }
        ],
        "recommendedActions": [
          {
            "action": "(specific action)",
            "priority": (1-5, with 1 being highest),
            "reasoning": "(brief text)"
          }
        ]
      }`;
      
      // Make the API call
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI medical assistant that analyzes patient data and generates evidence-based health insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      });
      
      // Parse the response
      const responseText = response.choices[0].message.content.trim();
      
      // Extract JSON from the response (in case of any extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract valid JSON from AI response');
      }
      
      const jsonString = jsonMatch[0];
      const insights = JSON.parse(jsonString);
      
      // Add timestamp
      insights.overallHealth.lastUpdated = new Date();
      
      return insights;
    } catch (error) {
      console.error('Error generating patient insights:', error);
      // Return basic insights if API fails
      return this._generateFallbackInsights(patientProfile);
    }
  }

  /**
   * Generate fallback insights when OpenAI API fails
   * @param {Object} patientProfile - Patient profile
   * @returns {Object} - Basic insights object
   * @private
   */
  _generateFallbackInsights(patientProfile) {
    // Generate a basic health score
    let healthScore = 70; // Default to moderate health
    
    // Adjust based on basic factors
    if (patientProfile.medicalHistory?.chronicConditions?.length > 0) {
      // Reduce score based on number of chronic conditions
      healthScore -= patientProfile.medicalHistory.chronicConditions.length * 5;
    }
    
    if (patientProfile.visits?.length > 0) {
      // Recent visits might indicate more health issues
      const now = new Date();
      const recentVisits = patientProfile.visits.filter(v => {
        const visitDate = new Date(v.date);
        if (isNaN(visitDate.getTime())) return false;
        
        // Check if visit is within last 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return visitDate >= threeMonthsAgo && visitDate <= now;
      });
      
      // Adjust score based on recent visits
      if (recentVisits.length > 2) {
        healthScore -= 10; // Multiple recent visits indicates potential issues
      }
    }
    
    // Keep score within 0-100 range
    healthScore = Math.max(0, Math.min(100, healthScore));
    
    return {
      overallHealth: {
        score: healthScore,
        assessment: "Basic health assessment based on available data.",
        lastUpdated: new Date()
      },
      chronicDiseaseRisk: [
        {
          condition: "General health monitoring",
          risk: 50,
          factors: ["Limited data available for detailed risk assessment"]
        }
      ],
      healthTrends: this._generateHealthTrends(patientProfile),
      recommendedActions: [
        {
          action: "Schedule a comprehensive health checkup",
          priority: 1,
          reasoning: "Regular monitoring is important for maintaining health"
        },
        {
          action: "Maintain a healthy diet and exercise routine",
          priority: 2,
          reasoning: "General wellness recommendation"
        }
      ]
    };
  }
  
  /**
   * Generate health trends data based on visit history
   * @param {Object} patientProfile - Patient profile
   * @returns {Array} - Health trends data
   * @private
   */
  _generateHealthTrends(patientProfile) {
    const trends = [];
    
    // Generate visit frequency trend
    if (patientProfile.visits && patientProfile.visits.length > 0) {
      // Sort visits by date
      const sortedVisits = [...patientProfile.visits].sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateA - dateB;
      });
      
      // Get dates for trend
      const dates = sortedVisits.map(v => {
        const date = new Date(v.date);
        return isNaN(date) ? null : date.toISOString().split('T')[0];
      }).filter(d => d !== null);
      
      // Generate mock data for health metrics
      trends.push({
        metric: "Visit Frequency",
        trend: "stable",
        data: Array(dates.length).fill(1),
        dates: dates
      });
      
      // Add a general health trend if we have multiple visits
      if (dates.length > 1) {
        trends.push({
          metric: "General Health",
          trend: "improving",
          data: Array(dates.length).fill(0).map((_, i) => 50 + i * 5),
          dates: dates
        });
      }
    }
    
    return trends;
  }

  /**
   * Search for relevant visits based on a query
   * @param {string} query - Search query
   * @param {Object} patientProfile - Patient profile
   * @returns {Promise<Array>} - Relevant visits sorted by similarity
   */
  async searchVisits(query, patientProfile) {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Calculate similarity between query and each visit
      const visitSimilarities = [];
      
      if (patientProfile.vectorData && patientProfile.vectorData.visitEmbeddings) {
        for (let i = 0; i < patientProfile.vectorData.visitEmbeddings.length; i++) {
          const visitEmbedding = patientProfile.vectorData.visitEmbeddings[i];
          const similarity = this.calculateCosineSimilarity(queryEmbedding, visitEmbedding.embedding);
          
          visitSimilarities.push({
            visitId: visitEmbedding.visitId,
            similarity: similarity
          });
        }
      }
      
      // Sort by similarity (highest first)
      visitSimilarities.sort((a, b) => b.similarity - a.similarity);
      
      // Get the corresponding visits
      const relevantVisits = [];
      for (const sim of visitSimilarities) {
        const visit = patientProfile.visits.find(v => v._id.toString() === sim.visitId.toString());
        if (visit) {
          relevantVisits.push({
            ...visit,
            similarityScore: sim.similarity
          });
        }
      }
      
      return relevantVisits;
    } catch (error) {
      console.error('Error searching visits:', error);
      return [];
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {Array<number>} a - First vector
   * @param {Array<number>} b - Second vector
   * @returns {number} - Cosine similarity (-1 to 1)
   */
  calculateCosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    return dotProduct / (normA * normB);
  }
}

export default new RAGService();
