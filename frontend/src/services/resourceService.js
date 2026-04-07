import api from './api'

const toFormData = (data) => {
  const formData = new FormData()
  Object.entries(data || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    formData.append(key, value)
  })
  return formData
}

const resourceService = {
  getAll: (params) => api.get('/resources', { params }),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', toFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.put(`/resources/${id}`, toFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateStatus: (id, status) => api.patch(`/resources/${id}/status`, null, { params: { status } }),
  uploadImage: (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/resources/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  delete: (id) => api.delete(`/resources/${id}`),
}

export default resourceService