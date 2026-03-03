import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { UserPlus } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', studentId: '', department: '', company: '' });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/auth/register', formData);
            setSuccessMsg(res.data.message || 'Registration successful. Please check your email to verify your account.');
            setFormData({ name: '', email: '', password: '', role: 'student', studentId: '', department: '', company: '' });
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
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{successMsg}</p>
                        <button type="button" onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%' }}>Proceed to Login</button>
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
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" className="input-field" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
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
                                <input type="text" className="input-field" required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
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
