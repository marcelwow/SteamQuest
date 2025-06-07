const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Game = require('../models/Game');

// Get all games
router.get('/', async (req, res) => {
    try {
        const games = await Game.find()
            .select('name imageUrl currentPrice originalPrice discount')
            .limit(20);
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get game by ID
router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id)
            .populate('reviews');
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search games
router.get('/search/:query', async (req, res) => {
    try {
        const games = await Game.find({
            name: { $regex: req.params.query, $options: 'i' }
        }).limit(10);
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get game achievements
router.get('/:id/achievements', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id)
            .select('achievements');
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        res.json(game.achievements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get game reviews
router.get('/:id/reviews', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id)
            .populate({
                path: 'reviews',
                populate: {
                    path: 'user',
                    select: 'username avatar'
                }
            });
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        res.json(game.reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 