import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Badge } from 'react-bootstrap';
import axios from 'axios';
import { FaTrophy, FaGamepad, FaComment, FaStar } from 'react-icons/fa';

const Quests = () => {
    const [quests, setQuests] = useState([]);
    const [userQuests, setUserQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        fetchQuests();
        fetchLeaderboard();
    }, []);

    const fetchQuests = async () => {
        try {
            const [allQuests, userQuests] = await Promise.all([
                axios.get('http://localhost:5000/api/quests'),
                axios.get('http://localhost:5000/api/quests/my-quests')
            ]);
            setQuests(allQuests.data);
            setUserQuests(userQuests.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching quests:', error);
            setLoading(false);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/quests/leaderboard');
            setLeaderboard(response.data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    };

    const handleCompleteQuest = async (questId) => {
        try {
            await axios.post(`http://localhost:5000/api/quests/${questId}/complete`);
            fetchQuests();
            fetchLeaderboard();
        } catch (error) {
            console.error('Error completing quest:', error);
        }
    };

    const getQuestIcon = (type) => {
        switch (type) {
            case 'achievement':
                return <FaTrophy />;
            case 'game':
                return <FaGamepad />;
            case 'review':
                return <FaComment />;
            default:
                return <FaStar />;
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
            <Row>
                <Col md={8}>
                    <h1 className="mb-4">Quests</h1>
                    
                    <h3 className="mb-3">Your Active Quests</h3>
                    <Row className="g-4 mb-5">
                        {userQuests.map(quest => (
                            <Col key={quest._id} md={6}>
                                <Card className="h-100">
                                    <Card.Body>
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="me-3 text-primary">
                                                {getQuestIcon(quest.type)}
                                            </div>
                                            <div>
                                                <Card.Title>{quest.title}</Card.Title>
                                                <Badge bg="primary">{quest.points} points</Badge>
                                            </div>
                                        </div>
                                        <Card.Text>{quest.description}</Card.Text>
                                        <Button
                                            variant="success"
                                            onClick={() => handleCompleteQuest(quest._id)}
                                        >
                                            Complete Quest
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <h3 className="mb-3">Available Quests</h3>
                    <Row className="g-4">
                        {quests.map(quest => (
                            <Col key={quest._id} md={6}>
                                <Card className="h-100">
                                    <Card.Body>
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="me-3 text-primary">
                                                {getQuestIcon(quest.type)}
                                            </div>
                                            <div>
                                                <Card.Title>{quest.title}</Card.Title>
                                                <Badge bg="primary">{quest.points} points</Badge>
                                            </div>
                                        </div>
                                        <Card.Text>{quest.description}</Card.Text>
                                        <ProgressBar
                                            now={(quest.completedBy.length / 100) * 100}
                                            label={`${quest.completedBy.length} completed`}
                                        />
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Col>

                <Col md={4}>
                    <Card className="sticky-top" style={{ top: '20px' }}>
                        <Card.Header>
                            <h3 className="mb-0">Leaderboard</h3>
                        </Card.Header>
                        <Card.Body>
                            {leaderboard.map((user, index) => (
                                <div key={user._id} className="d-flex align-items-center mb-3">
                                    <div className="me-3">
                                        <img
                                            src={user.avatar}
                                            alt={user.username}
                                            className="rounded-circle"
                                            style={{ width: '40px', height: '40px' }}
                                        />
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between">
                                            <span>{user.username}</span>
                                            <Badge bg="primary">{user.points} points</Badge>
                                        </div>
                                        <ProgressBar
                                            now={(user.points / leaderboard[0].points) * 100}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Quests; 