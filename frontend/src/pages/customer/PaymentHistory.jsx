import { CreditCard, Download, Receipt, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const PaymentHistory = () => {
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            if (!currentUser) return;
            try {
                // Fetch all bookings for the user to derive payment history
                // Note: ideally we would have a separate 'transactions' collection, 
                // but since Checkout.jsx writes only to 'bookings', we use that.
                const q = query(
                    collection(db, 'bookings'),
                    where('userId', '==', currentUser.uid)
                );

                const snapshot = await getDocs(q);
                const fetchedTx = snapshot.docs
                    .map(doc => {
                        const data = doc.data();
                        // Only include if it has a payment status (default is 'paid' for new bookings)
                        if (!data.paymentStatus && !data.price) return null;

                        let status = data.paymentStatus || 'paid';
                        if (data.status === 'cancelled') {
                            status = 'refunded';
                        }

                        return {
                            id: doc.id,
                            date: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : (data.date || 'Recent'),
                            timestamp: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : 0,
                            service: data.serviceName,
                            method: data.paymentMethod === 'upi' ? 'UPI Transfer' : 'Credit/Debit Card',
                            amount: data.total || data.price,
                            status: status
                        };
                    })
                    .filter(tx => tx !== null)
                    .sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first

                setTransactions(fetchedTx);
            } catch (error) {
                console.error("Error fetching payment history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [currentUser]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
                <Loader2 size={32} className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="payments-page">
            <div className="page-header">
                <div><h1>Payment History</h1><p>View your transaction history</p></div>
                {transactions.length > 0 && <button className="btn btn-secondary"><Download size={18} /> Export</button>}
            </div>

            {transactions.length > 0 ? (
                <div className="table-wrapper card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="table">
                        <thead>
                            <tr><th>Transaction ID</th><th>Date</th><th>Service</th><th>Payment Method</th><th>Amount</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td><strong>{tx.id}</strong></td>
                                    <td>{tx.date}</td>
                                    <td>{tx.service}</td>
                                    <td><CreditCard size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />{tx.method}</td>
                                    <td><strong>${tx.amount}</strong></td>
                                    <td><span className={`badge ${tx.status === 'refunded' ? 'badge-error' : (tx.status === 'completed' || tx.status === 'paid' ? 'badge-success' : 'badge-warning')}`} style={{
                                        backgroundColor: tx.status === 'refunded' ? '#FEE2E2' : undefined,
                                        color: tx.status === 'refunded' ? '#DC2626' : undefined
                                    }}>{tx.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state-card" style={{ textAlign: 'center', padding: 'var(--space-12)', background: 'var(--gray-50)', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--gray-200)' }}>
                    <Receipt size={48} style={{ margin: '0 auto var(--space-4)', color: 'var(--gray-300)' }} />
                    <h3>No transactions yet</h3>
                    <p style={{ color: 'var(--gray-500)' }}>Your payment history will appear here once you book your first service.</p>
                </div>
            )}

            <style>{`
        .payments-page { max-width: 1000px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        @media (max-width: 768px) { .page-header { flex-direction: column; gap: var(--space-4); align-items: flex-start; } }
      `}</style>
        </div>
    );
};

export default PaymentHistory;
