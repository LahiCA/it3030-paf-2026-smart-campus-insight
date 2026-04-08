import axios from 'axios'

const BASE = '/api/resources'

// GET all — with optional filters
export const getResources = (params = {}) => {
  // Filter out empty values to prevent sending empty strings to backend
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
  )
  return axios.get(BASE, { params: filteredParams })
}

// GET single
export const getResourceById = (id) =>
  axios.get(`${BASE}/${id}`)

// POST — Admin only
export const createResource = (formData) =>
  axios.post(BASE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

// PUT — Admin only
export const updateResource = (id, formData) =>
  axios.put(`${BASE}/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

// PATCH status — Admin only
export const updateResourceStatus = (id, status) =>
  axios.patch(`${BASE}/${id}/status`, null, { params: { status } })

// DELETE — Admin only
export const deleteResource = (id) =>
  axios.delete(`${BASE}/${id}`)