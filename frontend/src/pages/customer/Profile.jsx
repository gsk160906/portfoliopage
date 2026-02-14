import { User, Mail, Phone, Camera, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

const Profile = () => {
    const { userData, updateProfileData, changePassword, reauthenticate } = useAuth();
    const [loading, setLoading] = useState(false);
    const [pwdLoading, setPwdLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: ''
    });

    const [pwdData, setPwdData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (userData) {
            const [first, ...last] = (userData.fullName || '').split(' ');
            setFormData({
                firstName: first || '',
                lastName: last.join(' ') || '',
                phone: userData.phone || ''
            });
        }
    }, [userData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePwdChange = (e) => {
        setPwdData({ ...pwdData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await updateProfileData({
                fullName: `${formData.firstName} ${formData.lastName}`.trim(),
                phone: formData.phone
            });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error("Update error", error);
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (pwdData.newPassword !== pwdData.confirmPassword) {
            return setPwdMessage({ type: 'error', text: 'Passwords do not match.' });
        }
        if (pwdData.newPassword.length < 6) {
            return setPwdMessage({ type: 'error', text: 'Password should be at least 6 characters.' });
        }

        setPwdLoading(true);
        setPwdMessage({ type: '', text: '' });

        try {
            // 1. Reauthenticate
            await reauthenticate(pwdData.currentPassword);
            // 2. Change password
            await changePassword(pwdData.newPassword);

            setPwdMessage({ type: 'success', text: 'Password updated successfully!' });
            setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error("Password update error", error);
            if (error.code === 'auth/wrong-password') {
                setPwdMessage({ type: 'error', text: 'Incorrect current password.' });
            } else {
                setPwdMessage({ type: 'error', text: 'Failed to update password. Try logging in again.' });
            }
        } finally {
            setPwdLoading(false);
        }
    };

    const user = {
        name: userData?.fullName || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        avatar: userData?.avatar || null
    };

    return (
        <div className="profile-page">
            <div className="page-header"><h1>My Profile</h1><p>Manage your account information</p></div>

            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: message.type === 'success' ? 'var(--success-50)' : 'var(--error-50)', color: message.type === 'success' ? 'var(--success-700)' : 'var(--error-700)', border: `1px solid ${message.type === 'success' ? 'var(--success-200)' : 'var(--error-200)'}` }}>
                    {message.text}
                </div>
            )}

            <div className="profile-content">
                <div className="card avatar-section">
                    <div className="avatar-wrapper">
                        <div className="avatar avatar-xl">
                            {user.avatar ? <img src={user.avatar} alt={user.name} /> : (user.name ? user.name.charAt(0) : <User />)}
                        </div>
                        <button className="avatar-edit"><Camera size={16} /></button>
                    </div>
                    <h3>{user.name || 'User'}</h3>
                    <p>{user.email}</p>
                </div>

                <div className="card form-section">
                    <h3>Personal Information</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    className="form-input"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    className="form-input"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="form-group"><label className="form-label">Email Address</label><input type="email" className="form-input" value={user.email} disabled /></div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                className="form-input"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Changes'}
                        </button>
                    </form>
                </div>

                <div className="card form-section">
                    <h3>Change Password</h3>
                    {pwdMessage.text && (
                        <div className={`alert ${pwdMessage.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: pwdMessage.type === 'success' ? 'var(--success-50)' : 'var(--error-50)', color: pwdMessage.type === 'success' ? 'var(--success-700)' : 'var(--error-700)', border: `1px solid ${pwdMessage.type === 'success' ? 'var(--success-200)' : 'var(--error-200)'}` }}>
                            {pwdMessage.text}
                        </div>
                    )}
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label className="form-label">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                className="form-input"
                                placeholder="Enter current password"
                                value={pwdData.currentPassword}
                                onChange={handlePwdChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                className="form-input"
                                placeholder="Enter new password (min 6 chars)"
                                value={pwdData.newPassword}
                                onChange={handlePwdChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-input"
                                placeholder="Confirm new password"
                                value={pwdData.confirmPassword}
                                onChange={handlePwdChange}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-secondary" disabled={pwdLoading}>
                            {pwdLoading ? <><Loader2 size={18} className="animate-spin" /> Updating...</> : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
        .profile-page { max-width: 800px; margin: 0 auto; }
        .page-header { margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .profile-content { display: flex; flex-direction: column; gap: var(--space-6); }
        .avatar-section { text-align: center; padding: var(--space-8); }
        .avatar-wrapper { position: relative; display: inline-block; margin-bottom: var(--space-4); }
        .avatar-edit { position: absolute; bottom: 0; right: 0; width: 32px; height: 32px; background: var(--primary-600); color: white; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .avatar-section h3 { margin-bottom: var(--space-1); }
        .avatar-section p { color: var(--gray-500); }
        .form-section h3 { margin-bottom: var(--space-5); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
        @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default Profile;
