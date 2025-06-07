# SteamQuest Tracker

A web application that helps Steam users track their gaming achievements, manage quests, receive notifications about promotions, and interact with the gaming community.

## Features

- Steam Authentication (Login/Logout)
- Achievement Tracking
- Quest System with Points
- Steam Promotions Notifications
- Game Reviews and Comments
- Custom Game Lists Management

## Tech Stack

- Frontend: React.js, Bootstrap
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: Steam OAuth

## Project Structure

```
steamquest/
├── client/                 # Frontend React application
├── server/                 # Backend Node.js/Express application
├── .env                    # Environment variables
└── README.md              # Project documentation
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

## API Documentation

The API documentation will be available at `/api-docs` when running the server.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request