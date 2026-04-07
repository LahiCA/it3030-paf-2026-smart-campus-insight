const BASE_URL = "http://localhost:8080/api/tickets";

export const getTickets = async () => {
    const res = await fetch(BASE_URL);
    return res.json();
};

export const createTicket = async (data) => {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const updateStatus = async (id, status) => {
    const res = await fetch(`${BASE_URL}/${id}/status?status=${status}`, {
        method: "PUT",
    });
    return res.json();
};

export const assignTech = async (id, techId) => {
    const res = await fetch(`${BASE_URL}/${id}/assign?techId=${techId}`, {
        method: "PUT",
        headers: { role: "ADMIN" },
    });
    return res.json();
};

export const deleteTicket = async (id) => {
    return fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { role: "ADMIN" },
    });
};