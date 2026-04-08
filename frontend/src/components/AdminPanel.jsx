import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../utils/axios-instance';
import { ROLES } from '../utils/constants';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [successMsg, setSuccessMsg] = useState('');

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId) => {
    if (!selectedRole) return;
    try {
      await axiosInstance.put(`/users/${userId}/role`, {
        userId,
        newRole: selectedRole,
      });
      setSuccessMsg('Role updated successfully!');
      setEditingUser(null);
      setSelectedRole('');
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to update role');
      console.error(err);
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
      console.error(err);
    }
  };

  const filteredUsers = filterRole === 'ALL'
    ? users
    : users.filter((u) => u.role === filterRole);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="admin-panel">
        <div className="admin-error">
          <h2>Access Denied</h2>
          <p>You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p className="admin-subtitle">Manage users and roles</p>
      </div>

      {successMsg && <div className="admin-success">{successMsg}</div>}
      {error && <div className="admin-error-msg">{error}</div>}

      <div className="admin-controls">
        <div className="admin-filter">
          <label>Filter by Role:</label>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="ALL">All Roles</option>
            {Object.values(ROLES).map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
        <div className="admin-stats">
          <span>Total Users: <strong>{users.length}</strong></span>
          <span>Showing: <strong>{filteredUsers.length}</strong></span>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Loading users...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className={u.id === user?.userId ? 'current-user' : ''}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge role-${u.role?.toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="actions-cell">
                    {editingUser === u.id ? (
                      <div className="edit-role-form">
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                        >
                          <option value="">Select Role</option>
                          {Object.values(ROLES).map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                        <button
                          className="btn-save"
                          onClick={() => handleRoleUpdate(u.id)}
                          disabled={!selectedRole}
                        >
                          Save
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => { setEditingUser(null); setSelectedRole(''); }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => { setEditingUser(u.id); setSelectedRole(u.role); }}
                        >
                          Change Role
                        </button>
                        {u.email !== user?.email && (
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
