const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Review = require('../models/Review');
const Game = require('../models/Game');

// Create review
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const review = new Review({
            ...req.body,
            user: req.user.id
        });

        await review.save();

        // Update game's average rating
        const game = await Game.findById(req.body.game);
        const reviews = await Review.find({ game: req.body.game });
        
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        game.averageRating = totalRating / reviews.length;
        game.totalReviews = reviews.length;
        game.reviews.push(review._id);
        
        await game.save();

        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get reviews for a game
router.get('/game/:gameId', async (req, res) => {
    try {
        const reviews = await Review.find({ game: req.params.gameId })
            .populate('user', 'username avatar')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update review
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        Object.assign(review, req.body, { isEdited: true });
        await review.save();
        res.json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete review
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await review.remove();

        // Update game's average rating
        const game = await Game.findById(review.game);
        const reviews = await Review.find({ game: review.game });
        
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            game.averageRating = totalRating / reviews.length;
        } else {
            game.averageRating = 0;
        }
        
        game.totalReviews = reviews.length;
        game.reviews = game.reviews.filter(id => id.toString() !== review._id.toString());
        
        await game.save();

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Like/Unlike review
router.post('/:id/like', isAuthenticated, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const likeIndex = review.likes.indexOf(req.user.id);
        if (likeIndex === -1) {
            review.likes.push(req.user.id);
        } else {
            review.likes.splice(likeIndex, 1);
        }

        await review.save();
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add comment to review
router.post('/:id/comments', isAuthenticated, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.comments.push({
            user: req.user.id,
            content: req.body.content
        });

        await review.save();
        res.json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 