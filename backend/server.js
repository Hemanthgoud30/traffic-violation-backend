// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS - Updated to include your frontend port
app.use(cors({
  origin: ['http://localhost:62212', 'http://192.168.29.125:62212', 'http://localhost:3000', 'http://localhost:8000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Set static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/violations', require('./routes/violationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));