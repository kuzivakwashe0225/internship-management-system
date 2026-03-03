import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home, FileText, Briefcase } from 'lucide-react';

// Import our new advanced Role components
import StudentDashboard from '../components/StudentDashboard';
import IndustryDashboard from '../components/IndustryDashboard';
import UniversitySupervisorDashboard from '../components/UniversitySupervisorDashboard';
import CoordinatorDashboard from '../components/CoordinatorDashboard';
import Records from '../components/Records';

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        const userData = localStorage.getItem('intrahub_user');
        if (!userData) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(userData));
        setLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('intrahub_user');
        navigate('/login');
    };

    if (loading || !user) return <div style={{ padding: '40px', color: '#fff' }}>Loading...</div>;

    const renderDashboardContent = () => {
        switch (user.role) {
            case 'student':
                return <StudentDashboard user={user} token={user.token} />;
            case 'supervisor': // Industry Supervisor
                return <IndustryDashboard user={user} token={user.token} />;
            case 'university_supervisor':
                return <UniversitySupervisorDashboard user={user} token={user.token} />;
            case 'coordinator':
                return <CoordinatorDashboard user={user} token={user.token} />;
            default:
                return <p>Undefined Role</p>;
        }
    };

    return (
        <div className="dashboard-layout animate-fade-in">
            {/* Sidebar remains standard for all */}
            <div className="sidebar">
                <div className="sidebar-logo">
                    <Briefcase size={28} /> IntraHub
                </div>
                <button
                    className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <Home size={20} /> Dashboard
                </button>
                <button
                    className={`nav-item ${activeTab === 'records' ? 'active' : ''}`}
                    onClick={() => setActiveTab('records')}
                >
                    <FileText size={20} /> Records
                </button>
                <div style={{ flex: 1 }}></div>
                <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}><LogOut size={20} /> Sign Out</button>
            </div>

            <div className="main-content">
                <div className="header">
                    <h1 className="page-title">Welcome back, {user.name}</h1>
                    <div className="user-profile glass-card" style={{ padding: '8px 16px', borderRadius: '24px' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 600, textTransform: 'uppercase' }}>
                            {user.role.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                {/* Inject Advanced Component */}
                {activeTab === 'dashboard' ? renderDashboardContent() : <Records user={user} />}
            </div>
        </div>
    );
}
