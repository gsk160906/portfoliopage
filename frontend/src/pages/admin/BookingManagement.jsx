import { useState } from 'react';
import { Search, Filter, Eye, Edit2, Calendar, Download } from 'lucide-react';

const BookingManagement = () => {
    const [activeTab, setActiveTab] = useState('all');
    const tabs = ['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

    // Data will be populated from backend API
    const bookings = [];

    const statusColors = { pending: 'warning', confirmed: 'info', 'in-progress': 'primary', completed: 'success', cancelled: 'gray' };
    const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab);

    return (
        <div className="booking-management-page">
            <div className="page-header">
                <div><h1>Booking Management</h1><p>View and manage all bookings</p></div>
                <button className="btn btn-secondary"><Download size={18} /> Export</button>
            </div>

            <div className="toolbar">
                <div className="tabs">{tabs.map(t => <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t.replace('-', ' ')}</button>)}</div>
                <div className="search-input-wrapper"><Search size={18} className="search-icon" /><input type="text" className="form-input search-input" placeholder="Search bookings..." /></div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table className="table">
                        <thead><tr><th>ID</th><th>Customer</th><th>Service</th><th>Provider</th><th>Date</th><th>Status</th><th>Amount</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filtered.map(b => (
                                <tr key={b.id}>
                                    <td><strong>{b.id}</strong></td>
                                    <td>{b.customer}</td>
                                    <td>{b.service}</td>
                                    <td>{b.provider}</td>
                                    <td>{b.date}</td>
                                    <td><span className={`badge badge-${statusColors[b.status]}`}>{b.status}</span></td>
                                    <td><strong>${b.amount}</strong></td>
                                    <td><button className="btn btn-ghost btn-icon btn-sm"><Eye size={16} /></button><button className="btn btn-ghost btn-icon btn-sm"><Edit2 size={16} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
        .booking-management-page { max-width: 1200px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); gap: var(--space-4); flex-wrap: wrap; }
        .toolbar .tabs { overflow-x: auto; }
        .toolbar .search-input-wrapper { width: 250px; }
        @media (max-width: 768px) { .toolbar { flex-direction: column; align-items: stretch; } .toolbar .search-input-wrapper { width: 100%; } .page-header { flex-direction: column; gap: var(--space-4); align-items: flex-start; } }
      `}</style>
        </div>
    );
};

export default BookingManagement;
