import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
    Menu,
    X,
    ChevronDown,
    Search,
    Zap,
    User,
    LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const { currentUser, userData, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    const serviceCategories = [
        { name: 'All Services', path: '/services' },
        { name: 'Home Cleaning', path: '/services/category/cleaning' },
        { name: 'Plumbing', path: '/services/category/plumbing' },
        { name: 'Electrical', path: '/services/category/electrical' },
        { name: 'AC & Appliances', path: '/services/category/appliances' },
        { name: 'Beauty & Spa', path: '/services/category/beauty' },
        { name: 'Painting', path: '/services/category/painting' },
    ];

    return (
        <header className="header">
            <div className="container">
                <div className="header-inner">
                    {/* Logo */}
                    <Link to="/" className="logo">
                        <div className="logo-icon">
                            <Zap size={24} />
                        </div>
                        <span>ServisGo</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                        <Link
                            to="/"
                            className={`nav-link ${isActive('/') ? 'active' : ''}`}
                        >
                            Home
                        </Link>

                        <div
                            className="nav-dropdown"
                            onMouseEnter={() => setServicesDropdownOpen(true)}
                            onMouseLeave={() => setServicesDropdownOpen(false)}
                        >
                            <button className={`nav-link flex items-center gap-1 ${location.pathname.startsWith('/services') ? 'active' : ''}`}>
                                Services
                                <ChevronDown size={16} />
                            </button>
                            <div className={`nav-dropdown-menu ${servicesDropdownOpen ? 'open' : ''}`}>
                                {serviceCategories.map((category) => (
                                    <Link
                                        key={category.path}
                                        to={category.path}
                                        className="nav-dropdown-item"
                                    >
                                        {category.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <Link
                            to="/how-it-works"
                            className={`nav-link ${isActive('/how-it-works') ? 'active' : ''}`}
                        >
                            How It Works
                        </Link>

                        <Link
                            to="/blog"
                            className={`nav-link ${isActive('/blog') ? 'active' : ''}`}
                        >
                            Blog
                        </Link>

                        <Link
                            to="/become-provider"
                            className={`nav-link ${isActive('/become-provider') ? 'active' : ''}`}
                        >
                            Become a Provider
                        </Link>

                        <Link
                            to="/contact"
                            className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
                        >
                            Contact
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="nav-actions">
                        <button className="btn btn-icon btn-ghost" aria-label="Search">
                            <Search size={20} />
                        </button>

                        {currentUser ? (
                            <div
                                className="nav-dropdown"
                                onMouseEnter={() => setUserDropdownOpen(true)}
                                onMouseLeave={() => setUserDropdownOpen(false)}
                            >
                                <button className="btn btn-ghost flex items-center gap-2">
                                    <User size={20} />
                                    <span>{userData?.fullName?.split(' ')[0] || 'Account'}</span>
                                    <ChevronDown size={16} />
                                </button>
                                <div className={`nav-dropdown-menu ${userDropdownOpen ? 'open' : ''}`} style={{ right: 0, left: 'auto' }}>
                                    <Link to={userData?.role === 'provider' ? '/provider' : '/customer'} className="nav-dropdown-item">Dashboard</Link>
                                    <Link to={userData?.role === 'provider' ? '/provider/profile' : '/customer/profile'} className="nav-dropdown-item">Profile</Link>
                                    <Link to={userData?.role === 'provider' ? '/provider/jobs' : '/customer/bookings'} className="nav-dropdown-item">
                                        {userData?.role === 'provider' ? 'My Jobs' : 'My Bookings'}
                                    </Link>
                                    <button onClick={handleLogout} className="nav-dropdown-item text-error w-full text-left flex items-center gap-2">
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-ghost">
                                    Login
                                </Link>
                                <Link to="/signup" className="btn btn-primary">
                                    Sign Up
                                </Link>
                            </>
                        )}
                        {/* Mobile Menu Button */}
                        <button
                            className="mobile-menu-btn btn btn-ghost"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
