# Smart Campus Frontend - Member 03

A professional React frontend for the Smart Campus ticket management system, built with Vite.

## Features

- **Dashboard**: View all tickets in a card-based grid layout with filtering
- **Ticket Management**: Create, view, update, and delete tickets
- **Status Updates**: Change ticket status (Open, In Progress, Resolved, Closed, Rejected)
- **Technician Assignment**: Assign technicians to tickets (admin role required)
- **Comments**: Add, edit, and delete comments on tickets
- **Image Upload**: Upload up to 3 images per ticket with validation
- **Responsive Design**: Mobile-friendly layout
- **Professional UI**: Modern design with teal theme colors

## Tech Stack

- **React 19** with hooks
- **Vite** for fast development and building
- **React Router** for navigation
- **Axios** for API calls
- **CSS Variables** for theming
- **Responsive Grid Layout**

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Backend API running on `http://localhost:8080`

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
```

## API Integration

The frontend integrates with the Spring Boot backend API:

- Base URL: `http://localhost:8080/api/tickets`
- Authentication: Uses headers for role and userId (demo values set)
- Endpoints: CRUD operations for tickets, comments, images, and status updates

## Project Structure

```
src/
├── api/
│   └── ticketApi.js          # API integration functions
├── components/
│   ├── CommentSection.jsx    # Comment management
│   ├── ImageUpload.jsx       # Image upload component
│   ├── TicketCard.jsx        # Ticket card display
│   └── TicketStatusBadge.jsx # Status badge component
├── layout/
│   ├── Navbar.jsx            # Navigation bar
│   └── Navbar.css            # Navbar styles
├── pages/
│   ├── CreateTicket.jsx      # Create ticket form
│   ├── TicketDetails.jsx     # Ticket details and actions
│   └── TicketList.jsx        # Dashboard with ticket grid
├── App.jsx                   # Main app component with routing
├── App.css                   # App-specific styles
├── index.css                 # Global styles and CSS variables
└── main.jsx                  # App entry point
```

## Theme Colors

- **Primary**: #14B8A6 (Teal)
- **Primary Light**: #CCFBF1 (Pale Teal)
- **Success**: #22c55e (Green)
- **Warning**: #f59e0b (Orange)
- **Danger**: #ef4444 (Red)
- **Info**: #3b82f6 (Blue)

## Features Overview

### Dashboard
- Statistics cards showing ticket counts
- Filterable ticket grid
- Responsive card layout

### Ticket Details
- Complete ticket information
- Status update buttons
- Technician assignment
- Comment management
- Image gallery with upload/delete

### Create Ticket
- Form validation
- Category and priority selection
- Clean, accessible form design

### Comments
- Add new comments
- Edit own comments
- Delete own comments
- Real-time updates

### Images
- Multiple image upload (max 3)
- File type and size validation
- Image preview gallery
- Delete functionality

## Development Notes

- Uses CSS modules approach with global CSS variables
- Responsive design with mobile-first approach
- Error handling for API calls
- Loading states for better UX
- Clean, maintainable code structure

## Backend Requirements

Ensure the backend is running with the following endpoints:

- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/{id}` - Get ticket by ID
- `PUT /api/tickets/{id}/status` - Update status
- `PUT /api/tickets/{id}/assign` - Assign technician
- `DELETE /api/tickets/{id}` - Delete ticket
- `POST /api/tickets/{id}/comments` - Add comment
- `GET /api/tickets/{id}/comments` - Get comments
- `PUT /api/tickets/comments/{commentId}` - Edit comment
- `DELETE /api/tickets/comments/{commentId}` - Delete comment
- `GET /api/tickets/{id}/images` - Get images
- `POST /api/tickets/{id}/upload` - Upload images
- `DELETE /api/tickets/images/{imageId}` - Delete image

## License

This project is part of the IT3030 PAF 2026 Smart Campus Insight assignment.