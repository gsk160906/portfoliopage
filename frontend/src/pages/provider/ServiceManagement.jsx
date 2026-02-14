import { Plus, Trash2, DollarSign, Clock, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

const ServiceManagement = () => {
    const { currentUser, userData, updateProfileData } = useAuth();
    const [allServices, setAllServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        const fetchAllServices = async () => {
            console.log("Fetching all available services...");
            try {
                const snapshot = await getDocs(query(collection(db, 'services'), orderBy('name', 'asc')));
                const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log(`Successfully fetched ${servicesData.length} services.`);
                setAllServices(servicesData);
            } catch (error) {
                console.error("Error fetching services:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllServices();
    }, []);

    const providerServices = Array.isArray(userData?.services) ? userData.services : [];

    const handleOpenModal = () => {
        console.log("Button clicked, setting showAddModal to true");
        setShowAddModal(true);
    };

    const handleToggleService = async (serviceName) => {
        setActionLoading(true);
        try {
            let updatedServices = [];
            const isAdding = !providerServices.includes(serviceName);

            if (!isAdding) {
                updatedServices = providerServices.filter(s => s !== serviceName);
            } else {
                updatedServices = [...providerServices, serviceName];
            }

            await updateProfileData({ services: updatedServices });

            if (isAdding) {
                alert(`Successfully added ${serviceName} to your profile!`);
            } else {
                alert(`Removed ${serviceName} from your profile.`);
            }

            setShowAddModal(false);
        } catch (error) {
            console.error("Error updating services:", error);
            alert("Failed to update services. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} /></div>;

    return (
        <div className="services-page">
            <div className="page-header">
                <div><h1>My Services</h1><p>Active services you are currently offering to customers</p></div>
                <button
                    className="btn btn-primary"
                    onClick={handleOpenModal}
                    id="add-service-btn"
                >
                    <Plus size={18} /> Add New Service
                </button>
            </div>

            <div className="services-list">
                {providerServices.length > 0 ? providerServices.map((sName, idx) => {
                    const fullService = allServices.find(as => as.name === sName);
                    return (
                        <div key={idx} className="card service-card">
                            <div className="service-main">
                                <div className="service-icon-box">
                                    {fullService?.image ? <img src={fullService.image} alt={sName} /> : <div className="placeholder-icon"><Check size={24} /></div>}
                                </div>
                                <div className="service-info">
                                    <h4>{sName}</h4>
                                    <div className="service-meta">
                                        <span><DollarSign size={14} /> From ${fullService?.basePrice || '---'}</span>
                                        <span><Clock size={14} /> ~{fullService?.duration || '1-2'} hours</span>
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-sm remove-btn" onClick={() => handleToggleService(sName)} disabled={actionLoading}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="empty-state">
                        <AlertCircle size={48} />
                        <h3>No Services Active</h3>
                        <p>You haven't listed any services yet. Start adding services to receive job requests!</p>
                        <button className="btn btn-primary btn-sm" onClick={handleOpenModal} style={{ marginTop: '1rem' }}>Add Your First Service</button>
                    </div>
                )}
            </div>

            {showAddModal && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowAddModal(false)}
                    style={{ visibility: 'visible', opacity: 1, display: 'flex' }}
                >
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add Service</h2>
                            <button className="btn-close" onClick={() => setShowAddModal(false)}><X size={20} /></button>
                        </div>
                        <div className="services-grid">
                            {allServices.length > 0 ? allServices.filter(s => !providerServices.includes(s.name)).map(service => (
                                <div
                                    key={service.id}
                                    className="service-option-card"
                                    onClick={() => handleToggleService(service.name)}
                                >
                                    <div className="option-image"><img src={service.image} alt={service.name} /></div>
                                    <div className="option-info">
                                        <h5>{service.name}</h5>
                                        <span>{service.category}</span>
                                    </div>
                                    <Plus size={16} className="add-icon" />
                                </div>
                            )) : (
                                <div className="modal-empty-state">
                                    <Loader2 className="animate-spin" size={24} />
                                    <p>Loading available services...</p>
                                </div>
                            )}
                            {allServices.length > 0 && allServices.filter(s => !providerServices.includes(s.name)).length === 0 && (
                                <div className="modal-empty-state">
                                    <Check size={24} color="var(--success)" />
                                    <p>You have already added all available services!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .services-page { max-width: 900px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .services-list { display: flex; flex-direction: column; gap: var(--space-4); }
        .service-card { padding: var(--space-4); transition: 0.2s; }
        .service-card:hover { transform: translateY(-2px); border-color: var(--primary-200); }
        .service-main { display: flex; align-items: center; gap: var(--space-4); }
        .service-icon-box { width: 60px; height: 60px; border-radius: var(--radius-lg); overflow: hidden; background: var(--gray-100); flex-shrink: 0; }
        .service-icon-box img { width: 100%; height: 100%; object-fit: cover; }
        .placeholder-icon { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--success); }
        .service-info { flex: 1; }
        .service-info h4 { font-size: var(--text-lg); margin-bottom: 4px; }
        .service-meta { display: flex; gap: var(--space-6); font-size: var(--text-sm); color: var(--gray-500); }
        .service-meta span { display: flex; align-items: center; gap: 4px; }
        .remove-btn { color: var(--error); opacity: 0.3; transition: 0.2s; }
        .service-card:hover .remove-btn { opacity: 1; }
        .remove-btn:hover { background: var(--error-light); }
        
        .empty-state { text-align: center; padding: 4rem; color: var(--gray-400); background: white; border-radius: var(--radius-xl); border: 2px dashed var(--gray-200); }
        .empty-state h3 { color: var(--gray-700); margin: 1rem 0 0.5rem; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(8px); }
        .modal-content { background: white; border-radius: var(--radius-2xl); width: 90%; max-width: 700px; max-height: 85vh; overflow-y: auto; padding: var(--space-8); box-shadow: 0 20px 50px rgba(0,0,0,0.3); border: 1px solid var(--gray-100); position: relative; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8); }
        .btn-close { background: var(--gray-50); border: none; cursor: pointer; color: var(--gray-500); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .btn-close:hover { background: var(--gray-100); color: var(--gray-900); }
        .services-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
        .service-option-card { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4); border: 1px solid var(--gray-200); border-radius: var(--radius-xl); cursor: pointer; position: relative; transition: 0.2s; background: white; }
        .service-option-card:hover { border-color: var(--primary-400); transform: translateY(-3px); box-shadow: var(--shadow-md); }
        .option-image { width: 60px; height: 60px; border-radius: var(--radius-lg); overflow: hidden; flex-shrink: 0; }
        .option-image img { width: 100%; height: 100%; object-fit: cover; }
        .option-info { flex: 1; }
        .option-info h5 { font-size: var(--text-base); margin-bottom: 2px; }
        .option-info span { font-size: 10px; text-transform: uppercase; color: var(--primary-600); font-weight: bold; background: var(--primary-50); padding: 2px 8px; border-radius: 4px; }
        .add-icon { color: var(--gray-300); transition: 0.2s; }
        .service-option-card:hover .add-icon { color: var(--primary-600); transform: scale(1.2); }
        
        .modal-empty-state { grid-column: span 2; display: flex; flex-direction: column; align-items: center; gap: var(--space-4); padding: var(--space-12); color: var(--gray-500); text-align: center; }
        .modal-empty-state p { font-size: var(--text-sm); max-width: 250px; margin: 0; }
        
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 600px) { .services-grid { grid-template-columns: 1fr; } }
      `}</style>
        </div>
    );
};

export default ServiceManagement;
