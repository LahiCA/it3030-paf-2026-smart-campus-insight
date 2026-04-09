import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAllResources,
  createResource,
  updateResource,
  deleteResource,
} from '../../../frontend/src/services/resources';
import {
  FaPlus,
  FaSearch,
  FaMapMarkerAlt,
  FaUsers,
  FaEdit,
  FaTrash,
  FaTimes,
  FaBuilding,
} from 'react-icons/fa';

const RESOURCE_TYPES = [
  'LECTURE_HALL',
  'LAB',
  'MEETING_ROOM',
  'SPORTS',
  'LIBRARY',
  'AUDITORIUM',
  'OTHER',
];

const STATUS_OPTIONS = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'];

const TYPE_LABELS = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Lab',
  MEETING_ROOM: 'Meeting Room',
  SPORTS: 'Sports',
  LIBRARY: 'Library',
  AUDITORIUM: 'Auditorium',
  OTHER: 'Other',
};

const ResourcesPage = () => {
  const { isAdmin } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'LECTURE_HALL',
    location: '',
    capacity: 10,
    status: 'AVAILABLE',
    description: '',
  });

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await getAllResources();
      setResources(data);
    } catch (err) {
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = useMemo(() => {
    let result = resources;
    if (filterType !== 'ALL') {
      result = result.filter((r) => r.type === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [resources, filterType, searchQuery]);

  const openCreateModal = () => {
    setEditingResource(null);
    setFormData({
      name: '',
      type: 'LECTURE_HALL',
      location: '',
      capacity: 10,
      status: 'AVAILABLE',
      description: '',
    });
    setShowModal(true);
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      type: resource.type,
      location: resource.location || '',
      capacity: resource.capacity,
      status: resource.status,
      description: resource.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingResource) {
        await updateResource(editingResource.id, formData);
        setSuccess('Resource updated successfully');
      } else {
        await createResource(formData);
        setSuccess('Resource created successfully');
      }
      setShowModal(false);
      fetchResources();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save resource');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteResource(id);
      setSuccess('Resource deleted successfully');
      fetchResources();
    } catch (err) {
      setError('Failed to delete resource');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'rs-badge-available';
      case 'OCCUPIED': return 'rs-badge-occupied';
      case 'MAINTENANCE': return 'rs-badge-maintenance';
      default: return '';
    }
  };

  if (loading) {
    return (
      <>
        <style>{resourceStyles}</style>
        <div className="rs-loading">
          <div className="rs-spinner"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{resourceStyles}</style>
      <div className="rs-wrap">
        {/* Header */}
        <div className="rs-header">
          <div>
            <h1 className="rs-title">Campus Resources</h1>
            <p className="rs-subtitle">Manage all campus facilities and assets</p>
          </div>
          {isAdmin() && (
            <button onClick={openCreateModal} className="rs-add-btn">
              <FaPlus size={14} />
              Add Resource
            </button>
          )}
        </div>

        {/* Messages */}
        {success && <div className="rs-msg rs-msg-success">{success}</div>}
        {error && <div className="rs-msg rs-msg-error">{error}</div>}

        {/* Search & Filter */}
        <div className="rs-toolbar">
          <div className="rs-search-wrap">
            <FaSearch className="rs-search-icon" size={14} />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rs-search-input"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rs-filter-select"
          >
            <option value="ALL">All Types</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>

        {/* Resource Cards */}
        {filteredResources.length === 0 ? (
          <div className="rs-empty">
            <FaBuilding size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <p className="rs-empty-title">No resources found</p>
            <p className="rs-empty-sub">
              {searchQuery || filterType !== 'ALL'
                ? 'Try adjusting your search or filter'
                : 'Add your first campus resource'}
            </p>
          </div>
        ) : (
          <div className="rs-grid">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="rs-card">
                <div className="rs-card-header">
                  <FaBuilding size={40} style={{ color: 'rgba(99,102,241,0.35)' }} />
                </div>
                <div className="rs-card-body">
                  <div className="rs-card-top">
                    <h3 className="rs-card-name">{resource.name}</h3>
                    <span className={`rs-badge ${getStatusStyle(resource.status)}`}>
                      {resource.status}
                    </span>
                  </div>
                  {resource.location && (
                    <div className="rs-card-info">
                      <FaMapMarkerAlt size={11} style={{ color: '#9ca3af', flexShrink: 0 }} />
                      <span className="rs-truncate">{resource.location}</span>
                    </div>
                  )}
                  <div className="rs-card-info">
                    <FaUsers size={12} style={{ color: '#9ca3af', flexShrink: 0 }} />
                    <span>Capacity: {resource.capacity}</span>
                  </div>
                  {resource.description && (
                    <p className="rs-card-desc">{resource.description}</p>
                  )}
                  <div className="rs-card-footer">
                    <span className="rs-type-tag">
                      {TYPE_LABELS[resource.type] || resource.type}
                    </span>
                    {isAdmin() && (
                      <div className="rs-actions">
                        <button onClick={() => openEditModal(resource)} className="rs-action-btn rs-action-edit" title="Edit">
                          <FaEdit size={14} />
                        </button>
                        <button onClick={() => handleDelete(resource.id, resource.name)} className="rs-action-btn rs-action-delete" title="Delete">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="rs-overlay">
            <div className="rs-modal">
              <div className="rs-modal-header">
                <h2 className="rs-modal-title">
                  {editingResource ? 'Edit Resource' : 'Add Resource'}
                </h2>
                <button onClick={() => setShowModal(false)} className="rs-close-btn">
                  <FaTimes size={16} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="rs-form">
                <div className="rs-form-row">
                  <div className="rs-form-group">
                    <label className="rs-label">Resource Name <span className="rs-req">*</span></label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Lecture Hall A" required className="rs-input" />
                  </div>
                  <div className="rs-form-group">
                    <label className="rs-label">Type <span className="rs-req">*</span></label>
                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="rs-select">
                      {RESOURCE_TYPES.map((t) => (
                        <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="rs-form-row">
                  <div className="rs-form-group">
                    <label className="rs-label">Location <span className="rs-req">*</span></label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Block A, Ground Floor" required className="rs-input" />
                  </div>
                  <div className="rs-form-group">
                    <label className="rs-label">Capacity <span className="rs-req">*</span></label>
                    <input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })} min="1" required className="rs-input" />
                  </div>
                </div>
                <div className="rs-form-group">
                  <label className="rs-label">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="rs-select" style={{ maxWidth: 200 }}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="rs-form-group">
                  <label className="rs-label">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description..." rows={3} className="rs-textarea" />
                </div>
                <div className="rs-form-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="rs-cancel-btn">Cancel</button>
                  <button type="submit" className="rs-submit-btn">
                    {editingResource ? 'Update Resource' : 'Create Resource'}
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

const resourceStyles = `
  .rs-wrap { padding: 32px 24px; max-width: 1400px; margin: 0 auto; width: 100%; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .rs-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .rs-title { font-size: 24px; font-weight: 700; color: #111827; margin: 0; }
  .rs-subtitle { color: #6b7280; margin-top: 4px; font-size: 14px; }
  .rs-add-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #4f46e5; color: white; border-radius: 8px; font-weight: 600; font-size: 14px; border: none; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: background 0.2s; }
  .rs-add-btn:hover { background: #4338ca; }

  .rs-msg { padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 16px; }
  .rs-msg-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
  .rs-msg-error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }

  .rs-toolbar { display: flex; gap: 16px; margin-bottom: 24px; }
  .rs-search-wrap { position: relative; flex: 1; max-width: 400px; }
  .rs-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
  .rs-search-input { width: 100%; padding: 10px 16px 10px 36px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; background: white; font-family: inherit; }
  .rs-search-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
  .rs-filter-select { padding: 10px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #4b5563; background: white; cursor: pointer; outline: none; font-family: inherit; }
  .rs-filter-select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }

  .rs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
  @media (min-width: 1280px) { .rs-grid { grid-template-columns: repeat(4, 1fr); } }

  .rs-card { background: white; border-radius: 12px; border: 1px solid #f3f4f6; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: box-shadow 0.2s, transform 0.2s; }
  .rs-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
  .rs-card-header { height: 112px; background: linear-gradient(135deg, #e0e7ff 0%, #f5f3ff 50%, #dbeafe 100%); display: flex; align-items: center; justify-content: center; }
  .rs-card-body { padding: 16px; }
  .rs-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
  .rs-card-name { font-weight: 600; color: #111827; font-size: 15px; line-height: 1.3; margin: 0; }

  .rs-badge { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 999px; border: 1px solid; white-space: nowrap; }
  .rs-badge-available { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
  .rs-badge-occupied { background: #fefce8; color: #a16207; border-color: #fde68a; }
  .rs-badge-maintenance { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }

  .rs-card-info { display: flex; align-items: center; gap: 6px; color: #6b7280; font-size: 13px; margin-bottom: 4px; }
  .rs-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rs-card-desc { color: #6b7280; font-size: 13px; margin: 12px 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

  .rs-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid #f3f4f6; }
  .rs-type-tag { font-size: 12px; font-weight: 500; color: #6b7280; background: #f3f4f6; padding: 4px 10px; border-radius: 6px; }
  .rs-actions { display: flex; align-items: center; gap: 4px; }
  .rs-action-btn { padding: 8px; color: #9ca3af; border-radius: 8px; background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .rs-action-edit:hover { color: #4f46e5; background: #eef2ff; }
  .rs-action-delete:hover { color: #dc2626; background: #fef2f2; }

  .rs-empty { text-align: center; padding: 64px 16px; color: #9ca3af; }
  .rs-empty-title { font-size: 18px; font-weight: 500; margin: 0 0 4px; }
  .rs-empty-sub { font-size: 14px; margin: 0; }

  .rs-loading { display: flex; align-items: center; justify-content: center; min-height: 256px; }
  .rs-spinner { width: 48px; height: 48px; border: 3px solid #e5e7eb; border-top-color: #4f46e5; border-radius: 50%; animation: rs-spin 0.8s linear infinite; }
  @keyframes rs-spin { to { transform: rotate(360deg); } }

  /* Modal */
  .rs-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); }
  .rs-modal { background: white; border-radius: 12px; box-shadow: 0 25px 50px rgba(0,0,0,0.25); width: 100%; max-width: 520px; margin: 16px; max-height: 90vh; overflow-y: auto; }
  .rs-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 24px 16px; }
  .rs-modal-title { font-size: 20px; font-weight: 700; color: #111827; margin: 0; }
  .rs-close-btn { padding: 6px; color: #9ca3af; background: transparent; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; transition: all 0.2s; }
  .rs-close-btn:hover { color: #4b5563; background: #f3f4f6; }

  .rs-form { padding: 0 24px 24px; }
  .rs-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .rs-form-group { margin-bottom: 16px; }
  .rs-form-row .rs-form-group { margin-bottom: 0; }
  .rs-label { display: block; font-size: 11px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
  .rs-req { color: #ef4444; }
  .rs-input, .rs-select, .rs-textarea { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; font-family: inherit; background: white; }
  .rs-input:focus, .rs-select:focus, .rs-textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
  .rs-select { cursor: pointer; }
  .rs-textarea { resize: vertical; min-height: 80px; }

  .rs-form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
  .rs-cancel-btn { padding: 10px 20px; color: #4b5563; font-weight: 500; font-size: 14px; border-radius: 8px; background: transparent; border: none; cursor: pointer; transition: background 0.2s; }
  .rs-cancel-btn:hover { background: #f3f4f6; }
  .rs-submit-btn { padding: 10px 20px; background: #4f46e5; color: white; font-weight: 600; font-size: 14px; border-radius: 8px; border: none; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: background 0.2s; }
  .rs-submit-btn:hover { background: #4338ca; }
`;

export default ResourcesPage;
