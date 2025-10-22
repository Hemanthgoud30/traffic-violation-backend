const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Hardcode the connection string temporarily for testing
    const uri = 'mongodb+srv://admin:1MLMsbJHJmTRrltq@cluster0.phpllut.mongodb.net/?retryWrites=true&w=majority';
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;