import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight, CreditCard, Bell, Star, CheckCircle, Search, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';

const CustomerDashboard = () => {
    const { userData, currentUser } = useAuth();
    const [stats, setStats] = useState([
        { label: 'Total Bookings', value: '0', color: 'var(--primary-600)' },
        { label: 'Upcoming', value: '0', color: 'var(--accent-orange)' },
        { label: 'Completed', value: '0', color: 'var(--success)' },
    ]);
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentUser) return;

            try {
                const bookingsRef = collection(db, 'bookings');
                const q = query(bookingsRef, where('userId', '==', currentUser.uid));
                const snapshot = await getDocs(q);

                // Map and sort all bookings in memory
                const allBookings = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => {
                        const timeA = a.createdAt?.seconds || 0;
                        const timeB = b.createdAt?.seconds || 0;
                        return timeB - timeA;
                    });

                // Calculate stats based on real status values
                const total = allBookings.length;
                const upcoming = allBookings.filter(b => b.status === 'upcoming' || b.status === 'pending').length;
                const completed = allBookings.filter(b => b.status === 'completed').length;

                setStats([
                    { label: 'Total Bookings', value: total.toString(), color: 'var(--primary-600)' },
                    { label: 'Upcoming', value: upcoming.toString(), color: 'var(--accent-orange)' },
                    { label: 'Completed', value: completed.toString(), color: 'var(--success)' },
                ]);

                const filteredUpcoming = allBookings
                    .filter(b => b.status === 'upcoming' || b.status === 'pending')
                    .slice(0, 3);
                setUpcomingBookings(filteredUpcoming);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUser]);

    const quickActions = [
        { icon: Calendar, label: 'Book Service', link: '/customer/book-service' },
        { icon: Clock, label: 'My Bookings', link: '/customer/bookings' },
        { icon: MapPin, label: 'Addresses', link: '/customer/addresses' },
        { icon: CreditCard, label: 'Payments', link: '/customer/payments' },
    ];

    return (
        <div className="dashboard-page">
            <div className="welcome-section">
                <div>
                    <h1>Welcome back, {userData?.fullName?.split(' ')[0] || 'User'}!</h1>
                    <p>Here's what's happening with your account</p>
                </div>
                <Link to="/customer/book-service" className="btn btn-primary">
                    Book a Service <ArrowRight size={18} />
                </Link>
            </div>

            <div className="stats-row">
                {stats.map((stat, idx) => (
                    <div key={idx} className="card stat-card">
                        <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="main-content">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Upcoming Bookings</h3>
                            <Link to="/customer/bookings" className="btn btn-ghost btn-sm">View All</Link>
                        </div>
                        <div className="bookings-list">
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={32} className="animate-spin" /></div>
                            ) : upcomingBookings.length > 0 ? (
                                upcomingBookings.map(booking => (
                                    <Link key={booking.id} to={`/customer/bookings/${booking.id}`} className="booking-item">
                                        <div className="booking-icon-placeholder">
                                            <Calendar size={24} />
                                        </div>
                                        <div className="booking-info">
                                            <h4>{booking.serviceName}</h4>
                                            <div className="booking-meta">
                                                <span><Calendar size={14} /> {booking.date}</span>
                                                <span><Clock size={14} /> {booking.time}</span>
                                            </div>
                                        </div>
                                        <span className={`badge ${booking.status === 'upcoming' ? 'badge-success' : 'badge-warning'}`}>
                                            {booking.status}
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon"><Calendar size={48} /></div>
                                    <p>No upcoming bookings found.</p>
                                    <Link to="/customer/book-service" className="btn btn-primary btn-sm">Book Your First Service</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="sidebar-content">
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Quick Actions</h3>
                        <div className="quick-actions">
                            {quickActions.map((action, idx) => (
                                <Link key={idx} to={action.link} className="quick-action">
                                    <action.icon size={20} />
                                    <span>{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Account Status</h3>
                        <div className="status-item">
                            <CheckCircle size={18} color="var(--success)" />
                            <span>Email Verified</span>
                        </div>
                        {userData?.phone && (
                            <div className="status-item">
                                <CheckCircle size={18} color="var(--success)" />
                                <span>Phone Linked</span>
                            </div>
                        )}
                        {!userData?.address && (
                            <Link to="/customer/profile" className="status-item warning">
                                <ArrowRight size={18} />
                                <span>Complete Profile</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        .dashboard-page { max-width: 1200px; margin: 0 auto; }
        .welcome-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8); }
        .welcome-section h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .welcome-section p { color: var(--gray-500); }
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); margin-bottom: var(--space-8); }
        .stat-card { text-align: center; padding: var(--space-6); }
        .stat-value { font-size: var(--text-4xl); font-weight: var(--font-bold); margin-bottom: var(--space-1); }
        .stat-label { color: var(--gray-500); }
        .dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-6); }
        .bookings-list { display: flex; flex-direction: column; gap: var(--space-4); }
        .booking-item { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius-lg); }
        .booking-item:hover { background: var(--gray-100); }
        .booking-icon-placeholder { width: 48px; height: 48px; background: var(--primary-50); color: var(--primary-600); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; }
        .booking-info { flex: 1; }
        .booking-info h4 { font-size: var(--text-base); margin-bottom: var(--space-1); }
        .booking-meta { display: flex; gap: var(--space-4); font-size: var(--text-sm); color: var(--gray-500); }
        .booking-meta span { display: flex; align-items: center; gap: var(--space-1); }
        .sidebar-content { display: flex; flex-direction: column; gap: var(--space-6); }
        .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
        .quick-action { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius-lg); font-size: var(--text-sm); font-weight: var(--font-medium); color: var(--gray-700); }
        .quick-action:hover { background: var(--primary-50); color: var(--primary-600); }
        .status-item { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) 0; font-size: var(--text-sm); color: var(--gray-600); }
        .status-item.warning { color: var(--primary-600); font-weight: var(--font-medium); }
        .empty-state { text-align: center; padding: var(--space-12); background: var(--gray-50); border-radius: var(--radius-xl); border: 2px dashed var(--gray-200); }
        .empty-icon { color: var(--gray-300); margin-bottom: var(--space-4); display: flex; justify-content: center; }
        .empty-state p { color: var(--gray-500); margin-bottom: var(--space-6); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr; } }
        @media (max-width: 768px) { .stats-row { grid-template-columns: 1fr; } .welcome-section { flex-direction: column; gap: var(--space-4); text-align: center; } }
      `}</style>
        </div>
    );
};

export default CustomerDashboard;
