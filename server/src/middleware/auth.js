const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const User = require('../models/User');
const https = require('https');

passport.serializeUser((user, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        console.log('Deserializing user:', id);
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        console.error('Error deserializing user:', error);
        done(error, null);
    }
});

// Debug log the Steam API key (first few characters only)
console.log('Steam API Key (first 4 chars):', process.env.STEAM_API_KEY ? process.env.STEAM_API_KEY.substring(0, 4) + '...' : 'Not set');

// Function to get Steam profile data
async function getSteamProfile(steamId) {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.STEAM_API_KEY;
        const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`;
        
        console.log('Fetching Steam profile:', url);
        
        https.get(url, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log('Steam API Response:', result);
                    
                    if (result.response && result.response.players && result.response.players.length > 0) {
                        resolve(result.response.players[0]);
                    } else {
                        reject(new Error('No player data found'));
                    }
                } catch (error) {
                    console.error('Error parsing Steam API response:', error);
                    reject(error);
                }
            });
        }).on('error', (error) => {
            console.error('Error calling Steam API:', error);
            reject(error);
        });
    });
}

// Configure Steam Strategy
const steamStrategy = new SteamStrategy({
    returnURL: 'http://localhost:5000/auth/steam/return',
    realm: 'http://localhost:5000/',
    apiKey: process.env.STEAM_API_KEY,
    passReqToCallback: true
}, async (req, identifier, profile, done) => {
    try {
        console.log('Steam authentication callback received:', {
            identifier,
            profileId: profile.id,
            displayName: profile.displayName
        });

        if (!profile.id) {
            console.error('No Steam ID received from profile');
            return done(new Error('No Steam ID received'), null);
        }

        // Extract Steam ID from the identifier
        const steamId = profile.id;
        console.log('Processing Steam ID:', steamId);

        // Get additional profile data from Steam API
        let steamProfile;
        try {
            steamProfile = await getSteamProfile(steamId);
            console.log('Steam profile data:', steamProfile);
        } catch (error) {
            console.error('Error getting Steam profile:', error);
            // Continue with basic profile data if API call fails
            steamProfile = {
                personaname: profile.displayName,
                avatarfull: null
            };
        }

        let user = await User.findOne({ steamId });
        
        if (!user) {
            console.log('Creating new user for Steam ID:', steamId);
            user = await User.create({
                steamId: steamId,
                username: steamProfile.personaname || profile.displayName,
                avatar: steamProfile.avatarfull
            });
            console.log('New user created:', user);
        } else {
            console.log('Updating existing user:', steamId);
            user.username = steamProfile.personaname || profile.displayName;
            user.avatar = steamProfile.avatarfull;
            await user.save();
            console.log('User updated:', user);
        }

        // Store user in session
        if (req.session) {
            req.session.user = user;
            console.log('User stored in session:', req.session.user);
        }
        
        return done(null, user);
    } catch (error) {
        console.error('Error in Steam authentication:', error);
        return done(error, null);
    }
});

// Add error handling to the strategy
steamStrategy.error = function(err) {
    console.error('Steam Strategy Error:', err);
};

passport.use(steamStrategy);

const isAuthenticated = async (req, res, next) => {
    console.log('Checking authentication status:', {
        isAuthenticated: req.isAuthenticated(),
        session: req.session,
        user: req.user
    });

    if (req.isAuthenticated()) {
        console.log('User is authenticated');
        return next();
    }

    // Check if there's a session but it's not authenticated
    if (req.session && req.session.passport && req.session.passport.user) {
        console.log('Session exists but not authenticated, attempting to restore session');
        try {
            // Try to find the user
            const user = await User.findById(req.session.passport.user);
            if (!user) {
                console.error('User not found in database');
                return res.status(401).json({ message: 'User not found' });
            }

            // Log in the user
            req.login(user, (err) => {
                if (err) {
                    console.error('Error restoring session:', err);
                    return res.status(401).json({ message: 'Authentication failed' });
                }
                console.log('Session restored successfully');
                return next();
            });
        } catch (error) {
            console.error('Error restoring session:', error);
            return res.status(401).json({ message: 'Authentication failed' });
        }
    } else {
        console.log('No valid session found');
        return res.status(401).json({ message: 'Authentication required' });
    }
};

module.exports = {
    passport,
    isAuthenticated
}; 