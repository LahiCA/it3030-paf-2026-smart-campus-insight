import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import  ResourceAnalytics from '../components/ResourceAnalytics'
//import Chatbot from './ChatBot';
import {
  getAllResources,
  createResource,
  updateResource,
  deleteResource,
} from '../services/resources';
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

const statusClassMap = {
  AVAILABLE: 'border-green-200 bg-green-50 text-green-700',
  OCCUPIED: 'border-amber-200 bg-amber-50 text-amber-700',
  MAINTENANCE: 'border-red-200 bg-red-50 text-red-700',
};

const inputClassName =
  //'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10';

const ResourcesPageTailwind = () => {
  const { isAdmin } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCapacityMin, setFilterCapacityMin] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
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
  const [imageFile, setImageFile] = useState(null);

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
    } catch {
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

    if (filterStatus !== 'ALL') {
      result = result.filter((r) => r.status === filterStatus);
    }

    if (filterLocation.trim()) {
      const loc = filterLocation.toLowerCase();
      result = result.filter((r) =>
        r.location?.toLowerCase().includes(loc)
      );
    }

    if (filterCapacityMin !== '' && !isNaN(Number(filterCapacityMin))) {
      result = result.filter((r) => r.capacity >= Number(filterCapacityMin));
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
  }, [resources, filterType, filterStatus, filterLocation, filterCapacityMin, searchQuery]);

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
    setImageFile(null);
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
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        fd.append(key, value);
      });
      if (imageFile) {
        fd.append('images', imageFile);
      }
      if (editingResource) {
        await updateResource(editingResource.id, fd);
        setSuccess('Resource updated successfully');
      } else {
        await createResource(fd);
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
    } catch {
      setError('Failed to delete resource');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 font-['Poppins',sans-serif] sm:px-6">
      <div className="mb-6">
        {/* Header always on top */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Campus Resources</h1>
            <p className="mt-1 text-sm text-slate-500">Manage all campus facilities and assets</p>
          </div>
        </div>

        {/* Analytics below header */}
        <ResourceAnalytics resources={resources} isAdmin={isAdmin()} />

        {/* Add Resource button below analytics */}
        {isAdmin() && (
          <div className="flex justify-end mt-3">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/10"
            >
              <FaPlus size={14} />
              Add Resource
            </button>
          </div>
        )}
</div>
      

      {success && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <FaSearch
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputClassName} pl-9`}
            />
          </div>

          {/* Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={inputClassName}
          >
            <option value="ALL">All Types</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>

          {/* Location */}
          <input
            type="text"
            placeholder="Filter by location..."
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className={inputClassName}
          />

          {/* Min Capacity */}
          <input
            type="number"
            placeholder="Min capacity"
            min={1}
            value={filterCapacityMin}
            onChange={(e) => setFilterCapacityMin(e.target.value)}
            className={inputClassName}
          />

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={inputClassName}
          >
            <option value="ALL">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className="rounded-3xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">
          <FaBuilding size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="mb-1 text-lg font-medium text-slate-500">No resources found</p>
          <p className="text-sm text-slate-400">
            {searchQuery || filterType !== 'ALL' || filterLocation || filterCapacityMin || filterStatus !== 'ALL'
              ? 'Try adjusting your search or filters'
              : 'Add your first campus resource'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex h-28 items-center justify-center bg-[linear-gradient(135deg,#F0FDFA_0%,#CCFBF1_50%,#99F6E4_100%)]">
                <FaBuilding size={40} className="text-teal-500/40" />
              </div>
              <div className="p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="text-[15px] font-semibold leading-5 text-slate-900">{resource.name}</h3>
                  <span
                    className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusClassMap[resource.status] || 'border-slate-200 bg-slate-100 text-slate-700'}`}
                  >
                    {resource.status}
                  </span>
                </div>

                {resource.location && (
                  <div className="mb-1 flex items-center gap-1.5 text-[13px] text-slate-500">
                    <FaMapMarkerAlt size={11} className="shrink-0 text-slate-400" />
                    <span className="truncate">{resource.location}</span>
                  </div>
                )}

                <div className="mb-1 flex items-center gap-1.5 text-[13px] text-slate-500">
                  <FaUsers size={12} className="shrink-0 text-slate-400" />
                  <span>Capacity: {resource.capacity}</span>
                </div>

                {resource.description && (
                  <p className="mb-3 mt-3 line-clamp-2 text-[13px] leading-5 text-slate-500">
                    {resource.description}
                  </p>
                )}

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                    {TYPE_LABELS[resource.type] || resource.type}
                  </span>
                  {isAdmin() && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(resource)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-teal-50 hover:text-teal-600"
                        title="Edit"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(resource.id, resource.name)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-130 overflow-y-auto rounded-2xl bg-white shadow-2xl scrollbar-ui">
            <div className="flex items-center justify-between px-6 pb-4 pt-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingResource ? 'Edit Resource' : 'Add Resource'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6">
              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">
                    Resource Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Lecture Hall A"
                    required
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={inputClassName}
                  >
                    {RESOURCE_TYPES.map((t) => (
                      <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Block A, Ground Floor"
                    required
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 0 })}
                    min="1"
                    required
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={`${inputClassName} max-w-50`}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description..."
                  rows={3}
                  className={`${inputClassName} min-h-20 resize-y`}
                />
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files[0])}
                  className={inputClassName}
                />
              </div>
              <div className="mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/20"
                >
                  {editingResource ? 'Update Resource' : 'Create Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPageTailwind;


// import React, { useState, useEffect, useMemo } from 'react';
// import { useAuth } from '../context/AuthContext';
// import {
//   getAllResources,
//   createResource,
//   updateResource,
//   deleteResource,
// } from '../services/resources';
// import {
//   FaPlus,
//   FaSearch,
//   FaMapMarkerAlt,
//   FaUsers,
//   FaEdit,
//   FaTrash,
//   FaTimes,
//   FaBuilding,
// } from 'react-icons/fa';

// const RESOURCE_TYPES = [
//   'LECTURE_HALL',
//   'LAB',
//   'MEETING_ROOM',
//   'SPORTS',
//   'LIBRARY',
//   'AUDITORIUM',
//   'OTHER',
// ];

// const STATUS_OPTIONS = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'];

// const TYPE_LABELS = {
//   LECTURE_HALL: 'Lecture Hall',
//   LAB: 'Lab',
//   MEETING_ROOM: 'Meeting Room',
//   SPORTS: 'Sports',
//   LIBRARY: 'Library',
//   AUDITORIUM: 'Auditorium',
//   OTHER: 'Other',
// };

// const statusClassMap = {
//   AVAILABLE: 'border-green-200 bg-green-50 text-green-700',
//   OCCUPIED: 'border-amber-200 bg-amber-50 text-amber-700',
//   MAINTENANCE: 'border-red-200 bg-red-50 text-red-700',
// };

// const inputClassName =
//   'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';

// const ResourcesPageTailwind = () => {
//   const { isAdmin } = useAuth();
//   const [resources, setResources] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterType, setFilterType] = useState('ALL');
//   const [showModal, setShowModal] = useState(false);
//   const [editingResource, setEditingResource] = useState(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     type: 'LECTURE_HALL',
//     location: '',
//     capacity: 10,
//     status: 'AVAILABLE',
//     description: '',
//   });

//   useEffect(() => {
//     fetchResources();
//   }, []);

//   useEffect(() => {
//     if (success || error) {
//       const timer = setTimeout(() => {
//         setSuccess('');
//         setError('');
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [success, error]);

//   const fetchResources = async () => {
//     try {
//       setLoading(true);
//       const data = await getAllResources();
//       setResources(data);
//     } catch (err) {
//       setError('Failed to load resources');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredResources = useMemo(() => {
//     let result = resources;
//     if (filterType !== 'ALL') {
//       result = result.filter((r) => r.type === filterType);
//     }
//     if (searchQuery.trim()) {
//       const q = searchQuery.toLowerCase();
//       result = result.filter(
//         (r) =>
//           r.name.toLowerCase().includes(q) ||
//           r.location?.toLowerCase().includes(q) ||
//           r.description?.toLowerCase().includes(q)
//       );
//     }
//     return result;
//   }, [resources, filterType, searchQuery]);

//   const openCreateModal = () => {
//     setEditingResource(null);
//     setFormData({
//       name: '',
//       type: 'LECTURE_HALL',
//       location: '',
//       capacity: 10,
//       status: 'AVAILABLE',
//       description: '',
//     });
//     setShowModal(true);
//   };

//   const openEditModal = (resource) => {
//     setEditingResource(resource);
//     setFormData({
//       name: resource.name,
//       type: resource.type,
//       location: resource.location || '',
//       capacity: resource.capacity,
//       status: resource.status,
//       description: resource.description || '',
//     });
//     setShowModal(true);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingResource) {
//         await updateResource(editingResource.id, formData);
//         setSuccess('Resource updated successfully');
//       } else {
//         await createResource(formData);
//         setSuccess('Resource created successfully');
//       }
//       setShowModal(false);
//       fetchResources();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to save resource');
//     }
//   };

//   const handleDelete = async (id, name) => {
//     if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
//     try {
//       await deleteResource(id);
//       setSuccess('Resource deleted successfully');
//       fetchResources();
//     } catch (err) {
//       setError('Failed to delete resource');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex min-h-64 items-center justify-center">
//         <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-slate-200 border-t-indigo-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="mx-auto w-full max-w-[1400px] px-4 py-8 font-['Poppins',sans-serif] sm:px-6">
//       <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-slate-900">Campus Resources</h1>
//           <p className="mt-1 text-sm text-slate-500">Manage all campus facilities and assets</p>
//         </div>
//         {isAdmin() && (
//           <button
//             onClick={openCreateModal}
//             className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20"
//           >
//             <FaPlus size={14} />
//             Add Resource
//           </button>
//         )}
//       </div>

//       {success && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}
//       {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

//       <div className="mb-6 flex flex-col gap-4 lg:flex-row">
//         <div className="relative max-w-xl flex-1">
//           <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
//           <input
//             type="text"
//             placeholder="Search resources..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className={`${inputClassName} pl-9`}
//           />
//         </div>
//         <select
//           value={filterType}
//           onChange={(e) => setFilterType(e.target.value)}
//           className={`${inputClassName} lg:w-56`}
//         >
//           <option value="ALL">All Types</option>
//           {RESOURCE_TYPES.map((t) => (
//             <option key={t} value={t}>{TYPE_LABELS[t]}</option>
//           ))}
//         </select>
//       </div>

//       {filteredResources.length === 0 ? (
//         <div className="rounded-3xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">
//           <FaBuilding size={48} className="mx-auto mb-4 text-slate-300" />
//           <p className="mb-1 text-lg font-medium text-slate-500">No resources found</p>
//           <p className="text-sm text-slate-400">
//             {searchQuery || filterType !== 'ALL'
//               ? 'Try adjusting your search or filter'
//               : 'Add your first campus resource'}
//           </p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
//           {filteredResources.map((resource) => (
//             <div key={resource.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
//               <div className="flex h-28 items-center justify-center bg-[linear-(135deg,#e0e7ff_0%,#f5f3ff_50%,#dbeafe_100%)]">
//                 <FaBuilding size={40} className="text-indigo-400/40" />
//               </div>
//               <div className="p-4">
//                 <div className="mb-3 flex items-start justify-between gap-2">
//                   <h3 className="text-[15px] font-semibold leading-5 text-slate-900">{resource.name}</h3>
//                   <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusClassMap[resource.status] || 'border-slate-200 bg-slate-100 text-slate-700'}`}>
//                     {resource.status}
//                   </span>
//                 </div>

//                 {resource.location && (
//                   <div className="mb-1 flex items-center gap-1.5 text-[13px] text-slate-500">
//                     <FaMapMarkerAlt size={11} className="shrink-0 text-slate-400" />
//                     <span className="truncate">{resource.location}</span>
//                   </div>
//                 )}

//                 <div className="mb-1 flex items-center gap-1.5 text-[13px] text-slate-500">
//                   <FaUsers size={12} className="shrink-0 text-slate-400" />
//                   <span>Capacity: {resource.capacity}</span>
//                 </div>

//                 {resource.description && (
//                   <p className="mb-3 mt-3 line-clamp-2 text-[13px] leading-5 text-slate-500">
//                     {resource.description}
//                   </p>
//                 )}

//                 <div className="flex items-center justify-between border-t border-slate-100 pt-3">
//                   <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
//                     {TYPE_LABELS[resource.type] || resource.type}
//                   </span>
//                   {isAdmin() && (
//                     <div className="flex items-center gap-1">
//                       <button onClick={() => openEditModal(resource)} className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600" title="Edit">
//                         <FaEdit size={14} />
//                       </button>
//                       <button onClick={() => handleDelete(resource.id, resource.name)} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600" title="Delete">
//                         <FaTrash size={14} />
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {showModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
//           <div className="max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-2xl bg-white shadow-2xl scrollbar-ui">
//             <div className="flex items-center justify-between px-6 pb-4 pt-6">
//               <h2 className="text-2xl font-bold text-slate-900">{editingResource ? 'Edit Resource' : 'Add Resource'}</h2>
//               <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
//                 <FaTimes size={16} />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="px-6 pb-6">
//               <div className="mb-4 grid gap-4 md:grid-cols-2">
//                 <div>
//                   <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">Resource Name <span className="text-red-500">*</span></label>
//                   <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Lecture Hall A" required className={inputClassName} />
//                 </div>
//                 <div>
//                   <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">Type <span className="text-red-500">*</span></label>
//                   <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={inputClassName}>
//                     {RESOURCE_TYPES.map((t) => (
//                       <option key={t} value={t}>{TYPE_LABELS[t]}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <div className="mb-4 grid gap-4 md:grid-cols-2">
//                 <div>
//                   <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">Location <span className="text-red-500">*</span></label>
//                   <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Block A, Ground Floor" required className={inputClassName} />
//                 </div>
//                 <div>
//                   <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">Capacity <span className="text-red-500">*</span></label>
//                   <input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 0 })} min="1" required className={inputClassName} />
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">Status</label>
//                 <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={`${inputClassName} max-w-[200px]`}>
//                   {STATUS_OPTIONS.map((s) => (
//                     <option key={s} value={s}>{s}</option>
//                   ))}
//                 </select>
//               </div>

//               <div className="mb-4">
//                 <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">Description</label>
//                 <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description..." rows={3} className={`${inputClassName} min-h-20 resize-y`} />
//               </div>

//               <div className="mt-2 flex justify-end gap-3">
//                 <button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100">Cancel</button>
//                 <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20">
//                   {editingResource ? 'Update Resource' : 'Create Resource'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ResourcesPageTailwind;
