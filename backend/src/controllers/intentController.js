const User = require('../models/User');
const Intent = require('../models/Intent');
const Block = require('../models/Block');

// Free members get this many likes per day. Gold = unlimited.
const FREE_DAILY_LIKES = 20;

// Great-circle distance (km) between two lat/lon points — free, no maps API.
function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km) {
    if (km == null) return 'Nearby';
    if (km < 1) return 'Less than 1 km away';
    return `${Math.round(km)} km away`;
}

// Helper function to calculate match score based on interests
function calculateInterestMatchScore(currentUser, targetUser) {
    if (!currentUser.interests || !targetUser.interests) return 0;
    
    const currentUserInterests = new Set(currentUser.interests);
    const targetUserInterests = new Set(targetUser.interests);
    
    // Count common interests
    let commonInterests = 0;
    for (const interest of currentUserInterests) {
        if (targetUserInterests.has(interest)) {
            commonInterests++;
        }
    }
    
    // Calculate percentage match (0-100)
    const totalInterests = Math.max(currentUserInterests.size, targetUserInterests.size);
    return totalInterests > 0 ? Math.round((commonInterests / totalInterests) * 100) : 0;
}

// Helper function to calculate age compatibility score
function calculateAgeCompatibilityScore(currentUser, targetUser) {
    if (!currentUser.age || !targetUser.age) return 50; // Neutral score if age unknown
    
    const ageDifference = Math.abs(currentUser.age - targetUser.age);
    
    // Perfect match if same age, decreasing score as difference increases
    if (ageDifference === 0) return 100;
    if (ageDifference <= 2) return 90;
    if (ageDifference <= 5) return 75;
    if (ageDifference <= 10) return 50;
    return 25; // Large age difference
}

// Helper function to calculate overall match score
function calculateOverallMatchScore(currentUser, targetUser) {
    // Weight factors for different aspects
    const interestWeight = 0.5;
    const ageWeight = 0.3;
    const verificationWeight = 0.2;
    
    const interestScore = calculateInterestMatchScore(currentUser, targetUser);
    const ageScore = calculateAgeCompatibilityScore(currentUser, targetUser);
    const verificationScore = targetUser.isVerified ? 100 : 0;
    
    // Calculate weighted average
    const overallScore = (
        (interestScore * interestWeight) +
        (ageScore * ageWeight) +
        (verificationScore * verificationWeight)
    );
    
    return Math.round(overallScore);
}

exports.getIntents = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Get current user's data
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get current user's intent (likes/passes)
        let userIntent = await Intent.findOne({ user: currentUserId });
        if (!userIntent) {
            userIntent = await Intent.create({ user: currentUserId });
        }

        // Exclude blocked users (both directions)
        const blocks = await Block.find({
            $or: [{ blockerId: currentUserId }, { blockedUserId: currentUserId }]
        });
        const blockedIds = blocks.map(b =>
            String(b.blockerId) === String(currentUserId) ? b.blockedUserId : b.blockerId
        );

        const excludedIds = [
            currentUserId,
            ...userIntent.likes,
            ...userIntent.passes,
            ...blockedIds
        ];

        // Apply the user's preferences (age, gender, verified-only)
        const prefs = currentUser.preferences || {};
        const query = {
            _id: { $nin: excludedIds },
            isBanned: { $ne: true },
            isVisible: { $ne: false }
        };
        if (prefs.gender && prefs.gender !== 'Everyone') query.gender = prefs.gender;
        if (prefs.verifiedOnly) query.isVerified = true;
        if (prefs.ageMin || prefs.ageMax) {
            query.age = {};
            if (prefs.ageMin) query.age.$gte = prefs.ageMin;
            if (prefs.ageMax) query.age.$lte = prefs.ageMax;
        }

        // Pull a generous batch, then score + filter by real distance, then paginate.
        const candidates = await User.find(query).limit(300);

        const myCoords = currentUser.location?.coordinates || [0, 0];
        const [myLon, myLat] = myCoords;
        const hasMyLocation = myLat !== 0 || myLon !== 0;
        const maxKm = prefs.distance || 100;

        const scored = [];
        for (const user of candidates) {
            const [lon, lat] = user.location?.coordinates || [0, 0];
            const hasLocation = lat !== 0 || lon !== 0;
            let distanceKm = null;
            if (hasMyLocation && hasLocation) {
                distanceKm = haversineKm(myLat, myLon, lat, lon);
                if (distanceKm > maxKm) continue; // outside the user's radius
            }
            scored.push({
                user,
                matchScore: calculateOverallMatchScore(currentUser, user),
                distanceKm
            });
        }

        // Closest first when distance is known, otherwise best match first.
        scored.sort((a, b) => {
            if (a.distanceKm != null && b.distanceKm != null) {
                return a.distanceKm - b.distanceKm || b.matchScore - a.matchScore;
            }
            return b.matchScore - a.matchScore;
        });

        const start = (page - 1) * limit;
        const pageItems = scored.slice(start, start + limit);

        const intents = pageItems.map(({ user, matchScore, distanceKm }) => ({
            id: user._id,
            name: user.name || 'New User',
            age: user.age || null,
            distance: formatDistance(distanceKm),
            distanceKm: distanceKm == null ? null : Math.round(distanceKm),
            bio: user.bio || '',
            photos: (user.photos && user.photos.length) ? user.photos : [],
            interests: user.interests || [],
            isVerified: user.isVerified,
            matchScore
        }));

        res.json({
            intents,
            hasMore: start + limit < scored.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.likeIntent = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const targetUserId = req.params.id;

        const me = await User.findById(currentUserId);
        if (!me) return res.status(404).json({ error: 'User not found' });

        let userIntent = await Intent.findOne({ user: currentUserId });
        if (!userIntent) {
            userIntent = await Intent.create({ user: currentUserId });
        }

        const alreadyLiked = userIntent.likes.some(id => String(id) === String(targetUserId));

        // Enforce the free daily like cap — only counts brand-new likes.
        if (!alreadyLiked && !me.isPremium) {
            const today = new Date().toISOString().slice(0, 10);
            if (me.likesTodayDate !== today) { me.likesToday = 0; me.likesTodayDate = today; }
            if (me.likesToday >= FREE_DAILY_LIKES) {
                return res.status(429).json({
                    limitReached: true,
                    likesRemaining: 0,
                    message: `You've used your ${FREE_DAILY_LIKES} free likes for today. They reset tomorrow — or go Gold for unlimited likes.`
                });
            }
            me.likesToday += 1;
            await me.save();
        }

        // Add to likes if not already there
        if (!alreadyLiked) {
            userIntent.likes.push(targetUserId);
            await userIntent.save();
        }

        // Check for match
        let targetIntent = await Intent.findOne({ user: targetUserId });
        let isMatch = false;
        let matchData = null;

        if (targetIntent && targetIntent.likes.includes(currentUserId)) {
            isMatch = true;

            // Add to matches for both
            if (!userIntent.matches.includes(targetUserId)) {
                userIntent.matches.push(targetUserId);
                await userIntent.save();
            }
            if (!targetIntent.matches.includes(currentUserId)) {
                targetIntent.matches.push(currentUserId);
                await targetIntent.save();
            }

            const targetUser = await User.findById(targetUserId);
            matchData = {
                id: targetUser._id,
                name: targetUser.name,
                avatar: targetUser.photos[0] || 'https://via.placeholder.com/150'
            };
        }

        const likesRemaining = me.isPremium ? null : Math.max(0, FREE_DAILY_LIKES - me.likesToday);
        res.json({ isMatch, matchData, likesRemaining });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.passIntent = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const targetUserId = req.params.id;

        let userIntent = await Intent.findOne({ user: currentUserId });
        if (!userIntent) {
            userIntent = await Intent.create({ user: currentUserId });
        }

        if (!userIntent.passes.includes(targetUserId)) {
            userIntent.passes.push(targetUserId);
            await userIntent.save();
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};