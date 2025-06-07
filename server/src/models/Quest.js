const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['achievement', 'game', 'review', 'custom'],
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    requirements: {
        gameId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        },
        achievementCount: Number,
        reviewCount: Number,
        customRequirement: String
    },
    deadline: Date,
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
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Quest', questSchema); 