import React from 'react'
import { Building2, MapPin, Users, Pencil, Trash2 } from 'lucide-react'

const statusBadge = {
  AVAILABLE:   'badge-green',
  OCCUPIED:    'badge-yellow',
  MAINTENANCE: 'badge-orange',
  RETIRED:     'badge-gray',
}

export default function ResourceList({ resources, onEdit, onDelete, canManage }) {
  if (!resources.length) {
    return (
      <div className="empty-state">
        <Building2 size={44} />
        <h3>No resources found</h3>
        <p>Add your first campus resource to get started.</p>
      </div>
    )
  }

  return (
    <div className="resource-grid">
      {resources.map(r => (
        <div className="resource-card" key={r.id}>
          <div className="resource-card-img">
            <Building2 size={40} />
          </div>
          <div className="resource-card-body">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div className="resource-card-title">{r.name}</div>
              <span className={`badge ${statusBadge[r.status]||'badge-gray'}`}>{r.status}</span>
            </div>
            <div className="resource-card-meta">
              <div><MapPin size={11}/> {r.location}</div>
              <div><Users size={11}/> Capacity: {r.capacity}</div>
            </div>
            {r.description && (
              <p style={{ fontSize:12, color:'var(--text-3)', marginTop:8, lineHeight:1.5 }}>
                {r.description.length > 80 ? r.description.slice(0,80)+'…' : r.description}
              </p>
            )}
            <div className="resource-card-footer">
              <span className="type-chip">{r.type.replace('_',' ')}</span>
              {canManage && (
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn btn-sm btn-secondary btn-icon" onClick={()=>onEdit(r)}><Pencil size={12}/></button>
                  <button className="btn btn-sm btn-danger   btn-icon" onClick={()=>onDelete(r.id)}><Trash2 size={12}/></button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// import React from "react"
// import { Building2, MapPin, Users, Pencil, Trash2 } from "lucide-react"

// const STATUS_STYLES = {
//   ACTIVE: "bg-green-100 text-green-700",
//   OUT_OF_SERVICE: "bg-red-100 text-red-700",
// }

// const ResourceCard = ({
//   resources = [],
//   onEdit,
//   onDelete,
//   onToggleStatus,
//   onClick,
//   canManage = false,
// }) => {

//   if (!resources.length) {
//     return (
//       <div className="text-center py-10 text-gray-500">
//         <Building2 size={40} className="mx-auto mb-2" />
//         <p>No resources found</p>
//       </div>
//     )
//   }

//   return (
//     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {resources.map((r) => (
//         <div
//           key={r.id}
//           onClick={() => onClick?.(r)}
//           className="bg-white border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
//         >

//           {/* IMAGE (your addition 🔥) */}
//           {r.resourceImageUrl ? (
//             <img
//               src={r.resourceImageUrl}
//               alt={r.name}
//               className="w-full h-40 object-cover"
//             />
//           ) : (
//             <div className="h-40 flex items-center justify-center bg-gray-50">
//               <Building2 size={40} className="text-gray-400" />
//             </div>
//           )}

//           {/* BODY */}
//           <div className="p-4">

//             {/* Top Row */}
//             <div className="flex justify-between items-start mb-2">
//               <h3 className="font-semibold text-gray-800">
//                 {r.name}
//               </h3>

//               <span
//                 className={`text-xs px-2 py-1 rounded-full ${
//                   STATUS_STYLES[r.status] || "bg-gray-100 text-gray-600"
//                 }`}
//               >
//                 {r.status === "ACTIVE" ? "Active" : "Out of Service"}
//               </span>
//             </div>

//             {/* Meta */}
//             <div className="text-sm text-gray-500 space-y-1">
//               <div className="flex items-center gap-1">
//                 <MapPin size={12} /> {r.location}
//               </div>

//               {r.capacity && (
//                 <div className="flex items-center gap-1">
//                   <Users size={12} /> {r.capacity} seats
//                 </div>
//               )}
//             </div>

//             {/* Description */}
//             {r.description && (
//               <p className="text-xs text-gray-500 mt-2 line-clamp-2">
//                 {r.description}
//               </p>
//             )}

//             {/* Footer */}
//             <div className="flex justify-between items-center mt-3">

//               {/* Type */}
//               <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
//                 {r.type.replace("_", " ")}
//               </span>

//               {/* Admin Actions */}
//               {canManage && (
//                 <div className="flex gap-2">
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation()
//                       onEdit?.(r)
//                     }}
//                     className="p-1.5 bg-gray-100 rounded hover:bg-gray-200"
//                   >
//                     <Pencil size={14} />
//                   </button>

//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation()
//                       onToggleStatus?.(r.id)
//                     }}
//                     className="p-1.5 bg-gray-100 rounded hover:bg-gray-200"
//                   >
//                     🔄
//                   </button>

//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation()
//                       onDelete?.(r.id)
//                     }}
//                     className="p-1.5 bg-red-100 rounded hover:bg-red-200"
//                   >
//                     <Trash2 size={14} />
//                   </button>
//                 </div>
//               )}
//             </div>

//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }

// export default ResourceCard