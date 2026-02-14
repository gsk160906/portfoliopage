import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, limit, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Search,
  Star,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Wrench,
  Zap,
  Paintbrush,
  Wind,
  Scissors,
  ChevronRight,
  Play,
  Quote,
  Loader2,
  Users
} from 'lucide-react';

const categories_static = [
  { icon: Sparkles, name: 'Cleaning', color: '#10B981' },
  { icon: Wrench, name: 'Maintenance', color: '#3B82F6' },
  { icon: Zap, name: 'Repair', color: '#F59E0B' },
  { icon: Wind, name: 'Appliance', color: '#06B6D4' },
  { icon: Paintbrush, name: 'Home Decor', color: '#8B5CF6' },
  { icon: Scissors, name: 'Beauty', color: '#EC4899' },
];

const stats_static = [
  { value: '2,500+', label: 'Happy Customers' },
  { value: '150+', label: 'Verified Pros' },
  { value: '50+', label: 'Service Types' },
  { value: '4.8', label: 'Average Rating' },
];

// Map old hardcoded service names to new database names
const SERVICE_NAME_MAP = {
  'Electrical': 'Electrical Fix',
  'Plumbing': 'Plumber Repair',
  'Beauty & Spa': 'Massage Therapy',
  'AC & Appliances': 'AC Service'
};

const Home = () => {
  const [popularServices, setPopularServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealPopular = async () => {
      setLoading(true);
      try {
        // 1. Fetch all active providers to see what services they offer
        const providersQuery = query(collection(db, 'users'), where('role', '==', 'provider'));
        const providersSnapshot = await getDocs(providersQuery);
        const activeServiceNames = new Set();

        providersSnapshot.docs.forEach(doc => {
          const pData = doc.data();
          if (Array.isArray(pData.services)) {
            pData.services.forEach(sName => {
              activeServiceNames.add(sName);
              // Add mapped name if it exists to ensure matching with DB
              if (SERVICE_NAME_MAP[sName]) {
                activeServiceNames.add(SERVICE_NAME_MAP[sName]);
              }
            });
          }
        });

        // 2. Fetch global services
        const snapshot = await getDocs(collection(db, 'services'));
        const allServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 3. Filter to only show services that HAVE active providers
        // and sort by rating in-memory to handle missing rating fields
        const realPopular = allServices
          .filter(s => activeServiceNames.has(s.name))
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 4); // Show top 4 real services

        setPopularServices(realPopular);
      } catch (err) {
        console.error("Error fetching popular services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRealPopular();
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge"><Sparkles size={16} /> #1 Service Booking Platform</div>
              <h1 className="hero-title">Book Local Services <br /><span className="gradient-text">With Confidence</span></h1>
              <p className="hero-subtitle">Find trusted professionals for all your home service needs. From cleaning to repairs, we've got you covered.</p>
              <div className="hero-search">
                <div className="hero-search-input"><Search size={20} /><input type="text" placeholder="What service do you need?" /></div>
                <Link to="/services" className="btn btn-primary btn-lg">Find Services</Link>
              </div>
              <div className="hero-trust">
                <div className="trust-badge"><Shield size={18} /><span>Verified Pros</span></div>
                <div className="trust-badge"><CheckCircle size={18} /><span>Satisfaction Guaranteed</span></div>
              </div>
            </div>
            <div className="hero-stats-card">
              <div className="hero-image-wrapper">
                <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=400&fit=crop" alt="Professional" className="hero-image" />
                <div className="hero-stats-overlay">
                  {stats_static.map((stat, idx) => (
                    <div key={idx} className="hero-stat">
                      <span className="hero-stat-value">{stat.value}</span>
                      <span className="hero-stat-label">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <div><h2>Browse by Category</h2><p>Explore services tailored to your needs</p></div>
            <Link to="/services" className="btn btn-secondary">View All <ArrowRight size={18} /></Link>
          </div>
          <div className="categories-grid">
            {categories_static.map((category, idx) => (
              <Link key={idx} to={`/services`} className="category-card">
                <div className="category-icon" style={{ backgroundColor: `${category.color}15`, color: category.color }}><category.icon size={28} /></div>
                <h3 className="category-name">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section services-section">
        <div className="container">
          <div className="section-header">
            <div><h2>Popular Services</h2><p>Most booked services by our customers</p></div>
            <Link to="/services" className="btn btn-secondary">View All <ArrowRight size={18} /></Link>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={32} className="animate-spin" /></div>
          ) : (
            <div className="services-grid">
              {popularServices.map((service) => (
                <Link key={service.id} to={`/services/${service.id}`} className="card service-card">
                  <div className="service-card-image-wrapper"><img src={service.image} alt={service.name} className="service-card-image" /></div>
                  <div className="service-card-content">
                    <div className="service-card-rating"><Star size={16} fill="currentColor" /><span>{service.rating}</span></div>
                    <h3 className="service-card-title">{service.name}</h3>
                    <div className="service-card-footer">
                      <div className="service-card-price"><span className="price-label">Starting at</span><span className="price-value">${service.basePrice}</span></div>
                      <button className="btn btn-primary btn-sm">Book Now</button>
                    </div>
                  </div>
                </Link>
              ))}
              {popularServices.length === 0 && (
                <div className="empty-state" style={{ gridColumn: 'span 4', textAlign: 'center', padding: '4rem', color: 'var(--gray-400)' }}>
                  <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p>Our professionals are currently preparing their services. Check back soon!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .home-page { overflow-x: hidden; }
        .hero { background: var(--gradient-hero); padding: var(--space-16) 0 var(--space-20); color: white; }
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-12); align-items: center; }
        .hero-title { font-size: 3.5rem; line-height: 1.1; margin-bottom: var(--space-6); color: white; }
        .gradient-text { background: linear-gradient(90deg, #fff 0%, #E0E7FF 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-search { display: flex; background: white; border-radius: var(--radius-xl); padding: var(--space-2); max-width: 560px; margin-bottom: var(--space-8); }
        .hero-search-input { flex: 1; display: flex; align-items: center; gap: var(--space-3); padding: 0 var(--space-4); color: var(--gray-400); }
        .hero-search-input input { border: none; font-size: var(--text-lg); width: 100%; }
        .hero-search-input input:focus { outline: none; }
        .hero-image-wrapper { border-radius: var(--radius-2xl); overflow: hidden; box-shadow: var(--shadow-2xl); position: relative; }
        .hero-image { width: 100%; height: 400px; object-fit: cover; }
        .hero-stats-overlay { position: absolute; bottom: 0; width: 100%; display: grid; grid-template-columns: repeat(4, 1fr); background: rgba(255,255,255,0.95); padding: var(--space-4); }
        .hero-stat-value { display: block; font-weight: bold; color: var(--primary-600); }
        .hero-stat-label { font-size: 10px; color: var(--gray-500); }
        .categories-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: var(--space-4); }
        .category-card { background: white; padding: var(--space-6); border-radius: var(--radius-xl); text-align: center; border: 1px solid var(--gray-100); transition: 0.3s; }
        .category-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
        .category-icon { width: 60px; height: 60px; margin: 0 auto var(--space-4); display: flex; align-items: center; justify-content: center; border-radius: 50%; }
        .services-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-6); }
        .service-card { padding: 0; overflow: hidden; }
        .service-card-image-wrapper { height: 160px; overflow: hidden; }
        .service-card-image { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
        .service-card:hover .service-card-image { transform: scale(1.1); }
        .service-card-content { padding: var(--space-4); }
        .service-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-4); border-top: 1px solid var(--gray-100); padding-top: var(--space-4); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 1024px) { .hero-grid { grid-template-columns: 1fr; } .categories-grid { grid-template-columns: repeat(3, 1fr); } .services-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .categories-grid { grid-template-columns: repeat(2, 1fr); } .services-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default Home;
