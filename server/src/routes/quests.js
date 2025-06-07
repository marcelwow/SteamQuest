const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Quest = require('../models/Quest');
const User = require('../models/User');

// Get all quests
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const quests = await Quest.find()
            .populate('requirements.gameId', 'name imageUrl');
        res.json(quests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's active quests
router.get('/my-quests', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'quests',
                populate: {
                    path: 'requirements.gameId',
                    select: 'name imageUrl'
                }
            });
        res.json(user.quests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new quest
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const quest = new Quest(req.body);
        await quest.save();
        res.status(201).json(quest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Complete quest
router.post('/:id/complete', isAuthenticated, async (req, res) => {
    try {
        const quest = await Quest.findById(req.params.id);
        if (!quest) {
            return res.status(404).json({ message: 'Quest not found' });
        }

        const user = await User.findById(req.user.id);
        
        // Check if user already completed the quest
        if (quest.completedBy.some(completion => completion.user.toString() === req.user.id)) {
            return res.status(400).json({ message: 'Quest already completed' });
        }

        // Add completion record
        quest.completedBy.push({
            user: req.user.id,
            completedAt: new Date()
        });

        // Add points to user
        user.points += quest.points;
        
        // Add quest to user's completed quests
        user.quests.push(quest._id);

        await Promise.all([quest.save(), user.save()]);
        
        res.json({ message: 'Quest completed successfully', points: quest.points });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get quest leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const users = await User.find()
            .select('username points avatar')
            .sort({ points: -1 })
            .limit(10);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 