import React, { useEffect, useState } from "react"
import ResourceCard from "../component/ResourceCard"
import ResourceFormModal from "../component/ResourceFormModal"

import {
  getResources,
  createResource,
  updateResource,
  deleteResource,
  updateResourceStatus,
} from "../api/resourceApi"

const AdminDashboard = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingResource, setEditingResource] = useState(null)

  // 🔹 FETCH DATA
  const fetchResources = async () => {
    setLoading(true)
    try {
      const data = await getResources()
      setResources(data)
    } catch (err) {
      console.error(err)
      alert("Failed to load resources")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [])

  // 🔹 CREATE / UPDATE
  const handleSave = async (formData) => {
    try {
      if (editingResource) {
        await updateResource(editingResource.id, formData)
      } else {
        await createResource(formData)
      }
      setShowModal(false)
      setEditingResource(null)
      fetchResources()
    } catch (err) {
      alert(err)
    }
  }

  // 🔹 DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resource?")) return
    try {
      await deleteResource(id)
      fetchResources()
    } catch (err) {
      alert(err)
    }
  }

  // 🔹 EDIT
  const handleEdit = (resource) => {
    setEditingResource(resource)
    setShowModal(true)
  }

  // 🔹 STATUS TOGGLE
  const handleToggleStatus = async (id) => {
    const resource = resources.find(r => r.id === id)
    const newStatus =
      resource.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE"

    try {
      await updateResourceStatus(id, newStatus)
      fetchResources()
    } catch (err) {
      alert(err)
    }
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

        <button
          onClick={() => {
            setEditingResource(null)
            setShowModal(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Resource
        </button>
      </div>

      {/* Loading */}
      {loading && <p>Loading resources...</p>}

      {/* Empty state */}
      {!loading && resources.length === 0 && (
        <p className="text-gray-500">No resources found</p>
      )}

      {/* Resource List */}
      {!loading && resources.length > 0 && (
        <ResourceCard
          resources={resources}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Modal */}
      {showModal && (
        <ResourceFormModal
          resource={editingResource}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default AdminDashboard