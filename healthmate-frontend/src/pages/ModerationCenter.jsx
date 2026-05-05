import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import moderationService from '../services/moderation.service';
import { 
    FiCheckCircle, 
    FiXCircle, 
    FiEdit3, 
    FiTrash2, 
    FiShield, 
    FiFileText, 
    FiUser, 
    FiCalendar,
    FiAlertCircle,
    FiClock
} from 'react-icons/fi';

const ModerationCenter = () => {
    const { currentUser } = useContext(AuthContext);
    const [pendingPosts, setPendingPosts] = useState([]);
    const [pendingReports, setPendingReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'reports'

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [postsRes, reportsRes] = await Promise.all([
                moderationService.getPendingPosts(),
                moderationService.getPendingReports()
            ]);
            console.log("Moderation posts load response:", postsRes.data);
            setPendingPosts(postsRes.data || []);
            setPendingReports(reportsRes.data || []);
        } catch (error) {
            console.error("Error loading moderation data", error);
            if (error.response?.status === 403) {
                console.error("Access Forbidden! The backend is still blocking your role. Check if your username is exactly 'Manideep'.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (postId) => {
        try {
            await moderationService.approvePost(postId);
            setMessage("Post approved successfully! ✅");
            loadData();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage("Failed to approve post.");
        }
    };

    const handleReject = async (postId) => {
        const reason = prompt("Reason for rejection:");
        if (!reason) return;
        try {
            await moderationService.rejectPost(postId, reason);
            setMessage("Post rejected. ❌");
            loadData();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage("Failed to reject post.");
        }
    };

    const handleRequestEdit = async (postId) => {
        const reason = prompt("Notes for author (Edit Request):");
        if (!reason) return;
        try {
            await moderationService.requestEdit(postId, reason);
            setMessage("Edit request sent to author. 📝");
            loadData();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage("Failed to send edit request.");
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to permanently delete this pending post?")) return;
        try {
            await moderationService.deletePost(postId);
            setMessage("Post deleted permanently. 🗑️");
            loadData();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage("Failed to delete post.");
        }
    };

    const handleResolveReport = async (reportId, status) => {
        try {
            await moderationService.resolveReport(reportId, status);
            setMessage(`Report ${status.toLowerCase()}! ⚖️`);
            loadData();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage("Failed to resolve report.");
        }
    };

    if (!currentUser?.roles?.includes('ROLE_ADMIN') && !currentUser?.roles?.includes('ROLE_TRAINER') && currentUser?.username !== 'Manideep') {
        return (
            <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
                <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
                    <FiShield style={{ fontSize: '4rem', color: '#ef4444', marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Access Denied</h2>
                    <p style={{ color: 'var(--text-muted)' }}>You do not have permission to access the Moderation Center.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '120px', maxWidth: '1200px', paddingBottom: '100px' }}>
            <div style={{ marginBottom: '60px', textAlign: 'center' }}>
                <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '8px 16px', 
                    background: 'rgba(139, 92, 246, 0.1)', 
                    borderRadius: '30px',
                    color: 'var(--primary)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '20px',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                    <FiShield /> Admin Infrastructure
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '15px', letterSpacing: '-0.02em' }}>
                    Moderation <span style={{ color: 'var(--primary)' }}>Center</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Maintain high community standards by reviewing pending content and user reports.
                </p>
            </div>

            {message && (
                <div className="glass-card" style={{ padding: '20px', marginBottom: '30px', textAlign: 'center', border: '1px solid var(--primary)', background: 'rgba(16, 185, 129, 0.1)' }}>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>{message}</span>
                </div>
            )}

            <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                gap: '10px', 
                marginBottom: '50px', 
                background: 'rgba(255,255,255,0.03)',
                padding: '8px',
                borderRadius: '50px',
                border: '1px solid var(--glass-border)',
                width: 'fit-content',
                margin: '0 auto 50px auto'
            }}>
                <button 
                    onClick={() => setActiveTab('posts')}
                    style={{
                        padding: '12px 24px',
                        background: activeTab === 'posts' ? 'var(--primary)' : 'transparent',
                        border: 'none',
                        borderRadius: '40px',
                        color: activeTab === 'posts' ? '#fff' : 'var(--text-muted)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: activeTab === 'posts' ? '0 4px 15px rgba(139, 92, 246, 0.3)' : 'none'
                    }}
                >
                    <FiFileText size={18} /> Pending Posts 
                    <span style={{ 
                        background: activeTab === 'posts' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)', 
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        fontSize: '0.8rem' 
                    }}>
                        {pendingPosts.length}
                    </span>
                </button>
                <button 
                    onClick={() => setActiveTab('reports')}
                    style={{
                        padding: '12px 24px',
                        background: activeTab === 'reports' ? 'var(--primary)' : 'transparent',
                        border: 'none',
                        borderRadius: '40px',
                        color: activeTab === 'reports' ? '#fff' : 'var(--text-muted)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: activeTab === 'reports' ? '0 4px 15px rgba(139, 92, 246, 0.3)' : 'none'
                    }}
                >
                    <FiAlertCircle size={18} /> Reports 
                    <span style={{ 
                        background: activeTab === 'reports' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)', 
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        fontSize: '0.8rem' 
                    }}>
                        {pendingReports.length}
                    </span>
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <div className="loader" style={{ margin: '0 auto 20px' }}></div>
                    <p>Loading moderation queue...</p>
                </div>
            ) : (
                <div>
                    {activeTab === 'posts' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                            {pendingPosts.length === 0 ? (
                                <div className="glass-card" style={{ padding: '80px', textAlign: 'center', gridColumn: '1/-1' }}>
                                    <div style={{ 
                                        fontSize: '4rem', 
                                        marginBottom: '25px',
                                        background: 'var(--glass-border)',
                                        width: '100px',
                                        height: '100px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        margin: '0 auto 25px auto'
                                    }}>✨</div>
                                    <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Queue is Empty</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Great job! There are no pending posts to review at the moment.</p>
                                </div>
                            ) : (
                                pendingPosts.map(post => (
                                    <div key={post.id} className="glass-card" style={{ 
                                        padding: '40px', 
                                        margin: '0',
                                        width: '100%',
                                        maxWidth: '100%',
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        gap: '20px', 
                                        border: '1px solid var(--glass-border)',
                                        transition: 'transform 0.3s ease, border-color 0.3s ease',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{ 
                                            position: 'absolute', 
                                            top: '0', 
                                            left: '0', 
                                            width: '4px', 
                                            height: '100%', 
                                            background: 'var(--primary)' 
                                        }}></div>
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ 
                                                    padding: '6px 12px', 
                                                    background: 'rgba(139, 92, 246, 0.15)', 
                                                    borderRadius: '8px', 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: '700', 
                                                    color: 'var(--primary)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                }}>
                                                    {post.category}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '10px' }}>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <FiUser size={14} /> <b>{post.authorUsername}</b> 
                                                        <span style={{ 
                                                            fontSize: '0.75rem', 
                                                            background: 'var(--glass-border)', 
                                                            padding: '2px 6px', 
                                                            borderRadius: '4px' 
                                                        }}>{post.authorRole?.replace('ROLE_', '')}</span>
                                                    </span>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <FiCalendar size={14} /> {new Date(post.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <FiClock size={14} /> {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px' }}>
                                            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.8rem', fontWeight: '800', lineHeight: '1.2' }}>{post.title}</h3>
                                            <p style={{ margin: 0, color: 'var(--text-main)', opacity: 0.9, fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{post.content}</p>
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '10px' }}>
                                            <button 
                                                onClick={() => handleApprove(post.id)} 
                                                className="btn-primary" 
                                                style={{ 
                                                    width: 'auto', 
                                                    padding: '12px 25px', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '10px',
                                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)',
                                                    borderRadius: '12px'
                                                }}
                                            >
                                                <FiCheckCircle size={18} /> Approve
                                            </button>
                                            <button 
                                                onClick={() => handleRequestEdit(post.id)} 
                                                style={{ 
                                                    width: 'auto', 
                                                    padding: '12px 25px', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '10px',
                                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    borderRadius: '12px',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.2)'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                            >
                                                <FiEdit3 size={18} /> Request Edit
                                            </button>
                                            <button 
                                                onClick={() => handleReject(post.id)} 
                                                style={{ 
                                                    width: 'auto', 
                                                    padding: '12px 25px', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '10px',
                                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    borderRadius: '12px',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                            >
                                                <FiXCircle size={18} /> Reject
                                            </button>
                                            <button 
                                                onClick={() => handleDeletePost(post.id)} 
                                                style={{ 
                                                    width: 'auto', 
                                                    padding: '12px 25px', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '10px',
                                                    background: 'rgba(239, 68, 68, 0.05)',
                                                    color: '#ef4444',
                                                    border: '1.5px solid rgba(239, 68, 68, 0.3)',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    borderRadius: '12px',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                    e.currentTarget.style.borderColor = '#ef4444';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                                                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                                                }}
                                            >
                                                <FiTrash2 size={18} /> Delete Permanently
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                            {pendingReports.length === 0 ? (
                                <div className="glass-card" style={{ padding: '80px', textAlign: 'center', gridColumn: '1/-1' }}>
                                    <div style={{ 
                                        fontSize: '4rem', 
                                        marginBottom: '25px',
                                        background: 'rgba(239, 68, 68, 0.05)',
                                        width: '100px',
                                        height: '100px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        margin: '0 auto 25px auto'
                                    }}>🛡️</div>
                                    <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>No Active Reports</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Great job! The community is safe and there are no active reports to resolve.</p>
                                </div>
                            ) : (
                                pendingReports.map(report => (
                                    <div key={report.id} className="glass-card" style={{ 
                                        padding: '40px', 
                                        margin: '0',
                                        width: '100%',
                                        maxWidth: '100%',
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        gap: '20px', 
                                        border: '1px solid var(--glass-border)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{ 
                                            position: 'absolute', 
                                            top: '0', 
                                            left: '0', 
                                            width: '4px', 
                                            height: '100%', 
                                            background: '#ef4444' 
                                        }}></div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                                                <span style={{ 
                                                    padding: '6px 12px', 
                                                    background: 'rgba(239, 68, 68, 0.1)', 
                                                    borderRadius: '8px', 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: '700', 
                                                    color: '#ef4444', 
                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                }}>
                                                    {report.contentType} REPORT
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '10px' }}>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <FiAlertCircle size={14} /> flagged by <b>User ID: {report.reporterId}</b>
                                                    </span>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <FiCalendar size={14} /> {new Date(report.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px' }}>
                                            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)' }}>Reason: {report.reason}</h4>
                                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <FiShield size={14} /> Content ID: <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>{report.contentId}</span>
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                            <button 
                                                onClick={() => handleResolveReport(report.id, 'RESOLVED')} 
                                                style={{ 
                                                    width: 'auto', 
                                                    padding: '12px 25px', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '10px',
                                                    background: 'var(--primary)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    borderRadius: '12px',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.2)'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                            >
                                                <FiCheckCircle size={18} /> Resolve
                                            </button>
                                            <button 
                                                onClick={() => handleResolveReport(report.id, 'IGNORED')} 
                                                style={{ 
                                                    width: 'auto', 
                                                    padding: '12px 25px', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '10px',
                                                    background: 'var(--glass-border)',
                                                    color: 'var(--text-main)',
                                                    border: '1.5px solid var(--glass-border)',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    borderRadius: '12px',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                                                }}
                                            >
                                                <FiXCircle size={18} /> Ignore Report
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ModerationCenter;
