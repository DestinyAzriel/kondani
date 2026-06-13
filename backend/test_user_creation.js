const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kondani')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Test user creation
async function testUserCreation() {
    try {
        console.log('Testing user creation...');
        
        // Check if user already exists
        const existingUser = await User.findOne({ phoneNumber: '+265991234567' });
        if (existingUser) {
            console.log('Existing user found:', existingUser);
            // Delete the user for clean test
            await User.deleteOne({ phoneNumber: '+265991234567' });
            console.log('Deleted existing user for clean test');
        }
        
        // Create a new user
        const newUser = await User.create({ 
            phoneNumber: '+265991234567',
            name: 'Test User',
            isProfileComplete: false
        });
        
        console.log('New user created:', newUser);
        
        // Verify user was saved by fetching it
        const fetchedUser = await User.findById(newUser._id);
        console.log('Fetched user from DB:', fetchedUser);
        
        // Count total users
        const userCount = await User.countDocuments();
        console.log('Total users in database:', userCount);
        
        process.exit(0);
    } catch (error) {
        console.error('Error in test:', error);
        process.exit(1);
    }
}

// Run the test
setTimeout(testUserCreation, 2000);