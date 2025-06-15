import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTrophy, FaList, FaBell } from 'react-icons/fa';

const Home = () => {
  const features = [
    {
      icon: <FaTrophy size={40} />,
      title: 'Achievement Tracking',
      description: 'Track your Steam achievements and earn points for completing them.',
      link: '/achievements'
    },
    {
      icon: <FaList size={40} />,
      title: 'Game Lists',
      description: 'Create and manage your game lists, organize your library.',
      link: '/lists'
    },
    {
      icon: <FaBell size={40} />,
      title: 'Promotion Alerts',
      description: 'Get notified about new game promotions and discounts.',
      link: '/notifications'
    }
  ];

  return (
    <Container>
      <Row className="text-center mb-5">
        <Col>
          <h1 className="display-4">Welcome to SteamQuest</h1>
          <p className="lead">
            Track your gaming achievements, manage your game lists, and stay updated with the latest Steam promotions.
          </p>
        </Col>
      </Row>

      <Row className="g-4">
        {features.map((feature, index) => (
          <Col key={index} md={6} lg={4}>
            <Card className="h-100 text-center">
              <Card.Body>
                <div className="mb-3 text-primary">
                  {feature.icon}
                </div>
                <Card.Title>{feature.title}</Card.Title>
                <Card.Text>{feature.description}</Card.Text>
                <Button
                  as={Link}
                  to={feature.link}
                  variant="outline-primary"
                >
                  Learn More
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Home; 