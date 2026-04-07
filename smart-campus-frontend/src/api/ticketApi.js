import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/tickets';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include role and userId headers if available
api.interceptors.request.use((config) => {
    // For demo purposes, set default role and userId
    // In a real app, these would come from authentication context
    config.headers.role = config.headers.role || 'USER';
    config.headers.userId = config.headers.userId || 'user123';
    return config;
});

// Tickets API
export const ticketApi = {
    // Get all tickets
    getAllTickets: () => api.get('/'),

    // Get ticket by ID
    getTicketById: (id) => api.get(`/${id}`),

    // Create new ticket
    createTicket: (ticket) => api.post('/', ticket),

    // Update ticket status
    updateStatus: (id, status) => api.put(`/${id}/status`, null, { params: { status } }),

    // Assign technician (admin only)
    assignTechnician: (id, techId) => api.put(`/${id}/assign`, null, {
        params: { techId },
        headers: { role: 'ADMIN' }
    }),

    // Delete ticket (admin only)
    deleteTicket: (id) => api.delete(`/${id}`, { headers: { role: 'ADMIN' } }),

    // Comments API
    getComments: (ticketId) => api.get(`/${ticketId}/comments`),

    addComment: (ticketId, comment) => api.post(`/${ticketId}/comments`, comment),

    updateComment: (commentId, message) => api.put(`/comments/${commentId}`, null, {
        params: { message },
        headers: { userId: 'user123' } // Should come from auth
    }),

    deleteComment: (commentId) => api.delete(`/comments/${commentId}`, {
        headers: { userId: 'user123' } // Should come from auth
    }),

    // Images API
    getImages: (ticketId) => api.get(`/${ticketId}/images`),

    uploadImages: (ticketId, files) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        return api.post(`/${ticketId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    deleteImage: (imageId) => api.delete(`/images/${imageId}`, { headers: { role: 'ADMIN' } }),
};

export default ticketApi;