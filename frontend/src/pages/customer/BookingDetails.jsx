import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Phone, CheckCircle, XCircle, Star, ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const BookingDetails = () => {
    const { currentUser, userData } = useAuth();
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [providerData, setProviderData] = useState(null);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const docRef = doc(db, 'bookings', bookingId);
                const snapshot = await getDoc(docRef);
                if (snapshot.exists()) {
                    setBooking({ id: snapshot.id, ...snapshot.data() });
                    setNewDate(snapshot.data().date);
                    setNewTime(snapshot.data().time);

                    if (snapshot.data().providerId) {
                        const pDoc = await getDoc(doc(db, 'users', snapshot.data().providerId));
                        if (pDoc.exists()) setProviderData(pDoc.data());
                    }
                }
            } catch (error) {
                console.error("Error fetching booking details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId]);

    const handleCancel = async () => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        setActionLoading(true);
        try {
            const docRef = doc(db, 'bookings', bookingId);
            await updateDoc(docRef, {
                status: 'cancelled',
                updatedAt: new Date().toISOString()
            });
            setBooking(prev => ({ ...prev, status: 'cancelled' }));
            alert("Booking cancelled successfully.");
        } catch (error) {
            console.error("Error cancelling booking:", error);
            alert("Failed to cancel booking.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReschedule = async () => {
        if (!newDate || !newTime) {
            alert("Please select both date and time.");
            return;
        }

        setActionLoading(true);
        try {
            const docRef = doc(db, 'bookings', bookingId);
            const updateData = {
                date: newDate,
                time: newTime,
                updatedAt: new Date().toISOString()
            };

            // If it was already accepted, we must reset to pending for re-confirmation
            if (booking.status === 'upcoming') {
                updateData.status = 'pending';
            }

            await updateDoc(docRef, updateData);
            setBooking(prev => ({ ...prev, ...updateData }));
            setShowRescheduleModal(false);

            if (updateData.status === 'pending') {
                alert("Booking rescheduled! The provider will need to confirm the new time.");
            } else {
                alert("Booking rescheduled successfully.");
            }
        } catch (error) {
            console.error("Error rescheduling booking:", error);
            alert("Failed to reschedule booking.");
        } finally {
            setActionLoading(false);
        }
    };
    const handleReviewSubmit = async () => {
        if (reviewRating === 0) {
            alert("Please select a rating.");
            return;
        }

        setActionLoading(true);
        try {
            // 1. Create Review
            await addDoc(collection(db, 'reviews'), {
                bookingId: bookingId,
                providerId: booking.providerId,
                customerId: currentUser.uid,
                customerName: userData?.fullName || 'Customer',
                customerAvatar: userData?.profileImage || '',
                serviceName: booking.serviceName,
                rating: reviewRating,
                comment: reviewComment,
                createdAt: serverTimestamp()
            });

            // 2. Mark booking as reviewed
            const bookingRef = doc(db, 'bookings', bookingId);
            await updateDoc(bookingRef, { isReviewed: true });

            // 3. Update Provider's Aggregate Rating
            try {
                const reviewsQ = query(collection(db, 'reviews'), where('providerId', '==', booking.providerId));
                const reviewsSnapshot = await getDocs(reviewsQ);
                const reviews = reviewsSnapshot.docs.map(d => d.data());

                // Calculate new average
                const totalRating = reviews.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
                const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

                // Update provider document
                const providerRef = doc(db, 'users', booking.providerId);
                await updateDoc(providerRef, {
                    rating: parseFloat(avgRating),
                    reviewCount: reviews.length
                });
            } catch (err) {
                console.error("Failed to update provider rating stats:", err);
                // Don't block the UI flow for this background update
            }

            setBooking(prev => ({ ...prev, isReviewed: true }));
            setShowReviewModal(false);
            alert("Thank you for your review!");
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} /></div>;
    }

    if (!booking) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <h3>Booking Not Found</h3>
                <Link to="/customer/bookings" className="btn btn-primary">Back to Bookings</Link>
            </div>
        );
    }

    const canAction = booking.status !== 'completed' && booking.status !== 'cancelled';

    console.log("Render: BookingDetails", { showRescheduleModal, actionLoading, canAction });

    return (
        <div className="booking-details-page">
            <Link to="/customer/bookings" className="back-link"><ArrowLeft size={18} /> Back to Bookings</Link>

            <div className="details-header">
                <div>
                    <h1>{booking.serviceName}</h1>
                    <p style={{ color: 'var(--gray-500)' }}>Booking #{booking.id}</p>
                    {/* ... */}
                </div>
                <div className="header-actions">
                    {booking.status === 'completed' && !booking.isReviewed && (
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowReviewModal(true)}
                            disabled={actionLoading}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Star size={18} fill="currentColor" /> Leave a Review
                        </button>
                    )}
                    {booking.isReviewed && (
                        <button className="btn btn-outline" disabled style={{ color: 'var(--success)', borderColor: 'var(--success)' }}>
                            <CheckCircle size={18} /> Review Submitted
                        </button>
                    )}
                    {canAction && (
                        <>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    console.log("Reschedule button clicked. Setting state to true.");
                                    setShowRescheduleModal(true);
                                }}
                                disabled={actionLoading}
                            >
                                Reschedule
                            </button>
                            <button
                                className="btn btn-outline"
                                style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                                onClick={handleCancel}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Cancel'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="details-grid">
                <div className="main-content">
                    <div className="card">
                        <h3>Service Details</h3>
                        <div className="detail-row"><span>Service</span><strong>{booking.serviceName}</strong></div>
                        <div className="detail-row"><Calendar size={16} /><span>{booking.date}</span></div>
                        <div className="detail-row"><Clock size={16} /><span>{booking.time}</span></div>
                        <div className="detail-row"><MapPin size={16} /><span>{booking.address}</span></div>
                    </div>

                    <div className="card">
                        <h3>Service Provider</h3>
                        <div className="provider-info">
                            <div className="avatar-placeholder"><User size={32} /></div>
                            <div>
                                <h4>{booking.providerName || 'To be assigned'}</h4>
                                <div className="provider-meta">
                                    <span><Star size={14} fill="#FBBF24" color="#FBBF24" /> {providerData?.rating || 'New'}</span>
                                    <span><Phone size={14} /> ---</span>
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-secondary" style={{ width: '100%', marginTop: 'var(--space-4)' }} disabled>Contact Provider</button>
                    </div>

                    <div className="card">
                        <h3>Payment Summary</h3>
                        <div className="price-row"><span>Service Price</span><span>${booking.price}</span></div>
                        <div className="price-row"><span>Service Fee</span><span>${booking.serviceFee}</span></div>
                        <div className="price-row total"><span>Total Paid</span><span>${booking.total}</span></div>
                    </div>
                </div>

                <div className="sidebar-content">
                    <div className="card">
                        <h3>Booking Status</h3>
                        <div className="status-timeline">
                            <div className="status-point active">
                                <CheckCircle size={20} />
                                <div>
                                    <strong>Booking Placed</strong>
                                    <p>Your request has been received</p>
                                </div>
                            </div>
                            <div className={`status-point ${booking.status !== 'pending' ? 'active' : ''}`}>
                                <CheckCircle size={20} />
                                <div>
                                    <strong>Provider Assigned</strong>
                                    <p>{booking.providerId ? 'Expert assigned' : 'Finding the best expert...'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .booking-details-page { max-width: 1100px; margin: 0 auto; }
        .back-link { display: inline-flex; align-items: center; gap: var(--space-2); color: var(--gray-600); margin-bottom: var(--space-6); }
        .back-link:hover { color: var(--primary-600); }
        .details-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8); }
        .details-header h1 { font-size: var(--text-2xl); margin-bottom: 4px; }
        .header-actions { display: flex; gap: var(--space-3); }
        .details-grid { display: grid; grid-template-columns: 1fr 350px; gap: var(--space-6); }
        .main-content { display: flex; flex-direction: column; gap: var(--space-6); }
        .main-content h3 { margin-bottom: var(--space-4); border-bottom: 1px solid var(--gray-100); padding-bottom: var(--space-2); }
        .detail-row { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) 0; border-bottom: 1px solid var(--gray-50); color: var(--gray-600); font-size: var(--text-sm); }
        .detail-row:last-child { border-bottom: none; }
        .detail-row strong { margin-left: auto; color: var(--gray-900); }
        .provider-info { display: flex; gap: var(--space-4); align-items: center; }
        .avatar-placeholder { width: 56px; height: 56px; border-radius: var(--radius-lg); background: var(--gray-100); display: flex; align-items: center; justify-content: center; color: var(--gray-400); }
        .provider-meta { display: flex; gap: var(--space-4); font-size: var(--text-sm); color: var(--gray-500); }
        .provider-meta span { display: flex; align-items: center; gap: var(--space-1); }
        .price-row { display: flex; justify-content: space-between; padding: var(--space-3) 0; border-bottom: 1px solid var(--gray-100); }
        .price-row.total { border: none; font-size: var(--text-lg); font-weight: var(--font-bold); color: var(--primary-600); }
        .sidebar-content h3 { margin-bottom: var(--space-4); }
        .status-timeline { display: flex; flex-direction: column; gap: var(--space-6); position: relative; padding-left: 10px; }
        .status-point { display: flex; gap: var(--space-4); color: var(--gray-400); }
        .status-point.active { color: var(--success); }
        .status-point strong { display: block; color: var(--gray-900); font-size: var(--text-sm); }
        .status-point p { font-size: var(--text-xs); color: var(--gray-500); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(4px); }
        .modal-content { width: 100%; max-width: 450px; padding: var(--space-8); background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-2xl); }
        
        @media (max-width: 1024px) { .details-grid { grid-template-columns: 1fr; } }
      `}</style>

            {showRescheduleModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999999,
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setShowRescheduleModal(false)}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '1rem',
                        width: '90%',
                        maxWidth: '450px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Reschedule Booking</h2>
                        <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Choose a new date and time for your service</p>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>New Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>New Time</label>
                            <select
                                className="form-input"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB' }}
                            >
                                <option value="" disabled>Select a time</option>
                                {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-actions" style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-secondary" onClick={() => setShowRescheduleModal(false)} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB', background: 'white' }}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleReschedule} disabled={actionLoading} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.375rem', background: '#4F46E5', color: 'white', border: 'none' }}>
                                {actionLoading ? <Loader2 className="animate-spin" size={18} /> : 'Confirm Reschedule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999999,
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setShowReviewModal(false)}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '1rem',
                        width: '90%',
                        maxWidth: '450px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Rate Your Service</h2>
                        <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>How was your experience with {booking.providerName}?</p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={32}
                                    fill={star <= reviewRating ? "#FBBF24" : "none"}
                                    color={star <= reviewRating ? "#FBBF24" : "#D1D5DB"}
                                    style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                                    onClick={() => setReviewRating(star)}
                                    // Make it interactive
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            ))}
                        </div>

                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Your Comment</label>
                            <textarea
                                className="form-input"
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Tell us what you liked..."
                                rows={4}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB' }}
                            />
                        </div>

                        <div className="modal-actions" style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-secondary" onClick={() => setShowReviewModal(false)} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB', background: 'white' }}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleReviewSubmit} disabled={actionLoading || reviewRating === 0} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.375rem', background: '#4F46E5', color: 'white', border: 'none' }}>
                                {actionLoading ? <Loader2 className="animate-spin" size={18} /> : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};



export default BookingDetails;
