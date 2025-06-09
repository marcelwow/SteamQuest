const express = require('express');
const router = express.Router();
const { passport, isAuthenticated } = require('../middleware/auth');
const https = require('https');

// Test Steam API key
router.get('/test-steam-key', async (req, res) => {
    const apiKey = process.env.STEAM_API_KEY;
    const steamId = '76561198054738132'; // Your Steam ID from the callback
    
    console.log('Testing Steam API key:', {
        key: apiKey,
        keyLength: apiKey ? apiKey.length : 0,
        steamId: steamId
    });
    
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`;
    console.log('Steam API URL:', url);
    
    https.get(url, (response) => {
        console.log('Steam API Response Status:', response.statusCode);
        console.log('Steam API Response Headers:', response.headers);
        
        let data = '';
        
        response.on('data', (chunk) => {
            data += chunk;
        });
        
        response.on('end', () => {
            console.log('Raw Steam API Response:', data);
            
            try {
                const result = JSON.parse(data);
                console.log('Parsed Steam API Response:', result);
                
                if (result.response && result.response.players) {
                    res.json({
                        success: true,
                        response: result,
                        message: 'Steam API key is valid'
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        error: 'Invalid Steam API response format',
                        response: result
                    });
                }
            } catch (error) {
                console.error('Error parsing Steam API response:', error);
                res.status(500).json({
                    success: false,
                    error: 'Error parsing Steam API response',
                    details: error.message,
                    rawResponse: data
                });
            }
        });
    }).on('error', (error) => {
        console.error('Error calling Steam API:', error);
        res.status(500).json({
            success: false,
            error: 'Error calling Steam API',
            details: error.message
        });
    });
});

// Steam authentication routes
router.get('/steam',
    (req, res, next) => {
        console.log('Starting Steam authentication...');
        console.log('Session before auth:', req.session);
        passport.authenticate('steam', { 
            failureRedirect: '/',
            failureMessage: true,
            session: true
        })(req, res, next);
    }
);

router.get('/steam/return',
    (req, res, next) => {
        console.log('Steam authentication callback received');
        console.log('Session before callback:', req.session);
        console.log('Query parameters:', req.query);
        
        passport.authenticate('steam', { 
            failureRedirect: '/',
            failureMessage: true,
            session: true
        })(req, res, next);
    },
    (req, res) => {
        console.log('Steam authentication successful');
        console.log('Session after auth:', req.session);
        console.log('User after auth:', req.user);
        
        // Save session before redirect
        req.session.save((err) => {
            if (err) {
                console.error('Error saving session:', err);
                return res.status(500).json({ message: 'Error saving session' });
            }
            console.log('Session saved, redirecting to client');
            res.redirect(process.env.CLIENT_URL || 'http://localhost:3000');
        });
    }
);

// Get current user
router.get('/me', isAuthenticated, (req, res) => {
    console.log('Getting current user:', req.user);
    res.json(req.user);
});

// Logout
router.get('/logout', (req, res) => {
    console.log('Logging out user:', req.user);
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Error logging out' });
        }
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ message: 'Error destroying session' });
            }
            res.json({ message: 'Logged out successfully' });
        });
    });
});

module.exports = router; 