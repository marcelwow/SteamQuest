const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(new SteamStrategy({
    returnURL: process.env.STEAM_RETURN_URL || 'http://localhost:5000/auth/steam/return',
    realm: process.env.STEAM_REALM || 'http://localhost:5000/',
    apiKey: process.env.STEAM_API_KEY
}, async (identifier, profile, done) => {
    try {
        let user = await User.findOne({ steamId: profile.id });
        
        if (!user) {
            user = await User.create({
                steamId: profile.id,
                username: profile.displayName,
                avatar: profile._json.avatarfull
            });
        } else {
            user.username = profile.displayName;
            user.avatar = profile._json.avatarfull;
            await user.save();
        }
        
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
};

module.exports = {
    passport,
    isAuthenticated
}; 