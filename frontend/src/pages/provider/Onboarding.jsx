import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { User, Briefcase, FileText, CreditCard, CheckCircle, Zap, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, updateDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';

const Onboarding = () => {
    const { currentUser, userData, updateProfileData } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const totalSteps = 4;
    const [loading, setLoading] = useState(false);

    const [allAvailableServices, setAllAvailableServices] = useState([]);
    const [fetchingServices, setFetchingServices] = useState(false);

    useEffect(() => {
        const fetchServices = async () => {
            setFetchingServices(true);
            try {
                const snapshot = await getDocs(query(collection(db, 'services'), orderBy('name', 'asc')));
                setAllAvailableServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error fetching services for onboarding:", error);
            } finally {
                setFetchingServices(false);
            }
        };
        fetchServices();
    }, []);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        services: [],
        experience: '',
        upiId: '',
        accountHolderName: '',
        verificationStatus: 'pending'
    });

    useEffect(() => {
        if (userData) {
            const names = userData.fullName?.split(' ') || ['', ''];
            setFormData(prev => ({
                ...prev,
                firstName: names[0] || '',
                lastName: names.slice(1).join(' ') || '',
                phone: userData.phone || '',
                email: userData.email || '',
                accountHolderName: userData.fullName || ''
            }));
        }
    }, [userData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleServiceToggle = (serviceName) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(serviceName)
                ? prev.services.filter(s => s !== serviceName)
                : [...prev.services, serviceName]
        }));
    };

    const handleSubmit = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            // Remove File objects before saving to Firestore
            const { govIdFile, taxIdFile, ...userDataToSave } = formData;
            const submissionData = {
                ...userDataToSave,
                fullName: `${formData.firstName} ${formData.lastName}`,
                isOnboarded: true,
                onboardedAt: new Date().toISOString(),
                role: 'provider', // Explicitly ensure role is provider
                paymentDetails: {
                    type: 'upi',
                    upiId: formData.upiId,
                    accountHolderName: formData.accountHolderName
                },
                verificationDocs: {
                    govId: govIdFile?.name || null,
                    taxId: taxIdFile?.name || null
                },
                rating: 5.0,
                totalJobs: 0,
                earnings: 0
            };

            await updateProfileData(submissionData);
            navigate('/provider');
        } catch (error) {
            console.error("Onboarding error:", error);
            alert("Failed to save registration. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { num: 1, title: 'Personal Info', icon: User },
        { num: 2, title: 'Services', icon: Briefcase },
        { num: 3, title: 'Verification', icon: FileText },
        { num: 4, title: 'UPI Setup', icon: CreditCard },
    ];

    return (
        <div className="onboarding-page">
            <div className="onboarding-header">
                <Link to="/" className="logo"><div className="logo-icon"><Zap size={24} /></div><span>ServisGo</span></Link>
                <p>Provider Registration</p>
            </div>

            <div className="onboarding-container">
                <div className="steps-sidebar">
                    {steps.map(s => (
                        <div key={s.num} className={`step-item ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
                            <div className="step-icon">{step > s.num ? <CheckCircle size={20} /> : <s.icon size={20} />}</div>
                            <span>{s.title}</span>
                        </div>
                    ))}
                </div>

                <div className="onboarding-content card">
                    {step === 1 && (
                        <div className="onboarding-step-content">
                            <h2>Personal Information</h2>
                            <p>Tell us about yourself</p>
                            <div className="onboarding-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">First Name</label>
                                        <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="form-input" placeholder="John" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Last Name</label>
                                        <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="form-input" placeholder="Doe" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="form-input" placeholder="+1 234-567-8901" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Street Address</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="form-input" placeholder="123 Main St, City" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="onboarding-step-content">
                            <h2>Services You Offer</h2>
                            <p>Select the services you provide</p>
                            {fetchingServices ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="animate-spin" /></div>
                            ) : (
                                <div className="services-select">
                                    {allAvailableServices.map(s => (
                                        <label key={s.id} className={`service-option ${formData.services.includes(s.name) ? 'selected' : ''}`}>
                                            <input type="checkbox" checked={formData.services.includes(s.name)} onChange={() => handleServiceToggle(s.name)} />
                                            <span>{s.name}</span>
                                        </label>
                                    ))}
                                    {allAvailableServices.length === 0 && <p>No services available to select.</p>}
                                </div>
                            )}
                            <div className="form-group" style={{ marginTop: 'var(--space-6)' }}>
                                <label className="form-label">Years of Experience</label>
                                <input type="number" name="experience" value={formData.experience} onChange={handleInputChange} className="form-input" placeholder="e.g., 5" />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="onboarding-step-content">
                            <h2>Verification Documents</h2>
                            <p>Upload required documents for verification</p>
                            <div className="upload-section">
                                <div className="upload-box active">
                                    <FileText size={32} />
                                    <p>Government ID (License/Passport)</p>
                                    <input
                                        type="file"
                                        id="govId"
                                        style={{ display: 'none' }}
                                        onChange={(e) => setFormData(prev => ({ ...prev, govIdFile: e.target.files[0] }))}
                                    />
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => document.getElementById('govId').click()}
                                    >
                                        {formData.govIdFile ? 'Change File' : 'Browse File'}
                                    </button>
                                    {formData.govIdFile && <p className="file-name">{formData.govIdFile.name}</p>}
                                </div>
                                <div className="upload-box">
                                    <FileText size={32} />
                                    <p>Tax ID / Certification</p>
                                    <input
                                        type="file"
                                        id="taxId"
                                        style={{ display: 'none' }}
                                        onChange={(e) => setFormData(prev => ({ ...prev, taxIdFile: e.target.files[0] }))}
                                    />
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => document.getElementById('taxId').click()}
                                    >
                                        {formData.taxIdFile ? 'Change File' : 'Browse File'}
                                    </button>
                                    {formData.taxIdFile && <p className="file-name">{formData.taxIdFile.name}</p>}
                                </div>
                            </div>
                            <div className="verification-note">
                                <p><strong>Note:</strong> Verification usually takes 24-48 hours. You can proceed to dashboard but assignments will start after verification.</p>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="onboarding-step-content">
                            <h2>UPI Payment Setup</h2>
                            <p>Enter your UPI details to receive direct payouts</p>
                            <div className="onboarding-form">
                                <div className="form-group">
                                    <label className="form-label">Account Holder Name</label>
                                    <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleInputChange} className="form-input" placeholder="Name as per Bank Account" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">UPI ID</label>
                                    <input type="text" name="upiId" value={formData.upiId} onChange={handleInputChange} className="form-input" placeholder="username@upi" />
                                    <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '8px' }}>
                                        Make sure your UPI ID is correct to avoid payment delays.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="nav-buttons">
                        {step > 1 && <button className="btn btn-secondary" onClick={() => setStep(step - 1)} disabled={loading}><ArrowLeft size={18} /> Back</button>}
                        <div style={{ marginLeft: 'auto' }}>
                            {step < totalSteps ? (
                                <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue <ArrowRight size={18} /></button>
                            ) : (
                                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                                    {loading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><CheckCircle size={18} /> Complete Registration</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .onboarding-page { min-height: 100vh; background: var(--gray-50); padding: var(--space-8); }
        .onboarding-header { text-align: center; margin-bottom: var(--space-8); }
        .onboarding-header .logo { display: inline-flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2); text-decoration: none; }
        .onboarding-header p { color: var(--gray-500); }
        .onboarding-container { display: grid; grid-template-columns: 250px 1fr; gap: var(--space-8); max-width: 1000px; margin: 0 auto; }
        .steps-sidebar { display: flex; flex-direction: column; gap: var(--space-4); }
        .step-item { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4); background: white; border-radius: var(--radius-lg); color: var(--gray-400); font-weight: var(--font-medium); transition: 0.3s; }
        .step-item.active { background: var(--primary-600); color: white; box-shadow: var(--shadow-md); }
        .step-item.completed { color: var(--success); }
        .step-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: var(--gray-100); border-radius: var(--radius-lg); }
        .step-item.active .step-icon { background: rgba(255,255,255,0.2); }
        .onboarding-content { padding: var(--space-8); min-height: 500px; display: flex; flex-direction: column; }
        .onboarding-step-content { flex: 1; }
        .onboarding-content h2 { margin-bottom: var(--space-2); }
        .onboarding-content > p { color: var(--gray-500); margin-bottom: var(--space-6); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
        .services-select { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); margin-bottom: var(--space-6); }
        .service-option { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4); border: 2px solid var(--gray-200); border-radius: var(--radius-lg); cursor: pointer; transition: 0.2s; }
        .service-option.selected { border-color: var(--primary-600); background: var(--primary-50); }
        .service-option input { accent-color: var(--primary-600); width: 18px; height: 18px; }
        .upload-section { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-6); margin-bottom: var(--space-6); }
        .upload-box { text-align: center; padding: var(--space-8); border: 2px dashed var(--gray-300); border-radius: var(--radius-lg); color: var(--gray-400); }
        .upload-box.active { border-color: var(--primary-300); background: white; }
        .upload-box p { margin: var(--space-4) 0; font-size: var(--text-sm); }
        .file-name { color: var(--primary-600) !important; font-weight: 500; font-size: var(--text-xs) !important; margin-top: var(--space-2) !important; }
        .verification-note { padding: var(--space-4); background: var(--warning-light); border-radius: var(--radius-md); font-size: var(--text-sm); line-height: 1.5; color: var(--gray-700); }
        .nav-buttons { display: flex; justify-content: space-between; margin-top: auto; padding-top: var(--space-6); border-top: 1px solid var(--gray-100); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .onboarding-container { grid-template-columns: 1fr; } .steps-sidebar { display: none; } .upload-section, .services-select { grid-template-columns: 1fr; } }
      `}</style>
        </div>
    );
};

export default Onboarding;
