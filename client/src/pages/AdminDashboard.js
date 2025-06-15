import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [quests, setQuests] = useState([]);
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [newQuest, setNewQuest] = useState({
    gameId: '',
    questTitle: '',
    requiredMinutes: '',
    duration: 'daily'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth');
    if (!isAuthenticated) {
      navigate('/admin');
    }
    fetchQuests();
    fetchGames();
  }, [navigate]);

  const fetchQuests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/quests');
      setQuests(response.data);
    } catch (error) {
      setError('Error fetching quests');
    }
  };

  const fetchGames = async () => {
    try {
      setLoadingGames(true);
      const response = await axios.get('http://localhost:5000/api/games/steam/owned', { withCredentials: true });
      setGames(response.data);
      setLoadingGames(false);
    } catch (error) {
      setError('Error fetching Steam games');
      setLoadingGames(false);
    }
  };

  const handleInputChange = (e) => {
    setNewQuest({
      ...newQuest,
      [e.target.name]: e.target.value
    });
  };

  const handleAddQuest = async (e) => {
    e.preventDefault();
    try {
      const questData = {
        questTitle: newQuest.questTitle,
        requirements: {
          steamAppId: newQuest.gameId,
          gameName: games.find(g => String(g.appId) === String(newQuest.gameId))?.name || '',
          requiredMinutes: Number(newQuest.requiredMinutes)
        },
        duration: newQuest.duration
      };
      console.log('Wysyłany quest:', questData);
      await axios.post('http://localhost:5000/api/quests', questData);
      setSuccess('Quest added successfully');
      setNewQuest({ gameId: '', questTitle: '', requiredMinutes: '', duration: 'daily' });
      fetchQuests();
    } catch (error) {
      setError('Error adding quest');
    }
  };

  const handleDeleteQuest = async (questId) => {
    try {
      await axios.delete(`http://localhost:5000/api/quests/${questId}`);
      setSuccess('Quest deleted successfully');
      fetchQuests();
    } catch (error) {
      setError('Error deleting quest');
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Admin Dashboard - Quest Management</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="mb-4">
        <Card.Header>
          <h4>Add New Quest</h4>
        </Card.Header>
        <Card.Body>
          {loadingGames ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : (
          <Form onSubmit={handleAddQuest}>
            <Form.Group className="mb-3">
              <Form.Label>Game</Form.Label>
              <Form.Select
                name="gameId"
                value={newQuest.gameId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a game</option>
                {games.map((game) => (
                  <option key={game.appId} value={String(game.appId)}>{game.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quest Title</Form.Label>
              <Form.Control
                type="text"
                name="questTitle"
                value={newQuest.questTitle}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Required Minutes</Form.Label>
              <Form.Control
                type="number"
                name="requiredMinutes"
                value={newQuest.requiredMinutes}
                onChange={handleInputChange}
                min="1"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quest Duration</Form.Label>
              <Form.Select
                name="duration"
                value={newQuest.duration}
                onChange={handleInputChange}
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Form.Select>
            </Form.Group>
            <Button variant="primary" type="submit">
              Add Quest
            </Button>
          </Form>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h4>Existing Quests</h4>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Game</th>
                <th>Quest Title</th>
                <th>Required Minutes</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quests.map((quest) => (
                <tr key={quest._id}>
                  <td>{quest.gameId || '-'}</td>
                  <td>{quest.questTitle || '-'}</td>
                  <td>{quest.requirements?.requiredMinutes || '-'}</td>
                  <td>{quest.duration || '-'}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteQuest(quest._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboard; 