const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kondani')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Check user profile
async function checkUserProfile() {
    try {
        console.log('Checking profile for user with phone number +265992745780...');
        
        // Find the user
        const user = await User.findOne({ phoneNumber: '+265992745780' });
        
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }
        
        console.log('User found:');
        console.log(JSON.stringify(user, null, 2));
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Run the check
setTimeout(checkUserProfile, 2000);