const Intent = require('../models/Intent');
const User = require('../models/User');

exports.getLikes = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const me = await User.findById(currentUserId).select('isPremium');
        const isPremium = !!me?.isPremium;

        // People who liked the current user
        const likedByIntents = await Intent.find({ likes: currentUserId }).populate('user');
        const validLikers = likedByIntents.filter(i => i.user);
        const likesCount = validLikers.length;

        // Identities are a GOLD feature — free members only get the count.
        const newLikes = isPremium
            ? validLikers.map(intent => ({
                id: intent.user._id,
                name: intent.user.name,
                photo: intent.user.photos[0] || '',
                isVerified: intent.user.isVerified,
                isSuper: (intent.superLikes || []).some(id => String(id) === String(currentUserId))
            }))
            : [];

        // Mutual matches are always visible (you matched each other).
        const myIntent = await Intent.findOne({ user: currentUserId }).populate('matches');
        const mutualLikes = myIntent ? myIntent.matches.filter(Boolean).map(user => ({
            id: user._id,
            name: user.name,
            photo: user.photos[0] || '',
            isVerified: user.isVerified
        })) : [];

        res.json({ newLikes, mutualLikes, likesCount, isPremium });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
