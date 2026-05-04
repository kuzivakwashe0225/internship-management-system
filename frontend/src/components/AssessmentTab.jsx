import React, { useState, useEffect } from 'react';
import api from '../api';
import { CheckCircle, Calendar, User, FileText, Download } from 'lucide-react';

export default function AssessmentTab({ user }) {
    const [assessments, setAssessments] = useState([]);
    const [formData, setFormData] = useState({ studentId: '', internshipId: '', course: '', visitDate: '', score: '', comments: '' });
    const [internships, setInternships] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const resAssess = await api.get('/api/assessments');
            setAssessments(resAssess.data);

            if (user.role === 'university_supervisor' || user.role === 'coordinator') {
                const resCourses = await api.get('/api/courses');
                setCourses(resCourses.data);
                const resIntern = await api.get('/api/internships');
                setInternships(resIntern.data);
                const resStudents = await api.get('/api/students');
                setStudents(resStudents.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadAssessments = async () => {
        try {
            const response = await api.get('/api/assessments/download/csv', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `assessments-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            alert('Failed to download: ' + err.response?.data?.message);
        }
    };

    const handleSubmitAssessment = async (e) => {
        e.preventDefault();
        if (!formData.studentId || !formData.internshipId || !formData.course || !formData.visitDate || !formData.score || !formData.comments) {
            alert('All fields are required');
            return;
        }
        try {
            await api.post('/api/assessments', {
                studentId: formData.studentId,
                internshipId: formData.internshipId,
                course: formData.course,
                visitDate: formData.visitDate,
                score: parseInt(formData.score),
                comments: formData.comments
            });
            alert('Assessment recorded successfully!');
            setFormData({ studentId: '', internshipId: '', course: '', visitDate: '', score: '', comments: '' });
            fetchData();
        } catch (err) {
            alert('Failed: ' + err.response?.data?.message);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

    return (
        <div>
            {/* Record New Assessment - only for university supervisors */}
            {user.role === 'university_supervisor' && (
                <div className="glass-card" style={{ marginBottom: '30px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <CheckCircle size={20} /> Record Site Assessment
                    </h3>
                    <form onSubmit={handleSubmitAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label className="form-label">Student</label>
                                <select className="input-field" required value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })}>
                                    <option value="">Select Student</option>
                                    {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Course</label>
                                <select className="input-field" required value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })}>
                                    <option value="">Select Course</option>
                                    {courses.map(c => <option key={c._id} value={c.code}>{c.code} - {c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label className="form-label">Internship</label>
                                <select className="input-field" required value={formData.internshipId} onChange={e => setFormData({ ...formData, internshipId: e.target.value })}>
                                    <option value="">Select Internship</option>
                                    {internships.filter(i => i.status === 'active').map(i => <option key={i._id} value={i._id}>{i.company}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Visit Date</label>
                                <input type="date" className="input-field" required value={formData.visitDate} onChange={e => setFormData({ ...formData, visitDate: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Score (0-100)</label>
                            <input type="number" className="input-field" min="0" max="100" required value={formData.score} onChange={e => setFormData({ ...formData, score: e.target.value })} />
                        </div>
                        <div>
                            <label className="form-label">Comments</label>
                            <textarea className="input-field" rows="3" required placeholder="Assessment comments..." value={formData.comments} onChange={e => setFormData({ ...formData, comments: e.target.value })}></textarea>
                        </div>
                        <button type="submit" className="btn-primary">Submit Assessment</button>
                    </form>
                </div>
            )}

            {/* Assessments Table */}
            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <Calendar size={20} /> Site Assessments
                    </h3>
                    {(user.role === 'coordinator' || user.role === 'university_supervisor') && assessments.length > 0 && (
                        <button onClick={handleDownloadAssessments} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', borderRadius: '4px', cursor: 'pointer' }}>
                            <Download size={16} /> Download CSV
                        </button>
                    )}
                </div>

                {assessments.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No assessments recorded yet.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--primary-color)' }}>Student</th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--primary-color)' }}>Course</th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--primary-color)' }}>Assessed By</th>
                                    <th style={{ padding: '12px', textAlign: 'center', color: 'var(--primary-color)' }}>Score</th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--primary-color)' }}>Date</th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--primary-color)' }}>Comments</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assessments.map(a => (
                                    <tr key={a._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '12px', color: '#fff' }}>{a.student?.name}</td>
                                        <td style={{ padding: '12px', color: 'var(--primary-color)', fontWeight: '600' }}>{a.course}</td>
                                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{a.universitySupervisor?.name}</td>
                                        <td style={{ padding: '12px', textAlign: 'center', color: a.score >= 75 ? 'var(--success)' : a.score >= 50 ? 'var(--warning)' : 'var(--danger)', fontWeight: 'bold' }}>
                                            {a.score}%
                                        </td>
                                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{new Date(a.visitDate).toLocaleDateString()}</td>
                                        <td style={{ padding: '12px', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.comments}</td>
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
