const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Quest = require('../models/Quest');
const User = require('../models/User');

// Get all quests
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const quests = await Quest.find();
        res.json(quests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's active quests
router.get('/my-quests', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('quests.quest');
        res.json(user.quests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new quest
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { questTitle, requirements, duration } = req.body;
        const { steamAppId, gameName, requiredMinutes } = requirements;
        // Wylicz expiresAt na podstawie duration
        let expiresAt = new Date();
        if (duration === 'daily') {
            expiresAt.setDate(expiresAt.getDate() + 1);
        } else if (duration === 'weekly') {
            expiresAt.setDate(expiresAt.getDate() + 7);
        } else if (duration === 'monthly') {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        }
        const quest = new Quest({
            questTitle,
            requirements: {
                steamAppId,
                gameName,
                requiredMinutes
            },
            duration,
            expiresAt
        });
        await quest.save();
        res.status(201).json(quest);
    } catch (error) {
        console.error('Quest creation error:', error);
        res.status(400).json({ message: error.message, error });
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

// Assign quest to user
router.post('/:id/assign', isAuthenticated, async (req, res) => {
    try {
        const quest = await Quest.findById(req.params.id);
        if (!quest) {
            return res.status(404).json({ message: 'Quest not found' });
        }
        const user = await User.findById(req.user.id);
        // Sprawdź, czy quest już jest aktywny
        if (user.quests.some(q => q.quest.toString() === quest._id.toString() && q.status === 'active')) {
            return res.status(400).json({ message: 'Quest already assigned' });
        }
        // Pobierz aktualny czas gry z Steama
        const steamId = user.steamId;
        const appId = quest.requirements.steamAppId;
        const axios = require('axios');
        const response = await axios.get(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`);
        const game = (response.data.response.games || []).find(g => String(g.appid) === String(appId));
        const startMinutes = game ? Math.round(game.playtime_forever) : 0;
        // Dodaj questa do usera
        user.quests.push({
            quest: quest._id,
            startMinutes,
            status: 'active'
        });
        await user.save();
        res.json({ message: 'Quest assigned successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete quest by ID
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const quest = await Quest.findByIdAndDelete(req.params.id);
        if (!quest) {
            return res.status(404).json({ message: 'Quest not found' });
        }
        res.json({ message: 'Quest deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Check quest progress and complete if requirements met
router.post('/:id/check-progress', isAuthenticated, async (req, res) => {
    try {
        const quest = await Quest.findById(req.params.id);
        if (!quest) {
            return res.status(404).json({ message: 'Quest not found' });
        }
        const user = await User.findById(req.user.id);
        const userQuest = user.quests.find(q => q.quest.toString() === quest._id.toString() && q.status === 'active');
        if (!userQuest) {
            return res.status(400).json({ message: 'Quest not active for user' });
        }
        // Pobierz aktualny czas gry z Steama
        const steamId = user.steamId;
        const appId = quest.requirements.steamAppId;
        const axios = require('axios');
        const response = await axios.get(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`);
        const game = (response.data.response.games || []).find(g => String(g.appid) === String(appId));
        const currentMinutes = game ? Math.round(game.playtime_forever) : 0;
        const gainedMinutes = currentMinutes - userQuest.startMinutes;
        const requiredMinutes = quest.requirements.requiredMinutes;
        if (gainedMinutes >= requiredMinutes) {
            userQuest.status = 'completed';
            userQuest.completedAt = new Date();
            user.points += requiredMinutes; // 1 punkt za każdą wymaganą minutę
            await user.save();
            return res.json({ message: 'Quest completed!', points: user.points });
        } else {
            return res.json({ message: `Progress: ${gainedMinutes}/${requiredMinutes} minutes. Keep playing!` });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 