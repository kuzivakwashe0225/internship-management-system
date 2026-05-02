import React, { useState, useEffect } from 'react';
import api from '../api';
import { BookOpen, CheckSquare, Download } from 'lucide-react';

export default function UniversitySupervisorDashboard({ user, token }) {
    const [internships, setInternships] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [logbooks, setLogbooks] = useState([]);
    const [industryFeedback, setIndustryFeedback] = useState([]);

    // Task Assignment Form
    const [taskForm, setTaskForm] = useState({ title: '', description: '', deadline: '', studentId: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Internships linked to this Univ Supervisor
            const resIn = await api.get('/api/internships');
            setInternships(resIn.data);

            // Tasks assigned by this Univ Supervisor
            const resTasks = await api.get('/api/tasks/assigned');
            setTasks(resTasks.data);

            // Complaints from assigned students
            const resComp = await api.get('/api/complaints');
            setComplaints(resComp.data);

            // Industry feedback for assigned students
            const resIndustryFeedback = await api.get('/api/industry-feedback');
            setIndustryFeedback(resIndustryFeedback.data);

            const resLog = await api.get('/api/logbook');
            setLogbooks(resLog.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssignTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/tasks', taskForm);
            alert('Task assigned successfully!');
            setTaskForm({ title: '', description: '', deadline: '', studentId: '' });
            fetchData();
        } catch (err) {
            alert('Failed: ' + err.response?.data?.message);
        }
    };

    const handleGrade = async (taskId, grade, feedback) => {
        try {
            await api.put(`/api/tasks/${taskId}/grade`, { grade, feedback });
            alert('Task Graded!');
            fetchData();
        } catch (err) {
            alert('Failed: ' + err.response?.data?.message);
        }
    };

    const activeStudents = internships.filter(i => i.status === 'active' || i.status === 'completed');

    return (
        <div>
            {/* Dashboard Header Info */}
            <div className="glass-card" style={{ marginBottom: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{ padding: '20px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%' }}>
                    <BookOpen size={48} className="text-primary" />
                </div>
                <div>
                    <h2>University Supervisor Panel</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your allocated students, assign coursework like the HIT-300, and grade submissions.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                {/* Left Column: Assigned Students & Assign Task Form */}
                <div>
                    <div className="glass-card" style={{ marginBottom: '24px' }}>
                        <h3 style={{ marginBottom: '16px' }}>My Assigned Interns</h3>
                        {activeStudents.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No interns assigned yet.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {activeStudents.map(i => (
                                    <div key={i._id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <strong>{i.student?.name}</strong>
                                            <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-muted)' }}>{i.company}</p>
                                        </div>
                                        <code style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>ID: {i.student?._id}</code>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="glass-card">
                        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckSquare size={20} /> Assign HIT-300 / Task
                        </h3>
                        <form onSubmit={handleAssignTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="form-label">Task Title</label>
                                <input type="text" className="input-field" required placeholder="e.g. HIT-300 Weaknesses Report" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="form-label">Description</label>
                                <textarea className="input-field" rows="2" placeholder="Task requirements..." value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Deadline</label>
                                    <input type="date" className="input-field" required value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Student ID</label>
                                    <input type="text" className="input-field" required placeholder="Paste from list above" value={taskForm.studentId} onChange={e => setTaskForm({ ...taskForm, studentId: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary">Assign Task</button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Grading Board */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '16px' }}>Submissions to Grade</h3>

                    {tasks.filter(t => t.status === 'submitted').length === 0 ? (
                        <p style={{ color: 'var(--success)' }}>All caught up! No pending submissions to grade.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {tasks.filter(t => t.status === 'submitted').map(t => (
                                <div key={t._id} style={{ padding: '16px', border: '1px solid var(--border-light)', borderLeft: '4px solid var(--primary-color)', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <h4 style={{ margin: 0 }}>{t.title}</h4>
                                        <a href={`http://localhost:5000${t.submissionUrl}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--primary-color)' }}>
                                            <Download size={14} /> Download File
                                        </a>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 16px' }}>Submitted by: {t.student?.name}</p>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <input type="number" id={`grade-${t._id}`} className="input-field" placeholder="Grade (0-100)" style={{ flex: '1', padding: '8px' }} max="100" min="0" />
                                        <input type="text" id={`feedback-${t._id}`} className="input-field" placeholder="Short feedback" style={{ flex: '2', padding: '8px' }} />
                                    </div>
                                    <button
                                        onClick={() => handleGrade(t._id, document.getElementById(`grade-${t._id}`).value, document.getElementById(`feedback-${t._id}`).value)}
                                        className="btn-primary" style={{ width: '100%', marginTop: '12px', padding: '8px' }}>
                                        Submit Grade
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <hr style={{ borderColor: 'var(--border-light)', margin: '24px 0' }} />

                    <h4 style={{ marginBottom: '12px' }}>Recently Graded</h4>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {tasks.filter(t => t.status === 'graded').map(t => (
                            <div key={t._id} style={{ fontSize: '0.85rem', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{t.title} <em>({t.student?.name})</em></span>
                                <strong style={{ color: 'var(--success)' }}>{t.grade}%</strong>
                            </div>
                        ))}
                    </div>

                </div>

            </div>

            {/* Student Feedback & Sentiment Monitoring */}
            <div className="glass-card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={20} className="text-warning" /> Student Feedback & Sentiment Monitoring
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Monitor the emotional well-being of your students. Negative feedback is automatically highlighted by our Intelligent Sentiment Engine.
                </p>

                {complaints.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No feedback submitted by your students yet.</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {complaints.map(c => {
                            const isNegative = c.sentimentScore < 0;
                            return (
                                <div key={c._id} style={{ 
                                    padding: '12px', 
                                    background: isNegative ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)', 
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${isNegative ? 'var(--danger)' : 'var(--success)'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <strong>{c.student?.name}</strong>
                                        <span style={{ fontSize: '0.7rem', color: isNegative ? 'var(--danger)' : 'var(--success)' }}>
                                            {isNegative ? 'NEGATIVE SENTIMENT' : 'POSITIVE/NEUTRAL'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>"{c.content}"</p>
                                    <div style={{ marginTop: '8px', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Status: {c.status.toUpperCase()}</span>
                                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Logbook Monitoring */}
            <div className="glass-card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={20} className="text-primary" /> Daily Logbook Monitoring
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {logbooks.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No logbook entries from interns yet.</p> : (
                        logbooks.map(l => (
                            <div key={l._id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid var(--primary-color)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <strong>{l.student?.name}</strong>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(l.date).toLocaleDateString()}</span>
                                </div>
                                <p style={{ fontSize: '0.85rem' }}>{l.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Industry Supervisor Performance Feedback */}
            <div className="glass-card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={20} className="text-primary" /> Industry Supervisor Feedback on Your Students
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Sentiment-analyzed feedback from industry supervisors about your assigned students' performance. Use this to identify students who may need additional support.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {industryFeedback.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No industry feedback submitted yet.</p> : (
                        industryFeedback.map(fb => {
                            const isNegative = fb.sentimentScore < 0;
                            const isPositive = fb.sentimentScore > 0;
                            return (
                                <div key={fb._id} style={{
                                    padding: '12px',
                                    background: isNegative ? 'rgba(239, 68, 68, 0.05)' : isPositive ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)',
                                    border: isNegative ? '1px solid rgba(239, 68, 68, 0.2)' : isPositive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-light)',
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${isNegative ? 'var(--danger)' : isPositive ? 'var(--success)' : 'var(--warning)'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <strong>{fb.student?.name}</strong>
                                        <span style={{
                                            fontSize: '0.65rem',
                                            padding: '2px 6px',
                                            borderRadius: '3px',
                                            background: isNegative ? 'rgba(239, 68, 68, 0.2)' : isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                            color: isNegative ? 'var(--danger)' : isPositive ? 'var(--success)' : 'var(--warning)',
                                            fontWeight: 'bold'
                                        }}>
                                            {isPositive ? '😊 POSITIVE' : isNegative ? '😞 NEGATIVE' : '😐 NEUTRAL'} ({fb.sentimentScore})
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                        {fb.supervisor?.company}
                                    </p>
                                    <p style={{ fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '8px' }}>
                                        "{fb.description}"
                                    </p>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        {new Date(fb.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
