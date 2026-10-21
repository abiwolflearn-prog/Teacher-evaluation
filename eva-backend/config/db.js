const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eva_db';
    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB connected: ${mongoose.connection.host}`);
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        console.warn('Backend server will continue running. Please ensure MongoDB is running or check MONGO_URI.');
    }
};

module.exports = connectDB;
