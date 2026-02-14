import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Star,
  Clock,
  Shield,
  CheckCircle,
  MapPin,
  Calendar,
  User,
  ChevronRight,
  Heart,
  Share2,
  MessageCircle,
  Loader2,
  Users,
  AlertTriangle,
  Award,
  BadgeCheck
} from 'lucide-react';

// Map old hardcoded service names to new database names
const SERVICE_NAME_MAP = {
  'Electrical': 'Electrical Fix',
  'Plumbing': 'Plumber Repair',
  'Beauty & Spa': 'Massage Therapy',
  'AC & Appliances': 'AC Service'
};

const ServiceDetails = () => {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceAndProviders = async () => {
      try {
        // 1. Fetch Service Metadata
        const docRef = doc(db, 'services', serviceId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const sData = { id: docSnap.id, ...docSnap.data() };
          setService(sData);

          // 2. Fetch Providers offering this specific service
          const providersQuery = query(collection(db, 'users'), where('role', '==', 'provider'));
          const providersSnapshot = await getDocs(providersQuery);

          const filteredProviders = [];
          providersSnapshot.docs.forEach(doc => {
            const pData = doc.data();
            if (Array.isArray(pData.services)) {
              // Check exact match OR mapped legacy name
              const hasService = pData.services.some(sName =>
                sName === sData.name || SERVICE_NAME_MAP[sName] === sData.name
              );

              if (hasService) {
                filteredProviders.push({ id: doc.id, ...pData });
              }
            }
          });
          setProviders(filteredProviders);
          if (filteredProviders.length > 0) {
            setSelectedProvider(filteredProviders[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceAndProviders();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="loading-container" style={{ textAlign: 'center', padding: 'var(--space-20)' }}>
        <Loader2 size={48} className="animate-spin" />
        <p>Connecting you with the best professionals...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-details-page">
        <section className="section">
          <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
            <h2>Service Not Found</h2>
            <Link to="/services" className="btn btn-primary" style={{ marginTop: '2rem' }}>Browse All Services</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="service-details-page">
      <section className="breadcrumb-section">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={16} />
            <Link to="/services">Services</Link>
            <ChevronRight size={16} />
            <span>{service.name}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="service-details-layout">
            <div className="service-main">
              <div className="main-image">
                <img src={service.image} alt={service.name} />
              </div>

              <div className="service-info">
                <div className="service-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="service-category">{service.category}</span>
                  {providers.length > 0 ? (
                    <span className="availability-badge success"><CheckCircle size={14} /> {providers.length} {providers.length === 1 ? 'Pro' : 'Pros'} Online</span>
                  ) : (
                    <span className="availability-badge warning"><AlertTriangle size={14} /> Currently Unavailable</span>
                  )}
                </div>
                <h1>{service.name}</h1>
                <div className="service-meta">
                  <div className="rating-display">
                    <Star size={18} fill="#FBBF24" color="#FBBF24" />
                    <span className="rating-value">{service.rating}</span>
                  </div>
                  <div className="provider-stat">
                    <Users size={16} />
                    <span>Trusted by 100+ customers</span>
                  </div>
                </div>

                <div className="description-section">
                  <h3>About the Service</h3>
                  <p className="service-description">{service.description}</p>
                </div>

                {/* New Section: Meet the Professionals */}
                <div className="providers-section">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-6)' }}>
                    <Award size={24} color="var(--primary-600)" />
                    <h3>Choose Your Professional</h3>
                  </div>

                  {providers.length > 0 ? (
                    <div className="providers-list">
                      {providers.map(provider => (
                        <div
                          key={provider.id}
                          className={`card provider-card-horizontal ${selectedProvider?.id === provider.id ? 'selected' : ''}`}
                          onClick={() => setSelectedProvider(provider)}
                          style={{ cursor: 'pointer', borderColor: selectedProvider?.id === provider.id ? 'var(--primary-600)' : 'var(--gray-100)', borderWidth: selectedProvider?.id === provider.id ? '2px' : '1px' }}
                        >
                          <div className="provider-avatar-box">
                            {provider.profileImage ? (
                              <img src={provider.profileImage} alt={provider.fullName} />
                            ) : (
                              <div className="avatar-placeholder"><User size={32} /></div>
                            )}
                          </div>
                          <div className="provider-details">
                            <div className="provider-header">
                              <h4>{provider.fullName} <BadgeCheck size={16} color="var(--success)" fill="white" /></h4>
                              <div className="provider-rating"><Star size={14} fill="#FBBF24" color="#FBBF24" /> <span>{provider.rating || 'New'}</span></div>
                            </div>
                            <div className="provider-tags">
                              <span className="tag">{provider.experience || '1+'} Years Exp</span>
                              <span className="tag">{provider.reviewCount || '0'} Reviews</span>
                            </div>
                            <p className="provider-bio">{provider.bio || 'Professional and reliable service provider dedicated to quality work.'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-providers-alert">
                      <AlertTriangle size={32} color="var(--warning)" />
                      <p>We're currently verifying professionals for this service in your area.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <aside className="service-sidebar">
              <div className="card booking-card">
                <div className="price-display">
                  <span className="price-label">Starting from</span>
                  <span className="price-value">${service.basePrice}</span>
                </div>

                {providers.length > 0 ? (
                  <Link
                    to="/customer/schedule"
                    state={{
                      service,
                      provider: selectedProvider // Carry the professional choice
                    }}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                  >
                    Continue to Booking
                  </Link>
                ) : (
                  <button
                    className="btn btn-secondary btn-lg"
                    style={{ width: '100%', cursor: 'not-allowed', opacity: 0.7 }}
                    disabled
                  >
                    Currently Unavailable
                  </button>
                )}

                <div className="booking-features">
                  <div className="booking-feature"><CheckCircle size={18} /><span>Free cancellation</span></div>
                  <div className="booking-feature"><Shield size={18} /><span>Safety insurance cover</span></div>
                  <div className="booking-feature"><Award size={18} /><span>Verified top-rated pros</span></div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <style>{`
        .breadcrumb-section { background: var(--gray-50); padding: var(--space-4) 0; }
        .breadcrumb { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--gray-500); }
        .service-details-layout { display: grid; grid-template-columns: 1fr 380px; gap: var(--space-12); }
        .main-image { border-radius: var(--radius-2xl); overflow: hidden; margin-bottom: var(--space-8); height: 450px; box-shadow: var(--shadow-xl); }
        .main-image img { width: 100%; height: 100%; object-fit: cover; }
        .service-header { margin-bottom: var(--space-4); }
        .service-category { background: var(--primary-50); color: var(--primary-600); padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); font-size: var(--text-sm); font-weight: 600; }
        .availability-badge { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; }
        .availability-badge.success { background: var(--success-light); color: #059669; }
        .availability-badge.warning { background: var(--warning-light); color: #D97706; }
        .service-info h1 { font-size: var(--text-5xl); margin-bottom: var(--space-4); color: var(--gray-900); }
        .service-meta { display: flex; align-items: center; gap: var(--space-8); margin-bottom: var(--space-8); border-bottom: 1px solid var(--gray-100); padding-bottom: var(--space-6); }
        .rating-display { display: flex; align-items: center; gap: var(--space-1); font-weight: bold; font-size: var(--text-2xl); color: var(--gray-900); }
        .provider-stat { display: flex; align-items: center; gap: 8px; color: var(--gray-600); font-size: var(--text-sm); font-weight: 500; }
        .description-section { margin-bottom: var(--space-12); }
        .description-section h3 { margin-bottom: var(--space-4); font-size: var(--text-xl); }
        .service-description { font-size: 1.15rem; line-height: 1.8; color: var(--gray-600); }
        
        .providers-section { padding-top: var(--space-8); border-top: 1px solid var(--gray-100); }
        .providers-list { display: flex; flex-direction: column; gap: var(--space-6); }
        .provider-card-horizontal { display: flex; gap: var(--space-6); padding: var(--space-6); border: 1px solid var(--gray-100); border-radius: var(--radius-2xl); background: var(--gray-50); }
        .provider-avatar-box { width: 90px; height: 90px; border-radius: var(--radius-full); overflow: hidden; background: white; border: 4px solid white; box-shadow: var(--shadow-md); flex-shrink: 0; }
        .avatar-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--primary-300); }
        .provider-details { flex: 1; }
        .provider-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); }
        .provider-header h4 { font-size: var(--text-xl); display: flex; align-items: center; gap: 8px; }
        .provider-rating { display: flex; align-items: center; gap: 4px; font-weight: bold; color: var(--gray-700); }
        .provider-tags { display: flex; gap: var(--space-3); margin-bottom: var(--space-3); }
        .tag { font-size: 11px; font-weight: 600; color: var(--primary-700); background: var(--primary-100); padding: 4px 10px; border-radius: 4px; }
        .provider-bio { font-size: var(--text-sm); color: var(--gray-500); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .no-providers-alert { text-align: center; padding: var(--space-10); background: var(--warning-light); border-radius: var(--radius-xl); color: #B45309; }

        .booking-card { position: sticky; top: 100px; text-align: center; border: 1px solid var(--primary-100); background: white; z-index: 10; padding: var(--space-8); }
        .price-display { margin-bottom: var(--space-8); }
        .price-label { display: block; font-size: var(--text-sm); color: var(--gray-500); margin-bottom: 4px; }
        .price-value { font-size: var(--text-5xl); font-weight: var(--font-bold); color: var(--primary-600); }
        .booking-features { margin-top: var(--space-8); display: flex; flex-direction: column; gap: var(--space-4); text-align: left; background: var(--gray-50); padding: var(--space-5); border-radius: var(--radius-xl); }
        .booking-feature { display: flex; align-items: center; gap: var(--space-3); font-size: var(--text-sm); color: var(--gray-600); font-weight: 500; }
        
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 1024px) { .service-details-layout { grid-template-columns: 1fr; } .booking-card { position: static; } .main-image { height: 320px; } }
      `}</style>
    </div>
  );
};

export default ServiceDetails;
