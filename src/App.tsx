import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import SupportDashboard from './components/SupportDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/user-dashboard" element={<ProtectedRoute element={UserDashboard} />} />
                <Route path="/support-dashboard" element={<ProtectedRoute element={SupportDashboard} />} />
                <Route path="*" element={<Login />} />
            </Routes>
        </Router>
    );
};

export default App;
