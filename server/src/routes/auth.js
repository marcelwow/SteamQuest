const express = require('express');
const router = express.Router();
const { passport, isAuthenticated } = require('../middleware/auth');

// Steam authentication routes
router.get('/steam',
    passport.authenticate('steam', { failureRedirect: '/' })
);

router.get('/steam/return',
    passport.authenticate('steam', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect(process.env.CLIENT_URL || 'http://localhost:3000');
    }
);

// Get current user
router.get('/me', isAuthenticated, (req, res) => {
    res.json(req.user);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

module.exports = router; 