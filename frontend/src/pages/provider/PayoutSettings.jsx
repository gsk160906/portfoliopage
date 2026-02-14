import { CreditCard, Edit2, Check, Loader2, Zap } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const PayoutSettings = () => {
    const { userData, updateProfileData } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [upiId, setUpiId] = useState(userData?.paymentDetails?.upiId || '');
    const [holderName, setHolderName] = useState(userData?.paymentDetails?.accountHolderName || '');

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfileData({
                paymentDetails: {
                    type: 'upi',
                    upiId: upiId,
                    accountHolderName: holderName
                }
            });
            setIsEditing(false);
            alert("Payment details updated successfully!");
        } catch (error) {
            console.error("Error updating payout settings:", error);
            alert("Failed to update settings.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payout-page">
            <div className="page-header"><h1>Payout Settings</h1><p>Manage how you receive your earnings</p></div>

            <div className="card">
                <div className="section-header">
                    <h3>UPI Configuration</h3>
                    {!isEditing && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(true)}>
                            <Edit2 size={16} /> Edit Details
                        </button>
                    )}
                </div>

                <div className="payout-method-box">
                    <div className="method-icon"><Zap size={24} /></div>
                    <div className="method-details">
                        {isEditing ? (
                            <div className="edit-form">
                                <div className="form-group">
                                    <label className="form-label">Account Holder Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={holderName}
                                        onChange={(e) => setHolderName(e.target.value)}
                                        placeholder="Name as per bank"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">UPI ID</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="username@upi"
                                    />
                                </div>
                                <div className="form-actions">
                                    <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
                                    <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading}>
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h4>{userData?.paymentDetails?.accountHolderName || 'Not Set'}</h4>
                                <p className="upi-id">{userData?.paymentDetails?.upiId || 'No UPI ID registered'}</p>
                                <span className="badge badge-success" style={{ marginTop: '8px', display: 'inline-block' }}>Active Payout Method</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>Payout Schedule</h3>
                <p>Your earnings are automatically transferred to your UPI ID every <strong>Monday</strong>.</p>
                <div className="info-box" style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--gray-600)' }}>
                    Note: Payouts may take up to 24 hours to reflect in your account depending on your bank's processing time.
                </div>
            </div>

            <style>{`
        .payout-page { max-width: 800px; margin: 0 auto; }
        .page-header { margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
        .payout-method-box { display: flex; gap: var(--space-6); padding: var(--space-6); background: var(--gray-50); border-radius: var(--radius-xl); border: 1px solid var(--gray-200); }
        .method-icon { width: 60px; height: 60px; background: var(--primary-600); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
        .method-details { flex: 1; }
        .method-details h4 { font-size: var(--text-lg); margin-bottom: 4px; }
        .upi-id { font-family: monospace; font-size: var(--text-md); color: var(--primary-600); font-weight: 600; }
        .edit-form { display: flex; flex-direction: column; gap: var(--space-4); }
        .form-actions { display: flex; gap: var(--space-3); justify-content: flex-end; margin-top: var(--space-2); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default PayoutSettings;
