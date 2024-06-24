import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './styles.css'; 

const  SupportDashboard: React.FC = () => {
    const [tickets, setTickets] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [ticketsPerPage] = useState(10);
    const [userName, setUserName] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [loading, setLoading] = useState(false);
    const [canCreateTicket, setCanCreateTicket] = useState(true);
    const [showEmptyFieldsAlert, setShowEmptyFieldsAlert] = useState(false);

    useEffect(() => {
        const fetchUserData = () => {
            const user = JSON.parse(localStorage.getItem('user')!);
            setUserName(user.name);
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchTickets = async () => {
            const user = JSON.parse(localStorage.getItem('user')!);
            const response = await api.get(`/tickets`, {
                params: {
                    userId: user.id,
                    _sort: 'id',
                    _order: 'desc'
                }
            });
            setTickets(response.data.reverse()); 
        };

        fetchTickets();
    }, [tickets.length]);

    const closeAlert = async () => {
        setShowAlert(false);

        const user = JSON.parse(localStorage.getItem('user')!);
        const response = await api.get(`/tickets`, {
            params: {
                userId: user.id,
                _sort: 'id',
                _order: 'desc'
            }
        });
        setTickets(response.data.reverse());
        setCanCreateTicket(true);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length <= 30) {
            setTitle(e.target.value);
        }
    };

    const indexOfLastTicket = currentPage * ticketsPerPage;
    const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
    const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div className="container">
            <div className="user-dashboard">
                <h2 className="dashboard-title">AREA DO SUPORTE - {userName}</h2>

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
                                <td>{ticket.isClosed ? 'Fechado' : 'Aberto'}</td>
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
                        <p>Chamado criado com sucesso!</p>
                        <button onClick={closeAlert}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportDashboard;
