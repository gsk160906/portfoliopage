import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, Download, Home } from 'lucide-react';

const BookingConfirmation = () => {
    const location = useLocation();
    const { booking: confirmedBooking } = location.state || {};

    // Fallback if accessed directly without state
    const booking = confirmedBooking || {
        id: 'B' + Math.floor(100000 + Math.random() * 900000),
        service: 'Service',
        provider: 'To be assigned',
        date: '---',
        time: '---',
        address: '---',
        total: 0,
    };

    return (
        <div className="confirmation-page">
            <div className="confirmation-card card">
                <div className="success-icon"><CheckCircle size={64} /></div>
                <h1>Booking Confirmed!</h1>
                <p className="booking-id">Booking ID: <strong>{booking.id}</strong></p>

                <div className="booking-details">
                    <h3>Booking Details</h3>
                    <div className="detail-item"><span>Service</span><strong>{booking.service}</strong></div>
                    <div className="detail-item"><span>Provider</span><strong>{booking.provider}</strong></div>
                    <div className="detail-item"><Calendar size={16} /><span>{booking.date}</span></div>
                    <div className="detail-item"><Clock size={16} /><span>{booking.time}</span></div>
                    <div className="detail-item"><MapPin size={16} /><span>{booking.address}</span></div>
                    <div className="detail-item total"><span>Total Paid</span><strong>${booking.total}</strong></div>
                </div>

                <div className="confirmation-actions">
                    <Link to="/customer/bookings" className="btn btn-primary">View My Bookings</Link>
                    <Link to="/customer" className="btn btn-secondary"><Home size={18} /> Back to Dashboard</Link>
                </div>

                <p className="confirmation-note">A confirmation email has been sent to your registered email address.</p>
            </div>

            <style>{`
        .confirmation-page { display: flex; align-items: center; justify-content: center; min-height: 60vh; padding: var(--space-8); }
        .confirmation-card { max-width: 500px; text-align: center; padding: var(--space-10); width: 100%; }
        .success-icon { color: var(--success); margin-bottom: var(--space-6); display: flex; justify-content: center; }
        .confirmation-card h1 { font-size: var(--text-3xl); margin-bottom: var(--space-2); }
        .booking-id { color: var(--gray-500); margin-bottom: var(--space-8); }
        .booking-details { background: var(--gray-50); border-radius: var(--radius-lg); padding: var(--space-5); margin-bottom: var(--space-8); text-align: left; }
        .booking-details h3 { font-size: var(--text-base); margin-bottom: var(--space-4); text-align: center; }
        .detail-item { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) 0; color: var(--gray-600); font-size: var(--text-sm); }
        .detail-item strong { margin-left: auto; color: var(--gray-900); text-align: right; }
        .detail-item.total { border-top: 1px solid var(--gray-200); padding-top: var(--space-4); margin-top: var(--space-2); font-weight: var(--font-semibold); }
        .detail-item.total strong { color: var(--primary-600); font-size: var(--text-lg); }
        .confirmation-actions { display: flex; flex-direction: column; gap: var(--space-3); }
        .confirmation-note { margin-top: var(--space-6); font-size: var(--text-sm); color: var(--gray-500); }
        @media (max-width: 768px) { .confirmation-card { padding: var(--space-6); } }
      `}</style>
        </div>
    );
};

export default BookingConfirmation;
