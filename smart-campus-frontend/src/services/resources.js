import axiosInstance from '../utils/axios-instance';

// Get all resources
export const getAllResources = async () => {
  const response = await axiosInstance.get('/resources');
  return response.data;
};

// Get a single resource by ID
export const getResourceById = async (id) => {
  const response = await axiosInstance.get(`/resources/${id}`);
  return response.data;
};

// Get resources filtered by type (e.g., ROOM, LAB)
export const getResourcesByType = async (type) => {
  const response = await axiosInstance.get(`/resources/type/${type}`);
  return response.data;
};

// Search resources using a query string
export const searchResources = async (query) => {
  const response = await axiosInstance.get(
    `/resources/search?q=${encodeURIComponent(query)}`
  );
  return response.data;
};

// Create a new resource with file upload (multipart form data)
export const createResource = async (formData) => {
  const response = await axiosInstance.post('/resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Update an existing resource with optional file upload
export const updateResource = async (id, formData) => {
  const response = await axiosInstance.put(`/resources/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Delete a resource by ID
export const deleteResource = async (id) => {
  const response = await axiosInstance.delete(`/resources/${id}`);
  return response.data;
};