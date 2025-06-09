import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Achievements from './pages/Achievements';
import Quests from './pages/Quests';
import Reviews from './pages/Reviews';
import GameLists from './pages/GameLists';
import Notifications from './pages/Notifications';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Container className="mt-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/quests" element={<Quests />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/lists" element={<GameLists />} />
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
          </Container>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 