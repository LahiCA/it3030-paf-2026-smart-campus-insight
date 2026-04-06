import React, { useState, useEffect } from 'react'
import ResourceCard from ' ../component/ResourceCard'
import ResourceForm from './ResourceForm'
import axios from 'axios'

const ResourceListPage = () => {

  const [resources, setResources]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)   // null = create, object = edit
  const [activeTab, setActiveTab]   = useState('all')

  const [filters, setFilters] = useState({
    search:      '',
    type:        '',
    status:      '',
    minCapacity: '',
  })

  // ── Fetch from API ─────────────────────────────────────────
  const fetchResources = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (filters.type)        params.type        = filters.type
      if (filters.status)      params.status      = filters.status
      if (filters.minCapacity) params.minCapacity = filters.minCapacity

      const res = await axios.get('/api/resources', { params })
      setResources(res.data)
    } catch (err) {
      setError('Failed to load resources. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [filters.type, filters.status, filters.minCapacity])

  // ── Client-side search filter ──────────────────────────────
  const filtered = resources.filter((r) => {
    const q = filters.search.toLowerCase()
    const matchesSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q)

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'rooms'     && r.type !== 'EQUIPMENT') ||
      (activeTab === 'equipment' && r.type === 'EQUIPMENT')

    return matchesSearch && matchesTab
  })

  // ── Stats ──────────────────────────────────────────────────
  const stats = {
    total:  resources.length,
    active: resources.filter((r) => r.status === 'ACTIVE').length,
    oos:    resources.filter((r) => r.status === 'OUT_OF_SERVICE').length,
    types:  new Set(resources.map((r) => r.type)).size,
  }

  // ── Handlers ───────────────────────────────────────────────
  const openModal = (resource = null) => {
    setEditTarget(resource)
    setModalOpen(true)
  }

  const closeModal = () => {
    setEditTarget(null)
    setModalOpen(false)
  }

  const handleSave = async (formData) => {
    try {
      if (editTarget) {
        // PUT — update existing
        await axios.put(`/api/resources/${editTarget.id}`, formData)
      } else {
        // POST — create new
        await axios.post('/api/resources', formData)
      }
      closeModal()
      fetchResources()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save resource.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource? This cannot be undone.')) return
    try {
      await axios.delete(`/api/resources/${id}`)
      fetchResources()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete resource.')
    }
  }

  const handleToggleStatus = async (id) => {
    const resource = resources.find((r) => r.id === id)
    const newStatus = resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE'
    try {
      await axios.patch(`/api/resources/${id}/status`, null, {
        params: { status: newStatus },
      })
      fetchResources()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.')
    }
  }

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const clearFilters = () => {
    setFilters({ search: '', type: '', status: '', minCapacity: '' })
    setActiveTab('all')
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="p-6 bg-stone-50 min-h-screen">

      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-charcoal-950">
            Facilities &amp; Assets
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Manage all bookable resources on campus
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary"
        >
          + Add resource
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total resources',  value: stats.total,  bg: 'bg-amber-pale'   },
          { label: 'Active',           value: stats.active, bg: 'bg-green-50'     },
          { label: 'Out of service',   value: stats.oos,    bg: 'bg-red-50'       },
          { label: 'Resource types',   value: stats.types,  bg: 'bg-amber-warm'   },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-stone-400">{s.label}</span>
              <div className={`w-7 h-7 rounded-lg ${s.bg}`} />
            </div>
            <p className="text-2xl font-medium text-charcoal-950">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar mb-5">
        {[
          { key: 'all',       label: 'All resources' },
          { key: 'rooms',     label: 'Rooms'         },
          { key: 'equipment', label: 'Equipment'     },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={activeTab === t.key ? 'tab-active' : 'tab'}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="filter-bar mb-6">
        <div className="flex flex-col gap-1">
          <label className="form-label">Search</label>
          <input
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Name or location…"
            className="form-input w-44"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="form-label">Type</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="form-input w-36"
          >
            <option value="">All types</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Lab</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="form-label">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="form-input w-32"
          >
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of service</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="form-label">Min capacity</label>
          <input
            name="minCapacity"
            value={filters.minCapacity}
            onChange={handleFilterChange}
            type="number"
            placeholder="e.g. 30"
            className="form-input w-28"
          />
        </div>
        <button
          onClick={clearFilters}
          className="btn-ghost text-xs px-3 py-1.5 self-end"
        >
          Clear
        </button>
      </div>

      {/* Resource cards */}
      {loading && (
        <div className="text-center py-16 text-stone-400 text-sm">
          Loading resources…
        </div>
      )}

      {error && (
        <div className="text-center py-16 text-red-500 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-stone-400 text-sm">
          <p className="text-3xl mb-3">🔍</p>
          No resources match your filters.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ResourceCard
          resources={filtered}
          onEdit={(resource) => openModal(resource)}
          onDelete={(id) => handleDelete(id)}
          onToggleStatus={(id) => handleToggleStatus(id)}
        />
      )}

      {/* Create / Edit modal */}
      {modalOpen && (
        <ResourceFormModal
          resource={editTarget}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

    </div>
  )
}

export default ResourceListPage