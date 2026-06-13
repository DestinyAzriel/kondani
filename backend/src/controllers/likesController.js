const Intent = require('../models/Intent');
const User = require('../models/User');

exports.getLikes = async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Find who liked the current user
        // In a real app, we'd query Intents where likes includes currentUserId
        // For MVP, we'll iterate (inefficient but simple for now) or use reverse query

        // Better approach: Find Intents where 'likes' array contains currentUserId
        const likedByIntents = await Intent.find({ likes: currentUserId }).populate('user');

        const newLikes = likedByIntents.map(intent => ({
            id: intent.user._id,
            name: intent.user.name,
            photo: intent.user.photos[0] || 'https://via.placeholder.com/150',
            isVerified: intent.user.isVerified
        }));

        // Find mutual matches
        const myIntent = await Intent.findOne({ user: currentUserId }).populate('matches');
        const mutualLikes = myIntent ? myIntent.matches.map(user => ({
            id: user._id,
            name: user.name,
            photo: user.photos[0] || 'https://via.placeholder.com/150',
            isVerified: user.isVerified
        })) : [];

        res.json({ newLikes, mutualLikes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
