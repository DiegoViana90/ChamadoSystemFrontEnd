import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import './styles.css';

const SupportDashboard: React.FC = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [ticketsPerPage] = useState(10);
    const [userName, setUserName] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [canCreateTicket, setCanCreateTicket] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');
    const [userRole, setUserRole] = useState<string>(''); 

    useEffect(() => {
        const fetchUserData = () => {
            const user = JSON.parse(localStorage.getItem('user')!);
            setUserName(user.name);
            setUserRole(user.role); 
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user')!);
                const response = await api.get('/tickets', {
                    params: {
                        userId: user.id,
                        _sort: 'id',
                        _order: 'desc'
                    }
                });
                const reversedTickets = response.data.reverse().map((ticket: any) => ({
                    ...ticket,
                    status: ticket.isClosed ? 'Fechado' : 'Aberto'
                }));
                setTickets(reversedTickets);
            } catch (error) {
                console.error('Erro ao buscar os tickets:', error);
            }
        };

        fetchTickets();
    }, [showAlert]);

    const closeAlert = async () => {
        setShowAlert(false);
        try {
            const user = JSON.parse(localStorage.getItem('user')!);
            const response = await api.get('/tickets', {
                params: {
                    userId: user.id,
                    _sort: 'id',
                    _order: 'desc'
                }
            });
            const reversedTickets = response.data.reverse().map((ticket: any) => ({
                ...ticket,
                status: ticket.isClosed ? 'Fechado' : 'Aberto'
            }));
            setTickets(reversedTickets);
            setCanCreateTicket(true);
        } catch (error) {
            console.error('Erro ao fechar o alerta:', error);
        }
    };

    const indexOfLastTicket = currentPage * ticketsPerPage;
    const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
    const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleStatusChange = async (ticketId: number, newStatus: string) => {
        try {
            const user = JSON.parse(localStorage.getItem('user')!);
            
            const ticketDto = {
                ticketId: ticketId,
                userId: user.id,
                isClosed: newStatus === 'Fechado', 
                description: ''
            };

            const response = await api.put('/tickets', ticketDto);
            const updatedTicketMessage = response.data;

            const fetchResponse = await api.get('/tickets', {
                params: {
                    userId: user.id,
                    _sort: 'id',
                    _order: 'desc'
                }
            });
            const reversedTickets = fetchResponse.data.reverse().map((ticket: any) => ({
                ...ticket,
                status: ticket.isClosed ? 'Fechado' : 'Aberto'
            }));
            setTickets(reversedTickets);

            setAlertMessage(updatedTicketMessage);
            setShowAlert(true);
        } catch (error) {
            console.error('Erro ao atualizar o status do ticket:', error);
        }
    };

    if (userRole !== 'support') {
        return <Navigate to="/login" />;
    }

    return (
        <div className="container">
            <div className="user-dashboard">
                <h2 className="dashboard-title">ÁREA DO SUPORTE - {userName}</h2>

                <h3 className="tickets-title">Chamados</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nº Chamado</th>
                            <th>Nome Usuário</th>
                            <th>Título</th>
                            <th>Descrição</th>
                            <th>Dia da Criação</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTickets.map((ticket: any) => (
                            <tr
                                key={ticket.id}
                                className={ticket.isClosed ? 'closed-ticket' : 'open-ticket'}
                            >
                                <td className="ticket-id-cell">{ticket.id}</td>
                                <td>{ticket.user.name}</td>
                                <td>{ticket.title}</td>
                                <td className="description-cell">
                                    {ticket.description.length > 100
                                        ? (
                                            <>
                                                {`${ticket.description.substring(0, 60)}...`}
                                                <div className="description-tooltip">
                                                    {ticket.description}
                                                </div>
                                            </>
                                        )
                                        : ticket.description
                                    }
                                </td>
                                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <select
                                        value={ticket.isClosed ? 'Fechado' : 'Aberto'}
                                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                    >
                                        <option value="Aberto">Aberto</option>
                                        <option value="Fechado">Fechado</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <ul className="pagination">
                    {Array.from({ length: Math.ceil(tickets.length / ticketsPerPage) }, (_, index) => (
                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                            <button onClick={() => paginate(index + 1)} className="page-link">
                                {index + 1}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {showAlert && (
                <div className="popup">
                    <div className="popup-content">
                        <p>{alertMessage}</p>
                        <button onClick={closeAlert}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportDashboard;
