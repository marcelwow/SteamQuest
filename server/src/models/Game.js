const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    steamAppId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    imageUrl: String,
    currentPrice: Number,
    originalPrice: Number,
    discount: Number,
    achievements: [{
        name: String,
        description: String,
        iconUrl: String,
        globalPercentage: Number
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    averageRating: {
        type: Number,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Game', gameSchema); 