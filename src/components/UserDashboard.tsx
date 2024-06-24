import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './styles.css'; 

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
        const response = await api.get(`/tickets?userId=${user.id}`);
        setTickets(response.data);
    };

    return (
        <div className="container">
            <div className="user-dashboard">
                <h1>User Dashboard</h1>
                <div className="input-container">
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Title" 
                        className="input-title" 
                    />
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Description" 
                        className="textarea-description" 
                    />
                </div>
                <button 
                    onClick={handleCreateTicket} 
                    className="button-create-ticket"
                >
                    Create Ticket
                </button>

                <h2>Your Tickets</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Titulo</th>
                            <th>Descrição</th>
                            <th>Dia da Criação</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket: any) => (
                            <tr key={ticket.id}>
                                <td>{ticket.title}</td>
                                <td>{ticket.description}</td>
                                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                <td>{ticket.isClosed}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserDashboard;
