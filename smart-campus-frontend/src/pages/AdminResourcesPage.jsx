import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Plus, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import resourceService from '../services/resourceService'
import ResourceCard from '../components/ResourceList'
import ResourceForm from '../components/ResourceForm'

const TYPES = ['LECTURE_HALL','LAB','MEETING_ROOM','EQUIPMENT','SPORTS','STUDY_ROOM','AUDITORIUM','OTHER']
const STATUSES = ['AVAILABLE','OUT_OF_SERVICE','OCCUPIED','MAINTENANCE','RETIRED']

export default function AdminResourcesPage() {
  const { user } = useAuth()
  const [resources, setResources] = useState([])
 
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [capacityMin, setCapacityMin] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const canManage = user?.role === 'ADMIN'
 // const canManage = true // For testing, replace with actual auth check

  // Load resources from backend
  const load = async () => {
    setLoading(true)
    try {
      const params = {
        status: statusFilter?.toUpperCase() || undefined,
        type: typeFilter?.toUpperCase() || undefined,
        location: locationFilter || undefined,
        capacityMin: capacityMin ? Number(capacityMin) : undefined,
        search: search || undefined,
      }
      const res = await resourceService.getAll(params)
      const data = Array.isArray(res.data) ? res.data : []
      setResources(data)
      //setFiltered(data)
    } catch (err) {
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    load() },
   [search, typeFilter, locationFilter, capacityMin, statusFilter])

  // Add or update
  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await resourceService.update(editing.id, data)
        toast.success('Resource updated')
      } else {
        await resourceService.create(data)
        toast.success('Resource created')
      }
      setShowModal(false)
      setEditing(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    }
  }

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return
    try {
      await resourceService.delete(id)
      toast.success('Resource deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Campus Resources</h1>
          <p className="text-gray-500 text-sm">Manage all campus facilities and assets</p>
        </div>

        {canManage && (
          <button
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm hover:opacity-90"
            onClick={() => { setEditing(null); setShowModal(true) }}
          >
            <Plus size={16} /> Add Resource
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-2xl p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="flex items-center gap-2 border rounded-xl px-3 py-2">
          <Search size={16} className="text-gray-400" />
          <input
            className="w-full outline-none text-sm"
            placeholder="Search resources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="border rounded-xl px-3 py-2 text-sm"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>

        <input
          className="border rounded-xl px-3 py-2 text-sm"
          placeholder="Location"
          value={locationFilter}
          onChange={e => setLocationFilter(e.target.value)}
        />

        <input
          className="border rounded-xl px-3 py-2 text-sm"
          type="number"
          min={1}
          placeholder="Min capacity"
          value={capacityMin}
          onChange={e => setCapacityMin(e.target.value)}
        />

        <select
          className="border rounded-xl px-3 py-2 text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg font-medium">No resources found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(r => (
            <ResourceCard
              key={r.id}
              resource={r}
              onEdit={() => { setEditing(r); setShowModal(true) }}
              onDelete={() => handleDelete(r.id)}
              canManage={canManage}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Resource' : 'Add Resource'}</h2>
            <ResourceForm
              initial={editing}
              onSubmit={handleSubmit}
              onCancel={() => { setShowModal(false); setEditing(null) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// import React, { useState, useEffect } from 'react'
// import toast from 'react-hot-toast'
// import { Plus, Search } from 'lucide-react'
// import { useAuth } from '../context/AuthContext'
// import resourceService from '../services/resourceService'
// import ResourceCard from '../component/ResourceList'
// import ResourceForm from '../component/ResourceForm'

// const TYPES = ['LECTURE_HALL','LAB','MEETING_ROOM','EQUIPMENT','SPORTS','STUDY_ROOM','AUDITORIUM','OTHER']
// const STATUSES = ['AVAILABLE','OUT_OF_SERVICE','OCCUPIED','MAINTENANCE','RETIRED']

// export default function AdminResourcesPage() {
//   const { user } = useAuth()
//   const [resources, setResources] = useState([])
//   const [filtered, setFiltered] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [search, setSearch] = useState('')
//   const [typeFilter, setTypeFilter] = useState('')
//   const [locationFilter, setLocationFilter] = useState('')
//   const [capacityMin, setCapacityMin] = useState('')
//   const [statusFilter, setStatusFilter] = useState('')
//   const [showModal, setShowModal] = useState(false)
//   const [editing, setEditing] = useState(null)

//   const canManage = user?.role === 'ADMIN' || user?.role === 'STAFF'

//   const load = () => {
//     setLoading(true)
//     resourceService.getAll({
//       status: statusFilter,
//       type: typeFilter,
//       location: locationFilter,
//       capacityMin: capacityMin,
//       search: search
//     })
//       .then(r => {
//         const d = Array.isArray(r.data) ? r.data : []
//         setResources(d)
//         setFiltered(d)
//       })
//       .catch(() => toast.error('Failed to load resources'))
//       .finally(() => setLoading(false))
//   }

//   useEffect(load, [])

//   useEffect(() => {
//     let list = resources
//     if (search) {
//       const lower = search.toLowerCase()
//       list = list.filter(r =>
//         r.name.toLowerCase().includes(lower) ||
//         r.location.toLowerCase().includes(lower) ||
//         (r.description || '').toLowerCase().includes(lower)
//       )
//     }
//     if (typeFilter) list = list.filter(r => r.type === typeFilter)
//     if (locationFilter) list = list.filter(r => r.location.toLowerCase().includes(locationFilter.toLowerCase()))
//     if (capacityMin) list = list.filter(r => Number(r.capacity) >= Number(capacityMin))
//     if (statusFilter) list = list.filter(r => r.status === statusFilter)
//     setFiltered(list)
//   }, [search, typeFilter, locationFilter, capacityMin, statusFilter, resources])

//   const handleSubmit = async (data) => {
//     try {
//       if (editing) {
//         await resourceService.update(editing.id, data)
//         toast.success('Resource updated')
//       } else {
//         await resourceService.create(data)
//         toast.success('Resource created')
//       }
//       setShowModal(false)
//       setEditing(null)
//       load()
//     } catch (err) {
//       toast.error(err.message)
//     }
//   }

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this resource?')) return
//     try {
//       await resourceService.delete(id)
//       toast.success('Deleted')
//       load()
//     } catch (err) {
//       toast.error(err.message)
//     }
//   }

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//         <div>
//           <h1 className="text-2xl font-bold">Campus Resources</h1>
//           <p className="text-gray-500 text-sm">Manage all campus facilities and assets</p>
//         </div>

//         {canManage && (
//           <button
//             className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm hover:opacity-90"
//             onClick={() => { setEditing(null); setShowModal(true) }}
//           >
//             <Plus size={16} /> Add Resource
//           </button>
//         )}
//       </div>

//       {/* Filters */}
//       <div className="bg-white shadow-sm rounded-2xl p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
//         <div className="flex items-center gap-2 border rounded-xl px-3 py-2">
//           <Search size={16} className="text-gray-400" />
//           <input
//             className="w-full outline-none text-sm"
//             placeholder="Search resources..."
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//           />
//         </div>

//         <select
//           className="border rounded-xl px-3 py-2 text-sm"
//           value={typeFilter}
//           onChange={e => setTypeFilter(e.target.value)}
//         >
//           <option value="">All Types</option>
//           {TYPES.map(t => (
//             <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
//           ))}
//         </select>

//         <input
//           className="border rounded-xl px-3 py-2 text-sm"
//           placeholder="Location"
//           value={locationFilter}
//           onChange={e => setLocationFilter(e.target.value)}
//         />

//         <input
//           className="border rounded-xl px-3 py-2 text-sm"
//           type="number"
//           min={1}
//           placeholder="Min capacity"
//           value={capacityMin}
//           onChange={e => setCapacityMin(e.target.value)}
//         />

//         <select
//           className="border rounded-xl px-3 py-2 text-sm"
//           value={statusFilter}
//           onChange={e => setStatusFilter(e.target.value)}
//         >
//           <option value="">All Statuses</option>
//           {STATUSES.map(s => (
//             <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
//           ))}
//         </select>
//       </div>

//       {/* Content */}
//       {loading ? (
//         <div className="flex justify-center items-center py-20">
//           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
//         </div>
//       ) : filtered.length === 0 ? (
//         <div className="text-center py-20 text-gray-500">
//           <p className="text-lg font-medium">No resources found</p>
//           <p className="text-sm">Try adjusting your filters</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           <ResourceCard
//             resources={filtered}
//             onEdit={r => { setEditing(r); setShowModal(true) }}
//             onDelete={handleDelete}
//             canManage={canManage}
//           />
//         </div>
//       )}

//       {/* Modal */}
//       {showModal && (
//         <div
//           className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
//           onClick={e => e.target === e.currentTarget && setShowModal(false)}
//         >
//           <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 animate-fadeIn">
//             <h2 className="text-xl font-semibold mb-4">
//               {editing ? 'Edit Resource' : 'Add Resource'}
//             </h2>

//             <ResourceForm
//               initial={editing}
//               onSubmit={handleSubmit}
//               onCancel={() => { setShowModal(false); setEditing(null) }}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
