import React, { useState, useEffect } from 'react';
import api from '../api';
import { ShieldCheck, Link, Database, LayoutDashboard } from 'lucide-react';

export default function CoordinatorDashboard({ user, token }) {
    const [companies, setCompanies] = useState([]);
    const [internships, setInternships] = useState([]);
    const [universitySupervisors, setUniversitySupervisors] = useState([]);

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

            // We need a list of University Supervisors to assign. We can cheat by filtering locally if we had all users, 
            // but for MVP let's just make a generic call if we had a /users endpoint. 
            // Since we don't have a /users endpoint, we will just use a text input for the Univ Supervisor ID for now.
        } catch (err) {
            console.error(err);
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
            fetchData();
        } catch (err) {
            alert('Failed: ' + err.response?.data?.message);
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
                            {pendingPlacements.map(i => {
                                // Local state constraint: We don't have a specific state array for each input so we'll 
                                // use standard DOM extraction for this rapid MVP or ask user to provide it.
                                return (
                                    <div key={i._id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid var(--warning)', borderRadius: '8px' }}>
                                        <strong>{i.student?.name}</strong> recruited by <strong>{i.company}</strong>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                            <input type="text" id={`univ-sup-${i._id}`} className="input-field" placeholder="Paste Univ Supervisor ID" style={{ padding: '6px', fontSize: '0.8rem' }} />
                                            <button onClick={() => handleApprovePlacement(i._id, document.getElementById(`univ-sup-${i._id}`).value)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Approve & Link</button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
