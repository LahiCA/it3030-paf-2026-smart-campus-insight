import axiosInstance from '../utils/axios-instance';

/**
 * Send a message to the Smart Campus AI Assistant (Gemini-powered).
 * POST /api/chatbot
 * @param {string} message - User's message
 * @param {string} role - User's role (ADMIN, LECTURER, TECHNICIAN)
 * @returns {{ reply: string, suggestions: string[] }}
 */
export const sendChatMessage = async (message, role) => {
  const response = await axiosInstance.post('/chatbot', { message, role });
  return response.data;
};
