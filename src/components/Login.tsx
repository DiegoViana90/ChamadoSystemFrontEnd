import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './styles.css';

import logoImage from '../images/logo.jpg';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);

        setTimeout(async () => {
            try {
                const response = await api.post('/auth/login', { email, password });
                console.log(response);
                const { token, user } = response.data;

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                if (user.role === 'user') {
                    navigate('/user-dashboard');
                } else if (user.role === 'support') {
                    navigate('/support-dashboard');
                }
            } catch (error) {
                console.error('Login falhou:', error);
                alert('Login Falhou, Verifique suas credenciais.');
            } finally {
                setLoading(false);
            }
        }, 500); // Adiciona um delay de 0.5 segundos
    };

    return (
        <div className="container">
            <img src={logoImage} alt="Logo" className="login-logo" />
            <div className="card">
                <h2>Login Suporte</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="input"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Senha"
                        required
                        className="input"
                    />
                    <button type="submit" className="button-login" disabled={loading}>
                        {loading ? 'Carregando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
