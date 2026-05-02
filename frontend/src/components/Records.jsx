import React, { useState, useEffect } from 'react';
import api from '../api';
import { FileText, Clock, Briefcase, FileSignature } from 'lucide-react';

export default function Records({ user }) {
    const [internships, setInternships] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [industryFeedback, setIndustryFeedback] = useState([]);
    const [logbooks, setLogbooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecords();
    }, [user.role]);

    const fetchRecords = async () => {
        try {
            setLoading(true);

            // Fetch internships which are relevant to all roles
            try {
                const resInternships = await api.get('/api/internships');
                setInternships(Array.isArray(resInternships.data) ? resInternships.data : []);
            } catch (e) {
                console.error('No internships found');
            }

            // Fetch specific records based on role
            if (user.role === 'student') {
                try {
                    const resTasks = await api.get('/api/tasks/me');
                    setTasks(Array.isArray(resTasks.data) ? resTasks.data : []);
                } catch (e) { }
            } else if (user.role === 'university_supervisor' || user.role === 'coordinator') {
                try {
                    const resTasks = await api.get('/api/tasks/assigned');
                    setTasks(Array.isArray(resTasks.data) ? resTasks.data : []);
                } catch (e) { }

                try {
                    const resEvals = await api.get('/api/evaluations');
                    setEvaluations(Array.isArray(resEvals.data) ? resEvals.data : []);
                } catch (e) { }
            } else if (user.role === 'supervisor') {
                try {
                    const resEvals = await api.get('/api/evaluations');
                    setEvaluations(Array.isArray(resEvals.data) ? resEvals.data : []);
                } catch (e) { }
            }

            try {
                const resIndFeed = await api.get('/api/industry-feedback');
                setIndustryFeedback(Array.isArray(resIndFeed.data) ? resIndFeed.data : []);
            } catch (e) { }

            // Fetch Logbooks
            try {
                const resLog = await api.get('/api/logbook');
                setLogbooks(Array.isArray(resLog.data) ? resLog.data : []);
            } catch (e) { }
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="spinner" style={{ margin: '40px auto', display: 'block', width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>;

    const noRecords = internships.length === 0 && tasks.length === 0 && evaluations.length === 0;

    return (
        <div className="dashboard-section animate-fade-in">
            {noRecords ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
                    <h3 style={{ color: 'var(--text-muted)' }}>No records found</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>There is no historical activity available for your account yet.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

                    {/* Internships List */}
                    {internships.length > 0 && (
                        <div className="glass-card">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary-color)' }}>
                                <Briefcase size={20} /> Internship Placements
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {internships.map((record, idx) => (
                                    <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <strong style={{ color: '#fff' }}>{record.company || 'Company'}</strong>
                                            <span style={{ fontSize: '0.8rem', color: record.status === 'active' || record.status === 'employed' || record.status === 'completed' ? 'var(--success)' : 'var(--warning)' }}>
                                                {record.status.toUpperCase().replace('_', ' ')}
                                            </span>
                                        </div>
                                        {user.role !== 'student' && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Student: {record.student?.name || 'Unknown'}</p>}
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                                            Updated: {new Date(record.updatedAt || record.createdAt || Date.now()).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tasks List */}
                    {tasks.length > 0 && (
                        <div className="glass-card">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary-color)' }}>
                                <Clock size={20} /> Tasks & Assignments
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {tasks.map((task, idx) => (
                                    <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <strong style={{ color: '#fff' }}>{task.title}</strong>
                                            <span style={{ fontSize: '0.8rem', color: task.status === 'graded' ? 'var(--success)' : 'var(--warning)' }}>
                                                {task.status.toUpperCase()}
                                            </span>
                                        </div>
                                        {user.role !== 'student' && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Student: {task.studentId?.name || 'Unknown'}</p>}
                                        {task.grade && (
                                            <p style={{ fontSize: '0.85rem', color: 'var(--primary-color)', margin: '4px 0' }}>Grade: {task.grade}%</p>
                                        )}
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                                            Deadline: {new Date(task.deadline).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Evaluations List */}
                    {evaluations.length > 0 && (
                        <div className="glass-card">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary-color)' }}>
                                <FileSignature size={20} /> Performance Evaluations
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {evaluations.map((evalRecord, idx) => (
                                    <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <strong style={{ color: '#fff' }}>Student: {evalRecord.student?.name || 'Unknown'}</strong>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>Performance Rating: {evalRecord.performanceLevel}/5</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 4px 0', fontStyle: 'italic' }}>
                                            "{evalRecord.feedback}"
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                                            Evaluator: {evalRecord.supervisor?.name || 'Industry Supervisor'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Industry Feedback List */}
                    {industryFeedback.length > 0 && (
                        <div className="glass-card">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary-color)' }}>
                                <FileSignature size={20} className="text-warning" /> Industry Performance Feedback
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {industryFeedback.map((fb, idx) => (
                                    <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <strong style={{ color: '#fff' }}>{fb.student?.name}</strong>
                                            <span style={{ 
                                                fontSize: '0.75rem', 
                                                color: fb.sentiment === 'Positive' ? 'var(--success)' : fb.sentiment === 'Negative' ? 'var(--danger)' : 'var(--warning)',
                                                fontWeight: 'bold'
                                            }}>
                                                {fb.sentiment.toUpperCase()}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>"{fb.description}"</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            <span>ID: {fb.feedback_id}</span>
                                            <span>From: {fb.industrySupervisor?.company || 'N/A'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Logbook History */}
                    {logbooks.length > 0 && (
                        <div className="glass-card">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary-color)' }}>
                                <Clock size={20} /> Daily Logbook History
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {logbooks.map((log, idx) => (
                                    <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--primary-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <strong style={{ color: '#fff' }}>{log.student?.name}</strong>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(log.date).toLocaleDateString()}</span>
                                        </div>
                                        <p style={{ fontSize: '0.85rem' }}>"{log.content}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
