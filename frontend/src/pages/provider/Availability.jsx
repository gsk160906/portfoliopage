import { useState, useEffect } from 'react';
import { Clock, Save, Loader2, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Availability = () => {
    const { userData, updateProfileData } = useAuth();
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const [schedule, setSchedule] = useState(
        days.map(day => ({ day, enabled: day !== 'Sunday', start: '09:00', end: '17:00' }))
    );
    const [loading, setLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (userData?.availability) {
            setSchedule(userData.availability);
        }
    }, [userData]);

    const toggleDay = (idx) => {
        const updated = [...schedule];
        updated[idx].enabled = !updated[idx].enabled;
        setSchedule(updated);
        setSaveSuccess(false);
    };

    const handleTimeChange = (idx, field, value) => {
        const updated = [...schedule];
        updated[idx][field] = value;
        setSchedule(updated);
        setSaveSuccess(false);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfileData({
                availability: schedule
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving availability:", error);
            alert("Failed to save schedule.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="availability-page">
            <div className="page-header">
                <h1>Availability</h1>
                <p>Set your weekly working hours and days off</p>
            </div>

            <div className="card info-box">
                <Info size={20} />
                <p>Customers can only book you during these hours. Make sure they are accurate!</p>
            </div>

            <div className="card schedule-card">
                <div className="schedule-list">
                    {schedule.map((item, idx) => (
                        <div key={item.day} className={`schedule-row ${item.enabled ? 'enabled' : 'disabled'}`}>
                            <label className="day-control">
                                <div className={`custom-checkbox ${item.enabled ? 'checked' : ''}`} onClick={() => toggleDay(idx)}>
                                    {item.enabled && <CheckCircle size={14} />}
                                </div>
                                <span className="day-name">{item.day}</span>
                            </label>

                            {item.enabled ? (
                                <div className="time-controls">
                                    <div className="time-input-group">
                                        <Clock size={14} />
                                        <input
                                            type="time"
                                            value={item.start}
                                            className="form-input time-input"
                                            onChange={(e) => handleTimeChange(idx, 'start', e.target.value)}
                                        />
                                    </div>
                                    <span className="separator">to</span>
                                    <div className="time-input-group">
                                        <Clock size={14} />
                                        <input
                                            type="time"
                                            value={item.end}
                                            className="form-input time-input"
                                            onChange={(e) => handleTimeChange(idx, 'end', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <span className="unavailable-tag">Off Day</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="card-footer">
                    <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : saveSuccess ? <CheckCircle size={18} /> : <Save size={18} />}
                        {loading ? 'Saving...' : saveSuccess ? 'Changes Saved' : 'Save Schedule'}
                    </button>
                    {saveSuccess && <span className="success-msg">Your working hours have been updated!</span>}
                </div>
            </div>

            <style>{`
        .availability-page { max-width: 800px; margin: 0 auto; }
        .page-header { margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        
        .info-box { display: flex; align-items: center; gap: var(--space-3); background: var(--primary-50); color: var(--primary-700); padding: var(--space-4); margin-bottom: var(--space-6); border: 1px solid var(--primary-100); }
        .info-box p { font-size: var(--text-sm); margin: 0; }
        
        .schedule-card { padding: 0; overflow: hidden; }
        .schedule-list { display: flex; flex-direction: column; }
        
        .schedule-row { display: flex; align-items: center; justify-content: space-between; padding: var(--space-5) var(--space-6); border-bottom: 1px solid var(--gray-100); transition: 0.2s; }
        .schedule-row:last-child { border-bottom: none; }
        .schedule-row.disabled { background: var(--gray-50); }
        .schedule-row.enabled:hover { background: var(--gray-50)/50; }
        
        .day-control { display: flex; align-items: center; gap: var(--space-4); cursor: pointer; }
        .day-name { font-weight: var(--font-semibold); min-width: 100px; }
        
        .custom-checkbox { width: 22px; height: 22px; border-radius: 6px; border: 2px solid var(--gray-300); display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .custom-checkbox.checked { background: var(--primary-600); border-color: var(--primary-600); color: white; }
        
        .time-controls { display: flex; align-items: center; gap: var(--space-4); }
        .time-input-group { position: relative; display: flex; align-items: center; background: white; border: 1px solid var(--gray-200); border-radius: var(--radius-md); padding: 0 var(--space-3); }
        .time-input-group svg { color: var(--gray-400); margin-right: var(--space-2); }
        .time-input { border: none !important; padding: var(--space-2) 0 !important; width: 85px !important; font-size: var(--text-sm); font-weight: 500; }
        .time-input:focus { box-shadow: none !important; }
        .separator { color: var(--gray-400); font-weight: 500; font-size: var(--text-xs); text-transform: uppercase; }
        
        .unavailable-tag { color: var(--gray-400); font-size: var(--text-sm); font-weight: 500; background: var(--gray-200); padding: 4px 12px; border-radius: var(--radius-full); }
        
        .card-footer { padding: var(--space-6); background: white; border-top: 1px solid var(--gray-100); display: flex; align-items: center; gap: var(--space-4); }
        .success-msg { color: var(--success); font-size: var(--text-sm); font-weight: 500; }
        
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default Availability;
