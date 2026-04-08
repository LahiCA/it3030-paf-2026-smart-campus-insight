import axios from "axios";

const API = axios.create({
    baseURL: "/api/tickets", // relative path now works with proxy
});

// ---------- TICKETS ----------
export const getTickets = async () => (await API.get("/")).data;
export const createTicket = async (data) => (await API.post("/", data)).data;
export const getTicket = async (id) => (await API.get(`/${id}`)).data;

export const updateStatus = (id, status) =>
    API.put(`/${id}/status?status=${status}`);

export const resolveTicket = (id, note) =>
    API.put(`/${id}/resolve?note=${note}`);

export const assignTech = (id, techId) =>
    API.put(`/${id}/assign?techId=${techId}`, {}, { headers: { role: "ADMIN" } });

export const rejectTicket = (id, reason) =>
    API.put(`/${id}/reject?reason=${reason}`, {}, { headers: { role: "ADMIN" } });

// ---------- COMMENTS ----------
export const getComments = async (id) =>
    (await API.get(`/${id}/comments`)).data;

export const addComment = (id, data) =>
    API.post(`/${id}/comments`, data);

export const editComment = (id, userId, message) =>
    API.put(`/comments/${id}?message=${message}`, {}, { headers: { userId } });

export const deleteComment = (id, userId) =>
    API.delete(`/comments/${id}`, { headers: { userId } });

// ---------- IMAGES ----------
export const uploadImages = (id, files) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    return API.post(`/${id}/upload`, formData);
};

export const getImages = async (id) =>
    (await API.get(`/${id}/images`)).data;

export const deleteImage = (id) =>
    API.delete(`/images/${id}`, { headers: { role: "ADMIN" } });

// ---------- DELETE ----------
export const deleteTicket = (id) =>
    API.delete(`/${id}`, { headers: { role: "ADMIN" } });