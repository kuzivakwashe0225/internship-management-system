import React, { useState, useEffect } from 'react';
import api from '../api';
import { Upload, Briefcase, Clock, CheckCircle } from 'lucide-react';

export default function StudentDashboard({ user, token }) {
    const [internships, setInternships] = useState([]);
    const [tasks, setTasks] = useState([]);

    // CV Upload State
    const [cvFile, setCvFile] = useState(null);
    const [skills, setSkills] = useState('');
    const [cvStatus, setCvStatus] = useState('');

    // Task Upload State
    const [selectedTask, setSelectedTask] = useState('');
    const [taskFile, setTaskFile] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const resIn = await api.get('/api/internships');
            setInternships(resIn.data);

            const resTasks = await api.get('/api/tasks/me');
            setTasks(resTasks.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCVUpload = async (e) => {
        e.preventDefault();
        if (!cvFile) return alert('Please select a PDF CV');

        const formData = new FormData();
        formData.append('cv', cvFile);
        formData.append('skills', JSON.stringify(skills.split(',').map(s => s.trim())));

        try {
            await api.post('/api/internships/cv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCvStatus('CV Uploaded Successfully! You are now in the Candidate Pool.');
            // Update local user state if needed, but for MVP just showing message is fine
        } catch (err) {
            alert(err.response?.data?.message || 'Upload failed');
        }
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        if (!taskFile || !selectedTask) return alert('Please select a task and file');

        const formData = new FormData();
        formData.append('file', taskFile);

        try {
            await api.post(`/api/tasks/${selectedTask}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Task submitted successfully!');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Upload failed');
        }
    };

    return (
        <div>
            {/* Step 1: CV Upload (Only show if not employed) */}
            <div className="glass-card" style={{ marginBottom: '30px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Upload size={20} className="text-primary" /> Step 1: Upload CV for Attachment
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.9rem' }}>
                    Upload your resume to be visible to verified Industry Supervisors for placement.
                </p>
                <form onSubmit={handleCVUpload} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 300px' }}>
                        <label className="form-label">CV File (PDF)</label>
                        <input type="file" accept=".pdf" className="input-field" onChange={e => setCvFile(e.target.files[0])} />
                    </div>
                    <div style={{ flex: '1 1 300px' }}>
                        <label className="form-label">Core Skills (comma separated)</label>
                        <input type="text" placeholder="e.g. React, Node, Python" className="input-field" value={skills} onChange={e => setSkills(e.target.value)} />
                    </div>
                    <button type="submit" className="btn-primary">Submit Profile</button>
                </form>
                {cvStatus && <p style={{ color: 'var(--success)', marginTop: '10px', fontSize: '0.9rem' }}>{cvStatus}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                {/* Placement Tracking */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Briefcase size={20} /> My Placements
                    </h3>
                    {internships.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No placement offers yet. Keep an eye on your email for interview invites!</p> : (
                        <div>
                            {internships.map(i => (
                                <div key={i._id} style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '12px' }}>
                                    <h4 style={{ color: 'var(--primary-color)' }}>{i.company}</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        Status: <strong style={{ color: '#fff' }}>{i.status.toUpperCase().replace('_', ' ')}</strong>
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        Supervisors: {i.industrySupervisor?.name || 'Pending'} (Industry) | {i.universitySupervisor?.name || 'Pending'} (University)
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Task Tracking (HIT-300) */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={20} /> Assignments & HIT-300
                    </h3>
                    {tasks.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No tasks assigned by your University Supervisor yet.</p> : (
                        <>
                            <div style={{ marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                                {tasks.map(t => (
                                    <div key={t._id} style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', marginBottom: '8px', borderLeft: `4px solid ${t.status === 'graded' ? 'var(--success)' : t.status === 'submitted' ? 'var(--warning)' : 'var(--danger)'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <strong>{t.title}</strong>
                                            <span style={{ fontSize: '0.8rem', color: t.status === 'graded' ? 'var(--success)' : '#fff' }}>{t.status.toUpperCase()}</span>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0' }}>Due: {new Date(t.deadline).toLocaleDateString()}</p>
                                        {t.grade && <p style={{ fontSize: '0.9rem', color: 'var(--primary-color)' }}>Grade: {t.grade}%</p>}
                                        {t.feedback && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{t.feedback}"</p>}
                                    </div>
                                ))}
                            </div>

                            <hr style={{ borderColor: 'var(--border-light)', margin: '16px 0' }} />

                            <h4>Submit Report</h4>
                            <form onSubmit={handleTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                                <select className="input-field" value={selectedTask} onChange={e => setSelectedTask(e.target.value)} required>
                                    <option value="">Select Task...</option>
                                    {tasks.filter(t => t.status === 'pending').map(t => (
                                        <option key={t._id} value={t._id}>{t.title}</option>
                                    ))}
                                </select>
                                <input type="file" className="input-field" onChange={e => setTaskFile(e.target.files[0])} required />
                                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Upload Submission</button>
                            </form>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
