const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Game = require('../models/Game');
const axios = require('axios');

// Cache for Steam games
const steamGamesCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Cache for Steam achievements
const steamAchievementsCache = new Map();
const ACHIEVEMENTS_CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 1000 * 60; // 1 minute
const MAX_REQUESTS = 10; // Maximum requests per minute

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
router.get('/:id/achievements', isAuthenticated, async (req, res) => {
    try {
        const appId = req.params.id;
        const steamId = req.user.steamId;

        if (!steamId) {
            console.error('No Steam ID found for user:', req.user);
            return res.status(401).json({ message: 'Steam ID not found' });
        }

        console.log('Fetching achievements for game:', appId, 'user:', steamId);

        // Check cache first
        const cacheKey = `${steamId}-${appId}`;
        const cachedData = steamAchievementsCache.get(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp) < ACHIEVEMENTS_CACHE_DURATION) {
            console.log('Returning cached achievements for game:', appId);
            console.log('Sample achievement icons:', cachedData.achievements.slice(0, 3).map(a => a.iconUrl));
            return res.json(cachedData.achievements);
        }

        // Check rate limit
        const now = Date.now();
        const userRequests = rateLimit.get(steamId) || [];
        const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
        
        if (recentRequests.length >= MAX_REQUESTS) {
            console.log('Rate limit exceeded for user:', steamId);
            return res.status(429).json({ 
                message: 'Too many requests. Please try again in a minute.',
                retryAfter: Math.ceil((recentRequests[0] + RATE_LIMIT_WINDOW - now) / 1000)
            });
        }

        // Update rate limit
        recentRequests.push(now);
        rateLimit.set(steamId, recentRequests);

        // Fetch global achievement stats
        console.log('Fetching global achievement stats for game:', appId);
        const globalStatsResponse = await axios.get(
            `http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appId}`
        );

        // Fetch user's achievements
        console.log('Fetching user achievements for game:', appId);
        const userStatsResponse = await axios.get(
            `http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&key=${process.env.STEAM_API_KEY}&steamid=${steamId}`
        );

        // Fetch schema for the game (for icons and descriptions)
        console.log('Fetching achievement schema for game:', appId);
        const schemaResponse = await axios.get(
            `http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=${process.env.STEAM_API_KEY}&appid=${appId}&l=english&format=json`
        );
        const schemaAchievements = {};
        if (
            schemaResponse.data &&
            schemaResponse.data.game &&
            schemaResponse.data.game.availableGameStats &&
            schemaResponse.data.game.availableGameStats.achievements
        ) {
            for (const ach of schemaResponse.data.game.availableGameStats.achievements) {
                schemaAchievements[ach.name] = ach;
            }
        }

        if (!userStatsResponse.data.playerstats || !userStatsResponse.data.playerstats.achievements) {
            console.log('No achievements found for game:', appId);
            return res.status(404).json({ message: 'No achievements found for this game' });
        }

        // Combine global, user, and schema achievement data
        const achievements = userStatsResponse.data.playerstats.achievements.map(achievement => {
            const globalStats = globalStatsResponse.data.achievementpercentages.achievements.find(
                g => g.name === achievement.apiname
            );
            const schema = schemaAchievements[achievement.apiname] || {};
            const iconUrl = achievement.achieved === 1 ? schema.icon : schema.icongray;
            const globalPercentage = globalStats ? parseFloat(globalStats.percent) || 0 : 0;
            return {
                name: achievement.apiname,
                displayName: schema.displayName || achievement.apiname,
                description: schema.description || '',
                iconUrl: iconUrl || '',
                unlocked: achievement.achieved === 1,
                unlockTime: achievement.unlocktime || null,
                globalPercentage: globalPercentage
            };
        });

        // Cache the results
        steamAchievementsCache.set(cacheKey, {
            achievements,
            timestamp: now
        });

        console.log('Sample achievement icons:', achievements.slice(0, 3).map(a => a.iconUrl));
        console.log('Successfully fetched achievements for game:', appId);
        res.json(achievements);
    } catch (error) {
        console.error('Error fetching achievements:', error);
        
        // If we have cached data, return it even if expired
        const cacheKey = `${req.user.steamId}-${req.params.id}`;
        const cachedData = steamAchievementsCache.get(cacheKey);
        if (cachedData) {
            console.log('Returning expired cache due to API error');
            console.log('Sample achievement icons:', cachedData.achievements.slice(0, 3).map(a => a.iconUrl));
            return res.json(cachedData.achievements);
        }

        res.status(500).json({ 
            message: 'Error fetching achievements',
            error: error.response?.status === 429 ? 'Rate limit exceeded. Please try again later.' : 'Unknown error'
        });
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

// Get user's Steam games
router.get('/steam/owned', isAuthenticated, async (req, res) => {
    try {
        const steamId = req.user.steamId;
        
        // Check cache first
        const cachedData = steamGamesCache.get(steamId);
        if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
            console.log('Returning cached games data for user:', steamId);
            return res.json(cachedData.games);
        }

        // Check rate limit
        const now = Date.now();
        const userRequests = rateLimit.get(steamId) || [];
        const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
        
        if (recentRequests.length >= MAX_REQUESTS) {
            console.log('Rate limit exceeded for user:', steamId);
            return res.status(429).json({ 
                message: 'Too many requests. Please try again in a minute.',
                retryAfter: Math.ceil((recentRequests[0] + RATE_LIMIT_WINDOW - now) / 1000)
            });
        }

        // Update rate limit
        recentRequests.push(now);
        rateLimit.set(steamId, recentRequests);

        // Make the API request
        console.log('Fetching games from Steam API for user:', steamId);
        const response = await axios.get(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`);
        
        if (!response.data.response || !response.data.response.games) {
            return res.status(404).json({ message: 'No games found' });
        }

        const games = response.data.response.games.map(game => ({
            appId: game.appid,
            name: game.name,
            playtime: Math.round(game.playtime_forever / 60), // Convert minutes to hours
            playtime2Weeks: game.playtime_2weeks ? Math.round(game.playtime_2weeks / 60) : 0,
            iconUrl: `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`,
            logoUrl: `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_logo_url}.jpg`
        }));

        // Cache the results
        steamGamesCache.set(steamId, {
            games,
            timestamp: now
        });

        res.json(games);
    } catch (error) {
        console.error('Error fetching Steam games:', error);
        
        // If we have cached data, return it even if expired
        const cachedData = steamGamesCache.get(req.user.steamId);
        if (cachedData) {
            console.log('Returning expired cache due to API error');
            return res.json(cachedData.games);
        }

        res.status(500).json({ 
            message: 'Error fetching Steam games',
            error: error.response?.status === 429 ? 'Rate limit exceeded. Please try again later.' : 'Unknown error'
        });
    }
});

// Get 5 random Steam promotions
router.get('/steam-promotions', async (req, res) => {
    try {
        const axios = require('axios');
        // Pobierz listę bestsellerów/promocji z API Steama
        const resp = await axios.get('https://store.steampowered.com/api/featuredcategories/?cc=pl&l=pl', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        // Wybierz gry z promocjami (np. specials)
        const specials = resp.data.specials.items.filter(item => item.discount_percent > 0);
        // Wylosuj 5 gier
        const shuffled = specials.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5).map(game => ({
            appId: game.id,
            name: game.name,
            discountPercent: game.discount_percent,
            finalPrice: game.final_price / 100,
            originalPrice: game.original_price / 100,
            image: game.header_image
        }));
        res.json(selected);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Steam wishlist and check for promotions
router.get('/wishlist/promotions', isAuthenticated, async (req, res) => {
    try {
        const steamId = req.user.steamId;
        const axios = require('axios');
        // Pobierz wishlistę
        const wishlistUrl = `https://store.steampowered.com/wishlist/profiles/${steamId}/wishlistdata/`;
        const wishlistResp = await axios.get(wishlistUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const wishlist = wishlistResp.data;
        const results = [];
        // Dla każdej gry pobierz szczegóły i sprawdź promocję
        for (const appId of Object.keys(wishlist)) {
            try {
                const detailsResp = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=pl&l=pl`);
                const details = detailsResp.data[appId]?.data;
                const priceInfo = details?.price_overview;
                results.push({
                    appId,
                    name: details?.name || wishlist[appId].name,
                    isOnSale: priceInfo ? priceInfo.discount_percent > 0 : false,
                    discountPercent: priceInfo ? priceInfo.discount_percent : 0,
                    finalPrice: priceInfo ? priceInfo.final / 100 : null,
                    originalPrice: priceInfo ? priceInfo.initial / 100 : null,
                    image: details?.header_image || null
                });
            } catch (err) {
                // Pomijaj błędy pojedynczych gier
            }
        }
        res.json(results);
    } catch (error) {
        console.error('Błąd pobierania wishlisty:', error.response?.status, error.response?.data);
        if (error.response && error.response.status === 403) {
            return res.status(403).json({ message: 'Your Steam wishlist is private or not accessible.' });
        }
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 