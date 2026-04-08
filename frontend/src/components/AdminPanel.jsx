import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../utils/axios-instance';
import { ROLES } from '../utils/constants';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'LECTURER' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ name: '', email: '', role: 'LECTURER' });
    setFormError('');
    setEditingUser(null);
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setModalMode('edit');
    setFormData({ name: u.name, email: u.email, role: u.role });
    setFormError('');
    setEditingUser(u);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '', email: '', role: 'LECTURER' });
    setFormError('');
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Name and email are required');
      return;
    }

    try {
      if (modalMode === 'add') {
        await axiosInstance.post('/users', formData);
        setSuccessMsg('User created successfully!');
      } else {
        await axiosInstance.put(`/users/${editingUser.id}`, formData);
        setSuccessMsg('User updated successfully!');
      }
      closeModal();
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      const data = err.response?.data;
      const msg = typeof data === 'string' ? data : (data?.message || data?.error || 'Operation failed');
      setFormError(msg);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axiosInstance.delete(`/users/${userId}`);
      setSuccessMsg('User deleted successfully!');
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users
    .filter((u) => filterRole === 'ALL' || u.role === filterRole)
    .filter(
      (u) =>
        searchTerm === '' ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.displayId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'um-badge-admin';
      case 'LECTURER': return 'um-badge-lecturer';
      case 'TECHNICIAN': return 'um-badge-technician';
      default: return '';
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="um-container">
        <div className="um-access-denied">
          <h2>Access Denied</h2>
          <p>You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .um-container { padding: 32px; max-width: 1200px; margin: 0 auto; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .um-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .um-header h1 { font-size: 28px; font-weight: 700; color: #1e293b; margin: 0; }
        .um-header-sub { font-size: 14px; color: #64748b; margin-top: 4px; }
        .um-btn-add { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #14B8A6, #0f766e); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        .um-btn-add:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4); }
        .um-controls { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
        .um-search { flex: 1; min-width: 200px; padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; outline: none; transition: border-color 0.2s; }
        .um-search:focus { border-color: #14B8A6; box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1); }
        .um-filter-select { padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; outline: none; background: white; cursor: pointer; }
        .um-stats { display: flex; gap: 16px; margin-bottom: 20px; }
        .um-stat-card { background: white; border-radius: 12px; padding: 16px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid #f0f0f0; text-align: center; min-width: 120px; }
        .um-stat-value { font-size: 24px; font-weight: 700; color: #14B8A6; }
        .um-stat-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
        .um-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; font-size: 14px; }
        .um-error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; font-size: 14px; }
        .um-table-wrap { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid #f0f0f0; overflow: hidden; }
        .um-table { width: 100%; border-collapse: collapse; }
        .um-table thead { background: #f8fafc; }
        .um-table th { padding: 14px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; }
        .um-table td { padding: 14px 16px; font-size: 14px; color: #334155; border-bottom: 1px solid #f1f5f9; }
        .um-table tbody tr:hover { background: #f8fafc; }
        .um-table tbody tr:last-child td { border-bottom: none; }
        .um-display-id { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-weight: 600; color: #0f766e; background: #f0fdfa; padding: 4px 10px; border-radius: 6px; font-size: 13px; }
        .um-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .um-badge-admin { background: #fef3c7; color: #92400e; }
        .um-badge-lecturer { background: #dbeafe; color: #1e40af; }
        .um-badge-technician { background: #e0e7ff; color: #3730a3; }
        .um-actions { display: flex; gap: 8px; }
        .um-btn-edit { padding: 6px 14px; background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .um-btn-edit:hover { background: #e0f2fe; }
        .um-btn-delete { padding: 6px 14px; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .um-btn-delete:hover { background: #fee2e2; }
        .um-loading { text-align: center; padding: 60px; color: #64748b; font-size: 16px; }
        .um-empty { text-align: center; padding: 60px; color: #94a3b8; }
        .um-access-denied { text-align: center; padding: 60px; }
        .um-access-denied h2 { color: #dc2626; }

        /* Modal */
        .um-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .um-modal { background: white; border-radius: 16px; padding: 32px; width: 480px; max-width: 90vw; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
        .um-modal h2 { font-size: 20px; font-weight: 700; color: #1e293b; margin: 0 0 24px; }
        .um-form-group { margin-bottom: 20px; }
        .um-form-group label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px; }
        .um-form-group input, .um-form-group select { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; outline: none; box-sizing: border-box; transition: border-color 0.2s; }
        .um-form-group input:focus, .um-form-group select:focus { border-color: #14B8A6; box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1); }
        .um-form-error { color: #dc2626; font-size: 13px; margin-bottom: 16px; background: #fef2f2; padding: 8px 12px; border-radius: 8px; }
        .um-modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
        .um-btn-cancel { padding: 10px 20px; background: #f1f5f9; color: #475569; border: none; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; }
        .um-btn-cancel:hover { background: #e2e8f0; }
        .um-btn-submit { padding: 10px 24px; background: linear-gradient(135deg, #14B8A6, #0f766e); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .um-btn-submit:hover { box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4); }
        .um-current-row { background: #f0fdfa !important; }
      `}</style>
      <div className="um-container">
        <div className="um-header">
          <div>
            <h1>User Management</h1>
            <p className="um-header-sub">Manage system users and roles</p>
          </div>
          <button className="um-btn-add" onClick={openAddModal}>
            + Add New User
          </button>
        </div>

        {successMsg && <div className="um-success">{successMsg}</div>}
        {error && <div className="um-error">{error}</div>}

        <div className="um-stats">
          <div className="um-stat-card">
            <div className="um-stat-value">{users.length}</div>
            <div className="um-stat-label">Total Users</div>
          </div>
          <div className="um-stat-card">
            <div className="um-stat-value">{users.filter((u) => u.role === 'ADMIN').length}</div>
            <div className="um-stat-label">Admins</div>
          </div>
          <div className="um-stat-card">
            <div className="um-stat-value">{users.filter((u) => u.role === 'LECTURER').length}</div>
            <div className="um-stat-label">Lecturers</div>
          </div>
          <div className="um-stat-card">
            <div className="um-stat-value">{users.filter((u) => u.role === 'TECHNICIAN').length}</div>
            <div className="um-stat-label">Technicians</div>
          </div>
        </div>

        <div className="um-controls">
          <input
            className="um-search"
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select className="um-filter-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="ALL">All Roles</option>
            {Object.values(ROLES).map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="um-loading">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="um-empty">No users found</div>
        ) : (
          <div className="um-table-wrap">
            <table className="um-table">
              <thead>
                <tr>
                  <th>Display ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className={u.id === user?.userId ? 'um-current-row' : ''}>
                    <td><span className="um-display-id">{u.displayId || '—'}</span></td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`um-badge ${getRoleBadgeClass(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="um-actions">
                      <button className="um-btn-edit" onClick={() => openEditModal(u)}>
                        Edit
                      </button>
                      {u.email !== user?.email && (
                        <button className="um-btn-delete" onClick={() => handleDeleteUser(u.id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="um-overlay" onClick={closeModal}>
            <div className="um-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h2>
              {formError && <div className="um-form-error">{formError}</div>}
              <form onSubmit={handleSubmit}>
                <div className="um-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="um-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="um-form-group">
                  <label>Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    {Object.values(ROLES).map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="um-modal-actions">
                  <button type="button" className="um-btn-cancel" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="um-btn-submit">
                    {modalMode === 'add' ? 'Create User' : 'Update User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPanel;
