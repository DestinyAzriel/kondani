const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('MongoDB connected');
        
        // Update the user profile
        const user = await User.findOneAndUpdate(
            { phoneNumber: '+265992745780' },
            {
                name: 'Destiny Mwafulirwa',
                age: 28,
                bio: 'Software developer passionate about technology and travel.',
                location: {
                    type: 'Point',
                    coordinates: [35.0000, -15.7833] // Approximate coordinates for Blantyre, Malawi
                },
                photos: ['https://i.pravatar.cc/400?img=1'],
                interests: ['Technology', 'Travel', 'Coffee'],
                isProfileComplete: true
            },
            { new: true }
        );
        
        console.log('User updated:', JSON.stringify(user, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });