import React, { useState, useEffect } from 'react'

const RESOURCE_TYPES = [
  { value: 'LECTURE_HALL',  label: 'Lecture Hall' },
  { value: 'LAB',           label: 'Lab'          },
  { value: 'MEETING_ROOM',  label: 'Meeting Room' },
  { value: 'EQUIPMENT',     label: 'Equipment'    },
]

const EMPTY_FORM = {
  name:          '',
  type:          'LECTURE_HALL',
  location:      '',
  description:   '',
  capacity:      '',
  availableFrom: '08:00',
  availableTo:   '18:00',
  status:        'ACTIVE',
  resourceImageUrl: '',
}

const ResourceFormModal = ({ resource, onSave, onClose }) => {

  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const isEditing = !!resource

  // Pre-fill form when editing
  useEffect(() => {
    if (resource) {
      setForm({
        name:             resource.name             || '',
        type:             resource.type             || 'LECTURE_HALL',
        location:         resource.location         || '',
        description:      resource.description      || '',
        capacity:         resource.capacity         || '',
        availableFrom:    resource.availableFrom    || '08:00',
        availableTo:      resource.availableTo      || '18:00',
        status:           resource.status           || 'ACTIVE',
        resourceImageUrl: resource.resourceImageUrl || '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [resource])

  // ── Handlers ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())     e.name     = 'Name is required'
    if (!form.location.trim()) e.location = 'Location is required'
    if (!form.type)            e.type     = 'Type is required'
    if (form.capacity && isNaN(Number(form.capacity))) {
      e.capacity = 'Capacity must be a number'
    }
    if (form.availableFrom && form.availableTo && form.availableFrom >= form.availableTo) {
      e.availableTo = 'Available to must be after available from'
    }
    return e
  }

  const handleSubmit = async () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setSaving(true)
    try {
      await onSave({
        ...form,
        capacity: form.capacity ? Number(form.capacity) : null,
      })
    } finally {
      setSaving(false)
    }
  }

  // Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 bg-charcoal-950/65 flex items-center justify-center z-50 px-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-[520px] border border-stone-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-stone-100">
          <h2 className="text-base font-medium text-charcoal-950">
            {isEditing ? 'Edit resource' : 'Add resource'}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-charcoal-950 hover:bg-stone-100 w-7 h-7 rounded-md flex items-center justify-center transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid grid-cols-2 gap-4">

          {/* Name */}
          <div className="flex flex-col gap-1 col-span-2">
            <label className="form-label">Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Lab A2"
              className={`form-input ${errors.name ? 'border-red-400 outline-red-400' : ''}`}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1">
            <label className="form-label">Type *</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className={`form-input ${errors.type ? 'border-red-400' : ''}`}
            >
              {RESOURCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
            <label className="form-label">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="form-input"
            >
              <option value="ACTIVE">Active</option>
              <option value="OUT_OF_SERVICE">Out of service</option>
            </select>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1 col-span-2">
            <label className="form-label">Location *</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Block B, Floor 2"
              className={`form-input ${errors.location ? 'border-red-400' : ''}`}
            />
            {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
          </div>

          {/* Capacity */}
          <div className="flex flex-col gap-1">
            <label className="form-label">Capacity</label>
            <input
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              type="number"
              placeholder="e.g. 40"
              className={`form-input ${errors.capacity ? 'border-red-400' : ''}`}
            />
            {errors.capacity && <p className="text-xs text-red-500">{errors.capacity}</p>}
          </div>

          {/* Image URL */}
          <div className="flex flex-col gap-1">
            <label className="form-label">Image URL</label>
            <input
              name="resourceImageUrl"
              value={form.resourceImageUrl}
              onChange={handleChange}
              placeholder="https://…"
              className="form-input"
            />
          </div>

          {/* Available from */}
          <div className="flex flex-col gap-1">
            <label className="form-label">Available from</label>
            <input
              name="availableFrom"
              value={form.availableFrom}
              onChange={handleChange}
              type="time"
              className="form-input"
            />
          </div>

          {/* Available to */}
          <div className="flex flex-col gap-1">
            <label className="form-label">Available to</label>
            <input
              name="availableTo"
              value={form.availableTo}
              onChange={handleChange}
              type="time"
              className={`form-input ${errors.availableTo ? 'border-red-400' : ''}`}
            />
            {errors.availableTo && <p className="text-xs text-red-500">{errors.availableTo}</p>}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1 col-span-2">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional details about this resource…"
              rows={3}
              className="form-input resize-none"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-5 pt-2 border-t border-stone-100">
          <button
            onClick={onClose}
            className="btn-ghost"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary flex items-center gap-2"
            disabled={saving}
          >
            {saving && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-2a8 8 0 01-8-8z"/>
              </svg>
            )}
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add resource'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default ResourceFormModal