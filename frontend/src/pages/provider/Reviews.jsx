import { Star, Calendar, MessageCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Reviews = () => {
    const { currentUser } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ average: 0, total: 0, breakdown: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
                const q = query(
                    collection(db, 'reviews'),
                    where('providerId', '==', currentUser.uid)
                );
                const snapshot = await getDocs(q);
                const fetchedReviews = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        customer: data.customerName || data.customer || 'Anonymous',
                        service: data.serviceName || data.service || 'Service',
                        date: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : (data.date || 'Recent'),
                        avatar: data.customerAvatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop'
                    };
                });

                // Calculate Stats
                const total = fetchedReviews.length;
                const sum = fetchedReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
                const average = total > 0 ? (sum / total).toFixed(1) : 0;

                const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                fetchedReviews.forEach(r => {
                    const stars = Math.round(Number(r.rating) || 0);
                    if (counts[stars] !== undefined) counts[stars]++;
                });

                const breakdown = [5, 4, 3, 2, 1].map(star => ({
                    stars: star,
                    count: counts[star]
                }));

                setReviews(fetchedReviews);
                setStats({ average, total, breakdown });

            } catch (error) {
                console.error("Error fetching reviews:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [currentUser]);

    return (
        <div className="reviews-page">
            <div className="page-header"><h1>My Reviews</h1><p>See what customers say about your work</p></div>
            <div className="reviews-grid">
                <div className="card stats-card">
                    <div className="overall-rating">
                        <span className="big-rating">{stats.average}</span>
                        <div className="stars">{[...Array(5)].map((_, i) => <Star key={i} size={20} fill={i < Math.floor(stats.average) ? '#FBBF24' : '#E5E7EB'} color={i < Math.floor(stats.average) ? '#FBBF24' : '#E5E7EB'} />)}</div>
                        <p>{stats.total} reviews</p>
                    </div>
                    <div className="rating-breakdown">
                        {stats.breakdown.map(b => (
                            <div key={b.stars} className="breakdown-row">
                                <span>{b.stars} star</span>
                                <div className="bar"><div className="fill" style={{ width: `${stats.total > 0 ? (b.count / stats.total) * 100 : 0}%` }}></div></div>
                                <span>{b.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="reviews-list">
                    {reviews.map(r => (
                        <div key={r.id} className="card review-card">
                            <div className="review-header">
                                <img src={r.avatar} alt={r.customer} />
                                <div>
                                    <h4>{r.customer}</h4>
                                    <span className="service">{r.service}</span>
                                </div>
                                <div className="review-meta">
                                    <div className="stars">{[...Array(r.rating)].map((_, i) => <Star key={i} size={14} fill="#FBBF24" color="#FBBF24" />)}</div>
                                    <span><Calendar size={12} /> {r.date}</span>
                                </div>
                            </div>
                            <p>{r.comment}</p>
                            <button className="btn btn-ghost btn-sm"><MessageCircle size={14} /> Reply</button>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
        .reviews-page { max-width: 1000px; margin: 0 auto; }
        .page-header { margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .reviews-grid { display: grid; grid-template-columns: 300px 1fr; gap: var(--space-6); }
        .stats-card { padding: var(--space-6); }
        .overall-rating { text-align: center; margin-bottom: var(--space-6); padding-bottom: var(--space-6); border-bottom: 1px solid var(--gray-100); }
        .big-rating { font-size: 3rem; font-weight: var(--font-bold); color: var(--gray-900); }
        .stars { display: flex; justify-content: center; gap: var(--space-1); margin: var(--space-2) 0; }
        .overall-rating p { color: var(--gray-500); }
        .rating-breakdown { display: flex; flex-direction: column; gap: var(--space-2); }
        .breakdown-row { display: flex; align-items: center; gap: var(--space-3); font-size: var(--text-sm); }
        .bar { flex: 1; height: 8px; background: var(--gray-100); border-radius: 4px; overflow: hidden; }
        .fill { height: 100%; background: var(--accent-yellow); }
        .reviews-list { display: flex; flex-direction: column; gap: var(--space-4); }
        .review-card { padding: var(--space-5); }
        .review-header { display: flex; gap: var(--space-3); margin-bottom: var(--space-3); }
        .review-header img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
        .review-header h4 { margin-bottom: var(--space-1); }
        .review-header .service { font-size: var(--text-xs); color: var(--gray-500); }
        .review-meta { margin-left: auto; text-align: right; }
        .review-meta span { display: flex; align-items: center; gap: var(--space-1); font-size: var(--text-xs); color: var(--gray-400); margin-top: var(--space-1); }
        .review-card p { margin-bottom: var(--space-3); line-height: 1.6; }
        @media (max-width: 768px) { .reviews-grid { grid-template-columns: 1fr; } }
      `}</style>
        </div>
    );
};

export default Reviews;
