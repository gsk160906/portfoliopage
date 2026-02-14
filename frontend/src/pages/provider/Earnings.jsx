import { DollarSign, TrendingUp, Calendar, ArrowUpRight, Download, Loader2, Wallet, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, orderBy, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const Earnings = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ revenue: 0, balance: 0, pending: 0 });
    const [transactions, setTransactions] = useState([]);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    useEffect(() => {
        const fetchEarnings = async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
                // 1. Fetch Completed Bookings (Revenue) - Remove orderBy to avoid index issues
                const bookingsq = query(
                    collection(db, 'bookings'),
                    where('providerId', '==', currentUser.uid),
                    where('status', '==', 'completed')
                );
                const bookingsSnapshot = await getDocs(bookingsq);

                let revenue = 0;
                const txList = bookingsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    const amount = Number(data.price) || 0;
                    const fee = Number(data.serviceFee) || 0;
                    revenue += amount;
                    return {
                        id: doc.id,
                        service: data.serviceName,
                        date: data.date, // You might want to format this
                        timestamp: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.date),
                        amount: amount,
                        fee: fee,
                        customer: data.customerName,
                        type: 'earning'
                    };
                });

                // 2. Fetch Withdrawals (Debits)
                const withdrawalsq = query(
                    collection(db, 'withdrawals'),
                    where('providerId', '==', currentUser.uid)
                );
                // Note: If you want to order this, do it client side or ensure index exists
                const withdrawalsSnapshot = await getDocs(withdrawalsq);
                let totalWithdrawn = 0;

                withdrawalsSnapshot.forEach(doc => {
                    totalWithdrawn += Number(doc.data().amount);
                });

                // 3. Calculate Balance
                const balance = revenue - totalWithdrawn;

                // 4. Sort transactions by date (client-side)
                txList.sort((a, b) => b.timestamp - a.timestamp);

                setStats({ revenue, balance, pending: 0 });
                setTransactions(txList);

            } catch (error) {
                console.error("Error fetching earnings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEarnings();
    }, [currentUser]);

    const handleWithdraw = async () => {
        if (!withdrawAmount || isNaN(withdrawAmount) || Number(withdrawAmount) <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        setIsWithdrawing(true);
        try {
            // Create a withdrawal record
            await addDoc(collection(db, 'withdrawals'), {
                providerId: currentUser.uid,
                amount: Number(withdrawAmount),
                status: 'processed', // Simulating instant processing
                createdAt: new Date(),
                method: 'bank_transfer'
            });

            alert(`Withdrawal of $${withdrawAmount} processed successfully!`);

            // Refresh stats locally to reflect change immediately
            setStats(prev => ({
                ...prev,
                balance: prev.balance - Number(withdrawAmount)
            }));

            setShowWithdrawModal(false);
            setWithdrawAmount('');
        } catch (error) {
            console.error("Error processing withdrawal:", error);
            alert("Failed to process withdrawal. Please try again.");
        } finally {
            setIsWithdrawing(false);
        }
    };

    const handleDownloadReport = () => {
        if (transactions.length === 0) {
            alert("No transactions to export.");
            return;
        }

        const headers = ["Job ID", "Date", "Service", "Customer", "Amount", "Fee", "Net Earnings"];
        const rows = transactions.map(t => [t.id, t.date, t.service, t.customer, t.amount + t.fee, t.fee, t.amount]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `earnings_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="earnings-page">
            <div className="page-header">
                <div><h1>Earnings & Wallet</h1><p>Manage your revenue and payouts</p></div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-outline" onClick={handleDownloadReport}><Download size={18} /> Report</button>
                    <button className="btn btn-primary" onClick={() => setShowWithdrawModal(true)} disabled={stats.balance <= 0}>
                        <Wallet size={18} /> Withdraw
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="card stat-card">
                    <div className="stat-header">
                        <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}><DollarSign size={20} /></div>
                        <span className="trend positive">+12%</span>
                    </div>
                    <div className="stat-value">${stats.revenue}</div>
                    <div className="stat-label">Total Revenue</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-header">
                        <div className="stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}><TrendingUp size={20} /></div>
                        <span className="trend">Available</span>
                    </div>
                    <div className="stat-value">${stats.balance}</div>
                    <div className="stat-label">Current Balance</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-header">
                        <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}><Calendar size={20} /></div>
                        <span className="trend">Pending</span>
                    </div>
                    <div className="stat-value">${stats.pending}</div>
                    <div className="stat-label">Clearing Soon</div>
                </div>
            </div>

            <div className="card earnings-table-card">
                <h3 className="card-title">Transaction History</h3>
                <div className="table-responsive">
                    <table className="earnings-table">
                        <thead>
                            <tr>
                                <th>Job ID</th>
                                <th>Service / Customer</th>
                                <th>Date</th>
                                <th>Service Fee</th>
                                <th>Net Earnings</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}><Loader2 className="animate-spin" size={24} /></td></tr>
                            ) : transactions.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <span style={{ fontFamily: 'monospace', fontSize: '12px', background: 'var(--gray-100)', padding: '2px 6px', borderRadius: '4px' }}>
                                            #{item.id.slice(0, 6)}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{item.service}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{item.customer}</div>
                                    </td>
                                    <td>{item.date}</td>
                                    <td style={{ color: 'var(--error)' }}>-${item.fee}</td>
                                    <td className="amount">+${item.amount}</td>
                                    <td><span className="badge badge-success">Paid</span></td>
                                </tr>
                            ))}
                            {!loading && transactions.length === 0 && (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <AlertCircle size={24} />
                                        <p>No completed transactions yet.</p>
                                    </div>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
                    <div className="modal-content card" onClick={e => e.stopPropagation()}>
                        <h2>Withdraw Funds</h2>
                        <p>Transfer earnings to your linked bank account</p>

                        <div className="balance-display" style={{ margin: '1.5rem 0', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Available Balance</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-600)' }}>${stats.balance}</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Amount</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)' }}>$</span>
                                <input
                                    type="number"
                                    className="form-input"
                                    style={{ paddingLeft: '2rem' }}
                                    placeholder="Enter amount"
                                    value={withdrawAmount}
                                    onChange={e => setWithdrawAmount(e.target.value)}
                                    max={stats.balance}
                                />
                            </div>
                        </div>

                        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button className="btn btn-secondary" onClick={() => setShowWithdrawModal(false)} style={{ flex: 1 }}>Cancel</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleWithdraw}
                                style={{ flex: 1 }}
                                disabled={!withdrawAmount || Number(withdrawAmount) > stats.balance || isWithdrawing}
                            >
                                {isWithdrawing ? <Loader2 className="animate-spin" size={18} /> : 'Confirm Withdraw'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .earnings-page { max-width: 1100px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); margin-bottom: var(--space-8); }
        .stat-card { padding: var(--space-6); transition: transform 0.2s; }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); }
        .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .trend { font-size: var(--text-xs); font-weight: var(--font-bold); padding: 2px 8px; border-radius: 20px; }
        .trend.positive { background: var(--success-light); color: var(--success); }
        .stat-value { font-size: 2.5rem; font-weight: var(--font-bold); margin-bottom: var(--space-1); letter-spacing: -1px; }
        .stat-label { font-size: var(--text-sm); color: var(--gray-500); font-weight: 500; }
        
        .earnings-table-card { padding: 0; overflow: hidden; }
        .card-title { padding: var(--space-5) var(--space-6); border-bottom: 1px solid var(--gray-100); font-size: var(--text-lg); }
        .table-responsive { width: 100%; overflow-x: auto; }
        .earnings-table { width: 100%; border-collapse: collapse; text-align: left; }
        .earnings-table th { padding: var(--space-4) var(--space-6); background: var(--gray-50); font-size: 11px; font-weight: 700; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.05em; }
        .earnings-table td { padding: var(--space-4) var(--space-6); border-bottom: 1px solid var(--gray-50); font-size: var(--text-sm); vertical-align: middle; }
        .earnings-table tr:hover td { background: var(--gray-50); }
        .earnings-table .amount { font-weight: var(--font-bold); color: var(--success); font-family: monospace; font-size: 15px; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: var(--z-modal); backdrop-filter: blur(4px); }
        .modal-content { width: 100%; max-width: 420px; padding: var(--space-8); animation: modalSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes modalSlide { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: 1fr; } }
      `}</style>
        </div>
    );
};

export default Earnings;
