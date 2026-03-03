import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your email address...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await api.get(`/api/auth/verify?token=${token}`);
                setStatus('success');
                setMessage(res.data.message);
                setTimeout(() => navigate('/login'), 3000);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. Token may be invalid or expired.');
            }
        };

        verifyToken();
    }, [token, navigate]);

    return (
        <div className="auth-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
            <div className="glass-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '40px 20px' }}>
                {status === 'verifying' && (
                    <div style={{ color: 'var(--text-muted)' }}>
                        <div className="spinner" style={{ margin: '0 auto 20px', width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <h3>{message}</h3>
                    </div>
                )}

                {status === 'success' && (
                    <div style={{ color: 'var(--success)' }}>
                        <CheckCircle size={64} style={{ margin: '0 auto 20px' }} />
                        <h3>{message}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '12px' }}>Redirecting to login...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ color: 'var(--danger)' }}>
                        <XCircle size={64} style={{ margin: '0 auto 20px' }} />
                        <h3>Verification Failed</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '12px' }}>{message}</p>
                        <button onClick={() => navigate('/login')} className="btn-primary" style={{ marginTop: '24px', width: '100%' }}>Back to Login</button>
                    </div>
                )}
            </div>
            {/* Add spin keyframes globally if not exists, though standard rotation works */}
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
