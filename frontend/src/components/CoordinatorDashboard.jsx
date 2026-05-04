import React, { useState, useEffect } from 'react';
import api from '../api';
import { ShieldCheck, Link, Database, LayoutDashboard, Download } from 'lucide-react';

export default function CoordinatorDashboard({ user, token }) {
    const [companies, setCompanies] = useState([]);
    const [internships, setInternships] = useState([]);
    const [universitySupervisors, setUniversitySupervisors] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [industryFeedback, setIndustryFeedback] = useState([]);
    const [suggestions, setSuggestions] = useState({});

    // Placement Form States
    const [placementForm, setPlacementForm] = useState({ studentId: '', companyId: '', universitySupervisorId: '' });

    // Approval Form States
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [departmentsInput, setDepartmentsInput] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // GET Companies
            const resComp = await api.get('/api/users/companies');
            setCompanies(resComp.data);

            // GET Internships
            const resInt = await api.get('/api/internships');
            setInternships(resInt.data);

            // GET Complaints
            const resComplaints = await api.get('/api/complaints');
            setComplaints(resComplaints.data);

            // GET Industry Feedback
            const resIndustryFeedback = await api.get('/api/industry-feedback');
            setIndustryFeedback(resIndustryFeedback.data);

            // GET All Students for CV Monitoring
            const resStudents = await api.get('/api/students');
            setAllStudents(resStudents.data);

            // GET University Supervisors
            const resSup = await api.get('/api/supervisors/university');
            setUniversitySupervisors(resSup.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleResolveComplaint = async (id, comments) => {
        try {
            await api.put(`/api/complaints/${id}/resolve`, { status: 'resolved', coordinatorComments: comments });
            alert('Complaint resolved and student notified.');
            fetchData();
        } catch (err) {
            alert('Failed: ' + err.response?.data?.message);
        }
    };

    const handleApproveCompany = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/users/companies/${selectedCompany}/approve`, {
                allocatedDepartments: departmentsInput.split(',').map(d => d.trim())
            });

            alert('Company Approved & Allocated Successfully!');
            setSelectedCompany(null);
            setDepartmentsInput('');
            fetchData();
        } catch (err) {
            alert('Failed: ' + err.response?.data?.message);
        }
    };

    const handleApprovePlacement = async (internshipId, univSupervisorId) => {
        if (!univSupervisorId) return alert('Please enter a University Supervisor ID to link');
        try {
            await api.put(`/api/internships/${internshipId}/approve`, {
                universitySupervisorId: univSupervisorId
            });

            alert('Placement Finalized & Supervisor Linked!');
            setSuggestions({});
            fetchData();
        } catch (err) {
            alert('Failed: ' + err.response?.data?.message);
        }
    };

    const handleSmartAssign = async (internshipId) => {
        try {
            const res = await api.get(`/api/internships/${internshipId}/suggest-supervisor`);
            setSuggestions({ ...suggestions, [internshipId]: res.data });
        } catch (err) {
            alert('Failed to get suggestions: ' + err.response?.data?.message);
        }
    };

    const handleManualPlacement = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/internships/coordinator-place', placementForm);
            alert('Student Placed Successfully!');
            setPlacementForm({ studentId: '', companyId: '', universitySupervisorId: '' });
            fetchData();
        } catch (err) {
            alert('Failed: ' + err.response?.data?.message);
        }
    };

    const handleDownloadLogbooks = async () => {
        try {
            const response = await api.get('/api/logbook/download/csv', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `logbooks-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            alert('Failed to download logbooks: ' + err.response?.data?.message);
        }
    };

    const pendingCompanies = companies.filter(c => !c.isCompanyApproved);
    const pendingPlacements = internships.filter(i => i.status === 'interview_invite');

    return (
        <div>
            {/* Super Admin Top Row */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div className="glass-card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px' }}>
                        <Database size={32} className="text-primary" />
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--text-muted)' }}>Registered Companies</h4>
                        <h2 style={{ fontSize: '2rem' }}>{companies.length}</h2>
                    </div>
                </div>
                <div className="glass-card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                        <LayoutDashboard size={32} className="text-success" />
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--text-muted)' }}>Total Placements</h4>
                        <h2 style={{ fontSize: '2rem' }}>{internships.length}</h2>
                    </div>
                </div>
            </div>

            {/* Downloads Section */}
            <div className="glass-card" style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={20} /> Download Reports
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Export student logbooks and assessment records for record-keeping and reporting.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={handleDownloadLogbooks} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>
                        <Download size={18} /> Download All Logbooks (CSV)
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                {/* Company Approvals */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={20} /> Approve Industry Partners
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        Review registered companies and grant them access to browse CVs in specific departments.
                    </p>

                    {pendingCompanies.length === 0 ? <p style={{ color: 'var(--success)' }}>No pending company registrations.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {pendingCompanies.map(c => (
                                <div key={c._id} style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <strong>{c.company}</strong>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contact: {c.name} ({c.email})</p>
                                        </div>
                                        <button onClick={() => setSelectedCompany(c._id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Review</button>
                                    </div>

                                    {/* Inline Form if selected */}
                                    {selectedCompany === c._id && (
                                        <form onSubmit={handleApproveCompany} style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                            <label className="form-label">Allocate Departments (comma separated)</label>
                                            <input type="text" className="input-field" autoFocus required placeholder="e.g. Software Engineering, IT" value={departmentsInput} onChange={e => setDepartmentsInput(e.target.value)} />
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Approve & Grant Access</button>
                                                <button type="button" className="btn-secondary" onClick={() => setSelectedCompany(null)}>Cancel</button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <hr style={{ borderColor: 'var(--border-light)', margin: '24px 0' }} />
                    <h4>Approved Companies</h4>
                    <div style={{ maxHeight: '150px', overflowY: 'auto', marginTop: '12px' }}>
                        {companies.filter(c => c.isCompanyApproved).map(c => (
                            <div key={c._id} style={{ fontSize: '0.85rem', padding: '8px', borderBottom: '1px solid var(--border-light)' }}>
                                <strong>{c.company}</strong> <span style={{ color: 'var(--text-muted)' }}>can recruit from: {c.allocatedDepartments.join(', ')}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Finalize Placements */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link size={20} /> Finalize Placements
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        When a company invites a student, you must approve the placement and link a University Supervisor.
                    </p>

                    {pendingPlacements.length === 0 ? <p style={{ color: 'var(--success)' }}>All placements processed.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {pendingPlacements.map(i => (
                                <div key={i._id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid var(--warning)', borderRadius: '8px' }}>
                                    <strong>{i.student?.name}</strong> recruited by <strong>{i.company}</strong>

                                    {suggestions[i._id] ? (
                                        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px' }}>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Smart Suggestions (sorted by load):</p>
                                            {suggestions[i._id].length === 0 ? (
                                                <p style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>No supervisors available in {i.student?.department}</p>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    {suggestions[i._id].map((sup, idx) => (
                                                        <button
                                                            key={sup._id}
                                                            onClick={() => handleApprovePlacement(i._id, sup._id)}
                                                            style={{
                                                                padding: '8px 12px',
                                                                fontSize: '0.75rem',
                                                                background: idx === 0 ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                                                                border: idx === 0 ? '1px solid var(--success)' : '1px solid var(--border-light)',
                                                                color: '#fff',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                textAlign: 'left'
                                                            }}
                                                        >
                                                            {sup.name} — {sup.department} ({sup.activeStudentCount} students) {idx === 0 ? '← Best match' : ''}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                            <button onClick={() => handleSmartAssign(i._id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', flex: 1, background: 'rgba(99, 102, 241, 0.3)', border: '1px solid var(--primary-color)' }}>🤖 Smart Assign</button>
                                            <select id={`univ-sup-${i._id}`} className="input-field" style={{ padding: '6px', fontSize: '0.8rem', flex: 1 }}>
                                                <option value="">Or Select Manually</option>
                                                {universitySupervisors.map(s => (
                                                    <option key={s._id} value={s._id}>{s.name} ({s.department})</option>
                                                ))}
                                            </select>
                                            <button onClick={() => handleApprovePlacement(i._id, document.getElementById(`univ-sup-${i._id}`).value)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Approve</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                {/* CV Monitoring */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '16px' }}>Student CV Tracking</h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-light)' }}>
                                    <th style={{ padding: '8px' }}>Student</th>
                                    <th style={{ padding: '8px' }}>Status</th>
                                    <th style={{ padding: '8px' }}>CV</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allStudents.map(s => (
                                    <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '8px' }}>
                                            {s.name}<br/>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {s._id}</span>
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            {s.isEmployed ? <span className="text-success">PLACED</span> : s.cvUrl ? <span className="text-primary">READY</span> : <span className="text-danger">MISSING CV</span>}
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            {s.cvUrl ? <a href={`http://localhost:5000${s.cvUrl}`} target="_blank" rel="noreferrer" className="text-primary">View</a> : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Manual Placement Form */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '16px' }}>Direct Student Placement</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        Manually place a student into an approved company and assign a university supervisor.
                    </p>
                    <form onSubmit={handleManualPlacement} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label className="form-label">Student ID</label>
                            <input type="text" className="input-field" required placeholder="Paste Student ID from left" value={placementForm.studentId} onChange={e => setPlacementForm({ ...placementForm, studentId: e.target.value })} />
                        </div>
                        <div>
                            <label className="form-label">Company (Supervisor ID)</label>
                            <select className="input-field" required value={placementForm.companyId} onChange={e => setPlacementForm({ ...placementForm, companyId: e.target.value })}>
                                <option value="">Select Company</option>
                                {companies.filter(c => c.isCompanyApproved).map(c => (
                                    <option key={c._id} value={c._id}>{c.company} ({c.name})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Univ Supervisor</label>
                            <select className="input-field" required value={placementForm.universitySupervisorId} onChange={e => setPlacementForm({ ...placementForm, universitySupervisorId: e.target.value })}>
                                <option value="">Select Supervisor</option>
                                {universitySupervisors.map(s => (
                                    <option key={s._id} value={s._id}>{s.name} ({s.department})</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Finalize Placement</button>
                    </form>
                </div>
            </div>

            {/* Student Complaints & Sentiment Monitoring */}
            <div className="glass-card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LayoutDashboard size={20} className="text-warning" /> Student Complaints & Sentiment Monitoring
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    The system automatically analyzes student feedback. Items in <strong style={{ color: 'var(--danger)' }}>RED</strong> indicate high negative sentiment and require immediate institutional intervention.
                </p>

                {complaints.length === 0 ? <p style={{ color: 'var(--success)' }}>No active complaints or feedback.</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                        {complaints.map(c => {
                            const isNegative = c.sentimentScore < 0;
                            return (
                                <div key={c._id} style={{
                                    padding: '16px',
                                    background: isNegative ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)',
                                    border: isNegative ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border-light)',
                                    borderRadius: '12px',
                                    borderLeft: `6px solid ${isNegative ? 'var(--danger)' : c.status === 'resolved' ? 'var(--success)' : 'var(--warning)'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <strong>{c.student?.name}</strong>
                                        <span style={{ fontSize: '0.75rem', color: isNegative ? 'var(--danger)' : 'var(--text-muted)' }}>
                                            Sentiment: {c.sentimentScore > 0 ? 'Positive' : c.sentimentScore < 0 ? 'Negative' : 'Neutral'} ({c.sentimentScore})
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '12px', fontStyle: 'italic' }}>"{c.content}"</p>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                        Company: {c.internship?.industrySupervisor?.company || 'N/A'} | Dept: {c.student?.department}
                                    </div>

                                    {c.status !== 'resolved' ? (
                                        <div style={{ marginTop: '16px' }}>
                                            <input type="text" id={`resolve-comment-${c._id}`} className="input-field" placeholder="Action taken / Resolution..." style={{ fontSize: '0.8rem', padding: '6px' }} />
                                            <button
                                                onClick={() => handleResolveComplaint(c._id, document.getElementById(`resolve-comment-${c._id}`).value)}
                                                className="btn-primary"
                                                style={{ width: '100%', marginTop: '8px', padding: '6px', fontSize: '0.85rem' }}
                                            >
                                                Mark as Resolved
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--success)' }}>
                                            <strong>Resolved:</strong> {c.coordinatorComments}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Industry Performance Sentiment Analysis */}
            <div className="glass-card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LayoutDashboard size={20} className="text-primary" /> Industry Performance Sentiment Analysis
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    Real-time sentiment analysis of feedback from Industry Supervisors about student performance. <strong style={{ color: 'var(--danger)' }}>RED indicators</strong> flag students requiring intervention or additional support.
                </p>

                {industryFeedback.length === 0 ? <p style={{ color: 'var(--success)' }}>No industry feedback submitted yet.</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                        {industryFeedback.map(fb => {
                            const isNegative = fb.sentimentScore < 0;
                            const isPositive = fb.sentimentScore > 0;
                            return (
                                <div key={fb._id} style={{
                                    padding: '16px',
                                    background: isNegative ? 'rgba(239, 68, 68, 0.05)' : isPositive ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)',
                                    border: isNegative ? '1px solid rgba(239, 68, 68, 0.2)' : isPositive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-light)',
                                    borderRadius: '12px',
                                    borderLeft: `6px solid ${isNegative ? 'var(--danger)' : isPositive ? 'var(--success)' : 'var(--warning)'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div>
                                            <strong>{fb.student?.name}</strong>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0' }}>
                                                {fb.supervisor?.company} | Dept: {fb.student?.department}
                                            </p>
                                        </div>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: isNegative ? 'rgba(239, 68, 68, 0.2)' : isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                            color: isNegative ? 'var(--danger)' : isPositive ? 'var(--success)' : 'var(--warning)',
                                            fontWeight: 'bold'
                                        }}>
                                            {isPositive ? '😊 POSITIVE' : isNegative ? '😞 NEGATIVE' : '😐 NEUTRAL'} ({fb.sentimentScore})
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '12px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                                        "{fb.description}"
                                    </p>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {new Date(fb.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
