import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar, Form, Spinner, Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Configure axios defaults
axios.defaults.withCredentials = true;

const formatPercentage = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.0' : num.toFixed(1);
};

const Achievements = () => {
    const { user } = useAuth();
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [selectedGameDetails, setSelectedGameDetails] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryAfter, setRetryAfter] = useState(null);

    useEffect(() => {
        if (user) {
            fetchGames();
        } else {
            setLoading(false);
            setError('Please log in to view your games');
        }
    }, [user]);

    const fetchGames = async () => {
        try {
            setError(null);
            setRetryAfter(null);
            const response = await axios.get('http://localhost:5000/api/games/steam/owned');
            // Sort games by playtime (descending)
            const sortedGames = response.data.sort((a, b) => b.playtime - a.playtime);
            setGames(sortedGames);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching games:', error);
            if (error.response?.status === 429) {
                setRetryAfter(error.response.data.retryAfter);
                setError('Too many requests. Please wait a moment before trying again.');
            } else if (error.response?.status === 401) {
                setError('Please log in to view your games');
            } else {
                setError('Error loading your games. Please try again later.');
            }
            setLoading(false);
        }
    };

    const handleGameSelect = async (gameId) => {
        try {
            setLoading(true);
            setError(null);
            const game = games.find(g => g.appId === gameId);
            setSelectedGameDetails(game);
            setSelectedGame(gameId);
            
            const response = await axios.get(`http://localhost:5000/api/games/${gameId}/achievements`);
            setAchievements(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching achievements:', error);
            if (error.response?.status === 401) {
                setError('Please log in to view achievements');
            } else {
                setError('Error loading achievements. Please try again later.');
            }
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <h2 className="mt-3">Loading your games...</h2>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                    {retryAfter && (
                        <p>Please wait {retryAfter} seconds before trying again.</p>
                    )}
                    <hr />
                    <div className="d-flex justify-content-end">
                        <Button variant="outline-danger" onClick={fetchGames}>
                            Try Again
                        </Button>
                    </div>
                </Alert>
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
                            <option key={game.appId} value={game.appId}>
                                {game.name} ({game.playtime}h played)
                            </option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            {selectedGameDetails && (
                <Row className="mb-4">
                    <Col>
                        <Card>
                            <Card.Body>
                                <Row>
                                    <Col md={2}>
                                        <img
                                            src={selectedGameDetails.logoUrl}
                                            alt={selectedGameDetails.name}
                                            className="img-fluid rounded"
                                            style={{ maxWidth: '100%' }}
                                        />
                                    </Col>
                                    <Col md={10}>
                                        <h2>{selectedGameDetails.name}</h2>
                                        <div className="d-flex gap-4">
                                            <div>
                                                <h5>Total Playtime</h5>
                                                <p>{selectedGameDetails.playtime} hours</p>
                                            </div>
                                            {selectedGameDetails.playtime2Weeks > 0 && (
                                                <div>
                                                    <h5>Recent Playtime (2 weeks)</h5>
                                                    <p>{selectedGameDetails.playtime2Weeks} hours</p>
                                                </div>
                                            )}
                                            <div>
                                                <h5>Achievements</h5>
                                                <p>{achievements.length} total</p>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {selectedGame && (
                <Row className="g-4">
                    {achievements.map((achievement, index) => (
                        <Col key={index} md={6} lg={4}>
                            <Card className={`h-100 ${achievement.unlocked ? 'border-success' : 'border-secondary'}`}>
                                <Card.Body>
                                    <div className="d-flex align-items-center mb-3">
                                        <img
                                            src={achievement.iconUrl || '/default-achievement-icon.png'}
                                            alt={achievement.name}
                                            className="me-3"
                                            style={{ width: '64px', height: '64px' }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/default-achievement-icon.png';
                                            }}
                                        />
                                        <div>
                                            <Card.Title>{achievement.name}</Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">
                                                {formatPercentage(achievement.globalPercentage)}% of players
                                            </Card.Subtitle>
                                            {achievement.unlocked && achievement.unlockTime && (
                                                <small className="text-success">
                                                    Unlocked {new Date(achievement.unlockTime * 1000).toLocaleDateString()}
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                    <Card.Text>{achievement.description || 'No description available'}</Card.Text>
                                    <ProgressBar
                                        now={parseFloat(achievement.globalPercentage) || 0}
                                        label={`${formatPercentage(achievement.globalPercentage)}%`}
                                        variant={achievement.unlocked ? "success" : "secondary"}
                                    />
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {!selectedGame && games.length > 0 && (
                <Row className="text-center mt-5">
                    <Col>
                        <h3>Select a game to view achievements</h3>
                    </Col>
                </Row>
            )}

            {!selectedGame && games.length === 0 && (
                <Row className="text-center mt-5">
                    <Col>
                        <h3>No games found in your Steam library</h3>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default Achievements; 