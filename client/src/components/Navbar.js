import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSteam } from 'react-icons/fa';

const NavigationBar = () => {
  const navigate = useNavigate();
  const isAuthenticated = false; // This will be replaced with actual auth state

  const handleSteamLogin = () => {
    window.location.href = 'http://localhost:5000/auth/steam';
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
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/notifications">
                  <i className="fas fa-bell"></i>
                </Nav.Link>
                <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                <Button variant="outline-light" onClick={() => navigate('/auth/logout')}>
                  Logout
                </Button>
              </>
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