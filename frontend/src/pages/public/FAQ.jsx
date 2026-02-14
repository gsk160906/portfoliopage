import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = ['all', 'general', 'booking', 'payment', 'providers'];

    // Data will be populated from backend API
    const faqs = [];

    const filteredFaqs = faqs.filter(faq =>
        (activeCategory === 'all' || faq.category === activeCategory) &&
        (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="faq-page">
            <section className="page-hero">
                <div className="container">
                    <h1>Frequently Asked Questions</h1>
                    <p>Find answers to common questions about ServisGo</p>
                    <div className="hero-search">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="faq-categories">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="accordion">
                        {filteredFaqs.map((faq, idx) => (
                            <div key={idx} className={`accordion-item ${openIndex === idx ? 'open' : ''}`}>
                                <button className="accordion-header" onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}>
                                    {faq.question}
                                    <ChevronDown size={20} className="accordion-icon" />
                                </button>
                                <div className="accordion-content">
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredFaqs.length === 0 && (
                        <div className="empty-state">
                            <p>No questions found. Try a different search term.</p>
                        </div>
                    )}
                </div>
            </section>

            <style>{`
        .page-hero { background: var(--gradient-hero); padding: var(--space-16) 0; text-align: center; color: white; }
        .page-hero h1 { color: white; margin-bottom: var(--space-3); }
        .page-hero p { color: rgba(255,255,255,0.9); font-size: var(--text-xl); margin-bottom: var(--space-8); }
        .hero-search { display: flex; align-items: center; gap: var(--space-3); background: white; max-width: 500px; margin: 0 auto; padding: var(--space-3) var(--space-5); border-radius: var(--radius-full); }
        .hero-search svg { color: var(--gray-400); }
        .hero-search input { flex: 1; border: none; font-size: var(--text-base); }
        .hero-search input:focus { outline: none; }
        .faq-categories { display: flex; gap: var(--space-2); justify-content: center; margin-bottom: var(--space-8); flex-wrap: wrap; }
        .category-btn { padding: var(--space-2) var(--space-5); border: 2px solid var(--gray-200); border-radius: var(--radius-full); background: white; font-weight: var(--font-medium); cursor: pointer; transition: all var(--transition-fast); }
        .category-btn:hover { border-color: var(--primary-300); }
        .category-btn.active { background: var(--primary-600); border-color: var(--primary-600); color: white; }
        .accordion { max-width: 800px; margin: 0 auto; }
        .empty-state { text-align: center; padding: var(--space-12); color: var(--gray-500); }
      `}</style>
        </div>
    );
};

export default FAQ;
