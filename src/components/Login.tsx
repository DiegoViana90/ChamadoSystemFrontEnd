import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './styles.css'; // Import your CSS file

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

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
            console.error('Login failed:', error);
            alert('Login failed, please check your credentials');
        }
    };

    return (
        <div className="container">
            <div className="card">
                <h2>Login</h2>
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
                        placeholder="Password"
                        required
                        className="input"
                    />
                    <button type="submit" className="button-login">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
