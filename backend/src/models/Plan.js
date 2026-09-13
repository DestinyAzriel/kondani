const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    activity: {
        type: String,
        required: [true, 'Please specify what you want to do'],
        trim: true,
        maxlength: [120, 'Activity description cannot exceed 120 characters']
    },
    category: {
        type: String,
        enum: ['coffee', 'drinks', 'food', 'music', 'outdoors', 'active', 'other'],
        default: 'coffee',
        index: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [300, 'Description cannot exceed 300 characters'],
        default: ''
    },
    location: {
        type: String,
        required: [true, 'Please specify a venue or area'],
        trim: true,
        maxlength: [80, 'Location cannot exceed 80 characters']
    },
    when: {
        type: String,
        required: [true, 'Please specify when (e.g. Today, This Weekend)'],
        trim: true,
        maxlength: [60, 'When cannot exceed 60 characters']
    },
    interestedUsers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        note: {
            type: String,
            default: ''
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index automatically purges expired plans
    }
}, {
    timestamps: true
});

planSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Plan', planSchema);
