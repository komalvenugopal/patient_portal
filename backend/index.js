import express from 'express';
import cors from 'cors';
import BodyParser from 'body-parser';
import pkg from 'mongodb';
const { MongoClient, ObjectId } = pkg;
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from '@copilotkit/runtime';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(BodyParser.json());
app.use(express.static('doctors'));
app.use(fileUpload());

// MongoDB URI and Client Setup
const uri = "mongodb+srv://komal:komalSJSU@patientdbcluster.otpwq.mongodb.net/?retryWrites=true&w=majority&appName=PatientDBCluster";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Database Connection
async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully");

    const db = client.db('doctorsPortal');
    const doctorCollection = db.collection('doctors');
    const appointmentCollection = db.collection('appointments');
    const meetingsCollection = db.collection('meetings');
    const reviewCollection = db.collection('reviews');

    // Routes
    app.get('/', (req, res) => res.send('Welcome to Doctors Portal Backend'));

    app.post('/getMeetSummary', async (req, res) => {
      const { text } = req.body;
    
      if (!text) {
        return res.status(400).json({ error: 'Text is required for summarization' });
      }
    
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo', // Use the desired model
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that summarizes meeting text into concise points.',
            },
            {
              role: 'user',
              content: `Please summarize the following text:\n${text}`,
            },
          ],
          max_tokens: 150, // Adjust based on desired summary length
          temperature: 0.7,
        });
    
        const summary = response.choices[0].message.content;
        res.json({ summary });
      } catch (err) {
        console.error('Error generating meeting summary:', err);
        res.status(500).json({ error: 'Failed to generate meeting summary' });
      }
    });    

    app.get('/doctors', async (req, res) => {
      try {
        const doctors = await doctorCollection.find({}).toArray();
        res.json(doctors);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        res.status(500).send('Failed to fetch doctors');
      }
    });

    app.get('/doctors/:apId', async (req, res) => {
      try {
        const apId = req.params.apId;
        const doctor = await doctorCollection.findOne({ id: apId });
        if (!doctor) {
          return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(doctor);
      } catch (err) {
        console.error("Error fetching doctor by ID:", err);
        res.status(500).json({ message: 'Server error' });
      }
    });

    app.get('/bookedAppointments', async (req, res) => {
      try {
        const appointments = await appointmentCollection.find({}).toArray();
        res.json(appointments);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        res.status(500).send('Failed to fetch appointments');
      }
    });

    app.post('/addedPayment', async (req, res) => {
      const { apId, paymentID, status } = req.body;

      if (!apId || !paymentID || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      try {
        const appointment = await appointmentCollection.findOne({ apId });
        if (!appointment) {
          return res.status(404).json({ message: 'Appointment not found' });
        }

        await appointmentCollection.updateOne(
          { apId },
          { $set: { paymentID, status } }
        );

        res.json({ message: 'Appointment updated successfully' });
      } catch (err) {
        console.error("Error updating appointment:", err);
        res.status(500).json({ message: 'Error updating appointment' });
      }
    });

    app.post('/updateDisease', async (req, res) => {
      const { id, problem } = req.body;
      if (!id || !problem) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      try {
        const result = await appointmentCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { "patientInfo.problem": problem } }
        );
        if (result.modifiedCount === 0) {
          return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json({ message: 'Disease updated successfully' });
      } catch (err) {
        console.error("Error updating disease:", err);
        res.status(500).json({ message: 'Error updating disease' });
      }
    });

    app.post('/makeBooking', async (req, res) => {
      try {
        const appointmentData = req.body;
        const result = await appointmentCollection.insertOne(appointmentData);
        res.json({ success: result.insertedCount > 0 });
      } catch (err) {
        console.error("Error booking appointment:", err);
        res.status(500).send('Failed to book appointment');
      }
    });

    app.post('/addDoctor', async (req, res) => {
      try {
        const doctorData = req.body;
        const result = await doctorCollection.insertMany(doctorData);
        res.json({ insertedCount: result.insertedCount });
      } catch (err) {
        console.error("Error adding doctors:", err);
        res.status(500).send('Failed to add doctors');
      }
    });

    app.post('/addADoctor', async (req, res) => {
      try {
        const file = req.files.file;
        const { id, category, name, education, designation, department, hospital, img } = req.body;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
          contentType: file.mimetype,
          size: file.size,
          img: Buffer.from(encImg, 'base64'),
        };

        const result = await doctorCollection.insertOne({
          id,
          category,
          name,
          education,
          designation,
          department,
          hospital,
          img,
          image,
        });

        res.json({ success: result.insertedCount > 0 });
      } catch (err) {
        console.error("Error adding doctor:", err);
        res.status(500).send('Failed to add doctor');
      }
    });

    app.post('/addReview', async (req, res) => {
      try {
        const reviewData = req.body;
        const result = await reviewCollection.insertOne(reviewData);
        res.json({ success: result.insertedCount > 0 });
      } catch (err) {
        console.error("Error adding review:", err);
        res.status(500).send('Failed to add review');
      }
    });

    // Zoom Integration
    app.post('/start_meeting', async (req, res) => {
      try {
        const { topic, startTime, duration, appointmentId } = req.body;
        console.log("Request body:", req.body);
        
        if (!topic || !startTime || !duration || !appointmentId) {
          return res.status(400).json({ 
            error: 'Missing required fields: topic, startTime, duration, or appointmentId' 
          });
        }

        // Validate appointmentId format
        if (!ObjectId.isValid(appointmentId)) {
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid appointment ID format' 
          });
        }

        const ZOOM_BASE_URL = "https://api.zoom.us/v2";
        const ZOOM_OAUTH_URL = "https://zoom.us/oauth/token";
        const CLIENT_ID = process.env.CLIENT_ID;
        const CLIENT_SECRET = process.env.CLIENT_SECRET;
        const ACCOUNT_ID = process.env.ACCOUNT_ID;

        let zoomAccessToken = process.env.ZOOM_ACCESS_TOKEN;
        let tokenExpiryTime = process.env.TOKEN_EXPIRY_TIME;

        // Get access token with expiry check
        async function getAccessToken() {
          // Check if cached token is still valid
          if (zoomAccessToken && tokenExpiryTime && new Date() < new Date(tokenExpiryTime)) {
            console.log("Using cached access token.");
            return zoomAccessToken;
          }

          // Fetch new token if invalid or expired
          console.log("Generating new access token.");
          const response = await axios.post(
            `${ZOOM_OAUTH_URL}?grant_type=account_credentials&account_id=${ACCOUNT_ID}`,
            {},
            {
              auth: {
                username: CLIENT_ID,
                password: CLIENT_SECRET,
              },
            }
          );

          // Update cached values
          zoomAccessToken = response.data.access_token;
          tokenExpiryTime = new Date(Date.now() + response.data.expires_in * 1000).toISOString();

          // Update .env file
          const envData = await fs.readFile('.env', 'utf8');
          const updatedEnv = envData
            .replace(/ZOOM_ACCESS_TOKEN=.*/, `ZOOM_ACCESS_TOKEN=${zoomAccessToken}`)
            .replace(/TOKEN_EXPIRY_TIME=.*/, `TOKEN_EXPIRY_TIME=${tokenExpiryTime}`);
          await fs.writeFile('.env', updatedEnv, 'utf8');

          return zoomAccessToken;
        }

        const accessToken = await getAccessToken();

        // Create Zoom meeting
        const meetingResponse = await axios.post(
          `${ZOOM_BASE_URL}/users/me/meetings`,
          {
            topic,
            type: 2,
            start_time: startTime,
            duration,
            settings: {
              host_video: true,
              participant_video: true,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const { join_url, start_url, id: meetingId } = meetingResponse.data;
        console.log('Meeting created:', meetingResponse.data);

        // Update appointment with meeting details - Fix ObjectId conversion
        const result = await appointmentCollection.updateOne(
          { _id: new ObjectId(appointmentId) },  // Properly convert string to ObjectId
          {
            $set: {
              meetLink: join_url,
              zoomMeetingId: meetingId,
              startUrl: start_url,
              meetingCreatedAt: new Date()
            }
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            error: 'Appointment not found'
          });
        }

        res.json({ 
          success: true,
          message: 'Meeting created successfully',
          meeting: {
            meetingId,
            joinUrl: join_url,
            startUrl: start_url
          },
          nextStep: 'create_bot'
        });

      } catch (error) {
        console.error('Error in start_meeting:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to create meeting',
          details: error.message 
        });
      }
    });

    // Separate endpoint for bot creation after meeting is opened
    app.post('/create_meeting_bot', async (req, res) => {
      try {
        const { appointmentId } = req.body;
        
        if (!appointmentId || !ObjectId.isValid(appointmentId)) {
          return res.status(400).json({ 
            success: false, 
            error: "Valid appointmentId is required" 
          });
        }

        // Get meeting URL from appointment
        const appointment = await appointmentCollection.findOne(
          { _id: new ObjectId(appointmentId) }
        );

        if (!appointment || !appointment.meetLink) {
          return res.status(404).json({
            success: false,
            error: "Meeting URL not found for this appointment"
          });
        }

        // Create bot for transcription
        const botResponse = await axios.post(
          `${req.protocol}://${req.get('host')}/create_bot`,
          { 
            meeting_url: appointment.meetLink,
            appointmentId: appointmentId 
          }
        );

        if (!botResponse.data.success) {
          return res.status(500).json({
            success: false,
            error: 'Failed to create bot',
            details: botResponse.data.error
          });
        }

        res.json({ 
          success: true,
          message: 'Bot created successfully',
          bot: botResponse.data
        });

      } catch (error) {
        console.error('Error in create_meeting_bot:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to create meeting bot' 
        });
      }
    });

    
    // CopilotKit Integration
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const serviceAdapter = new OpenAIAdapter({ openai });

    app.use('/copilotkit', (req, res, next) => {
      const runtime = new CopilotRuntime();
      const handler = copilotRuntimeNodeHttpEndpoint({
        endpoint: '/copilotkit',
        runtime,
        serviceAdapter,
      });

      return handler(req, res, next);
    });

    app.post('/create_bot', async (req, res) => {
      try {
        const RECALL_API_KEY = process.env.RECALL_API_KEY;
        const BOT_NAME = process.env.BOT_NAME;
        const MEETING_URL = req.body.meeting_url;
        const appointmentId = req.body.appointmentId;
        const PROVIDER = process.env.PROVIDER;
        
        if (!MEETING_URL || !appointmentId) {
          return res.status(400).json({ 
            success: false, 
            error: "Meeting URL and appointmentId are required" 
          });
        }

        const url = "https://us-west-2.recall.ai/api/v1/bot/";
        const current_time = new Date().toISOString();

        const payload = {
          meeting_url: MEETING_URL,
          bot_name: BOT_NAME,
          join_at: current_time,
          transcription_options: {
            provider: PROVIDER
          },
          recording: {
            include_video: false,
            include_audio: false,
            include_transcript: true
          }
        };

        console.log("Creating bot with payload:", payload);

        const headers = {
          "accept": "application/json",
          "content-type": "application/json",
          "Authorization": RECALL_API_KEY
        };

        const response = await axios.post(url, payload, { headers });
        console.log("Bot API Response:", response.data);

        if (response.data && response.data.id) {
          const bot_id = response.data.id;
          
          // Update appointment with bot_id
          const result = await appointmentCollection.updateOne(
            { _id: new ObjectId(appointmentId) },
            { 
              $set: { 
                bot_id: bot_id,
                bot_created_at: new Date()
              }
            }
          );

          if (result.modifiedCount === 0) {
            throw new Error('Failed to update appointment with bot_id');
          }

          console.log(`Bot created successfully with ID: ${bot_id}`);
          res.json({ 
            success: true, 
            bot_id,
            message: 'Bot created and appointment updated successfully' 
          });
        } else {
          throw new Error('Bot ID not found in response');
        }
      } catch (error) {
        console.error("Error creating bot:", error.response?.data || error.message);
        res.status(500).json({ 
          success: false, 
          error: "Failed to create bot",
          details: error.response?.data || error.message
        });
      }
    });

    // Update get_transcript endpoint to use MongoDB
    app.get('/get_transcript/:appointmentId', async (req, res) => {
      try {
        const appointmentId = req.params.appointmentId;

        // Get bot_id from appointment
        const appointment = await appointmentCollection.findOne(
          { _id: new ObjectId(appointmentId) }
        );
        console.log(appointment.bot_id);
        if (!appointment || !appointment.bot_id) {
          return res.status(404).json({
            success: false,
            error: "Bot ID not found for this appointment"
          });
        }

        const RECALL_API_KEY = process.env.RECALL_API_KEY;
        const url = `https://us-west-2.recall.ai/api/v1/bot/${appointment.bot_id}/transcript/`;
        
        const headers = {
          "accept": "application/json",
          "content-type": "application/json",
          "Authorization": RECALL_API_KEY
        };

        const response = await axios.get(url, { headers });

        if (response.status === 200) {
          const transcript_data = response.data;
          
          // Format transcript as text with speaker labels
          const formatted_transcript = transcript_data.map(entry => {
            const speaker = entry.speaker || "Unknown Speaker";
            const words = entry.words || [];
            const text = words.map(word => word.text || "").join(" ");
            return `${speaker}: ${text}`;
          }).join("\n");

          // Update appointment with transcript 
          await appointmentCollection.updateOne(
            { _id: new ObjectId(appointmentId) },
            { 
              $set: { 
                meetSummary: formatted_transcript,
                transcript_updated_at: new Date()
              }
            }
          );

          res.json({ 
            success: true, 
            transcript: formatted_transcript
          });
        } else {
          throw new Error(`Error retrieving transcript: ${response.status}`);
        }
      } catch (error) {
        console.error("Error getting transcript:", error);
        res.status(500).json({ 
          success: false, 
          error: "Failed to get transcript",
          details: error.response?.data || error.message
        });
      }
    });

    // Get transcript for a specific appointment
    app.get('/appointment_transcript/:appointmentId', async (req, res) => {
      try {
        const appointmentId = req.params.appointmentId;
        const appointment = await appointmentCollection.findOne(
          { _id: new ObjectId(appointmentId) }
        );
        
        if (!appointment) {
          return res.status(404).json({ 
            success: false, 
            error: "Appointment not found" 
          });
        }

        if (!appointment.transcript) {
          return res.status(404).json({ 
            success: false, 
            error: "Transcript not found for this appointment" 
          });
        }

        res.json({ 
          success: true, 
          transcript: appointment.transcript,
          updated_at: appointment.transcript_updated_at 
        });
      } catch (error) {
        console.error("Error retrieving appointment transcript:", error);
        res.status(500).json({ 
          success: false, 
          error: "Failed to retrieve appointment transcript" 
        });
      }
    });

    // Server Setup
    const port = process.env.PORT || 5001;
    app.listen(port, () => console.log(`Server is running on port ${port}`));
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
}

// Connect to the database and initialize routes
connectDB();

// Graceful Shutdown
process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
    process.exit(1);
  }
});

// Add these near the top of your file with other imports and constants
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const ZOOM_BASE_URL = 'https://api.zoom.us/v2';

// Add these functions before your routes
async function saveToEnv(key, value) {
  try {
    const envPath = path.resolve('.env');
    let envContent = await fs.readFile(envPath, 'utf-8');
    const lines = envContent.split('\n');
    let updated = false;

    // Update existing line or prepare to add new one
    const updatedLines = lines.map(line => {
      if (line.startsWith(`${key}=`)) {
        updated = true;
        return `${key}=${value}`;
      }
      return line;
    });

    // Add new line if key wasn't found
    if (!updated) {
      updatedLines.push(`${key}=${value}`);
    }

    // Write back to .env file
    await fs.writeFile(envPath, updatedLines.join('\n'));
    
    // Also update process.env
    process.env[key] = value;
    
    console.log(`Updated ${key} in .env file`);
  } catch (error) {
    console.error(`Error saving to .env:`, error);
    throw error;
  }
}

async function getAccessToken() {
  try {
    // Try to use existing token first
    let token = process.env.ZOOM_JWT_TOKEN;
    
    if (!token) {
      // If no token exists, create new one
      const tokenResponse = await axios.post(
        'https://zoom.us/oauth/token',
        null,
        {
          params: {
            grant_type: 'account_credentials',
            account_id: ZOOM_ACCOUNT_ID,
          },
          headers: {
            'Authorization': `Basic ${Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')}`,
          },
        }
      );

      token = tokenResponse.data.access_token;
      
      // Save new token to .env
      await saveToEnv('ZOOM_JWT_TOKEN', token);
    }

    // Verify token is valid
    try {
      await axios.get(`${ZOOM_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return token;
    } catch (verifyError) {
      // If token is invalid, get new one
      console.log('Token invalid, getting new token...');
      const tokenResponse = await axios.post(
        'https://zoom.us/oauth/token',
        null,
        {
          params: {
            grant_type: 'account_credentials',
            account_id: ZOOM_ACCOUNT_ID,
          },
          headers: {
            'Authorization': `Basic ${Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')}`,
          },
        }
      );

      token = tokenResponse.data.access_token;
      await saveToEnv('ZOOM_JWT_TOKEN', token);
      return token;
    }
  } catch (error) {
    console.error('Error getting Zoom access token:', error.response?.data || error.message);
    throw new Error('Failed to get Zoom access token');
  }
}