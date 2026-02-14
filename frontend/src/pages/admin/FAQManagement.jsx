import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { useState } from 'react';

const FAQManagement = () => {
    const [expandedId, setExpandedId] = useState(1);

    // Data will be populated from backend API
    const faqs = [];

    return (
        <div className="faq-management-page">
            <div className="page-header">
                <div><h1>FAQ Management</h1><p>Manage frequently asked questions</p></div>
                <button className="btn btn-primary"><Plus size={18} /> Add FAQ</button>
            </div>

            <div className="faq-list">
                {faqs.map(faq => (
                    <div key={faq.id} className="card faq-item">
                        <div className="faq-header" onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}>
                            <div className="faq-grip"><GripVertical size={18} /></div>
                            <div className="faq-info">
                                <span className="badge badge-secondary">{faq.category}</span>
                                <h4>{faq.question}</h4>
                            </div>
                            <div className="faq-actions">
                                <button className="btn btn-ghost btn-icon btn-sm"><Edit2 size={16} /></button>
                                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--error)' }}><Trash2 size={16} /></button>
                                {expandedId === faq.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </div>
                        {expandedId === faq.id && (
                            <div className="faq-answer"><p>{faq.answer}</p></div>
                        )}
                    </div>
                ))}
            </div>

            <style>{`
        .faq-management-page { max-width: 900px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .faq-list { display: flex; flex-direction: column; gap: var(--space-3); }
        .faq-item { padding: 0; overflow: hidden; }
        .faq-header { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4); cursor: pointer; }
        .faq-header:hover { background: var(--gray-50); }
        .faq-grip { color: var(--gray-300); cursor: grab; }
        .faq-info { flex: 1; }
        .faq-info .badge { margin-bottom: var(--space-2); }
        .faq-info h4 { font-size: var(--text-base); }
        .faq-actions { display: flex; align-items: center; gap: var(--space-1); color: var(--gray-400); }
        .faq-answer { padding: var(--space-4); background: var(--gray-50); border-top: 1px solid var(--gray-100); }
        .faq-answer p { color: var(--gray-600); line-height: 1.6; }
        @media (max-width: 768px) { .page-header { flex-direction: column; gap: var(--space-4); align-items: flex-start; } }
      `}</style>
        </div>
    );
};

export default FAQManagement;
