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

    // Logbook State
    const [logbooks, setLogbooks] = useState([]);
    const [logbookContent, setLogbookContent] = useState('');
    const [logbookWeek, setLogbookWeek] = useState('');

    // Complaint State
    const [complaints, setComplaints] = useState([]);
    const [complaintContent, setComplaintContent] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const resIn = await api.get('/api/internships');
            setInternships(resIn.data);

            const resTasks = await api.get('/api/tasks/me');
            setTasks(resTasks.data);

            const resComp = await api.get('/api/complaints');
            setComplaints(resComp.data);

            const resLog = await api.get('/api/logbook');
            setLogbooks(resLog.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleComplaintSubmit = async (e) => {
        e.preventDefault();
        if (!complaintContent) return alert('Please write your feedback');

        try {
            await api.post('/api/complaints', { content: complaintContent });
            alert('Feedback submitted successfully! Our Intelligent Sentiment Engine has notified the coordinator.');
            setComplaintContent('');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Submission failed');
        }
    };

    const handleLogbookSubmit = async (e) => {
        e.preventDefault();
        if (!logbookContent) return alert('Please write logbook content');
        if (!logbookWeek) return alert('Please select a week number');

        try {
            await api.post('/api/logbook', { content: logbookContent, weekNumber: parseInt(logbookWeek) });
            alert('Daily logbook entry saved!');
            setLogbookContent('');
            setLogbookWeek('');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Submission failed');
        }
    };

    const handleLogbookDownload = () => {
        if (logbooks.length === 0) {
            alert('No logbook entries to download');
            return;
        }

        let csvContent = 'Week,Date,Work Done\n';
        logbooks.forEach(l => {
            const date = new Date(l.date).toLocaleDateString();
            const week = l.weekNumber || '-';
            const content = (l.content || '').replace(/"/g, '""'); // Escape quotes
            csvContent += `${week},"${date}","${content}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `logbook_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Check if student already submitted logbook today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const hasSubmittedToday = logbooks.some(l => {
        const logDate = new Date(l.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
    });

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
                {user.cvUrl ? (
                    <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>CV ACTIVE:</span>
                            <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>Your profile is visible to recruiters.</span>
                        </div>
                        <a href={`http://localhost:5000${user.cvUrl}`} target="_blank" rel="noreferrer" className="text-primary" style={{ fontSize: '0.9rem' }}>Download My CV</a>
                    </div>
                ) : (
                    cvStatus && <p style={{ color: 'var(--success)', marginTop: '10px', fontSize: '0.9rem' }}>{cvStatus}</p>
                )}
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

            {/* Daily Logbook Section */}
            <div className="glass-card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={20} className="text-primary" /> Daily Internship Logbook
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                    Record your daily activities and achievements. This log is visible to your Industry and University Supervisors.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {hasSubmittedToday ? (
                        <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', borderRadius: '8px', color: 'var(--warning)' }}>
                            <strong>Already Submitted Today</strong>
                            <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>You've already submitted your logbook entry for today. Please come back tomorrow to submit another entry.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleLogbookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label className="form-label">Week Number</label>
                                <select className="input-field" required value={logbookWeek} onChange={e => setLogbookWeek(e.target.value)}>
                                    <option value="">Select Week</option>
                                    {Array.from({ length: 52 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                                    ))}
                                </select>
                            </div>
                            <textarea
                                className="input-field"
                                rows="3"
                                placeholder="What did you do today?"
                                value={logbookContent}
                                onChange={e => setLogbookContent(e.target.value)}
                                required
                            ></textarea>
                            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Save Entry</button>
                        </form>
                    )}

                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h4 style={{ margin: 0 }}>Recent Entries</h4>
                            {logbooks.length > 0 && (
                                <button
                                    onClick={handleLogbookDownload}
                                    style={{
                                        padding: '6px 12px',
                                        background: 'rgba(99, 102, 241, 0.2)',
                                        border: '1px solid var(--primary-color)',
                                        color: 'var(--primary-color)',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    📥 Download CSV
                                </button>
                            )}
                        </div>
                        {logbooks.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No logbook entries yet.</p> : (
                            logbooks.map(l => (
                                <div key={l._id} style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '8px', borderLeft: '3px solid var(--primary-color)' }}>
                                    {l.weekNumber && <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: '600' }}>Week {l.weekNumber} • </span>}
                                    <p style={{ fontSize: '0.85rem', marginBottom: '4px' }}>{l.content}</p>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(l.date).toLocaleString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Feedback & Complaints Section */}
            <div className="glass-card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Briefcase size={20} className="text-warning" /> Feedback & Complaints (Intelligent Monitoring)
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                    Submit any concerns regarding your attachment or supervision. Our system uses Sentiment Analysis to prioritize negative experiences for coordinator intervention.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <form onSubmit={handleComplaintSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <textarea 
                            className="input-field" 
                            rows="4" 
                            placeholder="Describe your experience or complaint..." 
                            value={complaintContent}
                            onChange={e => setComplaintContent(e.target.value)}
                            required
                        ></textarea>
                        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Submit Feedback</button>
                    </form>
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        <h4>My Previous Submissions</h4>
                        {complaints.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No submissions yet.</p> : (
                            complaints.map(c => (
                                <div key={c._id} style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '8px', borderLeft: `4px solid ${c.status === 'resolved' ? 'var(--success)' : 'var(--warning)'}` }}>
                                    <p style={{ fontSize: '0.85rem', marginBottom: '4px' }}>{c.content}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                                        <span style={{ 
                                            fontSize: '0.7rem', 
                                            padding: '2px 6px', 
                                            borderRadius: '4px', 
                                            background: c.status === 'resolved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: c.status === 'resolved' ? 'var(--success)' : 'var(--warning)'
                                        }}>
                                            {c.status.toUpperCase()}
                                        </span>
                                    </div>
                                    {c.coordinatorComments && (
                                        <p style={{ fontSize: '0.8rem', color: 'var(--primary-color)', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px' }}>
                                            <strong>Response:</strong> {c.coordinatorComments}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
