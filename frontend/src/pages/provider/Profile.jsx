import { User, Camera, Mail, Phone, MapPin, Star, Briefcase, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

const ProviderProfile = () => {
    const { userData, updateProfileData, changePassword, reauthenticate } = useAuth();
    const [loading, setLoading] = useState(false);
    const [pwdLoading, setPwdLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        bio: '',
        specialization: ''
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
                phone: userData.phone || '',
                bio: userData.bio || '',
                specialization: userData.specialization || ''
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
                phone: formData.phone,
                bio: formData.bio,
                specialization: formData.specialization
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
            await reauthenticate(pwdData.currentPassword);
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
        address: userData?.address || '',
        rating: userData?.rating || 'New',
        jobs: userData?.jobsCompleted || 0,
        avatar: userData?.avatar || null,
        bio: userData?.bio || ''
    };

    return (
        <div className="profile-page">
            <div className="page-header"><h1>My Profile</h1><p>Manage your professional information</p></div>

            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: message.type === 'success' ? 'var(--success-50)' : 'var(--error-50)', color: message.type === 'success' ? 'var(--success-700)' : 'var(--error-700)', border: `1px solid ${message.type === 'success' ? 'var(--success-200)' : 'var(--error-200)'}` }}>
                    {message.text}
                </div>
            )}

            <div className="profile-grid">
                <div className="card profile-card">
                    <div className="avatar-section">
                        <div className="avatar-wrapper">
                            <div className="avatar avatar-xl">
                                {user.avatar ? <img src={user.avatar} alt={user.name} /> : (user.name ? user.name.charAt(0) : <User />)}
                            </div>
                            <button className="avatar-edit"><Camera size={16} /></button>
                        </div>
                        <h3>{user.name || 'Provider'}</h3>
                        <p>{formData.specialization || 'Professional'}</p>
                        <div className="profile-stats">
                            <div><Star size={16} fill="#FBBF24" color="#FBBF24" /> <strong>{user.rating}</strong> Rating</div>
                            <div><Briefcase size={16} /> <strong>{user.jobs}</strong> Jobs</div>
                        </div>
                    </div>
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
                        <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={user.email} disabled /></div>
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                className="form-input"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Specialization</label>
                            <input
                                type="text"
                                name="specialization"
                                className="form-input"
                                value={formData.specialization}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Bio</label>
                            <textarea
                                name="bio"
                                className="form-input form-textarea"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="3"
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Changes'}
                        </button>
                    </form>
                </div>

                <div className="card form-section" style={{ gridColumn: 'span 2' }}>
                    <h3>Change Password</h3>
                    {pwdMessage.text && (
                        <div className={`alert ${pwdMessage.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: pwdMessage.type === 'success' ? 'var(--success-50)' : 'var(--error-50)', color: pwdMessage.type === 'success' ? 'var(--success-700)' : 'var(--error-700)', border: `1px solid ${pwdMessage.type === 'success' ? 'var(--success-200)' : 'var(--error-200)'}` }}>
                            {pwdMessage.text}
                        </div>
                    )}
                    <form onSubmit={handlePasswordSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
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
                                placeholder="Enter new password"
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
                        <div style={{ gridColumn: '1 / -1' }}>
                            <button type="submit" className="btn btn-secondary" disabled={pwdLoading}>
                                {pwdLoading ? <><Loader2 size={18} className="animate-spin" /> Updating...</> : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <style>{`
        .profile-page { max-width: 900px; margin: 0 auto; }
        .page-header { margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .profile-grid { display: grid; grid-template-columns: 300px 1fr; gap: var(--space-6); }
        .profile-card { text-align: center; }
        .avatar-section { padding: var(--space-6); }
        .avatar-wrapper { position: relative; display: inline-block; margin-bottom: var(--space-4); }
        .avatar-wrapper img { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; }
        .avatar-edit { position: absolute; bottom: 0; right: 0; width: 32px; height: 32px; background: var(--primary-600); color: white; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .avatar-section h3 { margin-bottom: var(--space-1); }
        .avatar-section > p { color: var(--gray-500); margin-bottom: var(--space-4); }
        .profile-stats { display: flex; justify-content: center; gap: var(--space-6); font-size: var(--text-sm); color: var(--gray-600); }
        .profile-stats div { display: flex; align-items: center; gap: var(--space-1); }
        .form-section h3 { margin-bottom: var(--space-5); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
        @media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default ProviderProfile;
