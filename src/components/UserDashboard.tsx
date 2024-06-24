import React, { useEffect, useState } from 'react';
import api from '../services/api';

const UserDashboard: React.FC = () => {
    const [tickets, setTickets] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const fetchTickets = async () => {
            const user = JSON.parse(localStorage.getItem('user')!);
            const response = await api.get(`/tickets?userId=${user.id}`);
            setTickets(response.data);
        };

        fetchTickets();
    }, []);

    const handleCreateTicket = async () => {
        const user = JSON.parse(localStorage.getItem('user')!);
        await api.post('/tickets', { title, description, userId: user.id });
        setTitle('');
        setDescription('');
        // Refresh ticket list
        const response = await api.get(`/tickets?userId=${user.id}`);
        setTickets(response.data);
    };

    return (
        <div>
            <h1>User Dashboard</h1>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description"></textarea>
            <button onClick={handleCreateTicket}>Create Ticket</button>

            <h2>Your Tickets</h2>
            <ul>
                {tickets.map((ticket: any) => (
                    <li key={ticket.id}>{ticket.title}: {ticket.description}</li>
                ))}
            </ul>
        </div>
    );
};

export default UserDashboard;
