/**
 * Smart Campus AI Assistant — Mock Data & Conversations
 * Replace with Gemini API responses when backend is ready.
 */

// ─── Quick Actions per role ───────────────────────────────────────────────────
export const QUICK_ACTIONS = {
  ADMIN: [
    { id: 'find-room', icon: '🏫', label: 'Find Available Room', prompt: 'Find me an available lecture hall for tomorrow at 10 AM', navigateTo: '/resources' },
    { id: 'review-bookings', icon: '📋', label: 'Review Pending Bo...', prompt: 'Show me all pending booking requests that need approval', navigateTo: '/bw-admin-bookings' },
    { id: 'manage-users', icon: '👥', label: 'Manage Users', prompt: 'Show me an overview of all registered users', navigateTo: '/admin' },
    { id: 'view-tickets', icon: '🎫', label: 'View Open Tickets', prompt: 'Show me all open maintenance tickets', navigateTo: '/tickets' },
    { id: 'send-notification', icon: '🔔', label: 'Send Notification', prompt: 'Help me send a campus-wide notification', navigateTo: '/notifications-management' },
    { id: 'campus-stats', icon: '📊', label: 'Campus Statistics', prompt: 'Give me a summary of campus resource usage', navigateTo: '/dashboard' },
  ],
  LECTURER: [
    { id: 'find-room', icon: '🏫', label: 'Find Available Room', prompt: 'Find me an available lecture hall for tomorrow at 10 AM', navigateTo: '/resources' },
    { id: 'book-lab', icon: '🔬', label: 'Book a Lab', prompt: 'I want to book a computer lab for my class', navigateTo: '/bw-create-booking' },
    { id: 'reserve-equip', icon: '📽️', label: 'Reserve Equipment', prompt: 'I need to reserve a projector for my presentation', navigateTo: '/bw-create-booking' },
    { id: 'report-issue', icon: '🔧', label: 'Report an Issue', prompt: 'Report a broken projector in Lab 3', navigateTo: '/create' },
    { id: 'check-booking', icon: '📅', label: 'Check Booking Status', prompt: 'What is the status of my latest booking?', navigateTo: '/bw-my-bookings' },
    { id: 'my-tickets', icon: '🎫', label: 'Track My Tickets', prompt: 'Show my latest ticket updates', navigateTo: '/tickets' },
  ],
  TECHNICIAN: [
    { id: 'assigned-jobs', icon: '🔧', label: 'My Assigned Jobs', prompt: 'Show me all maintenance jobs assigned to me', navigateTo: '/tickets' },
    { id: 'urgent-tickets', icon: '🚨', label: 'Urgent Tickets', prompt: 'Show me all high-priority open tickets', navigateTo: '/tickets' },
    { id: 'update-ticket', icon: '📝', label: 'Update Ticket Status', prompt: 'Help me update the status of a ticket', navigateTo: '/tickets' },
    { id: 'find-room', icon: '🏫', label: 'Find Resource', prompt: 'Show me the location and details for Lab 3', navigateTo: '/resources' },
    { id: 'report-issue', icon: '⚠️', label: 'Log New Issue', prompt: 'Log a new maintenance issue I discovered', navigateTo: '/create' },
    { id: 'schedule', icon: '📅', label: 'My Schedule', prompt: 'Show my maintenance schedule for this week' },
  ],
};

// ─── Suggested prompts per role ───────────────────────────────────────────────
export const SUGGESTED_PROMPTS = {
  ADMIN: [
    'Show me all pending booking requests',
    'How many resources are currently available?',
    'List open maintenance tickets by priority',
    'Send a notification to all lecturers',
  ],
  LECTURER: [
    'Find me an available lab for tomorrow at 10 AM',
    'Book a lecture hall for 80 students',
    'Report a broken projector in Lab 3',
    'What is the status of my booking?',
  ],
  TECHNICIAN: [
    'Show my assigned maintenance tasks',
    'What are the urgent open tickets?',
    'Update ticket #TK005 to In Progress',
    'Show equipment needing maintenance',
  ],
};

// ─── Input placeholders per role ──────────────────────────────────────────────
export const INPUT_PLACEHOLDERS = {
  ADMIN: 'Ask about bookings, users, tickets, or campus stats…',
  LECTURER: 'Ask about rooms, bookings, or report an issue…',
  TECHNICIAN: 'Ask about assigned jobs, tickets, or resources…',
};

// ─── Sample resource / booking / ticket cards ─────────────────────────────────
export const SAMPLE_RESOURCES = [
  { id: 'r1', name: 'Lecture Hall A', type: 'LECTURE_HALL', capacity: 120, location: 'Block A, Floor 2', status: 'AVAILABLE' },
  { id: 'r2', name: 'Computer Lab 3', type: 'LAB', capacity: 40, location: 'Block C, Floor 1', status: 'AVAILABLE' },
  { id: 'r3', name: 'Meeting Room 201', type: 'MEETING_ROOM', capacity: 12, location: 'Admin Block, Floor 2', status: 'OCCUPIED' },
];

export const SAMPLE_BOOKINGS = [
  { id: 'b1', displayId: 'BK0012', resource: 'Lecture Hall A', date: '2026-04-11', timeSlot: '10:00 – 12:00', status: 'PENDING', purpose: 'Database Systems Lecture' },
  { id: 'b2', displayId: 'BK0010', resource: 'Computer Lab 3', date: '2026-04-10', timeSlot: '14:00 – 16:00', status: 'APPROVED', purpose: 'Java Programming Lab' },
];

export const SAMPLE_TICKETS = [
  { id: 't1', displayId: 'TK0023', title: 'Broken projector in Lab 3', category: 'EQUIPMENT', priority: 'HIGH', status: 'OPEN', createdAt: '2026-04-09' },
  { id: 't2', displayId: 'TK0021', title: 'AC not working in LH-A', category: 'FACILITIES', priority: 'MEDIUM', status: 'IN_PROGRESS', assignee: 'Kamal Perera', createdAt: '2026-04-08' },
];

// ─── Mock conversation flows ──────────────────────────────────────────────────
export const MOCK_RESPONSES = {
  // Booking-related
  'find.*(available|free).*(room|hall|lab)|available.*(room|hall|lab|space)': {
    text: "I found 2 available spaces for your needs. Here are the options:",
    cards: { type: 'resource', data: [SAMPLE_RESOURCES[0], SAMPLE_RESOURCES[1]] },
    suggestions: ['Book Lecture Hall A', 'Book Computer Lab 3', 'Show more options'],
  },
  'book.*(lab|hall|room)|need.*(room|lab|hall)': {
    text: "I'll help you book a space. Here's a suitable option based on your request:",
    cards: { type: 'resource', data: [SAMPLE_RESOURCES[0]] },
    suggestions: ['Confirm booking for tomorrow 10 AM', 'Change time slot', 'Find different room'],
  },
  '(check|view|show|my|list|all).*(booking|reservation)': {
    text: "Here are your recent bookings:",
    cards: { type: 'booking', data: SAMPLE_BOOKINGS },
    suggestions: ['Cancel BK0012', 'View booking details', 'Create new booking'],
  },
  'status.*(booking|reservation)': {
    text: "Here are your recent bookings:",
    cards: { type: 'booking', data: SAMPLE_BOOKINGS },
    suggestions: ['Cancel BK0012', 'View booking details', 'Create new booking'],
  },
  'reserve.*(equipment|projector)': {
    text: "I can help you reserve equipment. We have projectors, microphones, and whiteboards available. What do you need?",
    suggestions: ['Reserve a projector', 'Reserve a microphone', 'Show all equipment'],
  },

  // Ticket-related
  'report.*(broken|damaged|issue|incident)|broken|damaged|not working': {
    text: "I'll help you report this issue. I've prepared a ticket draft for you:",
    cards: { type: 'ticket', data: [{ id: 'new', displayId: 'NEW', title: 'Broken projector in Lab 3', category: 'EQUIPMENT', priority: 'HIGH', status: 'DRAFT', createdAt: new Date().toISOString().split('T')[0] }] },
    suggestions: ['Submit this ticket', 'Change priority', 'Add more details'],
  },
  '(track|show|view|check|my).*(ticket|maintenance|issue)': {
    text: "Here are your active tickets:",
    cards: { type: 'ticket', data: SAMPLE_TICKETS },
    suggestions: ['Update TK0023', 'View ticket details', 'Create new ticket'],
  },
  'assigned.*(job|task|ticket|maintenance)': {
    text: "You have 2 maintenance tasks assigned to you:",
    cards: { type: 'ticket', data: SAMPLE_TICKETS },
    suggestions: ['Start TK0023', 'Mark TK0021 resolved', 'View all assigned'],
  },
  'urgent|high.priority': {
    text: "There is 1 urgent ticket requiring immediate attention:",
    cards: { type: 'ticket', data: [SAMPLE_TICKETS[0]] },
    suggestions: ['Accept this job', 'View full details', 'Show all urgent tickets'],
  },

  // Admin-related
  'pending.*(booking|request|approval)': {
    text: "There are 2 pending booking requests awaiting your approval:",
    cards: { type: 'booking', data: SAMPLE_BOOKINGS },
    suggestions: ['Approve BK0012', 'Reject BK0012', 'View requester details'],
  },
  '(manage|overview).*(user|account)': {
    text: "Campus user overview:\n• Admins: 1\n• Lecturers: 5\n• Technicians: 3\n\nTotal registered: 9 users",
    suggestions: ['View all lecturers', 'Add new user', 'Go to User Management'],
  },
  '(send|create).*notification': {
    text: "I can help you create a notification. Who should receive it?",
    suggestions: ['All users', 'All lecturers', 'All technicians', 'Specific user'],
  },
  '(campus|resource).*(stat|usage|summary)': {
    text: "📊 Campus Resource Summary:\n• Total Resources: 12\n• Available Now: 8\n• Occupied: 3\n• Under Maintenance: 1\n\n📅 Bookings Today: 6\n🎫 Open Tickets: 4",
    suggestions: ['View detailed report', 'Export statistics', 'Go to Resources'],
  },

  // Notifications
  '(view|show|check|my|unread).*notification|notification': {
    text: "You have 3 unread notifications:\n\n🟢 Booking BK0010 has been approved\n🟡 New comment on ticket TK0021\n🔵 System maintenance scheduled for Sunday",
    suggestions: ['Mark all as read', 'Go to Notifications', 'Filter by type'],
  },

  // Greetings
  '^(hi|hello|hey|good|yo|sup)': {
    text: "Hello! 👋 I'm your Smart Campus Assistant. I can help you with:\n\n🏫 Finding & booking rooms, labs, and equipment\n🎫 Reporting and tracking maintenance issues\n🔔 Managing notifications\n📊 Campus resource insights\n\nWhat would you like to do?",
    suggestions: ['Find an available room', 'Report an issue', 'Check my bookings'],
  },

  // Help
  '(help|what can you|how do i)': {
    text: "Here's what I can help you with:\n\n📍 **Facility Search** — Find free rooms, labs, equipment\n📅 **Bookings** — Create, check status, cancel bookings\n🔧 **Maintenance** — Report issues, track ticket progress\n🔔 **Notifications** — View and manage alerts\n👤 **Account** — Check your role and profile\n\nJust type what you need or tap a quick action below!",
    suggestions: ['Find a room', 'My bookings', 'My tickets', 'Notifications'],
  },

  // Default fallback
  '__default__': {
    text: "I'm not sure I understood that. Could you rephrase? I can help with room bookings, maintenance tickets, resource management, and campus notifications.",
    suggestions: ['Find a room', 'Report an issue', 'Check booking status'],
  },
};

/**
 * Match user message against mock responses.
 * Returns the matching response or the default.
 */
export function getMockResponse(message) {
  const lower = message.toLowerCase().trim();
  for (const [pattern, response] of Object.entries(MOCK_RESPONSES)) {
    if (pattern === '__default__') continue;
    try {
      if (new RegExp(pattern, 'i').test(lower)) return response;
    } catch { /* skip invalid regex */ }
  }
  return MOCK_RESPONSES['__default__'];
}
