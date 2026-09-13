const Plan = require('../models/Plan');
const User = require('../models/User');
const Intent = require('../models/Intent');
const Message = require('../models/Message');

/**
 * Fallback seed plans for launch in Malawi
 * Shown if the community hasn't populated any plans yet
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
        mockPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        isVerified: true
    }
];

// Helper to seed initial plans if none exist
async function ensureSeedPlans(currentUserId) {
    try {
        const count = await Plan.countDocuments({ isActive: true, expiresAt: { $gt: new Date() } });
        if (count >= 3) return;

        // Find real other users in the DB to associate seed plans with
        const otherUsers = await User.find({ _id: { $ne: currentUserId }, isBanned: { $ne: true } }).limit(5);

        for (let i = 0; i < SEED_PLANS.length; i++) {
            const seed = SEED_PLANS[i];
            const assignedUser = otherUsers[i % otherUsers.length];

            // If we have an existing user in DB, use them; otherwise create plan with assigned user
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
                        expiresAt: new Date(Date.now() + 4 * 24 * 3600 * 1000) // 4 days
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
 * Fetch active community plans
 */
exports.getPlans = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { category } = req.query;

        // Ensure database has active plans for fresh launch
        await ensureSeedPlans(currentUserId);

        const query = {
            isActive: true,
            expiresAt: { $gt: new Date() }
        };

        if (category && category !== 'all') {
            query.category = category.toLowerCase();
        }

        const plans = await Plan.find(query)
            .populate('user', 'name age photos isVerified location district bio gender')
            .sort({ createdAt: -1 })
            .limit(50);

        // Format for frontend
        const formattedPlans = plans
            .filter(p => p.user) // exclude deleted users
            .map(plan => {
                const author = plan.user;
                const isOwner = String(author._id) === String(currentUserId);
                const hasJoined = (plan.interestedUsers || []).some(id => String(id) === String(currentUserId));

                return {
                    id: plan._id,
                    activity: plan.activity,
                    category: plan.category,
                    description: plan.description || '',
                    location: plan.location,
                    when: plan.when,
                    createdAt: plan.createdAt,
                    expiresAt: plan.expiresAt,
                    interestedCount: (plan.interestedUsers || []).length,
                    hasJoined,
                    isOwner,
                    author: {
                        id: author._id,
                        name: author.name || 'Kondani Member',
                        age: author.age || null,
                        photo: author.photos?.[0] || '',
                        isVerified: !!author.isVerified,
                        location: author.location?.city || author.district || plan.location
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
 * Create a new date/activity plan
 */
exports.createPlan = async (req, res) => {
    try {
        const currentUserId = req.user.id;
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

        // Limit active plans to 3 per user to avoid spam
        const userActiveCount = await Plan.countDocuments({
            user: currentUserId,
            isActive: true,
            expiresAt: { $gt: new Date() }
        });

        if (userActiveCount >= 3) {
            return res.status(400).json({
                error: 'You already have 3 active plans. Complete or delete an existing one first!'
            });
        }

        // Expires in 48 hours by default
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
 * Join an activity plan -> creates match and sends instant icebreaker message
 */
exports.joinPlan = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const planId = req.params.id;

        const plan = await Plan.findById(planId).populate('user', 'name photos isVerified');
        if (!plan || !plan.isActive) {
            return res.status(404).json({ error: 'Plan not found or has expired' });
        }

        const hostId = plan.user._id.toString();
        if (hostId === String(currentUserId)) {
            return res.status(400).json({ error: 'You are the host of this plan!' });
        }

        // Record interest if not already added
        const alreadyJoined = (plan.interestedUsers || []).some(id => String(id) === String(currentUserId));
        if (!alreadyJoined) {
            plan.interestedUsers.push(currentUserId);
            await plan.save();
        }

        // Automatically connect both users in chat (create match in Intent)
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

        // Send icebreaker message into chat room
        const chatId = [String(currentUserId), String(hostId)].sort().join('_');
        const customNote = req.body.note?.trim();
        const content = customNote || `Hey ${plan.user.name}! I saw your plan: "${plan.activity}" and I'd love to join you! 👋✨`;

        const msg = await Message.create({
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
            message: `You joined ${plan.user.name}'s plan! We started a chat for you.`
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
