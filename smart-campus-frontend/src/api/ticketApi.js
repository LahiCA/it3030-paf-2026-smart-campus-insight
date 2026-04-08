import axios from "axios";

const API = axios.create({
    baseURL: "/api/tickets", // relative path now works with proxy
});

export const getTickets = async () => {
    const res = await API.get("/");
    return res.data;
};

export const createTicket = async (data) => {
    const res = await API.post("/create", data);
    return res.data;
};

export const getTicket = async (id) => {
    const res = await API.get(`/${id}`);
    return res.data;
};

//export const getTickets = () => API.get("/");
//export const getTicket = (id) => API.get(`/${id}`);
//export const createTicket = (data) => API.post("/", data);
export const updateStatus = (id, status) =>
    API.put(`/${id}/status?status=${status}`);
export const assignTech = (id, techId) =>
    API.put(`/${id}/assign?techId=${techId}`, {}, { headers: { role: "ADMIN" } });
export const rejectTicket = (id, reason) =>
    API.put(`/${id}/reject?reason=${reason}`, {}, { headers: { role: "ADMIN" } });

export const getComments = (id) => API.get(`/${id}/comments`);
export const addComment = (id, data) => API.post(`/${id}/comments`, data);
export const editComment = (id, userId, message) =>
    API.put(`/comments/${id}?message=${message}`, {}, { headers: { userId } });
export const deleteComment = (id, userId) =>
    API.delete(`/comments/${id}`, { headers: { userId } });

export const uploadImages = (id, files) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    return API.post(`/${id}/upload`, formData);
};

export const getImages = (id) => API.get(`/${id}/images`);
export const deleteImage = (id) =>
    API.delete(`/images/${id}`, { headers: { role: "ADMIN" } });