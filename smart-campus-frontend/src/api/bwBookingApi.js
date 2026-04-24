import axios from "axios";

/**
 * Module B: Booking Management API Client 
 * Handles all Axios HTTP requests out to the Spring Boot REST API
 */
const API_BASE_URL = "http://localhost:8080/api/bookings";

// POST endpoint (Create Booking / Validated)
export const createBWBooking = async (bookingData) => {
  return await axios.post(API_BASE_URL, bookingData);
};

// GET all items
export const getAllBWBookings = async () => {
  return await axios.get(API_BASE_URL);
};

// GET a specific booking
export const getBWBookingById = async (id) => {
  return await axios.get(`${API_BASE_URL}/${id}`);
};

// GET bookings specific to a single user context
export const getBWBookingsByUser = async (userId) => {
  return await axios.get(`${API_BASE_URL}/user/${userId}`);
};

// PATCH mappings for shifting workflow states
export const approveBWBooking = async (id) => {
  return await axios.patch(`${API_BASE_URL}/${id}/approve`);
};

export const rejectBWBooking = async (id, reason) => {
  return await axios.patch(`${API_BASE_URL}/${id}/reject`, { reason });
};

export const cancelBWBooking = async (id, reason) => {
  const payload = reason ? { reason } : {};
  return await axios.patch(`${API_BASE_URL}/${id}/cancel`, payload);
};

export const checkInBWBooking = async (id) => {
  return await axios.patch(`${API_BASE_URL}/${id}/checkin`);
};

// DELETE endpoint implementation from member 2 criteria 
export const deleteBWBooking = async (id, reason) => {
  const url = reason ? `${API_BASE_URL}/${id}?reason=${encodeURIComponent(reason)}` : `${API_BASE_URL}/${id}`;
  return await axios.delete(url);
};