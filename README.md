# SteamQuest

A web application that helps Steam users track their gaming achievements, manage quests, and stay updated with the latest Steam promotions.

## Features

- Steam Authentication (Login/Logout)
- Achievement Tracking
- Quest System with Points
- Real-time Steam Promotions Notifications
- Game Lists Management
- Steam Store Integration

## Tech Stack

- Frontend: React.js, Bootstrap, React Router
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: Steam OAuth
- API Integration: Steam Web API

## Project Structure

```
steamquest/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context providers
│   │   └── utils/        # Utility functions
├── server/                # Backend Node.js/Express application
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── models/       # Database models
│   │   ├── middleware/   # Custom middleware
│   │   └── utils/        # Utility functions
├── .env                   # Environment variables
└── README.md             # Project documentation
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```
3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   STEAM_API_KEY=your_steam_api_key
   SESSION_SECRET=your_session_secret
   CLIENT_URL=http://localhost:3000
   ```
4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd ../client
   npm start
   ```

## API Endpoints

### Authentication
- `GET /auth/steam` - Steam OAuth login
- `GET /auth/steam/return` - Steam OAuth callback

### Games
- `GET /api/games` - Get all games
- `GET /api/games/:id` - Get game by ID
- `GET /api/steam/promotions` - Get current Steam promotions
- `GET /api/steam/wishlist/promotions` - Get promotions for user's wishlist

### Quests
- `GET /api/quests` - Get all quests
- `POST /api/quests` - Create new quest
- `PUT /api/quests/:id` - Update quest
- `DELETE /api/quests/:id` - Delete quest

## Features in Detail

### Achievement Tracking
- Track Steam achievements across all your games
- View achievement progress and completion statistics
- Get notifications for newly unlocked achievements

### Quest System
- Create custom quests for specific achievements
- Earn points for completing quests
- Track progress towards quest completion

### Steam Promotions
- Real-time notifications for Steam sales and discounts
- Personalized promotion alerts based on your wishlist
- Quick access to current promotions through the notification bell

### Game Lists
- Create and manage custom game lists
- Organize your Steam library
- Share lists with other users

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.