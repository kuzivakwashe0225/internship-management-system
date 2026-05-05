import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { UserPlus } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', studentId: '', department: '', company: '' });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await api.get('/api/departments');
                setDepartments(res.data);
            } catch (err) {
                console.error('Failed to fetch departments:', err);
            }
        };
        fetchDepartments();
    }, []);

    const handleNameChange = async (value) => {
        setFormData({ ...formData, name: value });

        if (value.length < 1) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            const res = await api.get(`/api/auth/suggest-users?query=${value}`);
            setSuggestions(res.data);
            setShowSuggestions(true);
        } catch (err) {
            console.error('Failed to fetch suggestions:', err);
        }
    };

    const handleSelectSuggestion = (suggestion) => {
        setFormData({
            ...formData,
            name: suggestion.name,
            email: suggestion.email
        });
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        try {
            const res = await api.post('/api/auth/register', formData);
            setSuccessMsg(res.data.message || 'Registration successful');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-container animate-fade-in" style={{ padding: '40px 20px' }}>
            <div className="auth-card glass-card">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join the IntraHub platform</p>

                {successMsg ? (
                    <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', borderRadius: '8px' }}>
                        <h3 style={{ color: 'var(--success)', marginBottom: '12px' }}>Success!</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>{successMsg}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Redirecting to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select className="input-field" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                <option value="student">Student</option>
                                <option value="supervisor">Industry Supervisor</option>
                                <option value="university_supervisor">University Supervisor</option>
                                <option value="coordinator">University Coordinator</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ position: 'relative' }}>
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="input-field"
                                required
                                value={formData.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="Start typing your name..."
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    background: 'rgba(30, 30, 50, 0.95)',
                                    border: '1px solid var(--border-light)',
                                    borderTop: 'none',
                                    borderRadius: '0 0 8px 8px',
                                    zIndex: 10,
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }}>
                                    {suggestions.map((suggestion) => (
                                        <button
                                            key={suggestion._id}
                                            type="button"
                                            onClick={() => handleSelectSuggestion(suggestion)}
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                padding: '10px 12px',
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#fff',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.2)'}
                                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                        >
                                            <div style={{ fontSize: '0.9rem' }}>{suggestion.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{suggestion.email}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input type="email" className="input-field" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input type="password" className="input-field" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                        </div>

                        {formData.role === 'student' && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Student ID</label>
                                    <input type="text" className="input-field" required value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} />
                                </div>
                            </>
                        )}

                        {(formData.role === 'student' || formData.role === 'coordinator' || formData.role === 'university_supervisor') && (
                            <div className="form-group">
                                <label className="form-label">Department / Faculty</label>
                                <select className="input-field" required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                                    <option value="">-- Select a Department --</option>
                                    {departments.map(d => (
                                        <option key={d._id} value={d.name}>{d.code} - {d.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {formData.role === 'supervisor' && (
                            <div className="form-group">
                                <label className="form-label">Company / Organization Name</label>
                                <input type="text" className="input-field" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                            </div>
                        )}

                        {error && <p className="error-text">{error}</p>}
                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                            <UserPlus size={20} /> Register Account
                        </button>
                    </form>
                )}

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}
