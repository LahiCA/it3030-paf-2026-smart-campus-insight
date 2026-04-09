import axios from "axios";
import { getUser } from "../services/storage";

const api = axios.create({
    baseURL: "/api/tickets",
});

const getStoredUser = () => getUser() || {};
const getRole = () => getStoredUser().role || "USER";
const getUserId = () => getStoredUser().id || "user-001";
const getDisplayId = () => getStoredUser().displayId || "";

api.interceptors.request.use((config) => {
    config.headers.role = getRole();
    config.headers.userId = getUserId();
    config.headers.displayId = getDisplayId();
    return config;
});

const unwrapError = (error) => {
    throw error?.response?.data || { message: "Request failed" };
};

export const getCurrentUser = () => ({
    userId: getUserId(),
    role: getRole(),
    displayId: getDisplayId(),
    user: getStoredUser(),
});

export const getTickets = async () => {
    try {
        const { role, userId, displayId } = getCurrentUser();
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

export const createTicket = async (payload) => {
    try {
        const response = await api.post("", payload);
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

export const getTicket = async (id) => {
    try {
        const response = await api.get(`/${id}`);
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

export const updateTicket = async (id, payload) => {
    try {
        const response = await api.put(`/${id}`, payload);
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

export const updateStatus = async (id, payload) => {
    try {
        const response = await api.put(`/${id}/status`, payload);
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

export const assignTechnician = async (id, assignedTo) => {
    try {
        const response = await api.put(`/${id}/assign`, { assignedTo });
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

export const uploadImages = async (id, files) => {
    try {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        const response = await api.post(`/${id}/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

export const getComments = async (id) => {
    try {
        const response = await api.get(`/${id}/comments`);
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

export const addComment = async (id, payload) => {
    try {
        const response = await api.post(`/${id}/comments`, payload);
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

export const editComment = async (commentId, payload) => {
    try {
        const response = await api.put(`/comments/${commentId}`, payload);
        return response.data;
    } catch (error) {
        unwrapError(error);
    }
};

export const deleteComment = async (commentId) => {
    try {
        await api.delete(`/comments/${commentId}`);
    } catch (error) {
        unwrapError(error);
    }
};

export const deleteTicket = async (id) => {
    try {
        await api.delete(`/${id}`);
    } catch (error) {
        unwrapError(error);
    }
};

export const getAttachmentUrl = (imageId) => `/api/tickets/attachments/${imageId}`;
