import React from 'react';
import { Navbar, Nav, Container, Button, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSteam } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const NavigationBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
          </Nav>
          <Nav>
            {user ? (
              <div className="d-flex align-items-center">
                <Nav.Link as={Link} to="/notifications" className="me-3">
                  <i className="fas fa-bell"></i>
                </Nav.Link>
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