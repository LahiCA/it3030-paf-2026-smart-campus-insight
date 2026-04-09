import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../utils/axios-instance';
import { ROLES } from '../utils/constants';

const roleBadgeClassMap = {
  ADMIN: 'border-amber-200 bg-amber-100 text-amber-800',
  LECTURER: 'border-blue-200 bg-blue-100 text-blue-800',
  TECHNICIAN: 'border-indigo-200 bg-indigo-100 text-indigo-800',
};

const inputClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10';

const AdminPanelTailwind = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'LECTURER', phoneNumber: '', address: '' });
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
    setFormData({ name: '', email: '', role: 'LECTURER', phoneNumber: '', address: '' });
    setFormError('');
    setEditingUser(null);
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setModalMode('edit');
    setFormData({ name: u.name, email: u.email, role: u.role, phoneNumber: u.phoneNumber || '', address: u.address || '' });
    setFormError('');
    setEditingUser(u);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '', email: '', role: 'LECTURER', phoneNumber: '', address: '' });
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

  if (user?.role !== 'ADMIN') {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
          <h2 className="mb-2 text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-sm text-red-700">You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 font-['Poppins',sans-serif] sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">Manage system users and roles</p>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,#14B8A6,#0f766e)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/25"
          onClick={openAddModal}
        >
          + Add New User
        </button>
      </div>

      {successMsg && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{successMsg}</div>}
      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total Users', users.length],
          ['Admins', users.filter((u) => u.role === 'ADMIN').length],
          ['Lecturers', users.filter((u) => u.role === 'LECTURER').length],
          ['Technicians', users.filter((u) => u.role === 'TECHNICIAN').length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-white px-6 py-5 text-center shadow-sm">
            <div className="text-3xl font-bold text-teal-500">{value}</div>
            <div className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          className={`${inputClassName} flex-1`}
          type="text"
          placeholder="Search by name, email, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className={`${inputClassName} sm:w-56`} value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="ALL">All Roles</option>
          {Object.values(ROLES).map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white px-6 py-16 text-center text-base text-slate-500 shadow-sm">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-16 text-center text-slate-400 shadow-sm">No users found</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto scrollbar-ui">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  {['Display ID', 'Name', 'Email', 'Phone', 'Address', 'Role', 'Created', 'Actions'].map((heading) => (
                    <th key={heading} className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className={u.id === user?.userId ? 'bg-teal-50/80' : 'hover:bg-slate-50'}>
                    <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                      <span className="rounded-md bg-teal-50 px-2.5 py-1 font-mono text-[13px] font-semibold text-teal-700">
                        {u.displayId || '-'}
                      </span>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{u.name}</td>
                    <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{u.email}</td>
                    <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{u.phoneNumber || '-'}</td>
                    <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{u.address || '-'}</td>
                    <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em] ${roleBadgeClassMap[u.role] || 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                      <div className="flex gap-2">
                        <button
                          className="rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-[13px] font-medium text-sky-700 transition hover:bg-sky-100"
                          onClick={() => openEditModal(u)}
                        >
                          Edit
                        </button>
                        {u.email !== user?.email && (
                          <button
                            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-1.5 text-[13px] font-medium text-red-600 transition hover:bg-red-100"
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4" onClick={closeModal}>
          <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-6 text-2xl font-bold text-slate-800">{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h2>
            {formError && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="mb-1.5 block text-sm font-semibold text-slate-600">Full Name</label>
                <input
                  className={inputClassName}
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="mb-5">
                <label className="mb-1.5 block text-sm font-semibold text-slate-600">Email Address</label>
                <input
                  className={inputClassName}
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="mb-5">
                <label className="mb-1.5 block text-sm font-semibold text-slate-600">Role</label>
                <select
                  className={inputClassName}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  {Object.values(ROLES).map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="mb-5">
                <label className="mb-1.5 block text-sm font-semibold text-slate-600">Phone Number</label>
                <input
                  className={inputClassName}
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="mb-5">
                <label className="mb-1.5 block text-sm font-semibold text-slate-600">Address</label>
                <input
                  className={inputClassName}
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter address"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200" onClick={closeModal}>Cancel</button>
                <button type="submit" className="rounded-xl bg-[linear-gradient(135deg,#14B8A6,#0f766e)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-lg hover:shadow-teal-500/25">
                  {modalMode === 'add' ? 'Create User' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelTailwind;
