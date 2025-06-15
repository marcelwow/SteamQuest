import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Badge } from 'react-bootstrap';
import axios from 'axios';
import { FaTrophy, FaGamepad, FaComment, FaStar } from 'react-icons/fa';
import { differenceInSeconds, formatDuration, intervalToDuration } from 'date-fns';

const Quests = () => {
    const [quests, setQuests] = useState([]);
    const [userQuests, setUserQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState([]);
    const [progressMessage, setProgressMessage] = useState('');

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

    const handleAssignQuest = async (questId) => {
        try {
            await axios.post(`http://localhost:5000/api/quests/${questId}/assign`);
            fetchQuests();
        } catch (error) {
            console.error('Error assigning quest:', error);
        }
    };

    const handleCheckProgress = async (questId) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/quests/${questId}/check-progress`);
            setProgressMessage(response.data.message);
            fetchQuests();
        } catch (error) {
            setProgressMessage('Error checking progress');
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

    // Filtruj dostępne questy, by nie pokazywać tych już przypisanych użytkownikowi
    const userQuestIds = new Set(userQuests.map(q => q._id));
    const availableQuests = quests.filter(q => !userQuestIds.has(q._id));

    // Podziel userQuests na aktywne i ukończone
    const activeUserQuests = userQuests.filter(q => q.status === 'active');
    const completedUserQuests = userQuests.filter(q => q.status === 'completed');

    // Funkcja do wyświetlania odliczania czasu do końca questa
    const getTimeLeft = (expiresAt) => {
        if (!expiresAt) return '-';
        const now = new Date();
        const end = new Date(expiresAt);
        if (end < now) return 'Expired';
        const duration = intervalToDuration({ start: now, end });
        return formatDuration(duration, { format: ['days', 'hours', 'minutes', 'seconds'] });
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
                    {progressMessage && <div className="alert alert-info">{progressMessage}</div>}
                    <Row className="g-4 mb-5">
                        {activeUserQuests.map(quest => (
                            <Col key={quest.quest?._id || quest._id} md={6}>
                                <Card className="h-100">
                                    <Card.Body>
                                        <Card.Title>{quest.quest?.questTitle || quest.questTitle}</Card.Title>
                                        <div className="mb-2"><b>Game:</b> {quest.quest?.requirements?.gameName || quest.requirements?.gameName || '-'}</div>
                                        <div className="mb-2"><b>Required Minutes:</b> {quest.quest?.requirements?.requiredMinutes || quest.requirements?.requiredMinutes || '-'}</div>
                                        <div className="mb-2"><b>Duration:</b> {quest.quest?.duration || quest.duration || '-'}</div>
                                        <div className="mb-2"><b>Expires in:</b> {getTimeLeft(quest.quest?.expiresAt || quest.expiresAt)}</div>
                                        <Button
                                            variant="warning"
                                            onClick={() => handleCheckProgress(quest.quest?._id || quest._id)}
                                        >
                                            Check progress
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    <h3 className="mb-3">Completed Quests</h3>
                    <Row className="g-4 mb-5">
                        {completedUserQuests.map(quest => (
                            <Col key={quest.quest?._id || quest._id} md={6}>
                                <Card className="h-100 bg-success bg-opacity-10">
                                    <Card.Body>
                                        <Card.Title>{quest.quest?.questTitle || quest.questTitle}</Card.Title>
                                        <div className="mb-2"><b>Game:</b> {quest.quest?.requirements?.gameName || quest.requirements?.gameName || '-'}</div>
                                        <div className="mb-2"><b>Required Minutes:</b> {quest.quest?.requirements?.requiredMinutes || quest.requirements?.requiredMinutes || '-'}</div>
                                        <div className="mb-2"><b>Duration:</b> {quest.quest?.duration || quest.duration || '-'}</div>
                                        <div className="mb-2"><b>Completed at:</b> {quest.completedAt ? new Date(quest.completedAt).toLocaleString() : '-'}</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <h3 className="mb-3">Available Quests</h3>
                    <Row className="g-4">
                        {availableQuests.map(quest => (
                            <Col key={quest._id} md={6}>
                                <Card className="h-100">
                                    <Card.Body>
                                        <Card.Title>{quest.questTitle}</Card.Title>
                                        <div className="mb-2"><b>Game:</b> {quest.requirements?.gameName || '-'}</div>
                                        <div className="mb-2"><b>Required Minutes:</b> {quest.requirements?.requiredMinutes || '-'}</div>
                                        <div className="mb-2"><b>Duration:</b> {quest.duration || '-'}</div>
                                        <div className="mb-2"><b>Expires in:</b> {getTimeLeft(quest.expiresAt)}</div>
                                        <Button
                                            variant="primary"
                                            onClick={() => handleAssignQuest(quest._id)}
                                        >
                                            Aktywuj questa
                                        </Button>
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