import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

const Schedule = () => {
    const location = useLocation();
    const { service, provider } = location.state || {};

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState('10:00 AM');
    const [dates, setDates] = useState([]);

    const times = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

    useEffect(() => {
        // Generate next 7 days
        const generatedDates = [];
        const today = new Date();
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            generatedDates.push({
                fullDate: date.toISOString().split('T')[0],
                day: date.getDate(),
                weekday: weekdays[date.getDay()],
                month: date.toLocaleString('default', { month: 'long' }),
                year: date.getFullYear()
            });
        }
        setDates(generatedDates);
        setSelectedDate(generatedDates[0].fullDate);
    }, []);

    const currentMonthYear = dates.length > 0 ? `${dates[0].month} ${dates[0].year}` : '';

    return (
        <div className="schedule-page">
            <div className="page-header">
                <h1>Select Date & Time</h1>
                <p>Choose when you want the {service?.name || 'service'}</p>
            </div>

            <div className="steps-indicator">
                <div className="step completed"><span>✓</span>Select Service</div>
                <div className="step active"><span>2</span>Schedule</div>
                <div className="step"><span>3</span>Address</div>
                <div className="step"><span>4</span>Checkout</div>
            </div>

            <div className="card schedule-card">
                <h3>Select Date</h3>
                <div className="date-nav">
                    <button className="btn btn-icon btn-ghost"><ChevronLeft size={20} /></button>
                    <span>{currentMonthYear}</span>
                    <button className="btn btn-icon btn-ghost"><ChevronRight size={20} /></button>
                </div>
                <div className="dates-grid">
                    {dates.map(d => (
                        <button
                            key={d.fullDate}
                            className={`date-btn ${selectedDate === d.fullDate ? 'active' : ''}`}
                            onClick={() => setSelectedDate(d.fullDate)}
                        >
                            <span className="weekday">{d.weekday}</span>
                            <span className="day">{d.day}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="card schedule-card">
                <h3>Select Time</h3>
                <div className="times-grid">
                    {times.map(t => (
                        <button key={t} className={`time-btn ${selectedTime === t ? 'active' : ''}`} onClick={() => setSelectedTime(t)}>
                            <Clock size={16} /> {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="nav-buttons">
                <Link to="/customer/book-service" className="btn btn-secondary">Back</Link>
                <Link
                    to="/customer/address"
                    state={{ service, provider, date: selectedDate, time: selectedTime }}
                    className="btn btn-primary"
                    disabled={!selectedDate}
                >
                    Continue
                </Link>
            </div>

            <style>{`
        .schedule-page { max-width: 700px; margin: 0 auto; }
        .page-header { margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .steps-indicator { display: flex; justify-content: space-between; margin-bottom: var(--space-8); padding: var(--space-4); background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); }
        .step { display: flex; align-items: center; gap: var(--space-2); color: var(--gray-400); font-size: var(--text-sm); }
        .step span { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: var(--gray-100); border-radius: 50%; font-weight: var(--font-semibold); }
        .step.active { color: var(--primary-600); }
        .step.active span { background: var(--primary-600); color: white; }
        .step.completed span { background: var(--success); color: white; }
        .schedule-card { margin-bottom: var(--space-6); }
        .schedule-card h3 { margin-bottom: var(--space-4); }
        .date-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4); font-weight: var(--font-semibold); }
        .dates-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--space-2); }
        .date-btn { display: flex; flex-direction: column; align-items: center; padding: var(--space-3); border: 2px solid var(--gray-200); border-radius: var(--radius-lg); background: white; cursor: pointer; transition: all var(--transition-fast); }
        .date-btn:hover { border-color: var(--primary-300); }
        .date-btn.active { border-color: var(--primary-600); background: var(--primary-50); }
        .date-btn .weekday { font-size: var(--text-xs); color: var(--gray-500); }
        .date-btn .day { font-size: var(--text-lg); font-weight: var(--font-semibold); }
        .times-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); }
        .time-btn { display: flex; align-items: center; justify-content: center; gap: var(--space-2); padding: var(--space-3); border: 2px solid var(--gray-200); border-radius: var(--radius-lg); background: white; cursor: pointer; font-size: var(--text-sm); transition: all var(--transition-fast); }
        .time-btn:hover { border-color: var(--primary-300); }
        .time-btn.active { border-color: var(--primary-600); background: var(--primary-50); color: var(--primary-600); }
        .nav-buttons { display: flex; justify-content: space-between; margin-top: var(--space-8); }
        @media (max-width: 768px) { .dates-grid { grid-template-columns: repeat(4, 1fr); } .times-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
        </div>
    );
};

export default Schedule;
