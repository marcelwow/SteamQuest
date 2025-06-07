import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

const GameLists = () => {
    const [lists, setLists] = useState([]);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewListModal, setShowNewListModal] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [selectedList, setSelectedList] = useState(null);
    const [showAddGameModal, setShowAddGameModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        fetchLists();
        fetchGames();
    }, []);

    const fetchLists = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/users/me');
            setLists(response.data.gameLists);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching lists:', error);
            setLoading(false);
        }
    };

    const fetchGames = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/games');
            setGames(response.data);
        } catch (error) {
            console.error('Error fetching games:', error);
        }
    };

    const handleCreateList = async () => {
        try {
            await axios.post('http://localhost:5000/api/users/lists', {
                name: newListName
            });
            setShowNewListModal(false);
            setNewListName('');
            fetchLists();
        } catch (error) {
            console.error('Error creating list:', error);
        }
    };

    const handleDeleteList = async (listId) => {
        try {
            await axios.delete(`http://localhost:5000/api/users/lists/${listId}`);
            fetchLists();
        } catch (error) {
            console.error('Error deleting list:', error);
        }
    };

    const handleAddGame = async (gameId) => {
        try {
            await axios.post(`http://localhost:5000/api/users/lists/${selectedList._id}/games`, {
                gameId
            });
            setShowAddGameModal(false);
            fetchLists();
        } catch (error) {
            console.error('Error adding game:', error);
        }
    };

    const handleRemoveGame = async (listId, gameId) => {
        try {
            await axios.delete(`http://localhost:5000/api/users/lists/${listId}/games/${gameId}`);
            fetchLists();
        } catch (error) {
            console.error('Error removing game:', error);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length > 2) {
            try {
                const response = await axios.get(`http://localhost:5000/api/games/search/${query}`);
                setSearchResults(response.data);
            } catch (error) {
                console.error('Error searching games:', error);
            }
        } else {
            setSearchResults([]);
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
                <h1>My Game Lists</h1>
                <Button
                    variant="primary"
                    onClick={() => setShowNewListModal(true)}
                >
                    <FaPlus className="me-2" />
                    Create New List
                </Button>
            </div>

            <Row className="g-4">
                {lists.map((list) => (
                    <Col key={list._id} md={6} lg={4}>
                        <Card className="h-100">
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">{list.name}</h3>
                                <div>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => {
                                            setSelectedList(list);
                                            setShowAddGameModal(true);
                                        }}
                                    >
                                        <FaPlus />
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDeleteList(list._id)}
                                    >
                                        <FaTrash />
                                    </Button>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                {list.games.length > 0 ? (
                                    <Row className="g-3">
                                        {list.games.map((game) => (
                                            <Col key={game._id} xs={6}>
                                                <Card>
                                                    <Card.Img
                                                        variant="top"
                                                        src={game.imageUrl}
                                                        alt={game.name}
                                                    />
                                                    <Card.Body className="p-2">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <small className="text-truncate">
                                                                {game.name}
                                                            </small>
                                                            <Button
                                                                variant="link"
                                                                className="p-0 text-danger"
                                                                onClick={() => handleRemoveGame(list._id, game._id)}
                                                            >
                                                                <FaTrash size={12} />
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                ) : (
                                    <p className="text-center text-muted">
                                        No games in this list
                                    </p>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* New List Modal */}
            <Modal show={showNewListModal} onHide={() => setShowNewListModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New List</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>List Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                placeholder="Enter list name"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowNewListModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleCreateList}>
                        Create List
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add Game Modal */}
            <Modal show={showAddGameModal} onHide={() => setShowAddGameModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Games to {selectedList?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Search games..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </Form.Group>
                    <div className="game-search-results">
                        {searchResults.map((game) => (
                            <div
                                key={game._id}
                                className="d-flex align-items-center p-2 border-bottom"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleAddGame(game._id)}
                            >
                                <img
                                    src={game.imageUrl}
                                    alt={game.name}
                                    style={{ width: '48px', height: '48px', marginRight: '10px' }}
                                />
                                <div>
                                    <h6 className="mb-0">{game.name}</h6>
                                    <small className="text-muted">
                                        {game.currentPrice ? `$${game.currentPrice}` : 'Free'}
                                    </small>
                                </div>
                            </div>
                        ))}
                    </div>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default GameLists; 