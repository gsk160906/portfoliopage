import { Link } from 'react-router-dom';
import { Users, Briefcase, Calendar, DollarSign, TrendingUp, ArrowUpRight, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
    // Data will be populated from backend API
    const stats = [
        { label: 'Total Users', value: '0', change: '-', icon: Users, color: 'var(--primary-600)' },
        { label: 'Active Providers', value: '0', change: '-', icon: Briefcase, color: 'var(--accent-cyan)' },
        { label: 'Bookings Today', value: '0', change: '-', icon: Calendar, color: 'var(--accent-orange)' },
        { label: 'Revenue (MTD)', value: '$0', change: '-', icon: DollarSign, color: 'var(--success)' },
    ];

    const recentBookings = [];

    const alerts = [];

    return (
        <div className="admin-dashboard">
            <div className="page-header"><h1>Dashboard</h1><p>Welcome back, Admin</p></div>

            <div className="stats-grid">
                {stats.map((s, i) => (
                    <div key={i} className="card stat-card">
                        <div className="stat-icon" style={{ background: `${s.color}15`, color: s.color }}><s.icon size={24} /></div>
                        <div className="stat-info">
                            <span className="stat-label">{s.label}</span>
                            <span className="stat-value">{s.value}</span>
                            <span className="stat-change"><ArrowUpRight size={14} /> {s.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            {alerts.length > 0 && (
                <div className="alerts-section">
                    {alerts.map((a, i) => (
                        <div key={i} className={`alert alert-${a.type}`}><AlertCircle size={18} /> {a.message}</div>
                    ))}
                </div>
            )}

            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-header"><h3>Recent Bookings</h3><Link to="/admin/bookings" className="btn btn-ghost btn-sm">View All</Link></div>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead><tr><th>Customer</th><th>Service</th><th>Provider</th><th>Status</th><th>Amount</th></tr></thead>
                            <tbody>
                                {recentBookings.map(b => (
                                    <tr key={b.id}>
                                        <td><strong>{b.customer}</strong></td>
                                        <td>{b.service}</td>
                                        <td>{b.provider}</td>
                                        <td><span className={`badge badge-${b.status === 'completed' ? 'success' : b.status === 'pending' ? 'warning' : 'info'}`}>{b.status}</span></td>
                                        <td>${b.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="card">
                    <h3>Quick Stats</h3>
                    <div className="chart-placeholder"><TrendingUp size={48} /><p>No revenue data yet</p></div>
                </div>
            </div>

            <style>{`
        .admin-dashboard { max-width: 1200px; margin: 0 auto; }
        .page-header { margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-6); margin-bottom: var(--space-6); }
        .stat-card { display: flex; gap: var(--space-4); align-items: center; }
        .stat-icon { width: 56px; height: 56px; border-radius: var(--radius-xl); display: flex; align-items: center; justify-content: center; }
        .stat-label { font-size: var(--text-sm); color: var(--gray-500); display: block; }
        .stat-value { font-size: var(--text-2xl); font-weight: var(--font-bold); display: block; }
        .stat-change { font-size: var(--text-sm); color: var(--success); display: flex; align-items: center; gap: 2px; }
        .alerts-section { display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-6); }
        .alert { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4); border-radius: var(--radius-lg); }
        .alert-warning { background: #FEF3C7; color: #92400E; }
        .alert-info { background: #DBEAFE; color: #1E40AF; }
        .dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-6); }
        .chart-placeholder { text-align: center; padding: var(--space-10); color: var(--gray-400); }
        .chart-placeholder p { margin-top: var(--space-4); color: var(--gray-600); font-weight: var(--font-medium); }
        @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .dashboard-grid { grid-template-columns: 1fr; } }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: 1fr; } }
      `}</style>
        </div>
    );
};

export default AdminDashboard;
