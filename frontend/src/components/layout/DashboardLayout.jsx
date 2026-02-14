import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    Zap,
    LayoutDashboard,
    Calendar,
    Briefcase,
    Clock,
    CheckCircle,
    DollarSign,
    CreditCard,
    User,
    Star,
    HelpCircle,
    Settings,
    Bell,
    MapPin,
    List,
    Users,
    BarChart3,
    FileText,
    MessageSquare,
    LogOut,
    ChevronDown,
    Menu
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

// Navigation configs for different roles
const navigationConfig = {
    customer: {
        title: 'Customer Dashboard',
        sections: [
            {
                title: 'Main',
                items: [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/customer' },
                    { icon: List, label: 'My Bookings', path: '/customer/bookings' },
                    { icon: Bell, label: 'Notifications', path: '/customer/notifications' },
                ]
            },
            {
                title: 'Account',
                items: [
                    { icon: User, label: 'Profile', path: '/customer/profile' },
                    { icon: MapPin, label: 'Saved Addresses', path: '/customer/addresses' },
                    { icon: CreditCard, label: 'Payment History', path: '/customer/payments' },
                ]
            }
        ]
    },
    provider: {
        title: 'Provider Dashboard',
        sections: [
            {
                title: 'Overview',
                items: [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/provider' },
                    { icon: Briefcase, label: 'Job Requests', path: '/provider/job-requests' },
                    { icon: Clock, label: 'Active Jobs', path: '/provider/active-jobs' },
                    { icon: CheckCircle, label: 'Completed Jobs', path: '/provider/completed-jobs' },
                ]
            },
            {
                title: 'Manage',
                items: [
                    { icon: Calendar, label: 'Availability', path: '/provider/availability' },
                    { icon: Settings, label: 'My Services', path: '/provider/services' },
                ]
            },
            {
                title: 'Earnings',
                items: [
                    { icon: DollarSign, label: 'Earnings', path: '/provider/earnings' },
                    { icon: CreditCard, label: 'Payout Settings', path: '/provider/payout' },
                ]
            },
            {
                title: 'Account',
                items: [
                    { icon: User, label: 'Profile', path: '/provider/profile' },
                    { icon: Star, label: 'Reviews', path: '/provider/reviews' },
                    { icon: HelpCircle, label: 'Support', path: '/provider/support' },
                ]
            }
        ]
    },
    admin: {
        title: 'Admin Panel',
        sections: [
            {
                title: 'Overview',
                items: [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
                    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
                ]
            },
            {
                title: 'Management',
                items: [
                    { icon: Users, label: 'Users', path: '/admin/users' },
                    { icon: Briefcase, label: 'Services', path: '/admin/services' },
                    { icon: Calendar, label: 'Bookings', path: '/admin/bookings' },
                ]
            },
            {
                title: 'Content',
                items: [
                    { icon: FileText, label: 'Blog', path: '/admin/blog' },
                    { icon: MessageSquare, label: 'FAQ', path: '/admin/faq' },
                ]
            }
        ]
    }
};

const DashboardLayout = ({ role }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { userData, logout, loading: authLoading } = useAuth();
    const config = navigationConfig[role];

    useEffect(() => {
        if (!authLoading && userData && role === 'provider' && !userData.isOnboarded) {
            if (location.pathname !== '/provider/onboarding') {
                navigate('/provider/onboarding');
            }
        }
    }, [userData, role, navigate, location.pathname, authLoading]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    const user = {
        name: userData?.fullName || (role === 'admin' ? 'Admin User' : role === 'provider' ? 'Provider' : 'Customer'),
        email: userData?.email || '',
        avatar: userData?.avatar || null
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
                <div className="sidebar-header">
                    <Link to="/" className="logo">
                        <div className="logo-icon">
                            <Zap size={20} />
                        </div>
                        <span>ServisGo</span>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    {config.sections.map((section, idx) => (
                        <div key={idx}>
                            <div className="sidebar-section-title">{section.title}</div>
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === `/${role}`}
                                    className={({ isActive }) =>
                                        `sidebar-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <item.icon className="sidebar-link-icon" size={20} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', padding: 'var(--space-4)' }}>
                    <button onClick={handleLogout} className="sidebar-link" style={{ color: 'var(--error)', width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
                        <LogOut className="sidebar-link-icon" size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-with-sidebar">
                {/* Dashboard Header */}
                <header className="dashboard-header">
                    <div className="flex items-center gap-4">
                        <button
                            className="btn btn-ghost btn-icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="dashboard-title">{config.title}</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
                            <Bell size={20} />
                            {/* In a real app, this would come from a context or API */}
                            {userData?.notifications?.length > 0 && (
                                <span className="notification-badge">{userData.notifications.length}</span>
                            )}
                        </button>

                        {/* User Menu */}
                        <div
                            className="user-menu"
                            onMouseEnter={() => setUserMenuOpen(true)}
                            onMouseLeave={() => setUserMenuOpen(false)}
                        >
                            <button className="user-menu-trigger">
                                <div className="avatar avatar-md">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} />
                                    ) : (
                                        user.name.charAt(0)
                                    )}
                                </div>
                                <div className="user-menu-info">
                                    <span className="user-menu-name">{user.name}</span>
                                    <span className="user-menu-role">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                                </div>
                                <ChevronDown size={16} />
                            </button>

                            {userMenuOpen && (
                                <div className="user-menu-dropdown">
                                    <Link to={`/${role}/profile`} className="user-menu-item">
                                        <User size={16} />
                                        Profile
                                    </Link>
                                    <Link to={`/${role}/settings`} className="user-menu-item">
                                        <Settings size={16} />
                                        Settings
                                    </Link>
                                    <hr style={{ margin: 'var(--space-2) 0', border: 'none', borderTop: '1px solid var(--gray-100)' }} />
                                    <button onClick={handleLogout} className="user-menu-item" style={{ color: 'var(--error)', width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="dashboard-content">
                    <Outlet />
                </main>
            </div>

            <style>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid var(--gray-100);
          min-height: 100vh;
          padding: var(--space-6);
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          z-index: var(--z-sticky);
          transition: transform var(--transition-base);
        }

        .sidebar.collapsed {
          transform: translateX(-100%);
        }

        .main-with-sidebar {
          flex: 1;
          margin-left: 280px;
          min-height: 100vh;
          background: var(--gray-50);
          transition: margin-left var(--transition-base);
        }

        .sidebar.collapsed + .main-with-sidebar {
          margin-left: 0;
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          background: white;
          border-bottom: 1px solid var(--gray-100);
          position: sticky;
          top: 0;
          z-index: var(--z-sticky);
        }

        .dashboard-title {
          font-size: var(--text-xl);
          font-weight: var(--font-semibold);
        }

        .dashboard-content {
          padding: var(--space-6);
        }

        .notification-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 18px;
          height: 18px;
          background: var(--error);
          color: white;
          font-size: 10px;
          font-weight: var(--font-bold);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-menu {
          position: relative;
        }

        .user-menu-trigger {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2);
          border-radius: var(--radius-lg);
          border: none;
          background: transparent;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .user-menu-trigger:hover {
          background: var(--gray-50);
        }

        .user-menu-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .user-menu-name {
          font-weight: var(--font-medium);
          color: var(--gray-900);
          font-size: var(--text-sm);
        }

        .user-menu-role {
          font-size: var(--text-xs);
          color: var(--gray-500);
        }

        .user-menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          min-width: 200px;
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          padding: var(--space-2);
          margin-top: var(--space-2);
        }

        .user-menu-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          color: var(--gray-600);
          border-radius: var(--radius-md);
          transition: background var(--transition-fast);
        }

        .user-menu-item:hover {
          background: var(--gray-50);
          color: var(--gray-900);
        }

        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .main-with-sidebar {
            margin-left: 0;
          }
        }
      `}</style>
        </div>
    );
};

export default DashboardLayout;
