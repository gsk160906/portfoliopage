import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, DollarSign, Check, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

const JobRequests = () => {
    const { currentUser, userData } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchRequests = async () => {
        if (!currentUser || !userData) return; // Wait for both
        setLoading(true);
        try {
            // 1. Fetch pending bookings locally (avoiding complex index requirements)
            const bookingsRef = collection(db, 'bookings');
            const q = query(
                bookingsRef,
                where('status', '==', 'pending')
            );
            const snapshot = await getDocs(q);

            // 2. Map and sort in memory by createdAt
            const allPending = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => {
                    const timeA = a.createdAt?.seconds || 0;
                    const timeB = b.createdAt?.seconds || 0;
                    return timeB - timeA;
                });

            // 3. Filter logic:
            // - Job is assigned specifically to THIS provider
            // - OR Job is open (providerId is null) AND provider offers this service
            const providerServices = userData?.services || [];

            const filtered = allPending.filter(req => {
                const isAssignedToMe = req.providerId === currentUser.uid;
                const isOpenMarketplace = req.providerId === null && providerServices.includes(req.serviceName);
                return isAssignedToMe || isOpenMarketplace;
            });

            setRequests(filtered);
        } catch (error) {
            console.error("Error fetching job requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [currentUser, userData]);

    const handleAccept = async (jobId) => {
        if (!currentUser) return;
        setActionLoading(jobId);
        try {
            const jobRef = doc(db, 'bookings', jobId);
            await updateDoc(jobRef, {
                status: 'upcoming',
                providerId: currentUser.uid,
                providerName: userData?.fullName || 'Provider'
            });
            // Refresh list
            setRequests(requests.filter(r => r.id !== jobId));
            alert("Job accepted successfully! You can find it in 'Active Jobs'.");
        } catch (error) {
            console.error("Error accepting job:", error);
            alert("Failed to accept job.");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="job-requests-page">
            <div className="page-header"><h1>Job Requests</h1><p>Review and accept new job requests</p></div>

            <div className="requests-list">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={40} /></div>
                ) : requests.map(req => (
                    <div key={req.id} className="card request-card">
                        <div className="request-main">
                            <div className="request-info">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h3>{req.serviceName}</h3>
                                    <span className="badge badge-warning">NEW</span>
                                </div>
                                <p className="customer">Customer: {req.customerName}</p>
                                <div className="request-meta">
                                    <span><Calendar size={14} /> {req.date}</span>
                                    <span><Clock size={14} /> {req.time}</span>
                                    <span><MapPin size={14} /> {req.address}</span>
                                </div>
                            </div>
                            <div className="request-amount"><DollarSign size={16} />{req.price}</div>
                        </div>
                        <div className="request-actions">
                            <Link to={`/provider/jobs/${req.id}`} className="btn btn-ghost btn-sm">View Details</Link>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleAccept(req.id)}
                                disabled={actionLoading === req.id}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                {actionLoading === req.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                Accept Job
                            </button>
                        </div>
                    </div>
                ))}
                {!loading && requests.length === 0 && (
                    <div className="empty-state">
                        <X size={48} style={{ margin: '0 auto var(--space-4)', color: 'var(--gray-300)' }} />
                        <p>No pending job requests at the moment. Check back later!</p>
                    </div>
                )}
            </div>

            <style>{`
        .job-requests-page { max-width: 900px; margin: 0 auto; }
        .page-header { margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .requests-list { display: flex; flex-direction: column; gap: var(--space-4); }
        .request-card { border-left: 4px solid var(--accent-orange); transition: 0.2s; }
        .request-card:hover { transform: translateX(5px); }
        .request-main { display: flex; justify-content: space-between; margin-bottom: var(--space-4); }
        .request-info h3 { font-size: var(--text-lg); margin-bottom: var(--space-1); }
        .request-info .customer { color: var(--gray-600); margin-bottom: var(--space-2); font-size: var(--text-sm); }
        .request-meta { display: flex; flex-wrap: wrap; gap: var(--space-4); font-size: var(--text-sm); color: var(--gray-500); }
        .request-meta span { display: flex; align-items: center; gap: var(--space-1); }
        .request-amount { display: flex; align-items: center; font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--primary-600); }
        .request-actions { display: flex; gap: var(--space-3); justify-content: flex-end; padding-top: var(--space-4); border-top: 1px solid var(--gray-100); }
        .empty-state { text-align: center; padding: var(--space-12); color: var(--gray-500); background: var(--gray-50); border-radius: var(--radius-xl); border: 2px dashed var(--gray-200); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .request-main { flex-direction: column; gap: var(--space-3); } .request-actions { flex-wrap: wrap; } }
      `}</style>
        </div>
    );
};

export default JobRequests;
