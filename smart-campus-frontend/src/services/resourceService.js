import { getAllResources, getResourceById, createResource, updateResource, deleteResource, getResourcesByType, searchResources } from '../services/resources';

const resourceService = {
  getAll: getAllResources,
  getById: getResourceById,
  create: createResource,
  update: updateResource,
  delete: deleteResource,
  getByType: getResourcesByType,
  search: searchResources,
};

export default resourceService;