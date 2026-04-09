import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Search } from 'lucide-react'
import resourceService from '../services/resourceService'
import ResourceCard from '../component/ResourceList'

const TYPES = ['LECTURE_HALL','LAB','MEETING_ROOM','EQUIPMENT','SPORTS','STUDY_ROOM','AUDITORIUM','OTHER']
const STATUSES = ['AVAILABLE','OUT_OF_SERVICE','OCCUPIED','MAINTENANCE','RETIRED']

export default function UserResourcesPage() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [ filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [capacityMin, setCapacityMin] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const load = () => {
    setLoading(true)
    resourceService.getAll({
      status: statusFilter,
      type: typeFilter,
      location: locationFilter,
      capacityMin: capacityMin,
      search: search
    })
      .then(r => {
        const d = Array.isArray(r.data) ? r.data : []
        setResources(d)
        //setFiltered(d)
      })
      .catch(() => toast.error('Failed to load resources'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [search, typeFilter, locationFilter, capacityMin, statusFilter])

  useEffect(() => {
    let list = resources
    if (search) {
      const lower = search.toLowerCase()
      list = list.filter(r =>
        r.name.toLowerCase().includes(lower) ||
        r.location.toLowerCase().includes(lower) ||
        (r.description || '').toLowerCase().includes(lower)
      )
    }
    if (typeFilter) list = list.filter(r => r.type === typeFilter)
    if (locationFilter) list = list.filter(r => r.location.toLowerCase().includes(locationFilter.toLowerCase()))
    if (capacityMin) list = list.filter(r => Number(r.capacity) >= Number(capacityMin))
    if (statusFilter) list = list.filter(r => r.status === statusFilter)
    setFiltered(list)
  }, [search, typeFilter, locationFilter, capacityMin, statusFilter, resources])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Campus Resources</h1>
          <p className="text-gray-500 text-sm">Browse available campus facilities and assets</p>
        </div>
        <div className="text-sm text-gray-500">
          {resources.length} resource{resources.length !== 1 ? 's' : ''}
        </div>
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
          {TYPES.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
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
          {STATUSES.map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
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
        // <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        //   <ResourceCard resources={filtered} canManage={false} />
        // </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(r => (
            <ResourceCard
              key={r.id}
              resource={r}
              canManage={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
