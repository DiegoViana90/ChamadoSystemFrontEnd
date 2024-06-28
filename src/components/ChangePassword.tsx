import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './styles.css';

const ChangePassword: React.FC = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.isFirstAccess) {
            navigate('/'); // redireciona para a página inicial ou qualquer outra página
        }
    }, [navigate]);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }

        try {
            setLoading(true);

            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await api.put('/users/update-password', {
                userId: user.id,
                newPassword,
            });

            if (response.status === 200) {
                alert('Senha alterada com sucesso!');
                navigate(user.role === 'user' ? '/user-dashboard' : '/support-dashboard');
            }
        } catch (error) {
            console.error('Alteração de senha falhou:', error);
            alert('Alteração de senha falhou, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="card">
                <h2>Alterar Senha</h2>
                <form onSubmit={handleChangePassword}>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nova Senha"
                        required
                        className="input"
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar Nova Senha"
                        required
                        className="input"
                    />
                    <button type="submit" className="button-login" disabled={loading}>
                        {loading ? 'Carregando...' : 'Alterar Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
