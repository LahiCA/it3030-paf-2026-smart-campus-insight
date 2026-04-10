import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendChatMessage } from '../api/chatbotApi';
import { QUICK_ACTIONS, SUGGESTED_PROMPTS, INPUT_PLACEHOLDERS } from './mockData';

const ChatbotContext = createContext();

/**
 * Generate a unique message ID.
 */
let _msgId = 0;
const nextId = () => `msg-${++_msgId}-${Date.now()}`;

/**
 * ChatbotProvider
 *
 * Global state for the floating AI assistant.
 * Wraps the entire app so the widget persists across route changes.
 *
 * When Gemini API is ready, replace the `handleSend` mock logic
 * with an Axios call: POST /api/chatbot  { message, role, conversationId }
 */
export const ChatbotProvider = ({ children }) => {
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bottomRef = useRef(null);

  const role = user?.role || 'LECTURER';
  const quickActions = QUICK_ACTIONS[role] || QUICK_ACTIONS.LECTURER;
  const suggestedPrompts = SUGGESTED_PROMPTS[role] || SUGGESTED_PROMPTS.LECTURER;
  const inputPlaceholder = INPUT_PLACEHOLDERS[role] || INPUT_PLACEHOLDERS.LECTURER;

  /**
   * Toggle panel open / close.
   */
  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setUnreadCount(0);
      return !prev;
    });
  }, []);

  /**
   * Send a user message to the Gemini-powered AI assistant.
   */
  const handleSend = useCallback(
    async (text) => {
      if (!text.trim()) return;

      // 1. Append user message
      const userMsg = {
        id: nextId(),
        role: 'user',
        text: text.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // 2. Show typing indicator
      setIsTyping(true);

      try {
        // 3. Call Gemini API via backend
        const data = await sendChatMessage(text.trim(), role);

        const assistantMsg = {
          id: nextId(),
          role: 'assistant',
          text: data.reply,
          suggestions: data.suggestions || [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        console.error('Chatbot API error:', err);
        const errorMsg = {
          id: nextId(),
          role: 'assistant',
          text: "I'm having trouble connecting right now. Please try again in a moment.",
          suggestions: ['Try again', 'Find a room', 'Check my bookings'],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
        if (!isOpen) setUnreadCount((c) => c + 1);
      }
    },
    [isOpen, role],
  );

  /**
   * Clear conversation history.
   */
  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const value = {
    isOpen,
    toggleOpen,
    messages,
    isTyping,
    unreadCount,
    handleSend,
    clearChat,
    quickActions,
    suggestedPrompts,
    inputPlaceholder,
    role,
    bottomRef,
  };

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>;
};

export const useChatbot = () => {
  const ctx = useContext(ChatbotContext);
  if (!ctx) throw new Error('useChatbot must be used within ChatbotProvider');
  return ctx;
};
