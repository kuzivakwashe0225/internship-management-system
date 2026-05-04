import React, { useState, useEffect } from 'react';
import api from '../api';
import { Settings, Plus, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
    const [tab, setTab] = useState('courses');
    const [courses, setCourses] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [courseForm, setCourseForm] = useState({ code: '', name: '', department: '' });
    const [orgForm, setOrgForm] = useState({ name: '', address: '', contactPerson: '', email: '', industry: '' });
    const [userForm, setUserForm] = useState({ name: '', email: '', role: 'university_supervisor', department: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const resCourses = await api.get('/api/courses');
            setCourses(resCourses.data);
            const resOrgs = await api.get('/api/organizations');
            setOrganizations(resOrgs.data);
            const resPendingUsers = await api.get('/api/pending-users');
            setPendingUsers(resPendingUsers.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/courses', courseForm);
            alert('Course added successfully!');
            setCourseForm({ code: '', name: '', department: '' });
            fetchData();
        } catch (err) {
            alert('Failed: ' + err.response?.data?.message);
        }
    };

    const handleDeleteCourse = async (id) => {
        if (window.confirm('Delete this course?')) {
            try {
                await api.delete(`/api/courses/${id}`);
                fetchData();
            } catch (err) {
                alert('Failed: ' + err.response?.data?.message);
            }
        }
    };

    const handleAddOrg = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/organizations', orgForm);
            alert('Organization added successfully!');
            setOrgForm({ name: '', address: '', contactPerson: '', email: '', industry: '' });
            fetchData();
        } catch (err) {
            alert('Failed: ' + err.response?.data?.message);
        }
    };

    const handleDeleteOrg = async (id) => {
        if (window.confirm('Delete this organization?')) {
            try {
                await api.delete(`/api/organizations/${id}`);
                fetchData();
            } catch (err) {
                alert('Failed: ' + err.response?.data?.message);
            }
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/pending-users', {
                name: userForm.name,
                email: userForm.email,
                role: userForm.role,
                department: userForm.department
            });
            alert('User invitation sent successfully!');
            setUserForm({ name: '', email: '', role: 'university_supervisor', department: '' });
            fetchData();
        } catch (err) {
            alert('Failed: ' + err.response?.data?.message);
        }
    };

    const handleDeletePendingUser = async (id) => {
        if (window.confirm('Delete this pending user invitation?')) {
            try {
                await api.delete(`/api/pending-users/${id}`);
                fetchData();
            } catch (err) {
                alert('Failed: ' + err.response?.data?.message);
            }
        }
    };

    return (
        <div>
            <div className="glass-card" style={{ marginBottom: '30px', display: 'flex', gap: '8px', borderBottom: '2px solid var(--border-light)' }}>
                {['courses', 'organizations', 'users'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            padding: '12px 16px',
                            background: tab === t ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                            border: 'none',
                            color: tab === t ? 'var(--primary-color)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: tab === t ? '600' : '400',
                            borderBottom: tab === t ? '2px solid var(--primary-color)' : 'none',
                            marginBottom: '-2px'
                        }}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {/* Courses Tab */}
            {tab === 'courses' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div className="glass-card">
                        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={20} /> Add Course
                        </h3>
                        <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input type="text" className="input-field" placeholder="Course Code" required value={courseForm.code} onChange={e => setCourseForm({ ...courseForm, code: e.target.value })} />
                            <input type="text" className="input-field" placeholder="Course Name" required value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} />
                            <input type="text" className="input-field" placeholder="Department" required value={courseForm.department} onChange={e => setCourseForm({ ...courseForm, department: e.target.value })} />
                            <button type="submit" className="btn-primary">Add Course</button>
                        </form>
                    </div>

                    <div className="glass-card">
                        <h3 style={{ marginBottom: '16px' }}>Courses List</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {courses.map(c => (
                                <div key={c._id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>{c.code}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.name}</span>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{c.department}</p>
                                    </div>
                                    <button onClick={() => handleDeleteCourse(c._id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Organizations Tab */}
            {tab === 'organizations' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div className="glass-card">
                        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={20} /> Add Organization
                        </h3>
                        <form onSubmit={handleAddOrg} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input type="text" className="input-field" placeholder="Organization Name" required value={orgForm.name} onChange={e => setOrgForm({ ...orgForm, name: e.target.value })} />
                            <input type="text" className="input-field" placeholder="Address" required value={orgForm.address} onChange={e => setOrgForm({ ...orgForm, address: e.target.value })} />
                            <input type="text" className="input-field" placeholder="Contact Person" required value={orgForm.contactPerson} onChange={e => setOrgForm({ ...orgForm, contactPerson: e.target.value })} />
                            <input type="email" className="input-field" placeholder="Email" required value={orgForm.email} onChange={e => setOrgForm({ ...orgForm, email: e.target.value })} />
                            <input type="text" className="input-field" placeholder="Industry" required value={orgForm.industry} onChange={e => setOrgForm({ ...orgForm, industry: e.target.value })} />
                            <button type="submit" className="btn-primary">Add Organization</button>
                        </form>
                    </div>

                    <div className="glass-card">
                        <h3 style={{ marginBottom: '16px' }}>Organizations List</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {organizations.map(o => (
                                <div key={o._id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>{o.name}</strong>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{o.industry} • {o.address}</p>
                                    </div>
                                    <button onClick={() => handleDeleteOrg(o._id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Users Tab */}
            {tab === 'users' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div className="glass-card">
                        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={20} /> Invite New User
                        </h3>
                        <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label className="form-label">Full Name</label>
                                <input type="text" className="input-field" placeholder="John Doe" required value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="form-label">Email</label>
                                <input type="email" className="input-field" placeholder="john@hit.ac.zw" required value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="form-label">Role</label>
                                <select className="input-field" required value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                                    <option value="student">Student</option>
                                    <option value="coordinator">Coordinator</option>
                                    <option value="university_supervisor">University Supervisor</option>
                                    <option value="supervisor">Industry Supervisor</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Department (Optional)</label>
                                <input type="text" className="input-field" placeholder="Engineering" value={userForm.department} onChange={e => setUserForm({ ...userForm, department: e.target.value })} />
                            </div>
                            <button type="submit" className="btn-primary">Send Invitation</button>
                        </form>
                    </div>

                    <div className="glass-card">
                        <h3 style={{ marginBottom: '16px' }}>Pending Invitations</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {pendingUsers.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No pending invitations</p>
                            ) : (
                                pendingUsers.map(u => (
                                    <div key={u._id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <strong>{u.name}</strong>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{u.email}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>{u.role.replace('_', ' ')}</p>
                                        </div>
                                        <button onClick={() => handleDeletePendingUser(u._id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
