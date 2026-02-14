import { Link, useParams } from 'react-router-dom';
import { Star, Clock, ChevronRight, Filter, Search, Loader2, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

const ServiceCategory = () => {
  const { categoryId } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [providerCount, setProviderCount] = useState(0);

  // Format category name for display
  const categoryName = categoryId?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Category';

  useEffect(() => {
    const fetchCategoryServices = async () => {
      setLoading(true);
      try {
        // 1. Fetch providers who have services in this category
        const providersQuery = query(collection(db, 'users'), where('role', '==', 'provider'));
        const providersSnapshot = await getDocs(providersQuery);

        const activeServiceNames = new Set();
        const serviceProviderCounts = {};
        const uniqueProvidersInCat = new Set();

        providersSnapshot.docs.forEach(doc => {
          const pData = doc.data();
          if (Array.isArray(pData.services)) {
            pData.services.forEach(sName => {
              activeServiceNames.add(sName); // We'll filter global services by these
              serviceProviderCounts[sName] = (serviceProviderCounts[sName] || 0) + 1;
              uniqueProvidersInCat.add(doc.id);
            });
          }
        });

        // 2. Fetch global services specifically for this category meta-tag
        const servicesCol = collection(db, 'services');
        const categoryQuery = query(servicesCol, where('category', '==', categoryName));
        const snapshot = await getDocs(categoryQuery);

        const allCategoryServices = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // 3. Filter to only show services that HAVE active providers
        const realServices = allCategoryServices
          .filter(s => activeServiceNames.has(s.name))
          .map(s => ({
            ...s,
            providerCount: serviceProviderCounts[s.name] || 0
          }));

        setServices(realServices);
        setProviderCount(uniqueProvidersInCat.size);
      } catch (error) {
        console.error("Error fetching category services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryServices();
  }, [categoryName]);

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="category-page">
      {/* Hero Section */}
      <section className="category-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={16} />
            <Link to="/services">Services</Link>
            <ChevronRight size={16} />
            <span>{categoryName}</span>
          </div>
          <h1>{categoryName} Services</h1>
          <p>Professional {categoryName.toLowerCase()} services for your home and business</p>

          <div className="category-stats">
            <div className="stat">
              <strong>{services.length}</strong>
              <span>Service Types</span>
            </div>
            <div className="stat">
              <strong>{providerCount}</strong>
              <span>Active Professionals</span>
            </div>
            <div className="stat">
              <strong>4.8</strong>
              <span>Avg. Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section">
        <div className="container">
          {/* Toolbar */}
          <div className="category-toolbar">
            <div className="search-input-wrapper">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder={`Search ${categoryName.toLowerCase()} services...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input search-input"
              />
            </div>
            <div className="toolbar-info">
              <span>Showing <strong>{filteredServices.length}</strong> real-world services</span>
            </div>
          </div>

          {/* Services Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 size={40} className="animate-spin" /></div>
          ) : (
            <div className="services-grid">
              {filteredServices.map(service => (
                <Link key={service.id} to={`/services/${service.id}`} className="card service-card">
                  <div className="service-card-image-wrapper">
                    <img src={service.image} alt={service.name} className="service-card-image" />
                    <span className="service-card-badge">{service.providerCount} Available</span>
                  </div>
                  <div className="service-card-content">
                    <div className="service-card-rating">
                      <Star size={16} fill="#FBBF24" color="#FBBF24" />
                      <span>{service.rating}</span>
                    </div>
                    <h3 className="service-card-title">{service.name}</h3>
                    <div className="service-card-meta">
                      <Users size={14} />
                      <span>Verified Professionals Ready</span>
                    </div>
                    <div className="service-card-footer">
                      <div className="service-card-price">
                        <span className="price-label">From</span>
                        <span className="price-value">${service.basePrice}</span>
                      </div>
                      <button className="btn btn-primary btn-sm">Book Now</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && filteredServices.length === 0 && (
            <div className="empty-state text-center">
              <Users size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
              <h3>Currently expanding our {categoryName} team</h3>
              <p>We're onboarding new professionals daily. Please check back soon or try another category!</p>
              <Link to="/services" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>View All Services</Link>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .category-hero { background: var(--gradient-hero); padding: var(--space-16) 0; color: white; }
        .category-hero .breadcrumb { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); margin-bottom: var(--space-6); opacity: 0.9; }
        .category-hero .breadcrumb a { color: white; }
        .category-hero h1 { color: white; font-size: var(--text-4xl); margin-bottom: var(--space-3); }
        .category-hero p { color: rgba(255,255,255,0.9); font-size: var(--text-base); margin-bottom: var(--space-8); max-width: 600px; }
        .category-stats { display: flex; gap: var(--space-10); }
        .category-stats .stat { display: flex; flex-direction: column; gap: var(--space-1); }
        .category-stats strong { font-size: var(--text-2xl); }
        .category-stats span { font-size: var(--text-sm); opacity: 0.8; }
        .category-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-8); gap: var(--space-4); background: white; padding: var(--space-4) var(--space-6); border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); }
        .search-input-wrapper { display: flex; align-items: center; gap: var(--space-3); flex: 1; min-width: 300px; background: var(--gray-50); padding: 0 var(--space-4); border-radius: var(--radius-lg); }
        .search-input { border: none; background: transparent; padding: var(--space-3) 0; width: 100%; }
        .toolbar-info { color: var(--gray-500); font-size: var(--text-sm); }
        .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); }
        .service-card { padding: 0; overflow: hidden; border: 1px solid var(--gray-100); transition: 0.3s; }
        .service-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-xl); border-color: var(--primary-200); }
        .service-card-image-wrapper { height: 200px; position: relative; overflow: hidden; }
        .service-card-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .service-card-badge { position: absolute; top: var(--space-3); right: var(--space-3); background: var(--success); color: white; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .service-card:hover .service-card-image { transform: scale(1.1); }
        .service-card-content { padding: var(--space-5); }
        .service-card-rating { display: flex; align-items: center; gap: var(--space-1); color: var(--accent-yellow); font-weight: var(--font-semibold); font-size: var(--text-sm); margin-bottom: var(--space-2); }
        .service-card-title { font-size: var(--text-xl); margin-bottom: var(--space-2); color: var(--gray-900); }
        .service-card-meta { display: flex; align-items: center; gap: var(--space-2); color: var(--gray-500); font-size: var(--text-sm); margin-bottom: var(--space-4); }
        .service-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: var(--space-4); border-top: 1px solid var(--gray-100); }
        .price-label { display: block; font-size: var(--text-xs); color: var(--gray-500); }
        .price-value { font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--primary-600); }
        .empty-state { padding: var(--space-20) 0; color: var(--gray-500); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 1024px) { .services-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .category-toolbar { flex-direction: column; align-items: stretch; } .services-grid { grid-template-columns: 1fr; } .category-stats { gap: var(--space-6); } }
      `}</style>
    </div>
  );
};

export default ServiceCategory;
