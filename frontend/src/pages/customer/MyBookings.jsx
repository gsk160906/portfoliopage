import { Link } from 'react-router-dom';
import { Calendar, Clock, Filter, Search, CalendarDays, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

const MyBookings = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('all');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
                // Fetch all user bookings without index-dependent orderBy
                const q = query(
                    collection(db, 'bookings'),
                    where('userId', '==', currentUser.uid)
                );
                const snapshot = await getDocs(q);

                // Sort in memory by createdAt
                const sortedBookings = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => {
                        const timeA = a.createdAt?.seconds || 0;
                        const timeB = b.createdAt?.seconds || 0;
                        return timeB - timeA;
                    });

                setBookings(sortedBookings);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [currentUser]);

    const tabs = ['all', 'upcoming', 'pending', 'completed', 'cancelled'];
    const filteredBookings = activeTab === 'all'
        ? bookings
        : bookings.filter(b => {
            if (activeTab === 'upcoming') return b.status === 'upcoming' || b.status === 'pending';
            return b.status === activeTab;
        });

    const statusColors = {
        upcoming: 'badge-info',
        pending: 'badge-warning',
        completed: 'badge-success',
        cancelled: 'badge-error'
    };

    return (
        <div className="my-bookings-page">
            <div className="page-header"><h1>My Bookings</h1><p>View and manage your service bookings</p></div>

            <div className="toolbar">
                <div className="tabs">
                    {tabs.map(tab => (
                        <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bookings-list">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={40} /></div>
                ) : filteredBookings.map(booking => (
                    <Link key={booking.id} to={`/customer/bookings/${booking.id}`} className="card booking-card">
                        <div className="booking-image-wrapper">
                            {booking.serviceImage ? (
                                <img src={booking.serviceImage} alt={booking.serviceName} />
                            ) : (
                                <div className="booking-placeholder"><Calendar size={32} /></div>
                            )}
                        </div>
                        <div className="booking-info">
                            <h3>{booking.serviceName}</h3>
                            <p>Provider: {booking.providerName || 'To be assigned'}</p>
                            <div className="booking-meta">
                                <span><Calendar size={14} /> {booking.date}</span>
                                <span><Clock size={14} /> {booking.time}</span>
                            </div>
                        </div>
                        <div className="booking-end">
                            <span className={`badge ${statusColors[booking.status] || 'badge-warning'}`}>{booking.status}</span>
                            <span className="price">${booking.total}</span>
                        </div>
                    </Link>
                ))}
                {!loading && filteredBookings.length === 0 && (
                    <div className="empty-state-card" style={{ textAlign: 'center', padding: 'var(--space-12)', background: 'var(--gray-50)', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--gray-200)' }}>
                        <CalendarDays size={48} style={{ margin: '0 auto var(--space-4)', color: 'var(--gray-300)' }} />
                        <p style={{ color: 'var(--gray-500)' }}>No {activeTab !== 'all' ? activeTab : ''} bookings found.</p>
                        <Link to="/customer/book-service" className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-4)' }}>Book a Service</Link>
                    </div>
                )}
            </div>

            <style>{`
        .my-bookings-page { max-width: 900px; margin: 0 auto; }
        .page-header { margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .toolbar { margin-bottom: var(--space-6); overflow-x: auto; padding-bottom: var(--space-2); }
        .tabs { display: flex; gap: var(--space-2); min-width: max-content; }
        .tab { padding: var(--space-2) var(--space-4); border-radius: var(--radius-full); background: white; border: 1px solid var(--gray-200); cursor: pointer; color: var(--gray-600); transition: 0.2s; white-space: nowrap; }
        .tab.active { background: var(--primary-600); border-color: var(--primary-600); color: white; }
        .bookings-list { display: flex; flex-direction: column; gap: var(--space-4); }
        .booking-card { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4); text-decoration: none; color: inherit; }
        .booking-image-wrapper { width: 80px; height: 80px; border-radius: var(--radius-lg); overflow: hidden; }
        .booking-card img { width: 100%; height: 100%; object-fit: cover; }
        .booking-placeholder { width: 100%; height: 100%; background: var(--gray-100); display: flex; align-items: center; justify-content: center; color: var(--gray-400); }
        .booking-info { flex: 1; }
        .booking-info h3 { font-size: var(--text-lg); margin-bottom: var(--space-1); }
        .booking-info p { font-size: var(--text-sm); color: var(--gray-500); margin-bottom: var(--space-2); }
        .booking-meta { display: flex; gap: var(--space-4); font-size: var(--text-sm); color: var(--gray-500); }
        .booking-meta span { display: flex; align-items: center; gap: var(--space-1); }
        .booking-end { text-align: right; }
        .booking-end .price { display: block; font-size: var(--text-lg); font-weight: var(--font-bold); color: var(--primary-600); margin-top: var(--space-2); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .booking-card { flex-wrap: wrap; } }
      `}</style>
        </div>
    );
};

export default MyBookings;
