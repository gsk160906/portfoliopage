import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Search, ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

const ActiveJobs = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('all');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
                const bookingsRef = collection(db, 'bookings');
                const q = query(
                    bookingsRef,
                    where('providerId', '==', currentUser.uid)
                );
                const snapshot = await getDocs(q);

                // Sort in memory and filter by status
                const jobList = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => {
                        const timeA = a.createdAt?.seconds || 0;
                        const timeB = b.createdAt?.seconds || 0;
                        return timeB - timeA;
                    })
                    .filter(j => j.status === 'upcoming' || j.status === 'in-progress');

                setJobs(jobList);
            } catch (error) {
                console.error("Error fetching active jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [currentUser]);

    const filteredJobs = activeTab === 'all' ? jobs : jobs.filter(j => j.status === activeTab);

    return (
        <div className="active-jobs-page">
            <div className="page-header"><h1>Active Jobs</h1><p>Manage your current and upcoming service bookings</p></div>

            <div className="toolbar">
                <div className="tabs">
                    <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Jobs ({jobs.length})</button>
                    <button className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>Upcoming</button>
                    <button className={`tab ${activeTab === 'in-progress' ? 'active' : ''}`} onClick={() => setActiveTab('in-progress')}>In Progress</button>
                </div>
            </div>

            <div className="jobs-list">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={40} /></div>
                ) : filteredJobs.map(job => (
                    <Link key={job.id} to={`/provider/jobs/${job.id}`} className="card job-card">
                        <div className="job-main">
                            <div className="job-icon"><Clock size={24} /></div>
                            <div className="job-details">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h3>{job.serviceName}</h3>
                                    <span className={`badge ${job.status === 'upcoming' ? 'badge-info' : 'badge-warning'}`}>
                                        {job.status}
                                    </span>
                                </div>
                                <p className="customer">{job.customerName}</p>
                                <div className="job-meta">
                                    <span><Calendar size={14} /> {job.date}</span>
                                    <span><Clock size={14} /> {job.time}</span>
                                    <span><MapPin size={14} /> {job.address}</span>
                                </div>
                            </div>
                            <div className="job-price">${job.price}</div>
                            <div className="job-action"><ChevronRight size={24} /></div>
                        </div>
                    </Link>
                ))}
                {!loading && filteredJobs.length === 0 && (
                    <div className="empty-state">
                        <p>No {activeTab !== 'all' ? activeTab : ''} active jobs found.</p>
                        {activeTab !== 'all' ? (
                            <button className="btn btn-link" onClick={() => setActiveTab('all')}>View all active jobs</button>
                        ) : (
                            <Link to="/provider/job-requests" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Browse Job Requests</Link>
                        )}
                    </div>
                )}
            </div>

            <style>{`
        .active-jobs-page { max-width: 900px; margin: 0 auto; }
        .page-header { margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .toolbar { margin-bottom: var(--space-6); }
        .tabs { display: flex; gap: var(--space-2); }
        .tab { padding: var(--space-2) var(--space-4); border-radius: var(--radius-full); background: white; border: 1px solid var(--gray-200); cursor: pointer; color: var(--gray-600); transition: 0.2s; }
        .tab.active { background: var(--primary-600); border-color: var(--primary-600); color: white; }
        .jobs-list { display: flex; flex-direction: column; gap: var(--space-4); }
        .job-card { padding: var(--space-4); text-decoration: none; color: inherit; transition: 0.2s; }
        .job-card:hover { transform: translateX(5px); border-color: var(--primary-200); }
        .job-main { display: flex; align-items: center; gap: var(--space-4); }
        .job-icon { width: 48px; height: 48px; border-radius: var(--radius-lg); background: var(--primary-50); color: var(--primary-600); display: flex; align-items: center; justify-content: center; }
        .job-details { flex: 1; }
        .job-details h3 { font-size: var(--text-lg); margin-bottom: var(--space-1); }
        .job-details .customer { color: var(--gray-600); margin-bottom: var(--space-2); font-size: var(--text-sm); }
        .job-meta { display: flex; flex-wrap: wrap; gap: var(--space-4); font-size: var(--text-sm); color: var(--gray-500); }
        .job-meta span { display: flex; align-items: center; gap: var(--space-1); }
        .job-price { font-size: var(--text-xl); font-weight: var(--font-bold); color: var(--primary-600); padding: 0 var(--space-4); }
        .job-action { color: var(--gray-300); }
        .empty-state { text-align: center; padding: var(--space-12); color: var(--gray-500); background: var(--gray-50); border-radius: var(--radius-xl); border: 2px dashed var(--gray-200); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .job-main { flex-wrap: wrap; } .job-price { width: 100%; text-align: right; padding-top: var(--space-2); } }
      `}</style>
        </div>
    );
};

export default ActiveJobs;
