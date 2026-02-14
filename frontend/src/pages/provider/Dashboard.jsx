import { Link } from 'react-router-dom';
import { DollarSign, Briefcase, Star, Clock, ArrowRight, TrendingUp, CheckCircle, Calendar, Loader2, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const ProviderDashboard = () => {
    const { userData, currentUser } = useAuth();
    const [stats, setStats] = useState([
        { label: 'Total Earnings', value: '$0', icon: DollarSign, color: 'var(--success)' },
        { label: 'Active Jobs', value: '0', icon: Briefcase, color: 'var(--primary-600)' },
        { label: 'Completed', value: '0', icon: CheckCircle, color: 'var(--accent-cyan)' },
        { label: 'Rating', value: '4.8', icon: Star, color: 'var(--accent-yellow)' },
    ]);
    const [upcomingJobs, setUpcomingJobs] = useState([]);
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentUser) return;
            try {
                const bookingsRef = collection(db, 'bookings');

                // 1. Fetch Jobs Assigned to this Provider
                const assignedQ = query(bookingsRef, where('providerId', '==', currentUser.uid));
                const assignedSnapshot = await getDocs(assignedQ);
                const assignedJobs = assignedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const completed = assignedJobs.filter(j => j.status === 'completed');
                const active = assignedJobs.filter(j => j.status === 'upcoming' || j.status === 'in-progress');
                const totalEarnings = completed.reduce((sum, j) => sum + (j.price || 0), 0);

                setStats([
                    { label: 'Total Earnings', value: `$${totalEarnings}`, icon: DollarSign, color: 'var(--success)' },
                    { label: 'Active Jobs', value: active.length.toString(), icon: Briefcase, color: 'var(--primary-600)' },
                    { label: 'Completed', value: completed.length.toString(), icon: CheckCircle, color: 'var(--accent-cyan)' },
                    { label: 'Rating', value: userData?.rating || 'New', icon: Star, color: 'var(--accent-yellow)' },
                ]);

                // 2. Fetch Upcoming Jobs (Assigned)
                const upcoming = assignedJobs
                    .filter(j => j.status === 'upcoming' || j.status === 'pending-provider') // pending-provider is when they accepted but customer hasn't confirmed maybe? or just upcoming
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 3);
                setUpcomingJobs(upcoming);

                // 3. Fetch Pending Requests (Directly assigned OR open marketplace matching services)
                const pendingQ = query(bookingsRef, where('status', '==', 'pending'));
                const pendingSnapshot = await getDocs(pendingQ);
                const allPending = pendingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const myServices = userData?.services || [];
                const myPendingCount = allPending.filter(req => {
                    const isAssignedToMe = req.providerId === currentUser.uid;
                    const isOpenMarketplace = req.providerId === null && myServices.includes(req.serviceName);
                    return isAssignedToMe || isOpenMarketplace;
                }).length;

                setPendingRequestsCount(myPendingCount);

                // 4. Self-Healing: Verify Rating Consistency
                const reviewsQ = query(collection(db, 'reviews'), where('providerId', '==', currentUser.uid));
                const reviewsSnapshot = await getDocs(reviewsQ);
                const reviews = reviewsSnapshot.docs.map(d => d.data());

                const totalRating = reviews.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
                const realAvg = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
                const realCount = reviews.length;

                // Update state to show real data immediately
                setStats(prev => prev.map(s => {
                    if (s.label === 'Rating') return { ...s, value: realAvg || 'New' };
                    return s;
                }));

                // If DB is out of sync, update it
                const currentStoredRating = userData?.rating || 0;
                const currentStoredCount = userData?.reviewCount || 0;

                if (Math.abs(parseFloat(realAvg) - parseFloat(currentStoredRating)) > 0.05 || realCount !== currentStoredCount) {
                    console.log("Fixing inconsistent rating data...", { old: currentStoredRating, new: realAvg });
                    await updateDoc(doc(db, 'users', currentUser.uid), {
                        rating: parseFloat(realAvg),
                        reviewCount: realCount
                    });
                }


            } catch (error) {
                console.error("Error fetching provider dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUser, userData]);

    return (
        <div className="dashboard-page">
            <div className="welcome-section">
                <div>
                    <h1>Welcome back, {userData?.fullName?.split(' ')[0] || 'Provider'}!</h1>
                    <p>Here's your business overview</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Link to="/provider/job-requests" className="btn btn-primary">
                        View Job Requests <ArrowRight size={18} />
                    </Link>
                    {pendingRequestsCount > 0 && (
                        <span className="badge-notification">{pendingRequestsCount}</span>
                    )}
                </div>
            </div>

            <div className="stats-grid">
                {stats.map((stat, idx) => (
                    <div key={idx} className="card stat-card">
                        <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}><stat.icon size={24} /></div>
                        <div className="stat-info"><div className="stat-value">{stat.value}</div><div className="stat-label">{stat.label}</div></div>
                    </div>
                ))}
            </div>

            <div className="quick-actions-section" style={{ marginBottom: 'var(--space-8)' }}>
                <h3>Quick Actions</h3>
                <div className="actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
                    <Link to="/provider/services" className="card action-card">
                        <div className="action-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}><Settings size={24} /></div>
                        <div className="action-info">
                            <h4>Manage Services</h4>
                            <p>Add or remove your service offerings</p>
                        </div>
                        <ArrowRight size={18} />
                    </Link>
                    <Link to="/provider/availability" className="card action-card">
                        <div className="action-icon" style={{ background: 'var(--accent-orange-light)', color: 'var(--accent-orange)' }}><Calendar size={24} /></div>
                        <div className="action-info">
                            <h4>Availability</h4>
                            <p>Set your working hours & days</p>
                        </div>
                        <ArrowRight size={18} />
                    </Link>
                    <Link to="/provider/earnings" className="card action-card">
                        <div className="action-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}><DollarSign size={24} /></div>
                        <div className="action-info">
                            <h4>Earnings Report</h4>
                            <p>View detailed revenue analytics</p>
                        </div>
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">My Upcoming Jobs</h3>
                        <Link to="/provider/active-jobs" className="btn btn-ghost btn-sm">View All</Link>
                    </div>
                    <div className="jobs-list">
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={32} className="animate-spin" /></div>
                        ) : upcomingJobs.length > 0 ? (
                            upcomingJobs.map(job => (
                                <Link key={job.id} to={`/provider/jobs/${job.id}`} className="job-item">
                                    <div className="job-info">
                                        <h4>{job.serviceName}</h4>
                                        <p>{job.customerName}</p>
                                        <div className="job-meta"><Calendar size={14} /> {job.date}, {job.time}</div>
                                    </div>
                                    <div className="job-end">
                                        <span className={`badge ${job.status === 'upcoming' ? 'badge-info' : 'badge-warning'}`}>{job.status}</span>
                                        <span className="amount">${job.price}</span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="empty-state-small">
                                <p>No upcoming jobs assigned yet.</p>
                                <Link to="/provider/job-requests" className="btn btn-link btn-sm">Browse job requests</Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Performance Overview</h3>
                    <div className="earnings-chart">
                        <div className="chart-placeholder">
                            <TrendingUp size={48} />
                            <p>${stats[0].value.replace('$', '')} Total Earned</p>
                            <span className="badge badge-info">Level 1 Provider</span>
                        </div>
                        <div className="performance-metrics" style={{ marginTop: '2rem' }}>
                            <div className="metric">
                                <span>Completion Rate</span>
                                <div className="progress-bar"><div className="progress" style={{ width: '95%' }}></div></div>
                                <span>95%</span>
                            </div>
                            <div className="metric">
                                <span>Response Time</span>
                                <div className="progress-bar"><div className="progress" style={{ width: '80%', background: 'var(--accent-orange)' }}></div></div>
                                <span>Fast</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .dashboard-page { max-width: 1200px; margin: 0 auto; }
        .welcome-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8); }
        .welcome-section h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .welcome-section p { color: var(--gray-500); }
        .badge-notification { position: absolute; top: -8px; right: -8px; background: var(--error); color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: var(--shadow-sm); }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-6); margin-bottom: var(--space-8); }
        .stat-card { display: flex; align-items: center; gap: var(--space-4); }
        .stat-icon { width: 56px; height: 56px; border-radius: var(--radius-xl); display: flex; align-items: center; justify-content: center; }
        .stat-value { font-size: var(--text-2xl); font-weight: var(--font-bold); }
        .stat-label { font-size: var(--text-sm); color: var(--gray-500); }
        
        .action-card { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-5); text-decoration: none; color: inherit; transition: 0.2s; border: 1px solid var(--gray-100); }
        .action-card:hover { transform: translateY(-3px); border-color: var(--primary-300); box-shadow: var(--shadow-md); }
        .action-icon { width: 48px; height: 48px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; }
        .action-info { flex: 1; }
        .action-info h4 { font-size: var(--text-base); margin-bottom: 2px; }
        .action-info p { font-size: var(--text-xs); color: var(--gray-500); }
        .action-card svg:last-child { color: var(--gray-300); transition: 0.2s; }
        .action-card:hover svg:last-child { color: var(--primary-600); transform: translateX(3px); }

        .dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-6); }
        .jobs-list { display: flex; flex-direction: column; gap: var(--space-3); }
        .job-item { display: flex; justify-content: space-between; align-items: center; padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius-lg); text-decoration: none; color: inherit; }
        .job-item:hover { background: var(--gray-100); }
        .job-info h4 { font-size: var(--text-base); margin-bottom: var(--space-1); }
        .job-info p { font-size: var(--text-sm); color: var(--gray-500); margin-bottom: var(--space-1); }
        .job-meta { font-size: var(--text-sm); color: var(--gray-400); display: flex; align-items: center; gap: var(--space-1); }
        .job-end { text-align: right; }
        .job-end .amount { display: block; font-size: var(--text-lg); font-weight: var(--font-bold); color: var(--primary-600); margin-top: var(--space-2); }
        .earnings-chart { padding: var(--space-4); }
        .chart-placeholder { text-align: center; color: var(--gray-400); }
        .chart-placeholder p { font-size: var(--text-xl); font-weight: var(--font-bold); color: var(--gray-900); margin: var(--space-4) 0 var(--space-2); }
        .performance-metrics { display: flex; flex-direction: column; gap: var(--space-4); }
        .metric { display: flex; align-items: center; gap: var(--space-3); font-size: var(--text-xs); color: var(--gray-600); }
        .metric span:first-child { width: 100px; }
        .progress-bar { flex: 1; height: 6px; background: var(--gray-100); border-radius: 3px; overflow: hidden; }
        .progress { height: 100%; background: var(--success); border-radius: 3px; }
        .empty-state-small { text-align: center; padding: var(--space-8); color: var(--gray-500); background: var(--gray-50); border-radius: var(--radius-lg); border: 2px dashed var(--gray-200); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .dashboard-grid { grid-template-columns: 1fr; } }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: 1fr; } .welcome-section { flex-direction: column; gap: var(--space-4); text-align: center; } }
      `}</style>
        </div>
    );
};

export default ProviderDashboard;
