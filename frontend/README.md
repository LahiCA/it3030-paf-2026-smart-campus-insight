# Smart Campus Insight - Frontend

React-based frontend for the Smart Campus Operations Hub. Provides a user-friendly interface for managing facilities, bookings, support tickets, and notifications.

## 📋 Prerequisites

- **Node.js**: Version 14 or higher
- **npm**: Version 6 or higher (comes with Node.js)
- **Backend API**: Ensure backend is running on `http://localhost:8080`
- **Google OAuth Client ID**: Required for Google Sign-In

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This installs all required packages:

- `react@18.2.0` and `react-dom@18.2.0` - UI framework
- `react-router-dom@6.11.0` - Client-side routing
- `@react-oauth/google@0.12.1` - Google OAuth integration
- `axios@1.4.0` - HTTP client
- `jwt-decode@3.1.2` - JWT token parsing
- `react-icons@4.8.0` - Icon library
- `react-scripts@5.0.1` - Build and dev server tools

### 2. Configure Environment Variables

Create a `.env` file in the frontend root directory:

```bash
# Google OAuth Configuration (REQUIRED)
# Get your Client ID from: https://console.cloud.google.com
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8080/api

# Dev/Debug
REACT_APP_DEBUG=true
```

#### Getting Your Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the "Google+ API"
4. Go to "Credentials" → Create OAuth 2.0 Client ID (Web application)
5. Add `http://localhost:3000` to Authorized redirect URIs
6. Copy the Client ID and paste it in `.env`

### 3. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000` and automatically reload on code changes.

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html                    # HTML entry point
├── src/
│   ├── components/                   # React components
│   │   ├── GoogleLoginButton.jsx     # Google login button
│   │   ├── LoginPage.jsx             # Login page
│   │   ├── PrivateRoute.jsx          # Protected route wrapper
│   │   ├── NotificationBell.jsx      # Notification bell with badge
│   │   ├── NotificationItem.jsx      # Single notification component
│   │   ├── NotificationsPage.jsx     # Full notifications page
│   │   ├── Navbar.jsx                # Top navigation bar
│   │   ├── Layout.jsx                # Layout wrapper with navbar
│   │   ├── Dashboard.jsx             # Main dashboard page
│   │   └── *.css                     # Component styles
│   ├── context/
│   │   ├── AuthContext.jsx           # Authentication context (user state, login/logout)
│   │   └── NotificationContext.jsx   # Notifications context (notifications list, polling)
│   ├── services/
│   │   ├── auth.js                   # Authentication API calls
│   │   ├── notifications.js          # Notifications API calls
│   │   └── storage.js                # localStorage wrapper
│   ├── utils/
│   │   ├── constants.js              # App configuration & constants
│   │   ├── jwt.js                    # JWT token utilities
│   │   ├── axios-instance.js         # Axios HTTP client with interceptors
│   ├── App.jsx                       # Main app component with routing
│   ├── App.css                       # Global styles (will be created)
│   ├── index.jsx                     # React entry point
│   └── index.css                     # Global styles
├── .env                              # Environment variables
├── .env.example                      # Example env file (for reference)
├── .gitignore                        # Git ignore rules
├── package.json                      # Dependencies and scripts
└── README.md                         # This file
```

## 🔐 Authentication Flow

1. User clicks "Sign in with Google"
2. Google OAuth dialog appears
3. User logs in with their Google account
4. Frontend receives JWT token from backend
5. Token is stored in localStorage
6. Token is automatically attached to all API requests
7. App navigates to Dashboard
8. Token is refreshed automatically via polling

## 🔔 Notifications Feature

- **Real-time Updates**: Notifications are polled every 30 seconds
- **Auto-mark Read**: Clicking on a notification marks it as read
- **Notification Bell**: Shows unread count in badge
- **Notification Page**: Full list with filtering and sorting
- **Notification Types**:
  - Booking Approved
  - Booking Rejected
  - Ticket Created
  - Ticket Updated
  - Comment Added
  - Booking Comment
  - General

## 🛣️ Route Structure

| Route            | Component         | Access  | Description                    |
| ---------------- | ----------------- | ------- | ------------------------------ |
| `/login`         | LoginPage         | Public  | Google login page              |
| `/dashboard`     | Dashboard         | Private | Main app dashboard             |
| `/notifications` | NotificationsPage | Private | All notifications              |
| `/*`             | Redirect          | Auto    | Redirects to appropriate route |

## 🔐 Protected Routes

Routes are protected using `PrivateRoute` component which checks:

- **Authentication**: User must be logged in
- **Authorization** (optional): User must have required role

Example:

```jsx
<Route
  path="/admin"
  element={<PrivateRoute element={<AdminPage />} requiredRole="ADMIN" />}
/>
```

## 🗂️ Service Layer

### Authentication Service (`auth.js`)

- `loginWithGoogle(googleToken)` - Login with Google token
- `logout()` - Clear auth and logout
- `getCurrentUser()` - Fetch current user info
- `isAuthenticated()` - Check if user is logged in

### Notifications Service (`notifications.js`)

- `getNotifications(unreadOnly)` - Get all or unread notifications
- `getUnreadCount()` - Get count of unread notifications
- `markAsRead(id)` - Mark notification as read
- `markAsUnread(id)` - Mark notification as unread
- `deleteNotification(id)` - Delete a notification
- `markAllAsRead(notifications)` - Mark all as read

### Storage Service (`storage.js`)

- `saveToken(token)` - Save JWT token
- `getToken()` - Retrieve JWT token
- `removeToken()` - Clear JWT token
- `saveUser(user)` - Save user data
- `getUser()` - Retrieve user data
- `removeUser()` - Clear user data
- `clearAuth()` - Clear all auth data

## 🎣 Hooks

### useAuth()

React hook to access authentication context:

```jsx
const { user, isAuthenticated, handleLogin, handleLogout, hasRole } = useAuth();

// Check roles
if (user.role === 'ADMIN') { ... }
if (isAdmin()) { ... }
if (hasRole('TECHNICIAN')) { ... }
```

### useNotifications()

React hook to access notifications context:

```jsx
const {
  notifications,
  unreadCount,
  markAsRead,
  deleteNotification,
  fetchNotifications,
} = useNotifications();
```

## 📡 API Integration

All API requests are made via Axios with JWT interceptor:

```javascript
// Request Interceptor
// - Automatically adds Authorization header with JWT
// - Removes expired tokens

// Response Interceptor
// - Handles 401 (Unauthorized) → logs out user
// - Handles 403 (Forbidden) → shows access denied
// - Handles 404 (Not Found) → shows error
// - Handles 500 (Server Error) → shows server error
```

## 🧪 Development

### Build for Production

```bash
npm run build
```

Creates optimized production build in `build/` directory.

### Run Tests (when configured)

```bash
npm test
```

### Code Quality

- **ESLint**: Configured for code style (can be added)
- **Prettier**: Code formatter (can be added)
- **TypeScript**: Can be migrated to (optional)

## 📦 Deployment

### Vercel (Recommended for React)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Upload 'build' folder to Netlify
```

### Traditional Server

```bash
npm run build
# Copy 'build' folder to your web server
# Configure server to serve index.html for all routes (SPA)
```

## 🐛 Troubleshooting

### "Cannot find module" error

```bash
rm -rf node_modules package-lock.json
npm install
```

### Google login not working

- Check Client ID is correct in `.env`
- Verify `http://localhost:3000` is in Google Cloud authorized URIs
- Clear localStorage and try again

### Backend connection error

- Ensure backend is running on `http://localhost:8080`
- Check CORS is enabled in backend (`application.yaml`)
- Verify network connection

### Notifications not updating

- Ensure backend is responding to GET `/api/notifications`
- Check browser DevTools Network tab for API errors
- Verify user is authenticated

## 📚 Resources

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [JWT Basics](https://jwt.io)

## 🤝 Contributing

Before committing:

1. Test all features work
2. Check console for errors/warnings
3. Ensure responsive design works
4. Update README if adding features

## 📝 License

© 2026 Smart Campus Operations. All rights reserved.
