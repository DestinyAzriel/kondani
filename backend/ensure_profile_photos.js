const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model
const User = require('./src/models/User');

console.log('Connecting to MongoDB...');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('MongoDB connected successfully');
        
        // Find the user
        const user = await User.findOne({ phoneNumber: '+265992745780' });
        
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }
        
        console.log('User found:', user.name);
        console.log('Current profile photos:', user.photos);
        
        // Ensure user has profile photos
        if (!user.photos || user.photos.length === 0) {
            console.log('Adding profile photos...');
            user.photos = ['https://i.pravatar.cc/400?img=1'];
            await user.save();
            console.log('Profile photos added.');
        } else {
            console.log('User already has profile photos.');
        }
        
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });