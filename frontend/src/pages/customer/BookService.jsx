import { Link } from 'react-router-dom';
import { Clock, ChevronRight, Loader2, Search, Filter, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Map old hardcoded service names to new database names
const SERVICE_NAME_MAP = {
    'Electrical': 'Electrical Fix',
    'Plumbing': 'Plumber Repair',
    'Beauty & Spa': 'Massage Therapy',
    'AC & Appliances': 'AC Service'
};

const BookService = () => {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [availableCategories, setAvailableCategories] = useState(['All']);

    useEffect(() => {
        const fetchRealServices = async () => {
            setLoading(true);
            try {
                // 1. Fetch all active providers
                const providersQuery = query(collection(db, 'users'), where('role', '==', 'provider'));
                const providersSnapshot = await getDocs(providersQuery);
                const providers = providersSnapshot.docs.map(doc => doc.data());

                // 2. Aggregate services and counts
                const serviceProviderCounts = {};
                const activeServiceNames = new Set();

                providers.forEach(p => {
                    if (Array.isArray(p.services)) {
                        p.services.forEach(sName => {
                            activeServiceNames.add(sName);
                            serviceProviderCounts[sName] = (serviceProviderCounts[sName] || 0) + 1;

                            // Add mapped name if it exists to ensure matching with DB
                            if (SERVICE_NAME_MAP[sName]) {
                                const mappedName = SERVICE_NAME_MAP[sName];
                                activeServiceNames.add(mappedName);
                                serviceProviderCounts[mappedName] = (serviceProviderCounts[mappedName] || 0) + 1;
                            }
                        });
                    }
                });

                // 3. Fetch global service metadata
                const snapshot = await getDocs(collection(db, 'services'));
                const allGlobalServices = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // 4. Filter to only "Real" services and sort by name
                const realServices = allGlobalServices
                    .filter(s => activeServiceNames.has(s.name))
                    .map(s => ({
                        ...s,
                        providerCount: serviceProviderCounts[s.name] || 0
                    }))
                    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

                setServices(realServices);
                setFilteredServices(realServices);

                // 5. Derive unique categories from active services
                const uniqueCategories = ['All', ...new Set(realServices.map(s => s.category).filter(Boolean))];
                setAvailableCategories(uniqueCategories);
            } catch (error) {
                console.error("Error fetching services:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRealServices();
    }, []);

    useEffect(() => {
        const filtered = services.filter(service => {
            const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
        setFilteredServices(filtered);
    }, [searchQuery, selectedCategory, services]);

    return (
        <div className="book-service-page">
            <div className="page-header">
                <h1>Book a Service</h1>
                <p>Find the perfect professional for your needs</p>
            </div>

            <div className="steps-indicator">
                <div className="step active"><span>1</span>Select Service</div>
                <div className="step"><span>2</span>Schedule</div>
                <div className="step"><span>3</span>Address</div>
                <div className="step"><span>4</span>Checkout</div>
            </div>

            <div className="search-filter-section">
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search for a service..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="categories-pills">
                    {availableCategories.map(cat => (
                        <button
                            key={cat}
                            className={`pill ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <Loader2 size={40} className="animate-spin" />
                    <p>Scanning for available professionals...</p>
                </div>
            ) : (
                <div className="services-grid">
                    {filteredServices.map(service => (
                        <Link key={service.id} to={`/services/${service.id}`} className="card service-option">
                            <div className="service-image-container">
                                <img src={service.image} alt={service.name} />
                            </div>
                            <div className="service-info">
                                <div className="service-tag">{service.category}</div>
                                <h3>{service.name}</h3>
                                <div className="service-meta">

                                    <span className="price">Starting from ${service.basePrice}</span>
                                    <span className="provider-count">
                                        <Users size={12} style={{ marginRight: '4px' }} />
                                        {service.providerCount} {service.providerCount === 1 ? 'Professional' : 'Professionals'} Available
                                    </span>
                                </div>
                            </div>
                            <ChevronRight size={20} className="arrow-icon" />
                        </Link>
                    ))}
                    {filteredServices.length === 0 && (
                        <div className="empty-state">
                            <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3>No Active Professionals Found</h3>
                            <p>We're currently onboarding pros in this category. Please check back soon!</p>
                            <button className="btn btn-ghost" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>Clear Filters</button>
                        </div>
                    )}
                </div>
            )}

            <style>{`
        .book-service-page { max-width: 1000px; margin: 0 auto; }
        .page-header { margin-bottom: var(--space-6); text-align: left; }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .steps-indicator { display: flex; justify-content: space-between; margin-bottom: var(--space-8); padding: var(--space-4); background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); }
        .step { display: flex; align-items: center; gap: var(--space-2); color: var(--gray-400); font-size: var(--text-sm); }
        .step span { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: var(--gray-100); border-radius: 50%; font-weight: var(--font-semibold); }
        .step.active { color: var(--primary-600); }
        .step.active span { background: var(--primary-600); color: white; }
        .step.completed span { background: var(--success); color: white; }
        
        .search-filter-section { margin-bottom: var(--space-8); display: flex; flex-direction: column; gap: var(--space-4); }
        .search-bar { display: flex; align-items: center; gap: var(--space-3); background: white; padding: 0 var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--gray-200); box-shadow: var(--shadow-sm); }
        .search-bar input { flex: 1; border: none; padding: var(--space-3) 0; font-size: var(--text-base); }
        .search-bar input:focus { outline: none; }
        .categories-pills { display: flex; gap: var(--space-2); overflow-x: auto; padding-bottom: var(--space-2); }
        .pill { padding: var(--space-2) var(--space-4); border-radius: var(--radius-full); background: white; border: 1px solid var(--gray-200); cursor: pointer; white-space: nowrap; font-size: var(--text-sm); }
        .pill.active { background: var(--primary-600); color: white; border-color: var(--primary-600); }
        
        .services-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-6); }
        .service-option { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4); cursor: pointer; transition: all 0.2s; position: relative; }
        .service-option:hover { border-color: var(--primary-400); transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .service-image-container { width: 100px; height: 100px; border-radius: var(--radius-lg); overflow: hidden; flex-shrink: 0; }
        .service-image-container img { width: 100%; height: 100%; object-fit: cover; }
        .service-info { flex: 1; }
        .service-tag { font-size: 10px; font-weight: bold; text-transform: uppercase; color: var(--primary-600); background: var(--primary-50); padding: 2px 8px; border-radius: var(--radius-full); width: fit-content; margin-bottom: 4px; }
        .service-info h3 { font-size: var(--text-lg); margin-bottom: var(--space-1); }
        .service-meta { display: flex; flex-direction: column; gap: 4px; font-size: var(--text-sm); }
        .rating { display: flex; align-items: center; gap: var(--space-1); color: var(--gray-600); }
        .price { color: var(--primary-600); font-weight: var(--font-bold); }
        .provider-count { display: flex; align-items: center; font-size: 11px; color: var(--success); font-weight: 500; }
        .arrow-icon { color: var(--gray-300); }
        .loading-state, .empty-state { grid-column: span 2; text-align: center; padding: var(--space-16); color: var(--gray-500); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .services-grid { grid-template-columns: 1fr; } .search-filter-section { padding: 0 4px; } }
      `}</style>
        </div>
    );
};

export default BookService;
