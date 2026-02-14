import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Plus, CheckCircle, Loader2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, getDocs, addDoc, orderBy, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const AddressSelect = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { service, provider, date, time } = location.state || {};
    const { currentUser } = useAuth();

    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddNew, setShowAddNew] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState({
        label: '',
        address: '',
        city: '',
        zip: '',
        isDefault: false
    });

    const fetchAddresses = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const addrRef = collection(db, 'users', currentUser.uid, 'addresses');
            const q = query(addrRef, orderBy('isDefault', 'desc'));
            const snapshot = await getDocs(q);
            const addrList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAddresses(addrList);

            // Auto-select the default address
            if (addrList.length > 0) {
                const defaultAddr = addrList.find(a => a.isDefault) || addrList[0];
                setSelectedAddressId(defaultAddr.id);
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [currentUser]);

    const handleAddAddress = async (e) => {
        e.preventDefault();
        if (!currentUser) return;
        setFormLoading(true);
        try {
            const addrRef = collection(db, 'users', currentUser.uid, 'addresses');
            const docRef = await addDoc(addrRef, { ...formData });

            setShowAddNew(false);
            setFormData({ label: '', address: '', city: '', zip: '', isDefault: false });

            // Refresh and select new address
            await fetchAddresses();
            setSelectedAddressId(docRef.id);
        } catch (error) {
            console.error("Error adding address:", error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleContinue = () => {
        const selected = addresses.find(a => a.id === selectedAddressId);
        navigate('/customer/checkout', {
            state: { service, provider, date, time, address: selected }
        });
    };

    if (!service) {
        return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
            <h3>Session Expired</h3>
            <Link to="/customer/book-service" className="btn btn-primary">Go Back to Selection</Link>
        </div>;
    }

    return (
        <div className="address-page">
            <div className="page-header">
                <h1>Select Address</h1>
                <p>Where should we provide the {service?.name}?</p>
            </div>

            <div className="steps-indicator">
                <div className="step completed"><span>✓</span>Select Service</div>
                <div className="step completed"><span>✓</span>Schedule</div>
                <div className="step active"><span>3</span>Address</div>
                <div className="step"><span>4</span>Checkout</div>
            </div>

            <div className="addresses-list">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="animate-spin" size={32} /></div>
                ) : addresses.map(addr => (
                    <div
                        key={addr.id}
                        className={`card address-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                        onClick={() => setSelectedAddressId(addr.id)}
                    >
                        <div className="address-icon"><MapPin size={20} /></div>
                        <div className="address-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h4>{addr.label}</h4>
                                {addr.isDefault && <span className="badge badge-success">Primary</span>}
                            </div>
                            <p>{addr.address}</p>
                            <p className="city">{addr.city}, {addr.zip}</p>
                        </div>
                        {selectedAddressId === addr.id && <CheckCircle size={24} className="check-icon" />}
                    </div>
                ))}

                {!loading && addresses.length === 0 && !showAddNew && (
                    <div className="empty-state-info" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--gray-500)' }}>
                        <MapPin size={40} style={{ margin: '0 auto var(--space-4)', opacity: 0.5 }} />
                        <p>You haven't saved any addresses yet.</p>
                    </div>
                )}

                {!showAddNew && (
                    <button className="card add-address-btn" onClick={() => setShowAddNew(true)}>
                        <Plus size={20} /> Add New Address
                    </button>
                )}
            </div>

            {showAddNew && (
                <div className="card new-address-form" style={{ position: 'relative' }}>
                    <button className="btn btn-ghost btn-icon" onClick={() => setShowAddNew(false)} style={{ position: 'absolute', top: '10px', right: '10px' }}><X size={20} /></button>
                    <h3>Add New Address</h3>
                    <form onSubmit={handleAddAddress}>
                        <div className="form-group"><label className="form-label">Label (Home, Office, etc.)</label><input type="text" className="form-input" value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} placeholder="e.g., Home" required /></div>
                        <div className="form-group"><label className="form-label">Street Address</label><input type="text" className="form-input" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Full address" required /></div>
                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group"><label className="form-label">City</label><input type="text" className="form-input" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="City" required /></div>
                            <div className="form-group"><label className="form-label">ZIP Code</label><input type="text" className="form-input" value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} placeholder="ZIP" required /></div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={formLoading} style={{ marginTop: '1rem' }}>
                            {formLoading ? <Loader2 className="animate-spin" size={18} /> : 'Save and Select'}
                        </button>
                    </form>
                </div>
            )}

            <div className="nav-buttons" style={{ marginTop: 'var(--space-8)', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => navigate(-1)} className="btn btn-secondary">Back</button>
                <button
                    onClick={handleContinue}
                    className="btn btn-primary"
                    disabled={!selectedAddressId || formLoading}
                >
                    Continue to Checkout
                </button>
            </div>

            <style>{`
        .address-page { max-width: 700px; margin: 0 auto; }
        .page-header { margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .steps-indicator { display: flex; justify-content: space-between; margin-bottom: var(--space-8); padding: var(--space-4); background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); }
        .step { display: flex; align-items: center; gap: var(--space-2); color: var(--gray-400); font-size: var(--text-sm); }
        .step span { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: var(--gray-100); border-radius: 50%; font-weight: var(--font-semibold); }
        .step.active { color: var(--primary-600); }
        .step.active span { background: var(--primary-600); color: white; }
        .step.completed span { background: var(--success); color: white; }
        .addresses-list { display: flex; flex-direction: column; gap: var(--space-4); margin-bottom: var(--space-6); }
        .address-card { display: flex; align-items: center; gap: var(--space-4); cursor: pointer; border: 2px solid transparent; transition: 0.2s; }
        .address-card.selected { border-color: var(--primary-600); background: var(--primary-50); }
        .address-icon { width: 48px; height: 48px; background: var(--gray-100); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; color: var(--gray-500); }
        .address-card.selected .address-icon { background: var(--white); color: var(--primary-600); }
        .address-info { flex: 1; }
        .address-info h4 { font-size: var(--text-base); margin-bottom: 2px; }
        .address-info p { font-size: var(--text-sm); color: var(--gray-600); }
        .address-info .city { color: var(--gray-400); }
        .check-icon { color: var(--primary-600); }
        .add-address-btn { display: flex; align-items: center; justify-content: center; gap: var(--space-2); color: var(--primary-600); border: 2px dashed var(--gray-300); cursor: pointer; background: transparent; padding: var(--space-6); }
        .add-address-btn:hover { border-color: var(--primary-400); background: var(--primary-50); }
        .new-address-form { margin-bottom: var(--space-6); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .nav-buttons { flex-direction: column-reverse; gap: 1rem; } .nav-buttons button { width: 100%; } }
      `}</style>
        </div>
    );
};

export default AddressSelect;
