import { Link } from 'react-router-dom';
import { Target, Heart, Users, Award, CheckCircle } from 'lucide-react';

const About = () => {
    // Data will be populated from backend API
    const stats = [
        { value: '0', label: 'Happy Customers' },
        { value: '0', label: 'Service Providers' },
        { value: '0', label: 'Service Types' },
        { value: '-', label: 'Average Rating' },
    ];

    const values = [
        { icon: Target, title: 'Mission', description: 'To connect people with trusted professionals for all their service needs.' },
        { icon: Heart, title: 'Care', description: 'We care deeply about customer satisfaction and provider success.' },
        { icon: Users, title: 'Community', description: 'Building a community of reliable service providers and happy customers.' },
        { icon: Award, title: 'Excellence', description: 'We strive for excellence in every service delivered.' },
    ];

    // Team data will be populated from backend API
    const team = [];

    return (
        <div className="about-page">
            <section className="page-hero">
                <div className="container">
                    <h1>About ServisGo</h1>
                    <p>Your trusted platform for booking local services</p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="about-intro">
                        <div className="intro-content">
                            <h2>Our Story</h2>
                            <p>ServisGo was founded with a simple mission: make it easy for people to find and book quality local services. We believe everyone deserves access to trusted professionals who can help maintain their homes and improve their lives.</p>
                            <p>Today, we've grown to serve thousands of customers, connecting them with verified service providers across multiple categories. Our platform ensures quality, convenience, and peace of mind.</p>
                        </div>
                        <div className="intro-image">
                            <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=400&fit=crop" alt="Team" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="section stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="stat-card card">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section values-section">
                <div className="container">
                    <h2 className="text-center mb-8">Our Values</h2>
                    <div className="values-grid">
                        {values.map((value, idx) => (
                            <div key={idx} className="card value-card">
                                <div className="value-icon"><value.icon size={28} /></div>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section team-section">
                <div className="container">
                    <h2 className="text-center mb-8">Leadership Team</h2>
                    <div className="team-grid">
                        {team.map((member, idx) => (
                            <div key={idx} className="team-card">
                                <img src={member.image} alt={member.name} />
                                <h4>{member.name}</h4>
                                <p>{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section cta-section">
                <div className="container">
                    <div className="cta-box">
                        <h2>Join Our Growing Community</h2>
                        <div className="cta-buttons">
                            <Link to="/services" className="btn btn-primary btn-lg">Find Services</Link>
                            <Link to="/become-provider" className="btn btn-secondary btn-lg">Become a Provider</Link>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
        .page-hero { background: var(--gradient-hero); padding: var(--space-16) 0; text-align: center; color: white; }
        .page-hero h1 { color: white; margin-bottom: var(--space-3); }
        .page-hero p { color: rgba(255,255,255,0.9); font-size: var(--text-xl); }
        .about-intro { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-12); align-items: center; }
        .intro-content h2 { margin-bottom: var(--space-6); }
        .intro-content p { margin-bottom: var(--space-4); font-size: var(--text-lg); line-height: 1.7; }
        .intro-image img { border-radius: var(--radius-xl); width: 100%; }
        .stats-section { background: var(--gray-50); }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-6); }
        .stat-card { text-align: center; padding: var(--space-8); }
        .stat-value { font-size: var(--text-4xl); font-weight: var(--font-bold); color: var(--primary-600); margin-bottom: var(--space-2); }
        .stat-label { color: var(--gray-600); }
        .values-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-6); }
        .value-card { text-align: center; }
        .value-icon { width: 64px; height: 64px; margin: 0 auto var(--space-4); background: var(--primary-50); border-radius: var(--radius-xl); display: flex; align-items: center; justify-content: center; color: var(--primary-600); }
        .value-card h3 { margin-bottom: var(--space-2); }
        .team-section { background: var(--gray-50); }
        .team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-8); max-width: 800px; margin: 0 auto; }
        .team-card { text-align: center; }
        .team-card img { width: 120px; height: 120px; border-radius: 50%; margin: 0 auto var(--space-4); object-fit: cover; }
        .team-card h4 { margin-bottom: var(--space-1); }
        .team-card p { color: var(--gray-600); }
        .cta-box { background: var(--gradient-hero); border-radius: var(--radius-2xl); padding: var(--space-12); text-align: center; color: white; }
        .cta-box h2 { color: white; margin-bottom: var(--space-6); }
        .cta-buttons { display: flex; gap: var(--space-4); justify-content: center; }
        .cta-buttons .btn-primary { background: white; color: var(--primary-600); }
        .cta-buttons .btn-secondary { color: white; border-color: rgba(255,255,255,0.5); }
        @media (max-width: 1024px) { .about-intro, .values-grid { grid-template-columns: repeat(2, 1fr); } .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .about-intro, .values-grid, .team-grid { grid-template-columns: 1fr; } .cta-buttons { flex-direction: column; } }
      `}</style>
        </div>
    );
};

export default About;
