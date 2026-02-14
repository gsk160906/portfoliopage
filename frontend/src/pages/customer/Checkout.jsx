import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, MapPin, CreditCard, Shield, Loader2, User, Star, BadgeCheck } from 'lucide-react';
import { useState } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();
    const { service, provider, date, time, address } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const servicePrice = service?.basePrice || 0;
    const serviceFee = Math.round(servicePrice * 0.1); // 10% fee
    const total = servicePrice + serviceFee;

    const handleConfirm = async () => {
        if (!currentUser) return;
        setIsSubmitting(true);

        try {
            const bookingData = {
                userId: currentUser.uid,
                customerName: userData?.fullName || 'Customer',
                serviceId: service?.id,
                serviceName: service?.name,
                serviceImage: service?.image || '',
                date: date,
                time: time,
                address: address?.address,
                addressDetails: address,
                price: servicePrice,
                serviceFee: serviceFee,
                total: total,
                status: 'pending',
                paymentMethod: paymentMethod,
                paymentStatus: 'paid', // Simulated instant payment
                createdAt: serverTimestamp(),
                providerId: provider?.id || null,
                providerName: provider?.fullName || 'To be assigned',
                providerProfile: {
                    fullName: provider?.fullName || '',
                    bio: provider?.bio || '',
                    rating: provider?.rating || 'New'
                }
            };

            const docRef = await addDoc(collection(db, 'bookings'), bookingData);

            // Navigate to confirmation with the data
            navigate('/customer/confirmation', {
                state: {
                    booking: {
                        id: docRef.id,
                        ...bookingData,
                        date: date,
                    }
                }
            });
        } catch (error) {
            console.error("Error creating booking:", error);
            alert("Failed to create booking. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!service || !date || !time || !address) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <h3>Missing Booking Information</h3>
                <p>Please go back and complete all steps.</p>
                <button onClick={() => navigate('/customer/book-service')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="page-header"><h1>Confirm Booking</h1><p>Ready to meet your professional?</p></div>

            <div className="steps-indicator">
                <div className="step completed"><span>✓</span>Service</div>
                <div className="step completed"><span>✓</span>Schedule</div>
                <div className="step completed"><span>✓</span>Address</div>
                <div className="step active"><span>4</span>Checkout</div>
            </div>

            <div className="checkout-layout">
                <div className="checkout-main">
                    {/* Professional Info Card */}
                    {provider && (
                        <div className="card professional-summary-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                <BadgeCheck size={20} color="var(--primary-600)" />
                                <h3 style={{ margin: 0 }}>Assigned Professional</h3>
                            </div>
                            <div className="provider-mini-profile">
                                <div className="mini-avatar">
                                    {provider.profileImage ? <img src={provider.profileImage} alt="" /> : <User size={24} />}
                                </div>
                                <div className="mini-details">
                                    <div className="name-row">
                                        <strong>{provider.fullName}</strong>
                                        <span className="rating-tag"><Star size={12} fill="#FBBF24" color="#FBBF24" /> {provider.rating || 'New'}</span>
                                    </div>
                                    <p className="mini-bio">{provider.bio || 'Top-rated professional for ' + service.name}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="card">
                        <h3>Job Details</h3>
                        <div className="summary-item"><span>Service</span><strong>{service.name}</strong></div>
                        <div className="summary-item"><Calendar size={16} /><span>{date}</span></div>
                        <div className="summary-item"><Clock size={16} /><span>{time}</span></div>
                        <div className="summary-item"><MapPin size={16} /><span>{address.address}</span></div>
                    </div>

                    <div className="card">
                        <h3>Payment Method</h3>
                        <div className="payment-options">
                            <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                                <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                                <CreditCard size={20} />
                                <span>Credit/Debit Card</span>
                            </label>
                            <label className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                                <input type="radio" name="payment" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                                <span>UPI Transfer</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="checkout-sidebar">
                    <div className="card order-summary">
                        <h3>Order Total</h3>
                        <div className="price-row"><span>Service Price</span><span>${servicePrice}</span></div>
                        <div className="price-row"><span>Service Fee</span><span>${serviceFee}</span></div>
                        <div className="price-row total"><span>Total Payable</span><span>${total}</span></div>

                        <button
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Finalizing...</> : 'Confirm & Pay'}
                        </button>

                        <div className="secure-badge"><Shield size={16} /> Secure Payment Protected</div>
                    </div>
                </div>
            </div>

            <style>{`
        .checkout-page { max-width: 1000px; margin: 0 auto; }
        .page-header { margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-3xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .steps-indicator { display: flex; justify-content: space-between; margin-bottom: var(--space-8); padding: var(--space-4); background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); }
        .step { display: flex; align-items: center; gap: var(--space-2); color: var(--gray-400); font-size: var(--text-sm); }
        .step span { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: var(--gray-100); border-radius: 50%; font-weight: var(--font-semibold); }
        .step.active { color: var(--primary-600); }
        .step.active span { background: var(--primary-600); color: white; }
        .step.completed span { background: var(--success); color: white; }
        
        .professional-summary-card { border: 1px solid var(--primary-100); background: var(--primary-50); }
        .provider-mini-profile { display: flex; gap: var(--space-4); align-items: center; }
        .mini-avatar { width: 60px; height: 60px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px solid white; box-shadow: var(--shadow-sm); }
        .mini-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .mini-details { flex: 1; }
        .name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
        .rating-tag { font-size: 11px; font-weight: bold; background: white; padding: 2px 8px; border-radius: 10px; display: flex; align-items: center; gap: 4px; border: 1px solid var(--gray-100); }
        .mini-bio { font-size: 13px; color: var(--gray-600); line-height: 1.4; }

        .checkout-layout { display: grid; grid-template-columns: 1fr 350px; gap: var(--space-8); }
        .checkout-main { display: flex; flex-direction: column; gap: var(--space-6); }
        .checkout-main h3 { margin-bottom: var(--space-4); }
        .summary-item { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4) 0; border-bottom: 1px solid var(--gray-100); color: var(--gray-600); font-size: var(--text-sm); }
        .summary-item:last-child { border-bottom: none; }
        .summary-item strong { margin-left: auto; color: var(--gray-900); }
        .payment-options { display: flex; flex-direction: column; gap: var(--space-3); }
        .payment-option { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4); border: 2px solid var(--gray-200); border-radius: var(--radius-lg); cursor: pointer; transition: 0.2s; }
        .payment-option.selected { border-color: var(--primary-600); background: var(--primary-50); }
        .order-summary h3 { margin-bottom: var(--space-4); }
        .price-row { display: flex; justify-content: space-between; padding: var(--space-3) 0; border-bottom: 1px solid var(--gray-100); color: var(--gray-600); }
        .price-row.total { border-bottom: none; padding-top: var(--space-4); font-size: var(--text-xl); font-weight: var(--font-bold); color: var(--gray-900); }
        .secure-badge { display: flex; align-items: center; justify-content: center; gap: var(--space-2); margin-top: var(--space-6); font-size: var(--text-xs); color: var(--gray-400); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 1024px) { .checkout-layout { grid-template-columns: 1fr; } }
      `}</style>
        </div>
    );
};

export default Checkout;
