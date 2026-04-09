import React, { useState } from 'react'

const TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT', 'SPORTS', 'STUDY_ROOM', 'AUDITORIUM', 'OTHER']
const STATUSES = ['AVAILABLE', 'OUT_OF_SERVICE', 'OCCUPIED', 'MAINTENANCE', 'RETIRED']

export default function ResourceForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    type: 'LECTURE_HALL',
    location: '',
    capacity: 10,
    status: 'AVAILABLE',
    description: '',
    availableFrom: '',
    availableTo: '',
    image: null,
    ...initial,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, capacity: Number(form.capacity) })
  }

  return (
    <div className="flex justify-center p-6 bg-gray-50 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8"
      >

        {/* Header */}
        <div className="mb-6 border-b pb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {initial ? 'Update Resource' : 'Add Resource'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Fill in the details below to manage campus resources
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">Resource Name *</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-sm font-medium text-gray-700">Type *</label>
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={form.type}
              onChange={e => set('type', e.target.value)}
            >
              {TYPES.map(t => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-gray-700">Location *</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
              value={form.location}
              onChange={e => set('location', e.target.value)}
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="text-sm font-medium text-gray-700">Capacity *</label>
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={form.capacity}
              onChange={e => set('capacity', e.target.value)}
            />
          </div>

          {/* From */}
          <div>
            <label className="text-sm font-medium text-gray-700">Available From</label>
            <input
              type="time"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={form.availableFrom || ''}
              onChange={e => set('availableFrom', e.target.value)}
            />
          </div>

          {/* To */}
          <div>
            <label className="text-sm font-medium text-gray-700">Available To</label>
            <input
              type="time"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={form.availableTo || ''}
              onChange={e => set('availableTo', e.target.value)}
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={form.status}
              onChange={e => set('status', e.target.value)}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Image */}
          <div>
            <label className="text-sm font-medium text-gray-700">Image</label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 w-full text-sm border border-gray-300 rounded-lg p-2 bg-gray-50"
              onChange={e => set('image', e.target.files[0])}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-5">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows="4"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow"
          >
            {initial ? 'Update Resource' : 'Create Resource'}
          </button>
        </div>

      </form>
    </div>
  )
}

// import React, { useState } from 'react'

// const TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT', 'SPORTS', 'STUDY_ROOM', 'AUDITORIUM', 'OTHER']
// const STATUSES = ['AVAILABLE', 'OUT_OF_SERVICE', 'OCCUPIED', 'MAINTENANCE', 'RETIRED']

// export default function ResourceForm({ initial, onSubmit, onCancel }) {
//   const [form, setForm] = useState({
//     name: '',
//     type: 'LECTURE_HALL',
//     location: '',
//     capacity: 10,
//     status: 'AVAILABLE', // ✅ FIXED
//     description: '',
//     availableFrom: '',
//     availableTo: '',
//     image: null,
//     ...initial,
//   })

//   const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

//   const handleSubmit = (e) => {
//     e.preventDefault()

//     const payload = {
//       ...form,
//       capacity: Number(form.capacity),
//     }

//     onSubmit(payload)
//   }

//   return (
//     <form onSubmit={handleSubmit}>
//       <div className="form-grid">

//         <div className="form-group">
//           <label>Resource Name *</label>
//           <input className="form-control" required value={form.name}
//             onChange={e => set('name', e.target.value)} />
//         </div>

//         <div className="form-group">
//           <label>Type *</label>
//           <select className="form-control"
//             value={form.type}
//             onChange={e => set('type', e.target.value)}
//           >
//             {TYPES.map(t => (
//               <option key={t} value={t}>{t.replace(/_/g, ' ')}</option> // ✅ FIXED
//             ))}
//           </select>
//         </div>

//         <div className="form-group">
//           <label>Location *</label>
//           <input className="form-control" required value={form.location}
//             onChange={e => set('location', e.target.value)} />
//         </div>

//         <div className="form-group">
//           <label>Capacity *</label>
//           <input className="form-control" type="number" min={1}
//             value={form.capacity}
//             onChange={e => set('capacity', e.target.value)} />
//         </div>

//         <div className="form-group">
//           <label>Available From</label>
//           <input type="time" className="form-control"
//             value={form.availableFrom || ''}
//             onChange={e => set('availableFrom', e.target.value)} />
//         </div>

//         <div className="form-group">
//           <label>Available To</label>
//           <input type="time" className="form-control"
//             value={form.availableTo || ''}
//             onChange={e => set('availableTo', e.target.value)} />
//         </div>

//         <div className="form-group">
//           <label>Status</label>
//           <select className="form-control"
//             value={form.status}
//             onChange={e => set('status', e.target.value)}
//           >
//             {STATUSES.map(s => (
//               <option key={s} value={s}>{s.replace(/_/g, ' ')}</option> // ✅ FIXED
//             ))}
//           </select>
//         </div>

//         {/* ✅ IMAGE UPLOAD */}
//         <div className="form-group">
//           <label>Image</label>
//           <input
//             type="file"
//             accept="image/*"
//             className="form-control"
//             onChange={e => set('image', e.target.files[0])}
//           />
//         </div>

//       </div>

//       <div className="form-group">
//         <label>Description</label>
//         <textarea className="form-control"
//           value={form.description}
//           onChange={e => set('description', e.target.value)} />
//       </div>

//       <div className="form-actions">
//         <button type="button" onClick={onCancel}>Cancel</button>
//         <button type="submit">
//           {initial ? 'Update Resource' : 'Create Resource'}
//         </button>
//       </div>
//     </form>
//   )
// }

// import React, { useState } from 'react'

// const TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT', 'SPORTS', 'STUDY_ROOM', 'AUDITORIUM', 'OTHER']
// const STATUSES = ['AVAILABLE', 'OUT_OF_SERVICE', 'OCCUPIED', 'MAINTENANCE', 'RETIRED']

// export default function ResourceForm({ initial, onSubmit, onCancel }) {
//   const [form, setForm] = useState({
//     name: '', type: 'LECTURE_HALL', location: '',
//     capacity: 10, status: 'ACTIVE', description: '',
//     ...initial,
//   })

//   const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     onSubmit({ ...form, capacity: Number(form.capacity) })
//   }

//   return (
//     <form onSubmit={handleSubmit}>
//       <div className="form-grid">
//         <div className="form-group">
//           <label>Resource Name *</label>
//           <input className="form-control" required value={form.name}
//             onChange={e => set('name', e.target.value)} placeholder="e.g. Lecture Hall A" />
//         </div>
//         <div className="form-group">
//           <label>Type *</label>
//           <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)}>
//             {TYPES.map(t => <option key={t}>{t.replace('_', ' ')}</option>)}
//           </select>
//         </div>
//         <div className="form-group">
//           <label>Location *</label>
//           <input className="form-control" required value={form.location}
//             onChange={e => set('location', e.target.value)} placeholder="e.g. Block A, Ground Floor" />
//         </div>
//         <div className="form-group">
//           <label>Capacity *</label>
//           <input className="form-control" type="number" required min={1} value={form.capacity}
//             onChange={e => set('capacity', e.target.value)} />
//         </div>
//         <div className="form-group">
//           <label>Available from</label>
//           <input className="form-control" type="time" value={form.availableFrom || ''}
//             onChange={e => set('availableFrom', e.target.value)} />
//         </div>
//         <div className="form-group">
//           <label>Available to</label>
//           <input className="form-control" type="time" value={form.availableTo || ''}
//             onChange={e => set('availableTo', e.target.value)} />
//         </div>
//         <div className="form-group">
//           <label>Status</label>
//           <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
//             {STATUSES.map(s => <option key={s}>{s.replace(/_/g, ' ')}</option>)}
//           </select>
//         </div>
//       </div>
//       <div className="form-group">
//         <label>Description</label>
//         <textarea className="form-control" rows={3} value={form.description}
//           onChange={e => set('description', e.target.value)} placeholder="Optional description..." />
//       </div>
//       <div className="form-actions">
//         <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
//         <button type="submit" className="btn btn-primary">
//           {initial ? 'Update Resource' : 'Create Resource'}
//         </button>
//       </div>
//     </form>
//   )
// }

// // import React, { useState, useEffect } from 'react'

// // const TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'SPORTS', 'STUDY_ROOM', 'AUDITORIUM', 'OTHER']
// // const STATUSES = ['ACTIVE', 'OUT_OF_SERVICE', 'OCCUPIED', 'MAINTENANCE', 'RETIRED']

// // export default function ResourceForm({ initial, onSubmit, onCancel }) {
// //   const [form, setForm] = useState({
// //     name: '', type: 'LECTURE_HALL', location: '',
// //     capacity: 10, status: 'AVAILABLE', description: '',
// //     ...initial,
// //   })

// //   const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

// //   const handleSubmit = (e) => {
// //     e.preventDefault()
// //     onSubmit({ ...form, capacity: Number(form.capacity) })
// //   }

// //   return (
// //     <form onSubmit={handleSubmit}>
// //       <div className="form-grid">
// //         <div className="form-group">
// //           <label>Resource Name *</label>
// //           <input className="form-control" required value={form.name}
// //             onChange={e => set('name', e.target.value)} placeholder="e.g. Lecture Hall A" />
// //         </div>
// //         <div className="form-group">
// //           <label>Type *</label>
// //           <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)}>
// //             {TYPES.map(t => <option key={t}>{t.replace('_', ' ')}</option>)}
// //           </select>
// //         </div>
// //         <div className="form-group">
// //           <label>Location *</label>
// //           <input className="form-control" required value={form.location}
// //             onChange={e => set('location', e.target.value)} placeholder="e.g. Block A, Ground Floor" />
// //         </div>
// //         <div className="form-group">
// //           <label>Capacity *</label>
// //           <input className="form-control" type="number" required min={1} value={form.capacity}
// //             onChange={e => set('capacity', e.target.value)} />
// //         </div>
// //         <div className="form-group">
// //           <label>Status</label>
// //           <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
// //             {STATUSES.map(s => <option key={s}>{s}</option>)}
// //           </select>
// //         </div>
// //       </div>
// //       <div className="form-group">
// //         <label>Description</label>
// //         <textarea className="form-control" rows={3} value={form.description}
// //           onChange={e => set('description', e.target.value)} placeholder="Optional description..." />
// //       </div>
// //       <div className="form-actions">
// //         <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
// //         <button type="submit" className="btn btn-primary">
// //           {initial ? 'Update Resource' : 'Create Resource'}
// //         </button>
// //       </div>
// //     </form>
// //   )
// // }