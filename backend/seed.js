const mongoose = require('mongoose');
const User = require('./src/models/User');
const Intent = require('./src/models/Intent');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kondani';

const dummyUsers = [
    {
        phone: '+265990000001',
        name: 'Chifundo',
        age: 24,
        gender: 'female',
        location: 'Lilongwe',
        bio: 'Love hiking and coffee. Looking for someone adventurous.',
        interests: ['Hiking', 'Coffee', 'Travel'],
        photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500'],
        isVerified: true
    },
    {
        phone: '+265990000002',
        name: 'Thoko',
        age: 26,
        gender: 'female',
        location: 'Blantyre',
        bio: 'Art enthusiast and foodie. Let\'s try new restaurants!',
        interests: ['Art', 'Food', 'Music'],
        photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500'],
        isVerified: false
    },
    {
        phone: '+265990000003',
        name: 'Grace',
        age: 23,
        gender: 'female',
        location: 'Mzuzu',
        bio: 'Student at Mzuzu Uni. Love reading and quiet evenings.',
        interests: ['Reading', 'Movies', 'Study'],
        photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500'],
        isVerified: true
    },
    {
        phone: '+265990000004',
        name: 'Kondwani',
        age: 27,
        gender: 'male',
        location: 'Lilongwe',
        bio: 'Entrepreneur. Tech lover. Always building something.',
        interests: ['Tech', 'Business', 'Fitness'],
        photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500'],
        isVerified: true
    },
    {
        phone: '+265990000005',
        name: 'Yamikani',
        age: 25,
        gender: 'male',
        location: 'Zomba',
        bio: 'Musician. Let\'s jam sometime.',
        interests: ['Music', 'Guitar', 'Concerts'],
        photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500'],
        isVerified: false
    }
];

const seed = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing users (optional, maybe just add if not exist)
        // await User.deleteMany({});
        // await Intent.deleteMany({});
        // console.log('Cleared existing data');

        for (const userData of dummyUsers) {
            const existing = await User.findOne({ phone: userData.phone });
            if (!existing) {
                const user = await User.create(userData);
                await Intent.create({ user: user._id });
                console.log(`Created user: ${user.name}`);
            } else {
                console.log(`User already exists: ${userData.name}`);
            }
        }

        console.log('Seeding complete');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seed();
