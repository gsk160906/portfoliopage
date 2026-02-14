import { HelpCircle, MessageCircle, Phone, Mail, FileText, ChevronRight, ExternalLink } from 'lucide-react';

const Support = () => {
    // Data will be populated from backend API
    const faqs = [];

    return (
        <div className="support-page">
            <div className="page-header"><h1>Help & Support</h1><p>Get help with your provider account</p></div>
            <div className="support-grid">
                <div className="card contact-card">
                    <h3>Contact Us</h3>
                    <div className="contact-options">
                        <a href="#" className="contact-option"><div className="option-icon"><MessageCircle size={20} /></div><div><strong>Live Chat</strong><p>Chat with support</p></div><ChevronRight size={18} /></a>
                        <a href="mailto:provider-support@servisgo.com" className="contact-option"><div className="option-icon"><Mail size={20} /></div><div><strong>Email</strong><p>provider-support@servisgo.com</p></div><ChevronRight size={18} /></a>
                        <a href="tel:+1234567890" className="contact-option"><div className="option-icon"><Phone size={20} /></div><div><strong>Phone</strong><p>+1 (234) 567-890</p></div><ChevronRight size={18} /></a>
                    </div>
                </div>
                <div className="card faq-card">
                    <h3>Quick Answers</h3>
                    <div className="faq-list">
                        {faqs.map((f, i) => (
                            <div key={i} className="faq-item">
                                <HelpCircle size={18} />
                                <div><strong>{f.q}</strong><p>{f.a}</p></div>
                            </div>
                        ))}
                    </div>
                    <a href="/faq" className="btn btn-secondary" style={{ marginTop: 'var(--space-4)' }}>View All FAQs <ExternalLink size={16} /></a>
                </div>
            </div>
            <div className="card">
                <h3>Submit a Ticket</h3>
                <form>
                    <div className="form-group"><label className="form-label">Subject</label><input type="text" className="form-input" placeholder="What's your issue about?" /></div>
                    <div className="form-group"><label className="form-label">Description</label><textarea className="form-input form-textarea" placeholder="Describe your issue in detail..." rows="4"></textarea></div>
                    <button type="submit" className="btn btn-primary">Submit Ticket</button>
                </form>
            </div>
            <style>{`
        .support-page { max-width: 900px; margin: 0 auto; }
        .page-header { margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .support-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); margin-bottom: var(--space-6); }
        .contact-card h3, .faq-card h3 { margin-bottom: var(--space-4); }
        .contact-options { display: flex; flex-direction: column; gap: var(--space-3); }
        .contact-option { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); border-radius: var(--radius-lg); background: var(--gray-50); color: inherit; }
        .contact-option:hover { background: var(--gray-100); }
        .option-icon { width: 40px; height: 40px; background: var(--primary-50); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; color: var(--primary-600); }
        .contact-option strong { display: block; margin-bottom: var(--space-1); }
        .contact-option p { font-size: var(--text-sm); color: var(--gray-500); }
        .contact-option > svg { margin-left: auto; color: var(--gray-400); }
        .faq-list { display: flex; flex-direction: column; gap: var(--space-4); }
        .faq-item { display: flex; gap: var(--space-3); }
        .faq-item svg { color: var(--primary-600); flex-shrink: 0; margin-top: 2px; }
        .faq-item strong { display: block; margin-bottom: var(--space-1); }
        .faq-item p { font-size: var(--text-sm); color: var(--gray-600); }
        .card h3 { margin-bottom: var(--space-5); }
        @media (max-width: 768px) { .support-grid { grid-template-columns: 1fr; } }
      `}</style>
        </div>
    );
};

export default Support;
