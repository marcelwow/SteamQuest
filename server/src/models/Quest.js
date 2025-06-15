const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
    questTitle: {
        type: String,
        required: true
    },
    requirements: {
        steamAppId: {
            type: String,
            required: true
        },
        gameName: {
            type: String,
            required: true
        },
        requiredMinutes: {
            type: Number,
            required: true
        }
    },
    duration: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        completedAt: {
            type: Date,
            default: Date.now
        }
    }],
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Quest', questSchema); 