import { MapPin, Plus, Edit2, Trash2, Home, Loader2, CheckCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, where, orderBy, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase/config';

const SavedAddresses = () => {
    const { currentUser } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
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
            setAddresses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return;
        setFormLoading(true);
        try {
            const addrRef = collection(db, 'users', currentUser.uid, 'addresses');

            // If setting as default, unset others first
            if (formData.isDefault) {
                const batch = writeBatch(db);
                addresses.forEach(addr => {
                    if (addr.isDefault) {
                        batch.update(doc(db, 'users', currentUser.uid, 'addresses', addr.id), { isDefault: false });
                    }
                });
                await batch.commit();
            }

            if (editingAddress) {
                await updateDoc(doc(db, 'users', currentUser.uid, 'addresses', editingAddress.id), formData);
            } else {
                await addDoc(addrRef, formData);
            }

            setShowForm(false);
            setEditingAddress(null);
            setFormData({ label: '', address: '', city: '', zip: '', isDefault: false });
            await fetchAddresses();
        } catch (error) {
            console.error("Error saving address:", error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!currentUser || !window.confirm('Are you sure you want to delete this address?')) return;
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'addresses', id));
            await fetchAddresses();
        } catch (error) {
            console.error("Error deleting address:", error);
        }
    };

    const handleSetDefault = async (id) => {
        if (!currentUser) return;
        try {
            const batch = writeBatch(db);
            addresses.forEach(addr => {
                batch.update(doc(db, 'users', currentUser.uid, 'addresses', addr.id), {
                    isDefault: addr.id === id
                });
            });
            await batch.commit();
            await fetchAddresses();
        } catch (error) {
            console.error("Error setting default address:", error);
        }
    };

    const openEdit = (addr) => {
        setEditingAddress(addr);
        setFormData({
            label: addr.label,
            address: addr.address,
            city: addr.city,
            zip: addr.zip,
            isDefault: addr.isDefault
        });
        setShowForm(true);
    };

    return (
        <div className="addresses-page">
            <div className="page-header">
                <div><h1>Saved Addresses</h1><p>Manage your delivery addresses</p></div>
                {!showForm && <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={18} /> Add New</button>}
            </div>

            {showForm && (
                <div className="card form-card" style={{ marginBottom: 'var(--space-8)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                        <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                        <button className="btn btn-ghost btn-icon" onClick={() => { setShowForm(false); setEditingAddress(null); }}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Label (e.g., Home, Office)</label>
                            <input type="text" className="form-input" value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Street Address</label>
                            <input type="text" className="form-input" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <input type="text" className="form-input" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">ZIP Code</label>
                                <input type="text" className="form-input" value={formData.zip} onChange={(e) => setFormData({ ...formData, zip: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-group checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                            <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} />
                            <label htmlFor="isDefault" className="form-label" style={{ marginBottom: 0 }}>Set as default address</label>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                            <button type="submit" className="btn btn-primary" disabled={formLoading}>
                                {formLoading ? <Loader2 className="animate-spin" size={18} /> : 'Save Address'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingAddress(null); }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="addresses-grid">
                {loading ? (
                    <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: 'var(--space-12)' }}>
                        <Loader2 className="animate-spin" size={40} />
                    </div>
                ) : addresses.map(addr => (
                    <div key={addr.id} className={`card address-card ${addr.isDefault ? 'default-card' : ''}`}>
                        <div className="address-header">
                            <div className="address-icon"><MapPin size={20} /></div>
                            <div className="address-label">
                                <h4>{addr.label}</h4>
                                {addr.isDefault && <span className="badge badge-success">Primary</span>}
                            </div>
                            <div className="address-actions">
                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(addr)}><Edit2 size={16} /></button>
                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(addr.id)}><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="address-details">
                            <p className="main-address">{addr.address}</p>
                            <p className="sub-address">{addr.city}, {addr.zip}</p>
                        </div>
                        {!addr.isDefault && (
                            <button className="btn btn-ghost btn-sm set-default-btn" onClick={() => handleSetDefault(addr.id)}>
                                Set as Default
                            </button>
                        )}
                    </div>
                ))}
                {!loading && addresses.length === 0 && !showForm && (
                    <div className="empty-state-card" style={{ gridColumn: 'span 2', textAlign: 'center', padding: 'var(--space-12)', background: 'var(--gray-50)', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--gray-200)' }}>
                        <Home size={48} style={{ margin: '0 auto var(--space-4)', color: 'var(--gray-300)' }} />
                        <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-6)' }}>No addresses saved yet. Add your first address to get started!</p>
                        <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add Address</button>
                    </div>
                )}
            </div>

            <style>{`
        .addresses-page { max-width: 900px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .addresses-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-6); }
        .address-card { position: relative; transition: all 0.2s; border: 2px solid transparent; }
        .address-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
        .address-card.default-card { border-color: var(--success-200); background: var(--success-50); }
        .address-header { display: flex; align-items: flex-start; gap: var(--space-3); margin-bottom: var(--space-4); }
        .address-icon { width: 40px; height: 40px; background: var(--primary-50); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; color: var(--primary-600); }
        .default-card .address-icon { background: white; color: var(--success-600); }
        .address-label { flex: 1; }
        .address-label h4 { font-size: var(--text-lg); margin-bottom: 2px; }
        .address-actions { display: flex; gap: var(--space-1); }
        .address-details p { font-size: var(--text-sm); line-height: 1.5; }
        .main-address { font-weight: var(--font-medium); color: var(--gray-900); }
        .sub-address { color: var(--gray-500); }
        .set-default-btn { margin-top: var(--space-4); width: 100%; border: 1px solid var(--gray-200); }
        
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
        .checkbox-group input { width: 18px; height: 18px; cursor: pointer; }
        
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        @media (max-width: 768px) { .addresses-grid { grid-template-columns: 1fr; } .page-header { flex-direction: column; gap: var(--space-4); align-items: flex-start; } .form-row { grid-template-columns: 1fr; } }
      `}</style>
        </div>
    );
};

export default SavedAddresses;
