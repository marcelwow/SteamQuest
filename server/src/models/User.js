const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    steamId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    points: {
        type: Number,
        default: 0
    },
    quests: [{
        quest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quest',
            required: true
        },
        startMinutes: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'completed'],
            default: 'active'
        },
        completedAt: Date
    }],
    gameLists: [{
        name: String,
        games: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        }]
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    notifications: [{
        type: {
            type: String,
            enum: ['achievement', 'promotion', 'quest', 'system']
        },
        message: String,
        read: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema); 