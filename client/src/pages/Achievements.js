import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar, Form } from 'react-bootstrap';
import axios from 'axios';

const Achievements = () => {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/games');
            setGames(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching games:', error);
            setLoading(false);
        }
    };

    const handleGameSelect = async (gameId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/games/${gameId}/achievements`);
            setAchievements(response.data);
            setSelectedGame(gameId);
        } catch (error) {
            console.error('Error fetching achievements:', error);
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <h2>Loading...</h2>
            </Container>
        );
    }

    return (
        <Container>
            <h1 className="mb-4">Achievements</h1>
            
            <Row className="mb-4">
                <Col>
                    <Form.Select
                        onChange={(e) => handleGameSelect(e.target.value)}
                        value={selectedGame || ''}
                    >
                        <option value="">Select a game</option>
                        {games.map(game => (
                            <option key={game._id} value={game._id}>
                                {game.name}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            {selectedGame && (
                <Row className="g-4">
                    {achievements.map((achievement, index) => (
                        <Col key={index} md={6} lg={4}>
                            <Card className="h-100">
                                <Card.Body>
                                    <div className="d-flex align-items-center mb-3">
                                        <img
                                            src={achievement.iconUrl}
                                            alt={achievement.name}
                                            className="me-3"
                                            style={{ width: '64px', height: '64px' }}
                                        />
                                        <div>
                                            <Card.Title>{achievement.name}</Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">
                                                {achievement.globalPercentage.toFixed(1)}% of players
                                            </Card.Subtitle>
                                        </div>
                                    </div>
                                    <Card.Text>{achievement.description}</Card.Text>
                                    <ProgressBar
                                        now={achievement.globalPercentage}
                                        label={`${achievement.globalPercentage.toFixed(1)}%`}
                                    />
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {!selectedGame && (
                <Row className="text-center mt-5">
                    <Col>
                        <h3>Select a game to view achievements</h3>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default Achievements; 