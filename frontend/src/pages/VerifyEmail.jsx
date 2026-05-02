import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { CheckCircle, XCircle, Mail, Key } from 'lucide-react';

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [status, setStatus] = useState('idle'); // idle, verifying, success, error
    const [message, setMessage] = useState('');

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!email || !otp) return alert('Please enter both email and OTP');
        
        setStatus('verifying');
        setMessage('Verifying your code...');

        try {
            const res = await api.post('/api/auth/verify', { email, otp });
            setStatus('success');
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Verification failed. Code may be invalid or expired.');
        }
    };

    return (
        <div className="auth-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div className="glass-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '40px 20px' }}>
                
                {status === 'idle' || status === 'error' ? (
                    <>
                        <h2 style={{ marginBottom: '8px' }}>Email Verification</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                            Enter the 6-digit OTP code sent to your inbox.
                        </p>

                        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                            <div>
                                <label className="form-label">Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                                    <input 
                                        type="email" 
                                        className="input-field" 
                                        style={{ paddingLeft: '40px' }}
                                        placeholder="Enter your registered email"
                                        required 
                                        value={email} 
                                        onChange={e => setEmail(e.target.value)} 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">6-Digit OTP Code</label>
                                <div style={{ position: 'relative' }}>
                                    <Key size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                                    <input 
                                        type="text" 
                                        className="input-field" 
                                        style={{ paddingLeft: '40px', letterSpacing: '4px', fontWeight: 'bold' }}
                                        placeholder="000000"
                                        maxLength="6"
                                        required 
                                        value={otp} 
                                        onChange={e => setOtp(e.target.value)} 
                                    />
                                </div>
                            </div>

                            {status === 'error' && (
                                <div style={{ color: 'var(--danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <XCircle size={16} /> {message}
                                </div>
                            )}

                            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Verify Account</button>
                        </form>
                    </>
                ) : status === 'verifying' ? (
                    <div style={{ color: 'var(--text-muted)' }}>
                        <div className="spinner" style={{ margin: '0 auto 20px', width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <h3>{message}</h3>
                    </div>
                ) : (
                    <div style={{ color: 'var(--success)' }}>
                        <CheckCircle size={64} style={{ margin: '0 auto 20px' }} />
                        <h3>Verified!</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '12px' }}>{message}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>Redirecting to login...</p>
                    </div>
                )}

                {(status === 'idle' || status === 'error') && (
                    <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', marginTop: '24px', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>
                        Back to Login
                    </button>
                )}
            </div>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
