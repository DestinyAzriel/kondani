const mongoose = require('mongoose');
require('dotenv').config();

// Import the User and IDVerification models
const User = require('./src/models/User');
const IDVerification = require('./src/models/IDVerification');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('MongoDB connected');
        
        // Find the user
        const user = await User.findOne({ phoneNumber: '+265992745780' });
        
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }
        
        console.log('User found:');
        console.log(`Name: ${user.name}`);
        console.log(`Phone: ${user.phoneNumber}`);
        console.log(`ID Verification Status: ${user.verification.id.status}`);
        console.log(`ID Verified: ${user.verification.id.verified}`);
        
        // Check if there's an ID verification record
        const idVerification = await IDVerification.findOne({ userId: user._id });
        
        if (idVerification) {
            console.log('\nID Verification Record:');
            console.log(`Status: ${idVerification.status}`);
            console.log(`Document Type: ${idVerification.documentType}`);
            console.log(`Document URL: ${idVerification.documentUrl}`);
            console.log(`Face Match Score: ${idVerification.faceMatchScore}`);
            console.log(`Is Real Photo: ${idVerification.isRealPhoto}`);
        } else {
            console.log('\nNo ID verification record found for this user');
        }
        
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });