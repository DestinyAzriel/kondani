const Plan = require('../models/Plan');
const User = require('../models/User');
const Intent = require('../models/Intent');
const Message = require('../models/Message');

/**
 * Fallback seed plans for launch in Malawi
 */
const SEED_PLANS = [
    {
        activity: 'Coffee and catch up at Mamma Mia',
        category: 'coffee',
        description: 'Looking to grab a latte and have great conversation this afternoon.',
        location: 'City Centre, Lilongwe',
        when: 'Today at 4:30 PM',
        mockName: 'Chifundo',
        mockAge: 24,
        mockGender: 'Female',
        mockPhoto: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop&q=80',
        isVerified: true
    },
    {
        activity: 'Hiking up Mulanje Mountain trails',
        category: 'outdoors',
        description: 'Planning a hike along the scenic paths this weekend. Anyone passionate about the outdoors?',
        location: 'Mulanje / Blantyre',
        when: 'This Saturday 8:00 AM',
        mockName: 'Thoko',
        mockAge: 27,
        mockGender: 'Female',
        mockPhoto: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=400&auto=format&fit=crop&q=80',
        isVerified: true
    },
    {
        activity: 'Afrobeats & cocktails at Club 101',
        category: 'music',
        description: 'Live DJ set, good vibes and drinks. Let\'s dance and enjoy Friday night!',
        location: 'Zomba Centre',
        when: 'This Friday ~ 8 PM',
        mockName: 'Yamikani',
        mockAge: 23,
        mockGender: 'Female',
        mockPhoto: 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=400&auto=format&fit=crop&q=80',
        isVerified: true
    },
    {
        activity: 'Sunday lunch & lake breeze in Salima',
        category: 'food',
        description: 'Chambo fish and sunset chill by Lake Malawi. Who is up for a short road trip?',
        location: 'Senga Bay, Salima',
        when: 'Sunday afternoon',
        mockName: 'Tadala',
        mockAge: 25,
        mockGender: 'Female',
        mockPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        isVerified: true
    },
    {
        activity: 'Evening drinks & jazz at Woodlands',
        category: 'drinks',
        description: 'Relaxed atmosphere, good wine, and acoustic jazz music.',
        location: 'Woodlands, Lilongwe',
        when: 'Tomorrow evening',
        mockName: 'Kondwani',
        mockAge: 28,
        mockGender: 'Male',
        mockPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        isVerified: true
    }
];

// Seed starter plans if none exist
async function ensureSeedPlans(currentUserId) {
    try {
        const count = await Plan.countDocuments({ isActive: true, expiresAt: { $gt: new Date() } });
        if (count >= 3) return;

        const otherUsers = await User.find({ _id: { $ne: currentUserId }, isBanned: { $ne: true } }).limit(5);

        for (let i = 0; i < SEED_PLANS.length; i++) {
            const seed = SEED_PLANS[i];
            const assignedUser = otherUsers[i % otherUsers.length];

            if (assignedUser) {
                const existing = await Plan.findOne({ user: assignedUser._id, activity: seed.activity });
                if (!existing) {
                    await Plan.create({
                        user: assignedUser._id,
                        activity: seed.activity,
                        category: seed.category,
                        description: seed.description,
                        location: seed.location,
                        when: seed.when,
                        expiresAt: new Date(Date.now() + 4 * 24 * 3600 * 1000)
                    });
                }
            }
        }
    } catch (err) {
        console.warn('Seed plans notice:', err.message);
    }
}

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

        await ensureSeedPlans(currentUserId);

        const query = {
            isActive: true,
            expiresAt: { $gt: new Date() }
        };

        if (category && category !== 'all') {
            query.category = category.toLowerCase();
        }

        // Fetch plans populated with author and applicants
        const plans = await Plan.find(query)
            .populate('user', 'name age photos isVerified location district bio gender subscriptionTier isPremium')
            .populate('interestedUsers.user', 'name age photos isVerified location district')
            .sort({ createdAt: -1 })
            .limit(50);

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
                            isVerified: !!item.user?.isVerified,
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
                                    isVerified: !!item.user?.isVerified,
                                    joinedAt: item.joinedAt,
                                    isLocked: false
                                };
                            }
                            return {
                                id: 'locked_' + idx,
                                name: 'Interested Member',
                                age: null,
                                photo: item.user?.photos?.[0] || '',
                                isVerified: !!item.user?.isVerified,
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
                    applicants: applicantsList,
                    hasJoined,
                    isOwner,
                    author: {
                        id: author._id,
                        name: author.name || 'Kondani Member',
                        age: author.age || null,
                        photo: author.photos?.[0] || '',
                        isVerified: !!author.isVerified,
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
            .populate('user', 'name age photos isVerified location district bio');

        const author = populated.user;
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
                applicants: [],
                hasJoined: false,
                isOwner: true,
                author: {
                    id: author._id,
                    name: author.name,
                    age: author.age,
                    photo: author.photos?.[0] || '',
                    isVerified: !!author.isVerified,
                    location: author.district || populated.location
                }
            }
        });
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
