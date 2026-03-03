import React, { useState, useEffect } from 'react';
import api from '../api';
import { BookOpen, CheckSquare, Download } from 'lucide-react';

export default function UniversitySupervisorDashboard({ user, token }) {
    const [internships, setInternships] = useState([]);
    const [tasks, setTasks] = useState([]);

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
        </div>
    );
}
