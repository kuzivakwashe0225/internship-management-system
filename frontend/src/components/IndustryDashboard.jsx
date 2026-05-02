import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, FileText, CheckCircle, Mail, Clock } from 'lucide-react';

export default function IndustryDashboard({ user, token }) {
    const [candidates, setCandidates] = useState([]);
    const [internships, setInternships] = useState([]);
    const [evalForm, setEvalForm] = useState({ internshipId: '', quantitativeGrade: 0, qualitativeFeedback: '' });
    const [studentFeedback, setStudentFeedback] = useState({}); // { studentId: 'feedback text' }
    const [logbooks, setLogbooks] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Only fetch candidates if the company is approved
            if (user.isCompanyApproved) {
                const resCand = await api.get('/api/internships/candidates');
                setCandidates(resCand.data);
            }

            const resIn = await api.get('/api/internships');
            setInternships(resIn.data);

            const resLog = await api.get('/api/logbook');
            setLogbooks(resLog.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleInvite = async (studentId) => {
        try {
            await api.post('/api/internships/select', { studentId });
            alert('Interview Invite Sent! Candidate will be moved to pending placements.');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to invite candidate');
        }
    };

    const submitEvaluation = async (e) => {
        e.preventDefault();
        const objectIdPattern = /^[0-9a-fA-F]{24}$/;
        if (!objectIdPattern.test(evalForm.internshipId)) {
            alert('Invalid Internship ID format. Please copy a valid ID from the active students list.');
            return;
        }

        try {
            await api.post('/api/evaluations', evalForm);
            alert('Evaluation submitted successfully!');
            fetchData();
        } catch (err) {
            alert('Failed: ' + err.response?.data?.message);
        }
    };

    const handleIndustryFeedback = async (studentId) => {
        const description = studentFeedback[studentId];
        if (!description) return alert('Please enter feedback first');

        try {
            await api.post('/api/industry-feedback', { studentId, description });
            alert('Feedback posted successfully with intelligent sentiment analysis!');
            setStudentFeedback({ ...studentFeedback, [studentId]: '' });
            fetchData();
        } catch (err) {
            alert('Failed to post feedback: ' + err.response?.data?.message);
        }
    };

    // Filter internships into pending interviews and active/employed
    const pendingInterviews = internships.filter(i => i.status === 'interview_invite' || i.status === 'approved_by_coordinator');
    const activeEmployed = internships.filter(i => i.status === 'active' || i.status === 'completed');

    if (!user.isCompanyApproved) {
        return (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Clock size={48} className="text-warning" style={{ margin: '0 auto 20px', color: 'var(--warning)' }} />
                <h3>Account Pending Approval</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>
                    Your company account is currently waiting for approval from the University Coordinator.
                    Once approved and allocated to departments, you will be able to browse student CVs and recruit candidates here.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Candidate Pool Browsing */}
            <div className="glass-card" style={{ marginBottom: '30px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Users size={20} /> Candidate pool ({user.allocatedDepartments.join(', ') || 'No departments allocated yet'})
                </h3>
                {candidates.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No available candidates in your allocated departments right now.</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {candidates.map(c => (
                            <div key={c._id} style={{ padding: '16px', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                                <h4>{c.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Department: {c.department}</p>
                                <div style={{ margin: '12px 0', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {c.skills.map((s, idx) => (
                                        <span key={idx} style={{ padding: '2px 8px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary-color)', borderRadius: '12px', fontSize: '0.75rem' }}>{s}</span>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                    <a href={`http://localhost:5000${c.cvUrl}`} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '8px 12px', fontSize: '0.85rem', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}>
                                        <FileText size={16} /> View CV
                                    </a>
                                    <button onClick={() => handleInvite(c._id)} className="btn-primary" style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1 }}>
                                        <Mail size={16} /> Invite
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                {/* Active Employed Students */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '16px' }}>Employed Interns & Performance Feedback</h3>
                    {activeEmployed.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No active interns.</p> : (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {activeEmployed.map(i => (
                                <div key={i._id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid var(--success)', borderRadius: '8px', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <strong>{i.student?.name}</strong>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>ACTIVE</span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--primary-color)', marginBottom: '8px' }}>
                                        <strong>Internship ID:</strong> {i._id}
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{i.student?.email} | Dept: {i.student?.department}</p>
                                    
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input 
                                            type="text" 
                                            className="input-field" 
                                            placeholder="Write performance feedback..." 
                                            style={{ fontSize: '0.8rem', padding: '8px' }}
                                            value={studentFeedback[i.student?._id] || ''}
                                            onChange={e => setStudentFeedback({ ...studentFeedback, [i.student?._id]: e.target.value })}
                                        />
                                        <button 
                                            onClick={() => handleIndustryFeedback(i.student?._id)}
                                            className="btn-primary" 
                                            style={{ padding: '8px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                                        >
                                            Post Feedback
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <h3 style={{ margin: '24px 0 16px' }}>Pending Placements/Invites</h3>
                    {pendingInterviews.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No pending invites.</p> : (
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {pendingInterviews.map(i => (
                                <div key={i._id} style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '4px', marginBottom: '8px' }}>
                                    <strong>{i.student?.name}</strong> <span style={{ fontSize: '0.8rem', color: 'var(--warning)', float: 'right' }}>{i.status.toUpperCase()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Evaluation */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '16px' }}>Submit Post-Internship Evaluation</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        Provide feedback for active interns. This qualitative feedback is parsed by our NLP Sentiment Engine.
                    </p>
                    <form onSubmit={submitEvaluation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label className="form-label">Active Internship ID</label>
                            <input type="text" className="input-field" required value={evalForm.internshipId} onChange={e => setEvalForm({ ...evalForm, internshipId: e.target.value })} placeholder="Copy ID from left panel" />
                        </div>
                        <div>
                            <label className="form-label">Quantitative Grade (0-100)</label>
                            <input type="number" className="input-field" min="0" max="100" required value={evalForm.quantitativeGrade} onChange={e => setEvalForm({ ...evalForm, quantitativeGrade: e.target.value })} />
                        </div>
                        <div>
                            <label className="form-label">Qualitative Feedback</label>
                            <textarea className="input-field" rows="4" required placeholder="Write detailed feedback about student performance..." value={evalForm.qualitativeFeedback} onChange={e => setEvalForm({ ...evalForm, qualitativeFeedback: e.target.value })}></textarea>
                        </div>
                        <button type="submit" className="btn-primary">Submit Evaluation</button>
                    </form>
                </div>

                {/* Logbook Monitoring */}
                <div className="glass-card" style={{ marginTop: '24px', gridColumn: 'span 2' }}>
                    <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={20} className="text-primary" /> Daily Logbook Monitoring
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

            </div>
        </div>
    );
}
