import { useState } from 'react';
import { Search, Filter, MoreVertical, Eye, Edit2, Trash2, CheckCircle, XCircle, Plus } from 'lucide-react';

const UserManagement = () => {
    const [activeTab, setActiveTab] = useState('all');
    const tabs = ['all', 'customers', 'providers', 'admins'];

    // Data will be populated from backend API
    const users = [];

    const filteredUsers = activeTab === 'all' ? users : users.filter(u => u.role === activeTab.slice(0, -1));

    return (
        <div className="user-management-page">
            <div className="page-header">
                <div><h1>User Management</h1><p>Manage customers, providers, and admins</p></div>
                <button className="btn btn-primary"><Plus size={18} /> Add User</button>
            </div>

            <div className="toolbar">
                <div className="tabs">
                    {tabs.map(t => <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}
                </div>
                <div className="search-input-wrapper"><Search size={18} className="search-icon" /><input type="text" className="form-input search-input" placeholder="Search users..." /></div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table className="table">
                        <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="user-cell"><div className="avatar avatar-sm">{u.name.charAt(0)}</div><div><strong>{u.name}</strong><p>{u.email}</p></div></div>
                                    </td>
                                    <td><span className={`badge badge-${u.role === 'admin' ? 'primary' : u.role === 'provider' ? 'info' : 'secondary'}`}>{u.role} {u.verified && <CheckCircle size={12} />}</span></td>
                                    <td><span className={`badge badge-${u.status === 'active' ? 'success' : u.status === 'pending' ? 'warning' : 'gray'}`}>{u.status}</span></td>
                                    <td>{u.joined}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn btn-ghost btn-icon btn-sm"><Eye size={16} /></button>
                                            <button className="btn btn-ghost btn-icon btn-sm"><Edit2 size={16} /></button>
                                            <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--error)' }}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
        .user-management-page { max-width: 1200px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
        .page-header h1 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
        .page-header p { color: var(--gray-500); }
        .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); gap: var(--space-4); flex-wrap: wrap; }
        .toolbar .search-input-wrapper { width: 300px; }
        .user-cell { display: flex; align-items: center; gap: var(--space-3); }
        .user-cell p { font-size: var(--text-sm); color: var(--gray-500); }
        .action-buttons { display: flex; gap: var(--space-1); }
        @media (max-width: 768px) { .toolbar { flex-direction: column; align-items: stretch; } .toolbar .search-input-wrapper { width: 100%; } .page-header { flex-direction: column; gap: var(--space-4); align-items: flex-start; } }
      `}</style>
        </div>
    );
};

export default UserManagement;
