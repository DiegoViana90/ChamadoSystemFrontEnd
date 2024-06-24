import React, { useEffect, useState } from 'react';
import api from '../services/api';

const SupportDashboard: React.FC = () => {
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        const fetchTickets = async () => {
            const user = JSON.parse(localStorage.getItem('user')!);
            const response = await api.get(`/tickets?userId=${user.id}`);
            setTickets(response.data);
        };


        fetchTickets();
    }, []);

    const handleUpdateTicket = async (ticketId: number, isClosed: boolean) => {
        const user = JSON.parse(localStorage.getItem('user')!);
        await api.put(`/tickets/${ticketId}`, { isClosed, userId: user.id });
        const response = await api.get('/tickets');
        setTickets(response.data);
    };

    return (
        <div>
            <h1>Support Dashboard</h1>
            <ul>
                {tickets.map((ticket: any) => (
                    <li key={ticket.id}>
                        {ticket.title}: {ticket.description} - {ticket.status}
                        <button onClick={() => handleUpdateTicket(ticket.id, !ticket.isClosed)}>
                            {ticket.isClosed ? 'Reopen' : 'Close'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SupportDashboard;
