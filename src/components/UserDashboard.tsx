import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './styles.css';

enum Status {
    Open = 0,
    Closed = 1,
    Analysis = 2,
    AwaitingAuthorization = 3,
    AwaitingOrder = 4,
    NotAuthorized = 5
}

const UserDashboard: React.FC = () => {
    const [tickets, setTickets] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [ticketsPerPage] = useState(5);
    const [userName, setUserName] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [loading, setLoading] = useState(false);
    const [canCreateTicket, setCanCreateTicket] = useState(true);
    const [showEmptyFieldsAlert, setShowEmptyFieldsAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [canRefreshTickets, setCanRefreshTickets] = useState(true); // Novo estado para controlar o botão de atualizar

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

    const handleCreateTicket = async () => {
        const user = JSON.parse(localStorage.getItem('user')!);

        if (title.trim() === '' || description.trim() === '') {
            setShowEmptyFieldsAlert(true);
            return;
        }

        setLoading(true);
        setShowEmptyFieldsAlert(false);

        setTimeout(async () => {
            try {
                const response = await api.post('/tickets', { title, description, userId: user.id });
                console.log(response);
                setTitle('');
                setDescription('');
                setAlertMessage('Chamado criado com sucesso!');
                setShowAlert(true);
                setCanCreateTicket(false);
            } catch (error) {
                console.error('Erro ao criar chamado:', error);
                alert('Erro ao criar chamado. Verifique os campos e tente novamente.');
            } finally {
                setLoading(false);
            }
        }, 500); // Adiciona um delay de 0.5 segundos
    };

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
        setCanRefreshTickets(true); // Reativa o botão de atualizar
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length <= 30) {
            setTitle(e.target.value);
        }
    };

    const handleRefreshTickets = async () => {
        const user = JSON.parse(localStorage.getItem('user')!);
        setCanRefreshTickets(false); // Desativa o botão de atualizar
        try {
            const response = await api.get(`/tickets`, {
                params: {
                    userId: user.id,
                    _sort: 'id',
                    _order: 'desc'
                }
            });
            setTickets(response.data.reverse());
            setAlertMessage('Chamados atualizados com sucesso!');
            setShowAlert(true);
        } catch (error) {
            console.error('Erro ao atualizar chamados:', error);
            alert('Erro ao atualizar chamados. Tente novamente.');
            setCanRefreshTickets(true); // Reativa o botão de atualizar em caso de erro
        }
    };

    const indexOfLastTicket = currentPage * ticketsPerPage;
    const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
    const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const getStatusClassName = (status: number) => {
        switch (status) {
            case Status.Closed:
                return 'closed-ticket';
            case Status.Analysis:
                return 'analysis-ticket';
            case Status.AwaitingAuthorization:
                return 'awaiting-authorization-ticket';
            case Status.AwaitingOrder:
                return 'awaiting-order-ticket';
            case Status.NotAuthorized:
                return 'not-authorized-ticket';
            default:
                return 'open-ticket';
        }
    };

    const getStatusText = (status: number) => {
        switch (status) {
            case Status.Closed:
                return 'Fechado';
            case Status.Analysis:
                return 'Análise';
            case Status.AwaitingAuthorization:
                return 'Aguardando Autorização';
            case Status.AwaitingOrder:
                return 'Aguardando Pedido';
            case Status.NotAuthorized:
                return 'Não Autorizado';
            default:
                return 'Aberto';
        }
    };

    return (
        <div className="container">
            <div className="user-dashboard">
                <h2 className="dashboard-title">Chamados de {userName}</h2>
                <div className="input-container">
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Título do Chamado (máx. 30 caracteres)."
                        className="input-title"
                        disabled={!canCreateTicket}
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descrição do chamado."
                        className="textarea-description"
                        disabled={!canCreateTicket}
                    />
                </div>
                <button
                    onClick={handleCreateTicket}
                    className="button-create-ticket"
                    disabled={!canCreateTicket || loading}
                >
                    {loading ? 'Criando...' : 'Criar NOVO Chamado'}
                </button>

                {showEmptyFieldsAlert && (
                    <p className="empty-fields-alert">Por favor, preencha os campos de título e descrição.</p>
                )}

                <h3 className="tickets-title">Seus Chamados</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nº Chamado</th>
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
                                className={getStatusClassName(ticket.status)}
                            >
                                <td className="ticket-id-cell">{ticket.id}</td>
                                <td>{ticket.title}</td>
                                <td className="description-cell">
                                    {ticket.description.length > 100
                                        ? (
                                            <>
                                                {`${ticket.description.substring(0, 80)}...`}
                                                <div className="description-tooltip">
                                                    {ticket.description}
                                                </div>
                                            </>
                                        )
                                        : ticket.description
                                    }
                                </td>
                                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                <td>{getStatusText(ticket.status)}</td>
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

                <div className="update-button-container">
                    <button
                        onClick={handleRefreshTickets}
                        className="button-refresh"
                        disabled={!canRefreshTickets} // Desabilita o botão enquanto a mensagem de sucesso estiver visível
                    >
                        Atualizar Chamados
                    </button>
                </div>
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

export default UserDashboard;
