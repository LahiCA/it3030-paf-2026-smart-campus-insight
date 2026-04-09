import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../utils/axios-instance';
import {
    adminGetAllNotifications,
    adminCreateNotification,
    adminUpdateNotification,
    adminDeleteNotification,
    adminSendToUser,
} from '../services/notifications';

const TYPE_OPTIONS = [
    'GENERAL',
    'BOOKING_APPROVED',
    'BOOKING_REJECTED',
    'TICKET_CREATED',
    'TICKET_UPDATED',
    'COMMENT_ADDED',
    'BOOKING_COMMENT',
];

const AUDIENCE_OPTIONS = [
    { value: 'ALL', label: 'All Users' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'LECTURER', label: 'Lecturer' },
    { value: 'TECHNICIAN', label: 'Technician' },
];

const TYPE_COLORS = {
    GENERAL: 'bg-gray-100 text-gray-700',
    BOOKING_APPROVED: 'bg-green-100 text-green-700',
    BOOKING_REJECTED: 'bg-red-100 text-red-700',
    TICKET_CREATED: 'bg-blue-100 text-blue-700',
    TICKET_UPDATED: 'bg-yellow-100 text-yellow-700',
    COMMENT_ADDED: 'bg-purple-100 text-purple-700',
    BOOKING_COMMENT: 'bg-indigo-100 text-indigo-700',
};

const AUDIENCE_COLORS = {
    ALL: 'bg-teal-100 text-teal-700',
    ADMIN: 'bg-orange-100 text-orange-700',
    LECTURER: 'bg-blue-100 text-blue-700',
    TECHNICIAN: 'bg-indigo-100 text-indigo-700',
};

const EMPTY_FORM = { message: '', type: 'GENERAL', targetAudience: 'ALL' };
const EMPTY_USER_FORM = { userId: '', message: '', type: 'GENERAL' };

const NotificationManagementPage = () => {
    const { user } = useContext(AuthContext);

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    // Filters
    const [filterAudience, setFilterAudience] = useState('ALL');
    const [filterType, setFilterType] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Send to specific user
    const [showUserModal, setShowUserModal] = useState(false);
    const [userForm, setUserForm] = useState(EMPTY_USER_FORM);
    const [userFormError, setUserFormError] = useState('');
    const [sendingToUser, setSendingToUser] = useState(false);
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    useEffect(() => {
        fetchNotifications();
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await axiosInstance.get('/users');
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setUsersLoading(false);
        }
    };

    const openUserModal = () => {
        setUserForm(EMPTY_USER_FORM);
        setUserFormError('');
        setShowUserModal(true);
    };

    const closeUserModal = () => {
        setShowUserModal(false);
        setUserForm(EMPTY_USER_FORM);
        setUserFormError('');
    };

    const handleUserFormChange = (e) => {
        setUserForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSendToUser = async (e) => {
        e.preventDefault();
        setUserFormError('');
        if (!userForm.userId) { setUserFormError('Please select a user'); return; }
        if (!userForm.message.trim()) { setUserFormError('Message is required'); return; }
        setSendingToUser(true);
        try {
            const result = await adminSendToUser(userForm);
            if (result.success) {
                showSuccess('Notification sent to user!');
                closeUserModal();
            } else {
                setUserFormError(result.message || 'Failed to send notification');
            }
        } finally {
            setSendingToUser(false);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        const result = await adminGetAllNotifications();
        if (result.success) {
            setNotifications(result.notifications);
            setError(null);
        } else {
            setError(result.message || 'Failed to load notifications');
        }
        setLoading(false);
    };

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3500);
    };

    const openAddModal = () => {
        setFormData(EMPTY_FORM);
        setFormError('');
        setEditingId(null);
        setModalMode('add');
        setShowModal(true);
    };

    const openEditModal = (n) => {
        setFormData({ message: n.message, type: n.type, targetAudience: n.targetAudience || 'ALL' });
        setFormError('');
        setEditingId(n.id);
        setModalMode('edit');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData(EMPTY_FORM);
        setFormError('');
        setEditingId(null);
    };

    const handleFormChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!formData.message.trim()) {
            setFormError('Message is required');
            return;
        }
        setSubmitting(true);
        try {
            let result;
            if (modalMode === 'add') {
                result = await adminCreateNotification(formData);
            } else {
                result = await adminUpdateNotification(editingId, formData);
            }
            if (result.success) {
                showSuccess(modalMode === 'add' ? 'Notification created!' : 'Notification updated!');
                closeModal();
                fetchNotifications();
            } else {
                setFormError(result.message || 'Operation failed');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        const result = await adminDeleteNotification(deleteTarget.id);
        setDeleting(false);
        if (result.success) {
            showSuccess('Notification deleted.');
            setDeleteTarget(null);
            fetchNotifications();
        } else {
            setError(result.message || 'Failed to delete notification');
            setDeleteTarget(null);
        }
    };

    // Apply filters + search
    const filtered = notifications.filter((n) => {
        const audienceMatch = filterAudience === 'ALL' || n.targetAudience === filterAudience;
        const typeMatch = filterType === 'ALL' || n.type === filterType;
        const search = searchTerm.toLowerCase();
        const textMatch =
            !search ||
            (n.displayId || '').toLowerCase().includes(search) ||
            (n.message || '').toLowerCase().includes(search);
        return audienceMatch && typeMatch && textMatch;
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
                <p className="text-gray-500 mt-1">Create and manage broadcast notifications for users.</p>
            </div>

            {/* Success / Error Banners */}
            {successMsg && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm font-medium">
                    {successMsg}
                </div>
            )}
            {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm font-medium flex justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="font-bold">✕</button>
                </div>
            )}

            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search ID or message..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-56"
                        />
                        {/* Audience filter */}
                        <select
                            value={filterAudience}
                            onChange={(e) => setFilterAudience(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="ALL">All Audiences</option>
                            {AUDIENCE_OPTIONS.map((a) => (
                                <option key={a.value} value={a.value}>{a.label}</option>
                            ))}
                        </select>
                        {/* Type filter */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="ALL">All Types</option>
                            {TYPE_OPTIONS.map((t) => (
                                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={openUserModal}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            <span className="text-lg leading-none">✉</span> Send to User
                        </button>
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            <span className="text-lg leading-none">+</span> Broadcast
                        </button>
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    {filtered.length} notification{filtered.length !== 1 ? 's' : ''} shown
                </p>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-500 text-sm gap-3">
                        <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading notifications…
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <span className="text-5xl mb-3">🔔</span>
                        <p className="text-sm">No notifications found.</p>
                        <button onClick={openAddModal} className="mt-4 text-blue-600 hover:underline text-sm">
                            Create the first notification
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Notification ID', 'Message', 'Type', 'Target Audience', 'Created Date', 'Actions'].map((h) => (
                                        <th
                                            key={h}
                                            className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filtered.map((n) => (
                                    <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                                        {/* Display ID */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                                {n.displayId || '—'}
                                            </span>
                                        </td>
                                        {/* Message */}
                                        <td className="px-4 py-3 max-w-xs">
                                            <p className="text-sm text-gray-800 line-clamp-2 leading-snug">{n.message}</p>
                                        </td>
                                        {/* Type */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[n.type] || 'bg-gray-100 text-gray-700'}`}>
                                                {(n.type || '—').replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        {/* Target Audience */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${AUDIENCE_COLORS[n.targetAudience] || 'bg-gray-100 text-gray-700'}`}>
                                                {AUDIENCE_OPTIONS.find((a) => a.value === n.targetAudience)?.label || n.targetAudience || '—'}
                                            </span>
                                        </td>
                                        {/* Created Date */}
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                                            {formatDate(n.createdAt)}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(n)}
                                                    className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(n)}
                                                    className="text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {modalMode === 'add' ? 'Add New Notification' : 'Edit Notification'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                            {formError && (
                                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-red-600 text-sm">
                                    {formError}
                                </div>
                            )}

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleFormChange}
                                    rows={3}
                                    placeholder="Enter notification message..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleFormChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    {TYPE_OPTIONS.map((t) => (
                                        <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Target Audience */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                                <select
                                    name="targetAudience"
                                    value={formData.targetAudience}
                                    onChange={handleFormChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    {AUDIENCE_OPTIONS.map((a) => (
                                        <option key={a.value} value={a.value}>{a.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {submitting && (
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    )}
                                    {modalMode === 'add' ? 'Create Notification' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Send to Specific User Modal */}
            {showUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Send Notification to User</h2>
                            <button onClick={closeUserModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                        </div>
                        <form onSubmit={handleSendToUser} className="px-6 py-5 space-y-5">
                            {userFormError && (
                                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-red-600 text-sm">
                                    {userFormError}
                                </div>
                            )}
                            {/* User selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select User <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="userId"
                                    value={userForm.userId}
                                    onChange={handleUserFormChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                                >
                                    <option value="">{usersLoading ? 'Loading users...' : '— Select a user —'}</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            [{u.displayId}] {u.name} — {u.role}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="message"
                                    value={userForm.message}
                                    onChange={handleUserFormChange}
                                    rows={3}
                                    placeholder="Enter notification message..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                                />
                            </div>
                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    name="type"
                                    value={userForm.type}
                                    onChange={handleUserFormChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                                >
                                    {TYPE_OPTIONS.map((t) => (
                                        <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeUserModal}
                                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingToUser}
                                    className="px-5 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {sendingToUser && (
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    )}
                                    Send Notification
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm Dialog */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete Notification</h2>
                        <p className="text-sm text-gray-600 mb-1">
                            Are you sure you want to delete this notification?
                        </p>
                        <div className="mt-2 mb-4 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 border border-gray-200">
                            <span className="font-mono font-semibold">{deleteTarget.displayId}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="line-clamp-1">{deleteTarget.message}</span>
                        </div>
                        <p className="text-xs text-red-500 mb-5">This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors"
                            >
                                {deleting ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationManagementPage;
