import React, { useState, useEffect } from 'react';
import api from '../api';
import { Briefcase, Send } from 'lucide-react';

export default function ApplicationsPanel({ user }) {
    const [applications, setApplications] = useState([]);
    const [formData, setFormData] = useState({ organizationName: '', address: '', role: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/applications');
            setApplications(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitApplication = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/applications', formData);
            alert('Application submitted successfully!');
            setFormData({ organizationName: '', address: '', role: '' });
            fetchApplications();
        } catch (err) {
            alert('Failed: ' + err.response?.data?.message);
        }
    };

    const handleUpdateStatus = async (appId, status) => {
        try {
            await api.put(`/api/applications/${appId}/status`, { status });
            fetchApplications();
        } catch (err) {
            alert('Failed: ' + err.response?.data?.message);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div>
            {/* Submit New Application - only for students */}
            {user.role === 'student' && (
                <div className="glass-card" style={{ marginBottom: '30px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Send size={20} /> Apply for Internship
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                        Submit your application to organizations you're interested in joining for your internship.
                    </p>
                    <form onSubmit={handleSubmitApplication} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label className="form-label">Organization Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g., TelOne, Econet Wireless, NetOne"
                                required
                                value={formData.organizationName}
                                onChange={e => setFormData({ ...formData, organizationName: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label className="form-label">Position/Role</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g., Software Engineer"
                                    required
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="form-label">Address</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Street address"
                                    required
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary">Submit Application</button>
                    </form>
                </div>
            )}

            {/* Applications List */}
            <div className="glass-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Briefcase size={20} /> {user.role === 'student' ? 'My Applications' : 'Internship Applications'}
                </h3>

                {applications.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No applications {user.role === 'student' ? 'submitted' : 'found'}.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--primary-color)' }}>Student</th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--primary-color)' }}>Organization</th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--primary-color)' }}>Position</th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--primary-color)' }}>Address</th>
                                    <th style={{ padding: '12px', textAlign: 'center', color: 'var(--primary-color)' }}>Status</th>
                                    {user.role === 'coordinator' && (
                                        <th style={{ padding: '12px', textAlign: 'center', color: 'var(--primary-color)' }}>Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map(app => (
                                    <tr key={app._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '12px', color: '#fff' }}>{app.student?.name}</td>
                                        <td style={{ padding: '12px', color: 'var(--primary-color)', fontWeight: '600' }}>{app.organizationName}</td>
                                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{app.role}</td>
                                        <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{app.address}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                background: app.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' : app.status === 'accepted' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                color: app.status === 'pending' ? 'var(--warning)' : app.status === 'accepted' ? 'var(--success)' : 'var(--danger)'
                                            }}>
                                                {app.status.toUpperCase()}
                                            </span>
                                        </td>
                                        {user.role === 'coordinator' && (
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <select
                                                    value={app.status}
                                                    onChange={e => handleUpdateStatus(app._id, e.target.value)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        background: 'rgba(99, 102, 241, 0.1)',
                                                        border: '1px solid var(--border-light)',
                                                        color: 'var(--primary-color)',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="accepted">Accept</option>
                                                    <option value="rejected">Reject</option>
                                                </select>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
