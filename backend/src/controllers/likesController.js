const Intent = require('../models/Intent');
const User = require('../models/User');
const IDVerification = require('../models/IDVerification');

// Helper: bulk fetch approved IDVerification user IDs
async function getApprovedVerifiedSet(userIds) {
    if (!userIds || userIds.length === 0) return new Set();
    const records = await IDVerification.find({
        userId: { $in: userIds },
        status: 'approved',
        selfieUrl: { $exists: true, $ne: '' }
    }).select('userId');
    return new Set(records.map(r => r.userId.toString()));
}

exports.getLikes = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const me = await User.findById(currentUserId).select('isPremium subscriptionTier premiumUntil');
        const isPremium = Boolean(me?.isPremium && (!me.premiumUntil || new Date(me.premiumUntil) > new Date()));
        const tier = me?.subscriptionTier || (isPremium ? 'gold' : 'free');

        // Identities are unlocked for GOLD and PLATINUM tiers. Free and Plus get the count.
        const canSeeIdentities = isPremium && (tier === 'gold' || tier === 'platinum');

        // Get current user's intent to filter out already matched or passed users
        const myIntent = await Intent.findOne({ user: currentUserId }).populate('matches');
        const matchedIds = new Set((myIntent?.matches || []).map(m => String(m._id || m)));
        const passedIds = new Set((myIntent?.passes || []).map(p => String(p)));

        // Get blocked users
        const Block = require('../models/Block');
        const blocks = await Block.find({
            $or: [{ blockerId: currentUserId }, { blockedUserId: currentUserId }]
        });
        const blockedIds = new Set(blocks.map(b => 
            String(b.blockerId) === String(currentUserId) ? String(b.blockedUserId) : String(b.blockerId)
        ));

        // People who liked the current user (excluding matches, passes, and blocked)
        const likedByIntents = await Intent.find({ likes: currentUserId }).populate('user');
        const validLikers = likedByIntents.filter(i => {
            if (!i.user) return false;
            const likerId = String(i.user._id);
            if (likerId === String(currentUserId)) return false;
            if (matchedIds.has(likerId)) return false;
            if (passedIds.has(likerId)) return false;
            if (blockedIds.has(likerId)) return false;
            return true;
        });
        const likesCount = validLikers.length;

        // Bulk fetch gold tick status from IDVerification (the authoritative source)
        const likerIds = validLikers.map(i => i.user._id);
        const matchIds = (myIntent?.matches || []).filter(Boolean).map(u => u._id);
        const allUserIds = [...likerIds, ...matchIds];
        const approvedSet = await getApprovedVerifiedSet(allUserIds);

        const newLikes = canSeeIdentities
            ? validLikers.map(intent => ({
                id: intent.user._id,
                name: intent.user.name,
                photo: intent.user.photos[0] || '',
                isVerified: approvedSet.has(String(intent.user._id)),
                isSuper: (intent.superLikes || []).some(id => String(id) === String(currentUserId))
            }))
            : [];

        // Mutual matches are always visible (you matched each other).
        const mutualLikes = myIntent ? myIntent.matches.filter(Boolean).map(user => ({
            id: user._id,
            name: user.name,
            photo: user.photos[0] || '',
            isVerified: approvedSet.has(String(user._id))
        })) : [];

        res.json({ newLikes, mutualLikes, likesCount, isPremium });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

