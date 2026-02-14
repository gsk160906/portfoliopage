import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Search,
  Star,
  Filter,
  Grid,
  List,
  ChevronDown,
  MapPin,
  Clock,
  Loader2,
  Users
} from 'lucide-react';

// Map old hardcoded service names to new database names
const SERVICE_NAME_MAP = {
  'Electrical': 'Electrical Fix',
  'Plumbing': 'Plumber Repair',
  'Beauty & Spa': 'Massage Therapy',
  'AC & Appliances': 'AC Service'
};

const AllServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]);
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

        // 2. Fetch global service metadata
        const snapshot = await getDocs(collection(db, 'services'));
        const allGlobalServices = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // 3. Filter to only "Real" services and sort by name
        const realServices = allGlobalServices
          .filter(s => activeServiceNames.has(s.name))
          .map(s => ({
            ...s,
            providerCount: serviceProviderCounts[s.name] || 0
          }))
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        setServices(realServices);

        // 4. Extract unique categories from active services
        const uniqueCats = ['All', ...new Set(realServices.map(s => s.category).filter(Boolean))];
        setAvailableCategories(uniqueCats);

      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealServices();
  }, []);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    const matchesPrice = service.basePrice >= priceRange[0] && service.basePrice <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="all-services-page">
      <section className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>All Services</span>
          </div>
          <h1>All Services</h1>
          <p>Browse our wide range of professional services</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="services-layout">
            <aside className={`filters-sidebar ${showFilters ? 'open' : ''}`}>
              <div className="filter-section">
                <h3>Categories</h3>
                <div className="filter-options">
                  {availableCategories.map(category => (
                    <label key={category} className="filter-option">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h3>Price Range</h3>
                <div className="price-inputs">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                    className="form-input"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                    className="form-input"
                  />
                </div>
              </div>
            </aside>

            <main className="services-main">
              <div className="services-toolbar">
                <div className="search-filter-row">
                  <div className="search-input-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="form-input search-input"
                    />
                  </div>
                  <button className="btn btn-secondary mobile-filter-btn" onClick={() => setShowFilters(!showFilters)}>
                    <Filter size={18} /> Filters
                  </button>
                </div>
                <div className="toolbar-right">
                  <div className="results-count"><strong>{filteredServices.length}</strong> services found</div>
                  <div className="view-toggle">
                    <button className={`btn btn-icon ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><Grid size={18} /></button>
                    <button className={`btn btn-icon ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><List size={18} /></button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="loading-state" style={{ textAlign: 'center', padding: 'var(--space-20)' }}>
                  <Loader2 size={48} className="animate-spin" />
                  <p>Searching for active professionals...</p>
                </div>
              ) : (
                <div className={`services-grid ${viewMode}`}>
                  {filteredServices.map(service => (
                    <Link key={service.id} to={`/services/${service.id}`} className={`card service-card ${viewMode === 'list' ? 'list-view' : ''}`}>
                      <div className="service-card-image-wrapper">
                        <img src={service.image} alt={service.name} className="service-card-image" />
                      </div>
                      <div className="service-card-content">
                        <span className="service-card-category">{service.category}</span>
                        <div className="service-card-rating">
                          <Star size={16} fill="#FBBF24" color="#FBBF24" />
                          <span>{service.rating}</span>
                        </div>
                        <h3 className="service-card-title">{service.name}</h3>
                        <div className="service-card-metadata" style={{ margin: 'var(--space-2) 0', fontSize: 'var(--text-sm)', color: 'var(--gray-500)', display: 'flex', gap: 'var(--space-4)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> {service.providerCount} Available</span>
                        </div>
                        <div className="service-card-footer">
                          <div className="service-card-price">
                            <span className="price-label">Starting at</span>
                            <span className="price-value">${service.basePrice}</span>
                          </div>
                          <button className="btn btn-primary btn-sm">Details</button>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {!loading && filteredServices.length === 0 && (
                    <div className="empty-state" style={{ gridColumn: 'span 3' }}>
                      <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                      <h3>No results match your search</h3>
                      <p>We're currently scaling our service network. Check back soon!</p>
                      <button className="btn btn-primary" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setPriceRange([0, 500]); }}>Clear Filters</button>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      <style>{`
        .all-services-page { max-width: 1200px; margin: 0 auto; }
        .page-header { background: var(--gradient-hero); padding: var(--space-12) 0; color: white; }
        .breadcrumb { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); margin-bottom: var(--space-4); opacity: 0.9; }
        .breadcrumb a { color: white; }
        .page-header h1, .page-header p { color: white; }
        .services-layout { display: grid; grid-template-columns: 250px 1fr; gap: var(--space-8); padding: var(--space-8) 0; }
        .filters-sidebar { background: white; border-radius: var(--radius-xl); padding: var(--space-6); box-shadow: var(--shadow-sm); height: fit-content; position: sticky; top: 100px; }
        .filter-section { margin-bottom: var(--space-6); padding-bottom: var(--space-6); border-bottom: 1px solid var(--gray-100); }
        .filter-section h3 { font-size: var(--text-base); margin-bottom: var(--space-4); }
        .filter-options { display: flex; flex-direction: column; gap: var(--space-3); }
        .filter-option { display: flex; align-items: center; gap: var(--space-3); cursor: pointer; }
        .price-inputs { display: flex; align-items: center; gap: var(--space-2); }
        .price-inputs input { width: 70px; }
        .services-toolbar { background: white; border-radius: var(--radius-xl); padding: var(--space-4) var(--space-6); margin-bottom: var(--space-6); box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: center; flex-wrap:wrap; gap: var(--space-4); }
        .search-input-wrapper { display: flex; align-items: center; gap: var(--space-2); flex: 1; min-width: 250px; background: var(--gray-50); padding: 0 var(--space-4); border-radius: var(--radius-lg); }
        .search-input { border: none; background: transparent; padding: var(--space-3) 0; width: 100%; }
        .toolbar-right { display: flex; align-items: center; gap: var(--space-6); }
        .services-grid.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); }
        .services-grid.list { display: flex; flex-direction: column; gap: var(--space-4); }
        .service-card { padding: 0; overflow: hidden; transition: transform 0.2s; }
        .service-card:hover { transform: translateY(-4px); }
        .service-card-image-wrapper { height: 180px; overflow: hidden; }
        .service-card-image { width: 100%; height: 100%; object-fit: cover; }
        .service-card-content { padding: var(--space-5); }
        .service-card-category { font-size: var(--text-xs); color: var(--primary-600); background: var(--primary-50); padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm); display: inline-block; margin-bottom: var(--space-2); }
        .service-card-rating { display: flex; align-items: center; gap: var(--space-1); color: var(--accent-yellow); font-size: var(--text-sm); margin-bottom: var(--space-2); }
        .service-card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: var(--space-4); border-top: 1px solid var(--gray-100); }
        .price-value { font-size: var(--text-lg); font-weight: var(--font-bold); color: var(--primary-600); }
        .empty-state { text-align: center; padding: var(--space-16); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 1024px) { .services-layout { grid-template-columns: 1fr; } .filters-sidebar { display: none; } }
        @media (max-width: 1200px) { .services-grid.grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .services-grid.grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default AllServices;
