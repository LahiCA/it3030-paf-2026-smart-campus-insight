import axiosInstance from '../utils/axios-instance';

export const getAllResources = async () => {
  const response = await axiosInstance.get('/resources');
  return response.data;
};

export const getResourceById = async (id) => {
  const response = await axiosInstance.get(`/resources/${id}`);
  return response.data;
};

export const getResourcesByType = async (type) => {
  const response = await axiosInstance.get(`/resources/type/${type}`);
  return response.data;
};

export const searchResources = async (query) => {
  const response = await axiosInstance.get(`/resources/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const createResource = async (data) => {
  const response = await axiosInstance.post('/resources', data);
  return response.data;
};

export const updateResource = async (id, data) => {
  const response = await axiosInstance.put(`/resources/${id}`, data);
  return response.data;
};

export const deleteResource = async (id) => {
  const response = await axiosInstance.delete(`/resources/${id}`);
  return response.data;
};
