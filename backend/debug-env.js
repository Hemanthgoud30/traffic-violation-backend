console.log('🔍 Debugging .env file...');

// Check if .env file exists
const fs = require('fs');
const envPath = '.env';
console.log('✅ .env file exists:', fs.existsSync(envPath));

// Load dotenv
const dotenv = require('dotenv');
console.log('✅ dotenv loaded:', typeof dotenv);

// Configure dotenv
const result = dotenv.config();
console.log('✅ dotenv config result:', result.error ? result.error.message : 'Success');

// Check environment variables
console.log('🔍 Environment variables:');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('MONGO_URI type:', typeof process.env.MONGO_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

// Test mongoose if MONGO_URI exists
if (process.env.MONGO_URI) {
    const mongoose = require('mongoose');
    console.log('🔄 Testing MongoDB connection...');
    
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log('✅ MongoDB Connected!');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ MongoDB Error:', err.message);
            process.exit(1);
        });
} else {
    console.error('❌ MONGO_URI is still undefined');
    process.exit(1);
}