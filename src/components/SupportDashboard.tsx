import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './styles.css';

enum Status {
    Open = 0,
    Closed = 1,
    Analysis = 2,
    AwaitingAuthorization = 3,
    awaitingOrder = 4,
    notAuthorized = 5
}

const SupportDashboard: React.FC = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [ticketsPerPage] = useState(10);
    const [userName, setUserName] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [canCreateTicket, setCanCreateTicket] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');
    const [counter, setCounter] = useState(60);

    useEffect(() => {
        const fetchUserData = () => {
            const user = JSON.parse(localStorage.getItem('user')!);
            setUserName(user.name);
        };

        fetchUserData();
    }, []);

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
            const updatedTickets = response.data.map((ticket: any) => ({
                ...ticket,
                status: ticket.status // Assuming the backend returns the status field mapped correctly
            }));
            const sortedTickets = sortTickets(updatedTickets);
            setTickets(sortedTickets);
        } catch (error) {
            console.error('Erro ao buscar os tickets:', error);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [showAlert]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCounter((prevCounter) => {
                if (prevCounter === 1) {
                    fetchTickets();
                    return 60;
                }
                return prevCounter - 1;
            });
        }, 1000); // 1000 ms = 1 segundo

        return () => clearInterval(interval);
    }, []);

    const sortTickets = (tickets: any[]) => {
        const openTickets = tickets.filter(ticket => ticket.status === Status.Open);
        const closedTickets = tickets.filter(ticket => ticket.status === Status.Closed);
        const analysisTickets = tickets.filter(ticket => ticket.status === Status.Analysis);
        const awaitingAuthorizationTickets = tickets.filter(ticket => ticket.status === Status.AwaitingAuthorization);
        const awaitingOrderTickets = tickets.filter(ticket => ticket.status === Status.awaitingOrder);
        const notAuthorizedTickets = tickets.filter(ticket => ticket.status === Status.notAuthorized);
        
        return [
            ...openTickets,
            ...closedTickets,
            ...analysisTickets,
            ...awaitingAuthorizationTickets,
            ...awaitingOrderTickets,
            ...notAuthorizedTickets
        ];
    };

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
            const updatedTickets = response.data.map((ticket: any) => ({
                ...ticket,
                status: ticket.status // Assuming the backend returns the status field mapped correctly
            }));
            const sortedTickets = sortTickets(updatedTickets);
            setTickets(sortedTickets);
            setCanCreateTicket(true);
        } catch (error) {
            console.error('Erro ao fechar o alerta:', error);
        }
    };

    const indexOfLastTicket = currentPage * ticketsPerPage;
    const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
    const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleStatusChange = async (ticketId: number, newStatus: Status, description: string) => {
        try {
            const user = JSON.parse(localStorage.getItem('user')!);
            const ticket = tickets.find(t => t.id === ticketId);
            
            if (!ticket) {
                console.error(`Ticket ${ticketId} não encontrado.`);
                return;
            }
            
            const ticketDto = {
                ticketId: ticketId,
                userId: ticket.userId,
                status: newStatus, 
                description: description
            };
    
            const response = await api.put(`/tickets/`, ticketDto);
            const updatedTicketMessage = response.data;
    
            const fetchResponse = await api.get('/tickets', {
                params: {
                    userId: user.id,
                    _sort: 'id',
                    _order: 'desc'
                }
            });

            const updatedTickets = fetchResponse.data.map((ticket: any) => ({
                ...ticket,
                status: ticket.status // Assuming the backend returns the status field mapped correctly
            }));
            const sortedTickets = sortTickets(updatedTickets);
            setTickets(sortedTickets);
    
            setAlertMessage(updatedTicketMessage);
            setShowAlert(true);
        } catch (error) {
            console.error('Erro ao atualizar o status do ticket:', error);
        }
    };

    return (
        <div className="container">
            <div className="user-dashboard">
                <div className="counter">Atualizando em: {counter}s</div>
                <h2 className="dashboard-title">ÁREA DO SUPORTE - {userName}</h2>

                <h3 className="tickets-title">Chamados</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nº Chamado</th>
                            <th>Nome Usuário</th>
                            <th>Título</th>
                            <th>Descrição</th>
                            <th>Data de Criação</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTickets.map((ticket: any) => (
                            <tr
                                key={ticket.id}
                                className={getStatusClassName(ticket.status)}
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
                                        value={ticket.status}
                                        onChange={(e) => handleStatusChange(ticket.id, Number(e.target.value), ticket.description)}
                                    >
                                        <option value={Status.Open}>Aberto</option>
                                        <option value={Status.Closed}>Fechado</option>
                                        <option value={Status.Analysis}>Análise</option>
                                        <option value={Status.AwaitingAuthorization}>Aguardando Autorização</option>
                                        <option value={Status.awaitingOrder}>Aguardando Pedido</option>
                                        <option value={Status.notAuthorized}>Não Autorizado</option>
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

const getStatusClassName = (status: Status) => {
    switch (status) {
        case Status.Open:
            return 'open-ticket';
        case Status.Closed:
            return 'closed-ticket';
        case Status.Analysis:
            return 'analysis-ticket';
        case Status.AwaitingAuthorization:
            return 'awaiting-authorization-ticket';
        case Status.awaitingOrder:
            return 'awaiting-order-ticket';
        case Status.notAuthorized:
            return 'not-authorized-ticket';
        default:
            return '';
    }
};

export default SupportDashboard;

