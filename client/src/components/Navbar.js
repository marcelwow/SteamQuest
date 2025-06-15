import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Nav, Container, Button, Image, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSteam, FaBell } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const NavigationBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [promoGames, setPromoGames] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const bellRef = useRef();

  useEffect(() => {
    if (user) {
      axios.get('http://localhost:5000/api/steam/promotions')
        .then(res => setPromoGames(res.data))
        .catch(() => setPromoGames([]));
    }
  }, [user]);

  // Zamknij dropdown po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSteamLogin = () => {
    window.location.href = 'http://localhost:5000/auth/steam';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <FaSteam className="me-2" />
          SteamQuest
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/achievements">Achievements</Nav.Link>
            <Nav.Link as={Link} to="/quests">Quests</Nav.Link>
            <Nav.Link as={Link} to="/reviews">Reviews</Nav.Link>
            <Nav.Link as={Link} to="/lists">Game Lists</Nav.Link>
            <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
          </Nav>
          <Nav>
            {user ? (
              <div className="d-flex align-items-center">
                <div ref={bellRef} className="position-relative me-3">
                  <FaBell
                    className="text-light fs-4 cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowDropdown((v) => !v)}
                  />
                  {promoGames.length > 0 && (
                    <span style={{position:'absolute',top:0,right:0}} className="badge bg-danger rounded-circle">{promoGames.length}</span>
                  )}
                  {showDropdown && (
                    <div style={{position:'absolute',right:0,top:'120%',zIndex:1000,minWidth:300}} className="bg-white shadow rounded p-2">
                      <div className="fw-bold mb-2">Losowe promocje na Steam</div>
                      {promoGames.length === 0 && <div className="text-muted">Brak promocji</div>}
                      {promoGames.map(game => (
                        <div key={game.appId} className="d-flex align-items-center mb-2">
                          {game.image && <img src={game.image} alt={game.name} style={{width:40, height:20, objectFit:'cover', marginRight:8}} />}
                          <div>
                            <div className="fw-bold">{game.name}</div>
                            <div className="text-success">-{game.discountPercent}% ({game.finalPrice} zł)</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="d-flex align-items-center me-3">
                  {user.avatar && (
                    <Image
                      src={user.avatar}
                      alt={user.username}
                      roundedCircle
                      style={{ width: '32px', height: '32px', marginRight: '8px' }}
                    />
                  )}
                  <span className="text-light">{user.username}</span>
                </div>
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="outline-light" onClick={handleSteamLogin}>
                <FaSteam className="me-2" />
                Login with Steam
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar; 