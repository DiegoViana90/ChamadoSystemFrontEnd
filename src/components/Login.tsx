import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { login } from '../services/auth';
import './styles.css'; // Importa o arquivo de estilos aqui

import logoImage from '../images/logo.jpg';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            const response = await api.post('/auth/login', { email, password });
            console.log(response);
            const { token, user } = response.data;

            login(token, user);

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
    };

    return (
        <div className="container-login">
            <div className="logo-container">
                <img src={logoImage} alt="Logo" className="login-logo" />
            </div>
            <div className="card-login">
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
