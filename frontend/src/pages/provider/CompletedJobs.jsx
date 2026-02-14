import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, Search, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

const CompletedJobs = () => {
    const { currentUser } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompletedJobs = async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
                const q = query(
                    collection(db, 'bookings'),
                    where('providerId', '==', currentUser.uid),
                    where('status', '==', 'completed')
                );
                const snapshot = await getDocs(q);
                const fetchedJobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Sort client-side to avoid compound index requirement
                fetchedJobs.sort((a, b) => {
                    const timeA = a.createdAt?.seconds || 0;
                    const timeB = b.createdAt?.seconds || 0;
                    return timeB - timeA;
                });
                setJobs(fetchedJobs);
            } catch (error) {
                console.error("Error fetching completed jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompletedJobs();
    }, [currentUser]);

    return (
        <div className="completed-jobs-page">
            <div className="page-header"><h1>Completed Jobs</h1><p>View your past work and history</p></div>

            <div className="jobs-list">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={40} /></div>
                ) : jobs.map(job => (
                    <div key={job.id} className="card job-card">
                        <div className="job-main">
                            <div className="job-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}><CheckCircle size={24} /></div>
                            <div className="job-details">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h3>{job.serviceName}</h3>
                                    <span className="badge badge-success">Completed</span>
                                </div>
                                <p className="customer">{job.customerName}</p>
                                <div className="job-meta">
                                    <span><Calendar size={14} /> {job.date}</span>
                                    <span><Clock size={14} /> {job.time}</span>
                                    <span><MapPin size={14} /> {job.address}</span>
                                </div>
                            </div>
                            <div className="job-price">${job.price}</div>
                        </div>
                    </div>
                ))}
                {!loading && jobs.length === 0 && (
                    <div className="empty-state">
                        <p>No completed jobs yet. Keep working!</p>
                        <Link to="/provider" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Back to Dashboard</Link>
                    </div>
                )}
            </div>

            <style>{`
        .completed-jobs-page { max-width: 900px; margin: 0 auto; }
        .page-header { margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .jobs-list { display: flex; flex-direction: column; gap: var(--space-4); }
        .job-card { padding: var(--space-4); border-left: 4px solid var(--success); }
        .job-main { display: flex; align-items: center; gap: var(--space-4); }
        .job-icon { width: 48px; height: 48px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; }
        .job-details { flex: 1; }
        .job-details h3 { font-size: var(--text-lg); margin-bottom: var(--space-1); }
        .job-details .customer { color: var(--gray-600); margin-bottom: var(--space-2); font-size: var(--text-sm); }
        .job-meta { display: flex; flex-wrap: wrap; gap: var(--space-4); font-size: var(--text-sm); color: var(--gray-500); }
        .job-meta span { display: flex; align-items: center; gap: var(--space-1); }
        .job-price { font-size: var(--text-xl); font-weight: var(--font-bold); color: var(--gray-900); padding: 0 var(--space-4); }
        .empty-state { text-align: center; padding: var(--space-12); color: var(--gray-500); background: var(--gray-50); border-radius: var(--radius-xl); border: 2px dashed var(--gray-200); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default CompletedJobs;
