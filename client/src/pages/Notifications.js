import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import axios from 'axios';
import { FaTrophy, FaGamepad, FaBell, FaTag } from 'react-icons/fa';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/users/me');
            setNotifications(response.data.notifications);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await axios.put(`http://localhost:5000/api/users/notifications/${notificationId}/read`);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.put('http://localhost:5000/api/users/notifications/read-all');
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'achievement':
                return <FaTrophy className="text-warning" />;
            case 'promotion':
                return <FaTag className="text-success" />;
            case 'quest':
                return <FaGamepad className="text-primary" />;
            default:
                return <FaBell className="text-secondary" />;
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Notifications</h1>
                {notifications.length > 0 && (
                    <Button
                        variant="outline-primary"
                        onClick={handleMarkAllAsRead}
                    >
                        Mark All as Read
                    </Button>
                )}
            </div>

            {notifications.length > 0 ? (
                <Row className="g-4">
                    {notifications.map((notification) => (
                        <Col key={notification._id} md={6} lg={4}>
                            <Card className={`h-100 ${!notification.read ? 'border-primary' : ''}`}>
                                <Card.Body>
                                    <div className="d-flex align-items-start mb-3">
                                        <div className="me-3">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <Card.Title className="mb-1">
                                                    {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                                </Card.Title>
                                                {!notification.read && (
                                                    <Badge bg="primary">New</Badge>
                                                )}
                                            </div>
                                            <Card.Text>{notification.message}</Card.Text>
                                            <small className="text-muted">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </small>
                                        </div>
                                    </div>
                                    {!notification.read && (
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleMarkAsRead(notification._id)}
                                        >
                                            Mark as Read
                                        </Button>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Card className="text-center p-5">
                    <Card.Body>
                        <FaBell size={48} className="text-muted mb-3" />
                        <h3>No Notifications</h3>
                        <p className="text-muted">
                            You don't have any notifications at the moment.
                        </p>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default Notifications; 