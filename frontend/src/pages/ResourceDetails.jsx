import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getResourceById } from "../api/resourceApi"

const ResourceDetails = () => {
  const { id } = useParams()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const data = await getResourceById(id)
        setResource(data)
      } catch (err) {
        alert("Failed to load resource")
      } finally {
        setLoading(false)
      }
    }

    fetchResource()
  }, [id])

  if (loading) return <p className="p-6">Loading...</p>
  if (!resource) return <p className="p-6">Resource not found</p>

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back
      </button>

      {/* Images */}
      {resource.resourceImageUrls && resource.resourceImageUrls.length > 0 && (
        <div className="mb-6">
          {resource.resourceImageUrls.length === 1 ? (
            <img
              src={resource.resourceImageUrls[0]}
              alt={resource.name}
              className="w-full h-64 object-cover rounded-xl"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {resource.resourceImageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`${resource.name} - Image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Name */}
      <h1 className="text-2xl font-semibold mb-2">
        {resource.name}
      </h1>

      {/* Location */}
      <p className="text-gray-500 mb-2">📍 {resource.location}</p>

      {/* Type */}
      <p className="mb-2">
        <span className="font-medium">Type:</span> {resource.type}
      </p>

      {/* Capacity */}
      <p className="mb-2">
        <span className="font-medium">Capacity:</span> {resource.capacity || "N/A"}
      </p>

      {/* Availability */}
      <p className="mb-2">
        <span className="font-medium">Available:</span>{" "}
        {resource.availableFrom} - {resource.availableTo}
      </p>

      {/* Status */}
      <span
        className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
          resource.status === "ACTIVE"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {resource.status === "ACTIVE" ? "Active" : "Out of Service"}
      </span>

      {/* Description */}
      {resource.description && (
        <p className="mt-4 text-gray-600 leading-relaxed">
          {resource.description}
        </p>
      )}

    </div>
  )
}

export default ResourceDetails