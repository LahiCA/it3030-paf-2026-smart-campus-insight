import axios from "axios";
import { getUser } from "../services/storage";

// Create Axios instance with base URL
const api = axios.create({
    baseURL: "/api/tickets",
});

// Helper functions to get stored user details
const getStoredUser = () => getUser() || {};
const getRole = () => getStoredUser().role || "USER";
const getUserId = () => getStoredUser().id || "user-001";
const getDisplayId = () => getStoredUser().displayId || "";

// Add headers (role, userId, displayId) to every request
api.interceptors.request.use((config) => {
    config.headers.role = getRole();
    config.headers.userId = getUserId();
    config.headers.displayId = getDisplayId();
    return config;
});

// Handle API errors in a consistent way
const unwrapError = (error) => {
    throw error?.response?.data || { message: "Request failed" };
};

// Get current user details
export const getCurrentUser = () => ({
    userId: getUserId(),
    role: getRole(),
    displayId: getDisplayId(),
    user: getStoredUser(),
});

// Get tickets based on user role
export const getTickets = async () => {
    try {
        const { role, userId, displayId } = getCurrentUser();

        // Select endpoint based on role
        const endpoint = role === "ADMIN"
            ? ""
            : role === "TECHNICIAN"
                ? `/assigned/${displayId}`
                : `/user/${userId}`;

        const response = await api.get(endpoint);
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

// Create a new ticket
export const createTicket = async (payload) => {
    try {
        const response = await api.post("", payload);
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

// Get a single ticket by ID
export const getTicket = async (id) => {
    try {
        const response = await api.get(`/${id}`);
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

// Update ticket details
export const updateTicket = async (id, payload) => {
    try {
        const response = await api.put(`/${id}`, payload);
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

// Update ticket status
export const updateStatus = async (id, payload) => {
    try {
        const response = await api.put(`/${id}/status`, payload);
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

// Assign technician to a ticket
export const assignTechnician = async (id, assignedTo) => {
    try {
        const response = await api.put(`/${id}/assign`, { assignedTo });
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

// Rate a completed ticket
export const rateTicket = async (id, data) => {
    try {
        const response = await api.put(`/${id}/rate`, data);
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

// Upload images related to a ticket
export const uploadImages = async (id, files) => {
    try {
        const formData = new FormData();

        // Append all files to form data
        files.forEach((file) => formData.append("files", file));

        const response = await api.post(`/${id}/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

// Get all comments for a ticket
export const getComments = async (id) => {
    try {
        const response = await api.get(`/${id}/comments`);
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

// Add a comment to a ticket
export const addComment = async (id, payload) => {
    try {
        const response = await api.post(`/${id}/comments`, payload);
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

// Update a comment
export const editComment = async (commentId, payload) => {
    try {
        const response = await api.put(`/comments/${commentId}`, payload);
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

// Delete a comment
export const deleteComment = async (commentId) => {
    try {
        await api.delete(`/comments/${commentId}`);
    } catch (error) {
        unwrapError(error);
    }
};

// Delete a ticket
export const deleteTicket = async (id) => {
    try {
        await api.delete(`/${id}`);
    } catch (error) {
        unwrapError(error);
    }
};

// Get URL for viewing/downloading an attachment
export const getAttachmentUrl = (imageId) => `/api/tickets/attachments/${imageId}`;