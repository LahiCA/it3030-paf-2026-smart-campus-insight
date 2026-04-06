import React, { useEffect, useState } from "react";
import axios from "axios";
import ResourceCard from "../component/ResourceCard";
import ResourceFormModal from "../component/ResourceFormModal";

const AdminDashboard = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // Fetch all resources
  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/resources");
      setResources(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Open modal for create/edit
  const openModal = (resource = null) => {
    setEditTarget(resource);
    setModalOpen(true);
  };

  const closeModal = () => {
    setEditTarget(null);
    setModalOpen(false);
  };

  // Save (create/update) resource
  const handleSave = async (formData) => {
    try {
      if (editTarget) {
        await axios.put(`/api/resources/${editTarget.id}`, formData);
      } else {
        await axios.post("/api/resources", formData);
      }
      closeModal();
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save resource");
    }
  };

  // Delete resource
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await axios.delete(`/api/resources/${id}`);
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete resource");
    }
  };

  // Toggle status
  const handleToggleStatus = async (id) => {
    const resource = resources.find((r) => r.id === id);
    const newStatus =
      resource.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";
    try {
      await axios.patch(`/api/resources/${id}/status?status=${newStatus}`);
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Resource
        </button>
      </div>

      {loading && <p>Loading resources...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && resources.length === 0 && (
        <p>No resources available</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((res) => (
          <ResourceCard
            key={res.id}
            resource={res}
            onEdit={() => openModal(res)}
            onDelete={() => handleDelete(res.id)}
            onToggleStatus={() => handleToggleStatus(res.id)}
          />
        ))}
      </div>

      {modalOpen && (
        <ResourceFormModal
          resource={editTarget}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default AdminDashboard;