import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/bookings";

export const createBWBooking = async (bookingData) => {
  return await axios.post(API_BASE_URL, bookingData);
};

export const getAllBWBookings = async () => {
  return await axios.get(API_BASE_URL);
};

export const getBWBookingById = async (id) => {
  return await axios.get(`${API_BASE_URL}/${id}`);
};

export const getBWBookingsByUser = async (userId) => {
  return await axios.get(`${API_BASE_URL}/user/${userId}`);
};

export const approveBWBooking = async (id) => {
  return await axios.patch(`${API_BASE_URL}/${id}/approve`);
};

export const rejectBWBooking = async (id, reason) => {
  return await axios.patch(`${API_BASE_URL}/${id}/reject`, { reason });
};

export const cancelBWBooking = async (id, reason) => {
  return await axios.patch(`${API_BASE_URL}/${id}/cancel`, { reason });
};

export const checkInBWBooking = async (id) => {
  return await axios.patch(`${API_BASE_URL}/${id}/checkin`);
};