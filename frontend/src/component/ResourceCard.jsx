import React from 'react'

const ICONS = {
  LECTURE_HALL: '🏛',
  LAB: '🔬',
  MEETING_ROOM: '🗓',
  EQUIPMENT: '🎥',
}

const ICON_BG = {
  LECTURE_HALL: 'bg-amber-pale',
  LAB: 'bg-yellow-50',
  MEETING_ROOM: 'bg-orange-50',
  EQUIPMENT: 'bg-amber-warm',
}

const ResourceCard = ({ resources = [], onEdit, onDelete, onToggleStatus }) => {

  const sampleResources = [
    { id: 1, name: 'Lecture Hall A1', type: 'LECTURE_HALL', location: 'Block A, Floor 1', capacity: 120, status: 'ACTIVE', availableFrom: '08:00', availableTo: '20:00', description: 'Main lecture hall with AV system and tiered seating.' },
    { id: 2, name: 'Lab B3 — Networks', type: 'LAB', location: 'Block B, Floor 3', capacity: 30, status: 'ACTIVE', availableFrom: '08:00', availableTo: '18:00', description: 'Networking lab with 30 workstations and Cisco equipment.' },
    { id: 3, name: 'Meeting Room C1', type: 'MEETING_ROOM', location: 'Block C, Floor 1', capacity: 12, status: 'ACTIVE', availableFrom: '09:00', availableTo: '17:00', description: 'Small meeting room with projector and whiteboard.' },
    { id: 4, name: 'Projector Unit 07', type: 'EQUIPMENT', location: 'AV Store, Block A', capacity: null, status: 'ACTIVE', availableFrom: '08:00', availableTo: '20:00', description: 'Full HD portable projector. Collection from AV store.' },
    { id: 5, name: 'Lab D1 — IoT', type: 'LAB', location: 'Block D, Floor 1', capacity: 24, status: 'OUT_OF_SERVICE', availableFrom: '08:00', availableTo: '18:00', description: 'IoT lab — currently under maintenance.' },
    { id: 6, name: 'Camera Kit 03', type: 'EQUIPMENT', location: 'Media Store, Block B', capacity: null, status: 'ACTIVE', availableFrom: '09:00', availableTo: '17:00', description: 'DSLR camera with tripod and accessories.' },
  ]

  const data = resources.length > 0 ? resources : sampleResources

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap'); *{ font-family: "Geist", sans-serif; }`}</style>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.map((resource) => (
          <div
            key={resource.id}
            className="flex items-start p-3 bg-white border border-stone-200 hover:border-amber-gold rounded-xl transition-colors w-full"
          >

            {/* Icon block */}
            <div className={`shrink-0 w-22.5 h-22.5 rounded-lg flex items-center justify-center text-4xl ${ICON_BG[resource.type] || 'bg-amber-pale'}`}>
              {ICONS[resource.type] || '▦'}
            </div>

            {/* Content */}
            <div className="ml-4 flex-1 min-w-0">

              {/* Top row — name + status */}
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-charcoal-950 leading-tight truncate">
                  {resource.name}
                </p>
                <span className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  resource.status === 'ACTIVE'
                    ? 'bg-status-active-bg text-status-active-text'
                    : 'bg-status-oos-bg text-status-oos-text'
                }`}>
                  {resource.status === 'ACTIVE' ? 'Active' : 'Out of service'}
                </span>
              </div>

              {/* Location */}
              <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
                <span>📍</span> {resource.location}
              </p>

              {/* Specs row */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-xs font-medium bg-amber-pale text-amber-900 px-2 py-0.5 rounded-full">
                  {resource.type.replace('_', ' ')}
                </span>
                {resource.capacity && (
                  <>
                    <div className="size-1 rounded-full bg-stone-300" />
                    <span className="text-xs text-stone-500">👥 {resource.capacity} seats</span>
                  </>
                )}
                <div className="size-1 rounded-full bg-stone-300" />
                <span className="text-xs text-stone-500">
                  ⏰ {resource.availableFrom}–{resource.availableTo}
                </span>
              </div>

              {/* Description */}
              {resource.description && (
                <p className="text-xs text-stone-400 mt-1.5 leading-relaxed line-clamp-2">
                  {resource.description}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-stone-100">
                <button
                  onClick={() => onEdit?.(resource)}
                  className="text-xs font-medium text-charcoal-800 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-md transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onToggleStatus?.(resource.id)}
                  className="text-xs font-medium text-charcoal-800 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-md transition-colors"
                >
                  {resource.status === 'ACTIVE' ? 'Mark OOS' : 'Mark Active'}
                </button>
                <button
                  onClick={() => onDelete?.(resource.id)}
                  className="text-xs font-medium text-status-oos-text bg-status-oos-bg hover:bg-red-200 px-3 py-1.5 rounded-md transition-colors ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </>
  )
}

export default ResourceCard