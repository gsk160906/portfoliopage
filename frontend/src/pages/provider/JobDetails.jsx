import { Link, useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Phone, Mail, DollarSign, ArrowLeft, Check, X, MessageCircle, Loader2, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const JobDetails = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const docRef = doc(db, 'bookings', jobId);
                const snapshot = await getDoc(docRef);
                if (snapshot.exists()) {
                    setJob({ id: snapshot.id, ...snapshot.data() });
                }
            } catch (error) {
                console.error("Error fetching job details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [jobId]);

    const handleUpdateStatus = async (newStatus) => {
        if (!currentUser) return;
        setActionLoading(true);
        try {
            const jobRef = doc(db, 'bookings', jobId);
            const updateData = { status: newStatus };

            // If accepting a pending job
            if (newStatus === 'upcoming' && job.status === 'pending') {
                updateData.providerId = currentUser.uid;
                updateData.providerName = userData?.fullName || 'Provider';
            }

            await updateDoc(jobRef, updateData);
            setJob({ ...job, ...updateData });
            alert(`Job updated to ${newStatus}`);
            if (newStatus === 'upcoming') navigate('/provider/active-jobs');
            if (newStatus === 'completed') navigate('/provider/completed-jobs');
        } catch (error) {
            console.error("Error updating job:", error);
            alert("Failed to update job status.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} /></div>;
    }

    if (!job) {
        return (
            <div className="job-details-page">
                <Link to="/provider/job-requests" className="back-link"><ArrowLeft size={18} /> Back to Requests</Link>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <h2>Job Not Found</h2>
                    <p style={{ color: 'var(--gray-500)', marginTop: '1rem' }}>
                        The job you're looking for is not available.
                    </p>
                    <Link to="/provider/job-requests" className="btn btn-primary" style={{ marginTop: '2rem' }}>
                        View All Job Requests
                    </Link>
                </div>
            </div>
        );
    }

    const isPending = job.status === 'pending';
    const isUpcoming = job.status === 'upcoming';
    const isInProgress = job.status === 'in-progress';

    return (
        <div className="job-details-page">
            <Link to={isPending ? "/provider/job-requests" : "/provider/active-jobs"} className="back-link">
                <ArrowLeft size={18} /> Back to {isPending ? 'Requests' : 'Active Jobs'}
            </Link>

            <div className="details-header">
                <div>
                    <h1>{job.serviceName}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span className={`badge ${job.status === 'pending' ? 'badge-warning' :
                            job.status === 'cancelled' ? 'badge-error' :
                                'badge-info'}`}>{job.status}</span>
                        <span style={{ color: 'var(--gray-400)', fontSize: '14px' }}>Job #{job.id}</span>
                    </div>
                </div>
                <div className="header-actions">
                    {isPending && (
                        <>
                            <button className="btn btn-outline" style={{ color: 'var(--error)', borderColor: 'var(--error)' }} disabled={actionLoading}>
                                <X size={18} /> Decline
                            </button>
                            <button className="btn btn-primary" onClick={() => handleUpdateStatus('upcoming')} disabled={actionLoading}>
                                {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} Accept Job
                            </button>
                        </>
                    )}
                    {isUpcoming && (
                        <button className="btn btn-primary" onClick={() => handleUpdateStatus('in-progress')} disabled={actionLoading}>
                            {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Clock size={18} />} Start Job
                        </button>
                    )}
                    {isInProgress && (
                        <button className="btn btn-success" onClick={() => handleUpdateStatus('completed')} disabled={actionLoading} style={{ background: 'var(--success)', color: 'white', border: 'none' }}>
                            {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />} Mark as Completed
                        </button>
                    )}
                </div>
            </div>

            <div className="details-grid">
                <div className="main-content">
                    <div className="card">
                        <h3>Job Details</h3>
                        <div className="detail-row"><span>Service</span><strong>{job.serviceName}</strong></div>
                        <div className="detail-row"><Calendar size={16} /><span>{job.date}</span></div>
                        <div className="detail-row"><Clock size={16} /><span>{job.time}</span></div>
                        <div className="detail-row"><MapPin size={16} /><span>{job.address}</span></div>
                        <div className="detail-row"><DollarSign size={16} /><strong className="amount">${job.price}</strong></div>
                    </div>
                    {job.addressDetails && (
                        <div className="card">
                            <h3>Location Map</h3>
                            <div className="address-box" style={{ padding: 'var(--space-4)', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)' }}>
                                <p style={{ fontWeight: '600' }}>{job.addressDetails.label}</p>
                                <p>{job.addressDetails.address}</p>
                                <p>{job.addressDetails.city}, {job.addressDetails.zip}</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="sidebar-content">
                    <div className="card">
                        <h3>Customer Information</h3>
                        <div className="customer-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="avatar-placeholder" style={{ width: '60px', height: '60px', background: 'var(--gray-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}><User size={30} /></div>
                            <div>
                                <h4 style={{ margin: 0 }}>{job.customerName}</h4>
                                <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Customer since 2026</span>
                            </div>
                        </div>
                        <div className="contact-info" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="contact-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--gray-600)' }}>
                                <Phone size={18} /> <span>{job.addressDetails?.phone || '---'}</span>
                            </div>
                            <div className="contact-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--gray-600)' }}>
                                <Mail size={18} /> <span>---</span>
                            </div>
                        </div>
                        <button className="btn btn-secondary" style={{ width: '100%', marginTop: 'var(--space-6)' }} disabled><MessageCircle size={18} /> Message Customer</button>
                    </div>
                </div>
            </div>

            <style>{`
        .job-details-page { max-width: 1000px; margin: 0 auto; }
        .back-link { display: inline-flex; align-items: center; gap: var(--space-2); color: var(--gray-600); margin-bottom: var(--space-6); text-decoration: none; }
        .back-link:hover { color: var(--primary-600); }
        .details-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8); }
        .details-header h1 { margin: 0; font-size: var(--text-2xl); }
        .header-actions { display: flex; gap: var(--space-3); }
        .details-grid { display: grid; grid-template-columns: 1fr 350px; gap: var(--space-6); }
        .main-content { display: flex; flex-direction: column; gap: var(--space-6); }
        .main-content h3 { margin-bottom: var(--space-4); border-bottom: 1px solid var(--gray-100); padding-bottom: var(--space-2); }
        .detail-row { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) 0; border-bottom: 1px solid var(--gray-50); color: var(--gray-600); }
        .detail-row:last-child { border-bottom: none; }
        .detail-row strong { margin-left: auto; color: var(--gray-900); }
        .detail-row .amount { color: var(--primary-600); font-size: var(--text-xl); }
        .sidebar-content h3 { margin-bottom: var(--space-4); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 1024px) { .details-grid { grid-template-columns: 1fr; } }
      `}</style>
        </div >
    );
};

export default JobDetails;
