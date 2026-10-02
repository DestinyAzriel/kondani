const Plan = require('../models/Plan');
const User = require('../models/User');
const Intent = require('../models/Intent');
const Message = require('../models/Message');
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

/**
 * Fallback seed plans for launch in Malawi
 */


/**
 * GET /api/plans
 * Fetch active community plans matching location and preferences
 */
exports.getPlans = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { category } = req.query;

        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const query = {
            isActive: true,
            expiresAt: { $gt: new Date() }
        };

        if (category && category !== 'all') {
            query.category = category.toLowerCase();
        }

        // Fetch plans populated with author and applicants
        const plans = await Plan.find(query)
            .populate('user', 'name age photos isVerified verification location district bio gender subscriptionTier isPremium')
            .populate('interestedUsers.user', 'name age photos isVerified verification location district')
            .sort({ createdAt: -1 })
            .limit(50);

        // Bulk check IDVerification for gold tick across all authors + applicants
        const allPlanUserIds = [];
        plans.forEach(p => {
            if (p.user?._id) allPlanUserIds.push(p.user._id);
            (p.interestedUsers || []).forEach(iu => {
                if (iu.user?._id) allPlanUserIds.push(iu.user._id);
            });
        });
        const approvedVerifSet = await getApprovedVerifiedSet(allPlanUserIds);

        const hostTier = currentUser.subscriptionTier || (currentUser.isPremium ? 'gold' : 'free');
        const isPremiumHost = hostTier === 'gold' || hostTier === 'platinum';

        // Format plans and apply monetization view filters
        const formattedPlans = plans
            .filter(p => {
                if (!p.user) return false;
                // Exclude author's own blocked users or banned authors
                if (p.user.isBanned) return false;

                // Match gender preference if configured (unless viewing own plan)
                if (String(p.user._id) !== String(currentUserId)) {
                    const prefGender = currentUser.preferences?.gender;
                    if (prefGender && prefGender !== 'Everyone' && p.user.gender) {
                        if (p.user.gender !== prefGender) return false;
                    }
                }
                return true;
            })
            .map(plan => {
                const author = plan.user;
                const isOwner = String(author._id) === String(currentUserId);
                const interested = plan.interestedUsers || [];
                const hasJoined = interested.some(item => {
                    const uId = item.user?._id || item.user;
                    return String(uId) === String(currentUserId);
                });

                // Host applicants visibility (Mechanism 2):
                // Free host: Sees 1st applicant clearly. Subsequent applicants are locked/blurred.
                // Gold/VIP host: Sees ALL applicants clearly.
                let applicantsList = [];
                let lockedCount = 0;

                if (isOwner) {
                    if (isPremiumHost || interested.length <= 1) {
                        applicantsList = interested.map(item => ({
                            id: item.user?._id || item.user,
                            name: item.user?.name || 'Kondani Member',
                            age: item.user?.age || null,
                            photo: item.user?.photos?.[0] || '',
                            isVerified: approvedVerifSet.has(String(item.user?._id || item.user)),
                            joinedAt: item.joinedAt,
                            isLocked: false
                        }));
                    } else {
                        // Free host with multiple applicants:
                        // 1st is visible, others are locked
                        applicantsList = interested.map((item, idx) => {
                            if (idx === 0) {
                                return {
                                    id: item.user?._id || item.user,
                                    name: item.user?.name || 'Kondani Member',
                                    age: item.user?.age || null,
                                    photo: item.user?.photos?.[0] || '',
                                    isVerified: approvedVerifSet.has(String(item.user?._id || item.user)),
                                    joinedAt: item.joinedAt,
                                    isLocked: false
                                };
                            }
                            return {
                                id: 'locked_' + idx,
                                name: 'Interested Member',
                                age: null,
                                photo: item.user?.photos?.[0] || '',
                                isVerified: approvedVerifSet.has(String(item.user?._id || item.user)),
                                joinedAt: item.joinedAt,
                                isLocked: true
                            };
                        });
                        lockedCount = interested.length - 1;
                    }
                }

                return {
                    id: plan._id,
                    activity: plan.activity,
                    category: plan.category,
                    description: plan.description || '',
                    location: plan.location,
                    when: plan.when,
                    createdAt: plan.createdAt,
                    expiresAt: plan.expiresAt,
                    interestedCount: interested.length,
                    lockedCount,
                    interested: applicantsList,
                    applicants: applicantsList,
                    hasJoined,
                    isOwner,
                    author: {
                        id: author._id,
                        name: author.name || 'Kondani Member',
                        age: author.age || null,
                        photo: author.photos?.[0] || '',
                        isVerified: approvedVerifSet.has(String(author._id)),
                        location: author.location?.city || author.district || plan.location,
                        tier: author.subscriptionTier || (author.isPremium ? 'gold' : 'free')
                    }
                };
            });

        res.json({
            success: true,
            plans: formattedPlans,
            count: formattedPlans.length
        });
    } catch (err) {
        console.error('getPlans error:', err);
        res.status(500).json({ error: 'Could not load plans' });
    }
};

/**
 * POST /api/plans
 * Create a new plan with Selfie-Verification gate & Quotas
 */
exports.createPlan = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 1. Safety Gate: Only selfie-verified members can post public plans
        if (!currentUser.isVerified) {
            return res.status(403).json({
                code: 'VERIFICATION_REQUIRED',
                error: 'Selfie verification required. To keep Kondani real and safe, please complete photo verification before posting plans.'
            });
        }

        const { activity, category, description, location, when } = req.body;

        if (!activity || !activity.trim()) {
            return res.status(400).json({ error: 'Please enter what you want to do' });
        }
        if (!location || !location.trim()) {
            return res.status(400).json({ error: 'Please specify a venue or area' });
        }
        if (!when || !when.trim()) {
            return res.status(400).json({ error: 'Please specify when (e.g. Tonight, Tomorrow)' });
        }

        // 2. Active Plan Quota by Tier
        const userTier = currentUser.subscriptionTier || (currentUser.isPremium ? 'gold' : 'free');
        const maxPlans = userTier === 'platinum' || userTier === 'gold' ? 10 : (userTier === 'plus' ? 2 : 1);

        const userActiveCount = await Plan.countDocuments({
            user: currentUserId,
            isActive: true,
            expiresAt: { $gt: new Date() }
        });

        if (userActiveCount >= maxPlans) {
            const upgradeMsg = userTier === 'free'
                ? 'Free members can post 1 active plan at a time. Upgrade to Gold for unlimited plans!'
                : 'You have reached your active plan limit.';
            return res.status(403).json({
                code: 'PLAN_LIMIT_REACHED',
                error: upgradeMsg
            });
        }

        const expiresAt = new Date(Date.now() + 48 * 3600 * 1000);

        const newPlan = await Plan.create({
            user: currentUserId,
            activity: activity.trim(),
            category: (category || 'coffee').toLowerCase(),
            description: (description || '').trim(),
            location: location.trim(),
            when: when.trim(),
            expiresAt
        });

        const populated = await Plan.findById(newPlan._id)
            .populate('user', 'name age photos isVerified verification location district bio');

        const author = populated.user;
        const authorVerifSet = await getApprovedVerifiedSet([author._id]);
        res.status(201).json({
            success: true,
            plan: {
                id: populated._id,
                activity: populated.activity,
                category: populated.category,
                description: populated.description,
                location: populated.location,
                when: populated.when,
                createdAt: populated.createdAt,
                expiresAt: populated.expiresAt,
                interestedCount: 0,
                lockedCount: 0,
                interested: [],
                applicants: [],
                hasJoined: false,
                isOwner: true,
                author: {
                    id: author._id,
                    name: author.name,
                    age: author.age,
                    photo: author.photos?.[0] || '',
                    isVerified: authorVerifSet.has(String(author._id)),
                    location: author.district || populated.location
                }
            }
        });

        const io = req.app?.get('io');
        if (io) {
            io.emit('new_plan', {
                planId: populated._id,
                activity: populated.activity,
                location: populated.location,
                authorId: author._id
            });
        }
    } catch (err) {
        console.error('createPlan error:', err);
        res.status(500).json({ error: 'Failed to create plan' });
    }
};

/**
 * POST /api/plans/:id/join
 * Join an activity plan with Daily Quota Enforcement (Mechanism 1)
 */
exports.joinPlan = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const planId = req.params.id;
        const plan = await Plan.findById(planId).populate('user', 'name photos isVerified');
        if (!plan || !plan.isActive) {
            return res.status(404).json({ error: 'Plan not found or has expired' });
        }

        const hostId = plan.user._id.toString();
        if (hostId === String(currentUserId)) {
            return res.status(400).json({ error: 'You are the creator of this plan!' });
        }

        const alreadyJoined = (plan.interestedUsers || []).some(item => {
            const uId = item.user?._id || item.user;
            return String(uId) === String(currentUserId);
        });

        if (alreadyJoined) {
            const chatId = [String(currentUserId), String(hostId)].sort().join('_');
            return res.json({
                success: true,
                alreadyJoined: true,
                chatId,
                hostName: plan.user.name,
                message: 'You have already joined this plan!'
            });
        }

        // Daily Join Quota Enforcement (Mechanism 1):
        // Free: 1 join / day
        // Plus: 3 joins / day
        // Gold / Platinum: Unlimited
        const userTier = currentUser.subscriptionTier || (currentUser.isPremium ? 'gold' : 'free');
        const isUnlimited = userTier === 'gold' || userTier === 'platinum';

        const now = new Date();
        const lastJoin = currentUser.lastPlanJoinDate ? new Date(currentUser.lastPlanJoinDate) : null;
        const isSameDay = lastJoin && (
            lastJoin.getFullYear() === now.getFullYear() &&
            lastJoin.getMonth() === now.getMonth() &&
            lastJoin.getDate() === now.getDate()
        );

        const currentDailyCount = isSameDay ? (currentUser.dailyPlanJoinsCount || 0) : 0;

        if (!isUnlimited) {
            if (userTier === 'free' && currentDailyCount >= 1) {
                return res.status(403).json({
                    code: 'DAILY_JOIN_LIMIT_REACHED',
                    error: 'You have used your 1 free plan join for today. Upgrade to Gold for unlimited joins & instant dating!',
                    limit: 1,
                    used: currentDailyCount
                });
            }
            if (userTier === 'plus' && currentDailyCount >= 3) {
                return res.status(403).json({
                    code: 'PLUS_JOIN_LIMIT_REACHED',
                    error: 'You have reached your 3 daily plan joins. Upgrade to Gold for unlimited joins!',
                    limit: 3,
                    used: currentDailyCount
                });
            }
        }

        // Increment daily quota count
        currentUser.dailyPlanJoinsCount = currentDailyCount + 1;
        currentUser.lastPlanJoinDate = now;
        await currentUser.save();

        // Record interest
        const customNote = req.body.note?.trim() || '';
        plan.interestedUsers.push({
            user: currentUserId,
            note: customNote,
            joinedAt: now
        });
        await plan.save();

        // Connect both users in chat (add to Intent matches)
        let myIntent = await Intent.findOne({ user: currentUserId });
        if (!myIntent) myIntent = await Intent.create({ user: currentUserId });

        let hostIntent = await Intent.findOne({ user: hostId });
        if (!hostIntent) hostIntent = await Intent.create({ user: hostId });

        if (!myIntent.matches.includes(hostId)) {
            myIntent.matches.push(hostId);
            await myIntent.save();
        }
        if (!hostIntent.matches.includes(currentUserId)) {
            hostIntent.matches.push(currentUserId);
            await hostIntent.save();
        }

        // Send icebreaker message into chat
        const chatId = [String(currentUserId), String(hostId)].sort().join('_');
        const content = customNote || `Hey ${plan.user.name}! I saw your plan: "${plan.activity}" and I'd love to join you! 👋✨`;

        await Message.create({
            chatId,
            sender: currentUserId,
            content,
            messageType: 'text',
            delivered: true
        });

        res.json({
            success: true,
            chatId,
            hostName: plan.user.name,
            hostPhoto: plan.user.photos?.[0] || '',
            message: `You joined ${plan.user.name}'s plan! Chat started.`
        });
    } catch (err) {
        console.error('joinPlan error:', err);
        res.status(500).json({ error: 'Could not join plan' });
    }
};

/**
 * DELETE /api/plans/:id
 * Delete a plan created by the current user
 */
exports.deletePlan = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const plan = await Plan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        if (String(plan.user) !== String(currentUserId)) {
            return res.status(403).json({ error: 'You can only delete your own plans' });
        }

        await Plan.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Plan deleted successfully' });
    } catch (err) {
        console.error('deletePlan error:', err);
        res.status(500).json({ error: 'Could not delete plan' });
    }
};
