import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff, Zap, Mail, Lock, User, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('customer');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!fullName || !email || !password) {
            return setError('Please fill in all fields');
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        try {
            setError('');
            setLoading(true);

            // 1. Create user in Firebase Auth
            const { user } = await signup(email, password);

            // 2. Create user profile in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                fullName,
                email,
                role,
                createdAt: serverTimestamp(),
                id: user.uid
            });

            // 3. Redirect based on role
            if (role === 'provider') {
                navigate('/provider');
            } else {
                navigate('/customer');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to create an account');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            const { user } = await googleSignIn();
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, 'users', user.uid), {
                    fullName: user.displayName,
                    email: user.email,
                    role: 'customer',
                    createdAt: serverTimestamp(),
                    id: user.uid
                });
            }
            navigate('/customer');
        } catch (err) {
            console.error(err);
            setError('Failed to sign in with Google');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-form-section">
                    <div className="auth-form-content">
                        <Link to="/" className="logo">
                            <div className="logo-icon"><Zap size={24} /></div>
                            <span>ServisGo</span>
                        </Link>
                        <div className="auth-header">
                            <h1>Create Account</h1>
                            <p>Join ServisGo and get started today</p>
                        </div>

                        {error && <div className="auth-error" style={{ color: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>{error}</div>}

                        <div className="role-selector">
                            <button className={`role-btn ${role === 'customer' ? 'active' : ''}`} onClick={() => setRole('customer')}>
                                <User size={20} />I need services
                            </button>
                            <button className={`role-btn ${role === 'provider' ? 'active' : ''}`} onClick={() => setRole('provider')}>
                                <Zap size={20} />I provide services
                            </button>
                        </div>

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <div className="input-with-icon">
                                    <User size={20} className="input-icon" />
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Enter your name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-with-icon">
                                    <Mail size={20} className="input-icon" />
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="input-with-icon">
                                    <Lock size={20} className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        placeholder="Create a password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <p className="form-hint">Must be at least 6 characters</p>
                            </div>
                            <label className="form-checkbox">
                                <input type="checkbox" required />
                                <span>I agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link></span>
                            </label>
                            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                                {loading ? <><Loader2 size={20} className="animate-spin" /> Creating Account...</> : 'Create Account'}
                            </button>
                        </form>
                        <div className="auth-divider"><span>or</span></div>
                        <div className="social-buttons">
                            <button className="btn btn-secondary" onClick={handleGoogleSignIn}>Google</button>
                            <button className="btn btn-secondary">Facebook</button>
                        </div>
                        <p className="auth-footer">Already have an account? <Link to="/login">Sign In</Link></p>
                    </div>
                </div>
                <div className="auth-info-section">
                    <div className="auth-info-content">
                        <h2>{role === 'customer' ? 'Access Quality Services' : 'Grow Your Business'}</h2>
                        <p>{role === 'customer' ? 'Book trusted professionals for all your needs' : 'Connect with customers and grow your income'}</p>
                        <div className="auth-features">
                            {role === 'customer' ? (
                                <>
                                    <div className="auth-feature"><Check size={20} /><span>Verified professionals</span></div>
                                    <div className="auth-feature"><Check size={20} /><span>Easy booking</span></div>
                                    <div className="auth-feature"><Check size={20} /><span>Money-back guarantee</span></div>
                                </>
                            ) : (
                                <>
                                    <div className="auth-feature"><Check size={20} /><span>Set your own rates</span></div>
                                    <div className="auth-feature"><Check size={20} /><span>Flexible schedule</span></div>
                                    <div className="auth-feature"><Check size={20} /><span>Weekly payouts</span></div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
        .auth-page { min-height: 100vh; }
        .auth-container { display: grid; grid-template-columns: 1fr 1fr; width: 100%; min-height: 100vh; }
        .auth-form-section { display: flex; align-items: center; justify-content: center; padding: var(--space-8); background: white; }
        .auth-form-content { width: 100%; max-width: 420px; }
        .auth-form-content .logo { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-8); }
        .auth-header { margin-bottom: var(--space-6); }
        .auth-header h1 { font-size: var(--text-3xl); margin-bottom: var(--space-2); }
        .role-selector { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-6); }
        .role-btn { display: flex; align-items: center; justify-content: center; gap: var(--space-2); padding: var(--space-4); border: 2px solid var(--gray-200); border-radius: var(--radius-lg); background: white; font-weight: var(--font-medium); cursor: pointer; transition: all var(--transition-fast); }
        .role-btn:hover { border-color: var(--primary-300); }
        .role-btn.active { border-color: var(--primary-600); background: var(--primary-50); color: var(--primary-600); }
        .auth-form { margin-bottom: var(--space-4); }
        .input-with-icon { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: var(--space-4); color: var(--gray-400); }
        .input-with-icon .form-input { padding-left: var(--space-12); padding-right: var(--space-12); }
        .password-toggle { position: absolute; right: var(--space-4); background: none; border: none; color: var(--gray-400); cursor: pointer; }
        .form-checkbox { margin-bottom: var(--space-6); }
        .form-checkbox a { color: var(--primary-600); }
        .auth-divider { display: flex; align-items: center; gap: var(--space-4); margin: var(--space-4) 0; }
        .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--gray-200); }
        .auth-divider span { color: var(--gray-500); font-size: var(--text-sm); }
        .social-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-6); }
        .auth-footer { text-align: center; color: var(--gray-600); }
        .auth-footer a { color: var(--primary-600); font-weight: var(--font-semibold); }
        .auth-info-section { background: var(--gradient-hero); display: flex; align-items: center; justify-content: center; padding: var(--space-8); }
        .auth-info-content { max-width: 400px; color: white; text-align: center; }
        .auth-info-content h2 { color: white; font-size: var(--text-3xl); margin-bottom: var(--space-4); }
        .auth-info-content > p { color: rgba(255,255,255,0.9); margin-bottom: var(--space-10); }
        .auth-features { display: flex; flex-direction: column; gap: var(--space-4); }
        .auth-feature { display: flex; align-items: center; gap: var(--space-3); background: rgba(255,255,255,0.1); padding: var(--space-4); border-radius: var(--radius-lg); }
        @media (max-width: 1024px) { .auth-container { grid-template-columns: 1fr; } .auth-info-section { display: none; } }
      `}</style>
        </div>
    );
};

export default SignUp;
