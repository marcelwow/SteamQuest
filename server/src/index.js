require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const fetch = require('node-fetch');
const { passport, isAuthenticated } = require('./middleware/auth');

// Validate required environment variables
const requiredEnvVars = ['STEAM_API_KEY', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    process.exit(1);
}

// Log environment configuration (safely)
console.log('Environment configuration:');
console.log('- Steam API Key:', process.env.STEAM_API_KEY ? 'Set' : 'Not set');
console.log('- MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('- Client URL:', process.env.CLIENT_URL || 'http://localhost:3000');
console.log('- Session Secret:', process.env.SESSION_SECRET ? 'Set' : 'Not set');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Add a middleware to log session state
app.use((req, res, next) => {
    console.log('Session state:', {
        isAuthenticated: req.isAuthenticated(),
        sessionID: req.sessionID,
        session: req.session,
        user: req.user
    });
    next();
});

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const gamesRoutes = require('./routes/games');
const questsRoutes = require('./routes/quests');
const reviewsRoutes = require('./routes/reviews');

// Mount routes
app.use('/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/quests', questsRoutes);
app.use('/api/reviews', reviewsRoutes);

// Base route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to SteamQuest API' });
});

// API routes
app.get('/api/steam/promotions', async (req, res) => {
    try {
        const response = await fetch('https://store.steampowered.com/api/featuredcategories');
        const data = await response.json();
        
        // Transform the data into the expected format
        const promotions = [];
        
        // Add specials
        if (data.specials && data.specials.items) {
            promotions.push(...data.specials.items
                .filter(item => item.discount_percent > 0) // Filter out items with 0% discount
                .map(item => ({
                    appId: item.id,
                    name: item.name,
                    image: item.large_capsule_image,
                    discountPercent: item.discount_percent,
                    finalPrice: (item.final_price / 100).toFixed(2)
                })));
        }
        
        // Add top sellers
        if (data.top_sellers && data.top_sellers.items) {
            promotions.push(...data.top_sellers.items
                .filter(item => item.discount_percent > 0) // Filter out items with 0% discount
                .map(item => ({
                    appId: item.id,
                    name: item.name,
                    image: item.large_capsule_image,
                    discountPercent: item.discount_percent,
                    finalPrice: (item.final_price / 100).toFixed(2)
                })));
        }
        
        res.json(promotions);
    } catch (error) {
        console.error('Error fetching Steam promotions:', error);
        res.status(500).json({ message: 'Error fetching Steam promotions' });
    }
});

app.get('/api/steam/wishlist/promotions', isAuthenticated, async (req, res) => {
    try {
        const response = await fetch('https://store.steampowered.com/api/featuredcategories');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching wishlist promotions:', error);
        res.status(500).json({ message: 'Error fetching wishlist promotions' });
    }
});

// Get game by ID - this should be the last route
app.get('/api/games/:id', async (req, res) => {
    // Implementation of the endpoint
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', err);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 