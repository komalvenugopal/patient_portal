import express from 'express';
import cors from 'cors';
import BodyParser from 'body-parser';
import pkg from 'mongodb';
const { MongoClient, ObjectId } = pkg;
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import axios from 'axios';
import fs from 'fs'; // Import the fs module

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
// Zoom Integration
app.post('/start_meeting', async (req, res) => {

  console.log(req.body);
  const appointmentId = req.body.appointmentId;

  const ZOOM_BASE_URL = "https://api.zoom.us/v2";
  const ZOOM_OAUTH_URL = "https://zoom.us/oauth/token";
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const ACCOUNT_ID = process.env.ACCOUNT_ID;


  let zoomAccessToken = process.env.ZOOM_ACCESS_TOKEN; // Cache in memory
  let tokenExpiryTime = process.env.TOKEN_EXPIRY_TIME; // Cache expiry time in memory
  
  async function getAccessToken() {
    // Check if the cached token is still valid
    if (zoomAccessToken && tokenExpiryTime && new Date() < new Date(tokenExpiryTime)) {
      console.log("Using cached access token.");
      return zoomAccessToken;
    }
  
    // Fetch a new token if invalid or expired
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
  
    // Update the cached values
    zoomAccessToken = response.data.access_token;
    tokenExpiryTime = new Date(Date.now() + response.data.expires_in * 1000).toISOString();
  
    // Update the `.env` file with the new token and expiry
    const envData = fs.readFileSync('.env', 'utf8');
    const updatedEnv = envData
      .replace(/ZOOM_ACCESS_TOKEN=.*/, `ZOOM_ACCESS_TOKEN=${zoomAccessToken}`)
      .replace(/TOKEN_EXPIRY_TIME=.*/, `TOKEN_EXPIRY_TIME=${tokenExpiryTime}`);
    fs.writeFileSync('.env', updatedEnv, 'utf8');
  
    return zoomAccessToken;
  }
  

  try {
    const { topic, startTime, duration } = req.body;
    
    if (!topic || !startTime || !duration) {
      return res.status(400).json({ error: 'Missing required fields: topic, startTime, or duration' });
    }

    const accessToken = await getAccessToken();

    const meetingResponse = await axios.post(
      `${ZOOM_BASE_URL}/users/me/meetings`,
      {
        topic,
        type: 2, // Scheduled meeting
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

    const { join_url, start_url, id } = meetingResponse.data;

    console.log('Meeting created:', meetingResponse.data);

    // Save meeting details in the database (optional)
    const meetingDetails = {
      topic,
      startTime,
      duration,
      meetingId: id,
      joinUrl: join_url,
      startUrl: start_url,
    };


    await meetingsCollection.insertOne(meetingDetails);

    res.json({ message: 'Meeting created successfully', data: meetingDetails });

    
  } catch (error) {
    console.error('Error creating meeting:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to create meeting' });
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
