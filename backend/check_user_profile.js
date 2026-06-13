const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kondani')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

async function checkUserProfile() {
    try {
        console.log('=== Checking User Profile ===');
        
        // Find a user (replace with actual user ID)
        const userId = '67559c44b1b9d40b9768c359'; // Replace with actual user ID
        
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found');
            return;
        }
        
        console.log('User:', user.name);
        console.log('Phone:', user.phoneNumber);
        console.log('Photos:', user.photos);
        console.log('Has photos:', user.photos && user.photos.length > 0);
        console.log('ID Verification Status:', user.verification.id.status);
        
        if (!user.photos || user.photos.length === 0) {
            console.log('❌ User has no profile photos. ID verification will fail.');
        } else {
            console.log('✅ User has profile photos. ID verification should work.');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

checkUserProfile();