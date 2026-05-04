import React, { useState, useEffect } from 'react';
import api from '../api';
import { Send, User } from 'lucide-react';

export default function MessagingPanel({ user }) {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
        const interval = setInterval(() => {
            if (selectedUserId) {
                fetchMessages(selectedUserId);
            }
            fetchUnreadCount();
        }, 5000);
        return () => clearInterval(interval);
    }, [selectedUserId]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/messages/users');
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const res = await api.get(`/api/messages/${userId}`);
            setMessages(res.data);
            // Mark messages as read
            await api.put(`/api/messages/${userId}/read`, {});
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/api/messages/unread/count');
            setUnreadCount(res.data.unreadCount);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectUser = (userId) => {
        setSelectedUserId(userId);
        fetchMessages(userId);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedUserId) return;

        try {
            await api.post('/api/messages', {
                toId: selectedUserId,
                content: messageText
            });
            setMessageText('');
            fetchMessages(selectedUserId);
        } catch (err) {
            alert('Failed to send message: ' + err.response?.data?.message);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', height: 'calc(100vh - 200px)' }}>
            {/* Users List */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Messages</h3>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {users.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No conversations available</p>
                    ) : (
                        users.map(u => (
                            <button
                                key={u._id}
                                onClick={() => handleSelectUser(u._id)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: selectedUserId === u._id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                    border: 'none',
                                    color: selectedUserId === u._id ? 'var(--primary-color)' : '#fff',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    borderRadius: '8px',
                                    marginBottom: '4px',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <User size={16} />
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.role}</div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Messages Thread */}
            {selectedUserId ? (
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>
                        {users.find(u => u._id === selectedUserId)?.name}
                    </h3>

                    {/* Messages Display */}
                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', paddingRight: '12px' }}>
                        {messages.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: '40px' }}>No messages yet. Start a conversation!</p>
                        ) : (
                            messages.map(msg => (
                                <div
                                    key={msg._id}
                                    style={{
                                        marginBottom: '12px',
                                        display: 'flex',
                                        justifyContent: msg.from._id === user._id ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={{
                                        maxWidth: '60%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        background: msg.from._id === user._id ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)',
                                        border: msg.from._id === user._id ? '1px solid var(--primary-color)' : '1px solid var(--border-light)'
                                    }}>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem' }}>{msg.content}</p>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Type a message..."
                            value={messageText}
                            onChange={e => setMessageText(e.target.value)}
                            style={{ margin: 0 }}
                        />
                        <button type="submit" className="btn-primary" style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            ) : (
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Select a conversation to start messaging</p>
                </div>
            )}
        </div>
    );
}
