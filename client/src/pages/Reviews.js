import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import axios from 'axios';
import { FaStar, FaThumbsUp, FaComment } from 'react-icons/fa';

const Reviews = () => {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({
        rating: 5,
        content: ''
    });

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
            const response = await axios.get(`http://localhost:5000/api/reviews/game/${gameId}`);
            setReviews(response.data);
            setSelectedGame(gameId);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/reviews', {
                game: selectedGame,
                ...newReview
            });
            handleGameSelect(selectedGame);
            setNewReview({ rating: 5, content: '' });
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    const handleLikeReview = async (reviewId) => {
        try {
            await axios.post(`http://localhost:5000/api/reviews/${reviewId}/like`);
            handleGameSelect(selectedGame);
        } catch (error) {
            console.error('Error liking review:', error);
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
            <h1 className="mb-4">Game Reviews</h1>

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
                <>
                    <Card className="mb-4">
                        <Card.Body>
                            <h3>Write a Review</h3>
                            <Form onSubmit={handleSubmitReview}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Rating</Form.Label>
                                    <div>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                className="me-1"
                                                style={{
                                                    color: star <= newReview.rating ? '#ffc107' : '#e4e5e9',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                            />
                                        ))}
                                    </div>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Review</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={newReview.content}
                                        onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Button type="submit" variant="primary">
                                    Submit Review
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>

                    <Row className="g-4">
                        {reviews.map((review) => (
                            <Col key={review._id} md={6}>
                                <Card className="h-100">
                                    <Card.Body>
                                        <div className="d-flex align-items-center mb-3">
                                            <img
                                                src={review.user.avatar}
                                                alt={review.user.username}
                                                className="rounded-circle me-3"
                                                style={{ width: '48px', height: '48px' }}
                                            />
                                            <div>
                                                <Card.Title>{review.user.username}</Card.Title>
                                                <div>
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar
                                                            key={i}
                                                            className="me-1"
                                                            style={{
                                                                color: i < review.rating ? '#ffc107' : '#e4e5e9'
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <Card.Text>{review.content}</Card.Text>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleLikeReview(review._id)}
                                                >
                                                    <FaThumbsUp className="me-1" />
                                                    {review.likes.length}
                                                </Button>
                                                <Button variant="outline-secondary" size="sm">
                                                    <FaComment className="me-1" />
                                                    {review.comments.length}
                                                </Button>
                                            </div>
                                            <small className="text-muted">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </small>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            {!selectedGame && (
                <Row className="text-center mt-5">
                    <Col>
                        <h3>Select a game to view reviews</h3>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default Reviews; 