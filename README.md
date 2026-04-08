# Smart Campus Insight – Booking Workflow Module (Member 2)

## Module Owner
**Member 2 – Booking Workflow / Resource Reservation**

This module is responsible for handling the complete **resource booking workflow** in the Smart Campus system.

---

# Tech Stack

## Frontend
- **React**
- **Vite**
- **Tailwind CSS**
- **Axios**
- **React Router DOM**

## Backend
- **Spring Boot**
- **Spring Web**
- **Spring Data MongoDB**
- **Spring Validation**
- **Maven**

## Database
- **MongoDB Atlas**

---

# Module Scope

This module allows users to:

- Create booking requests
- View their own bookings
- Track booking status
- Cancel approved bookings

This module also supports workflow status transitions:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELLED`

---

# Backend Implementation

The backend follows a **layered Spring Boot architecture**.

---

## Backend Folder Structure

```text
backend/
└── src/main/java/com/smartcampus/backend/
    └── bookingworkflow/
        ├── controller/
        │   └── BookingController.java
        │
        ├── dto/
        │   ├── BookingRequestDto.java
        │   ├── BookingDecisionDto.java
        │   └── BookingCancelDto.java
        │
        ├── exception/
        │   ├── BookingConflictException.java
        │   ├── InvalidBookingException.java
        │   └── ResourceNotFoundException.java
        │
        ├── model/
        │   ├── Booking.java
        │   └── BookingStatus.java
        │
        ├── repository/
        │   └── BookingRepository.java
        │
        └── service/
            └── BookingService.java
```
## Backend Features Completed
### 1. Booking Creation

Implemented:

`POST /api/bookings`

This endpoint:

- validates request data
- checks time conflicts
- saves booking in MongoDB
- sets status as PENDING

### 2. Get User Bookings

Implemented:

`GET /api/bookings/user/{userId}`

Allows users to view only their own bookings.

### 3. Get Booking by ID

Implemented:

`GET /api/bookings/{id}`

Used for booking details retrieval.

### 4. Workflow Actions

Implemented:

- `PATCH /api/bookings/{id}/approve`
- `PATCH /api/bookings/{id}/reject`
- `PATCH /api/bookings/{id}/cancel`

### 5. Conflict Checking Logic

The system prevents overlapping bookings for the same resource and date.

Example:

| Existing | New       |
| :------- | :-------- |
| 10:00 - 12:00 | 11:00 - 01:00 |

Result:

`BookingConflictException`

# Frontend Implementation

Frontend is built using `React` + `Vite` + `Tailwind CSS`

## Frontend Folder Structure
```text
smart-campus-frontend/
└── src/
    ├── api/
    │   └── bwBookingApi.js
    │
    ├── components/
    │   ├── BWBookingForm.jsx
    │   ├── BWBookingTable.jsx
    │   └── BWBookingStatusBadge.jsx
    │
    ├── layout/
    │   └── BWSidebar.jsx
    │
    ├── pages/
    │   ├── BWCreateBooking.jsx
    │   └── BWMyBookings.jsx
    │
    ├── App.jsx
    └── index.css
```
## Frontend Features Completed
### 1. Sidebar Navigation

Implemented user workflow sidebar with:

- Dashboard
- Create Booking
- My Bookings

### 2. Create Booking Page

Users can submit:

- resource ID
- resource name
- resource type
- booking date
- start time
- end time
- purpose
- expected attendees

Integrated with backend using Axios.

### 3. My Bookings Page

Displays user-specific bookings.

Includes:

- resource
- type
- date
- time
- purpose
- status

### 4. Status Badges

Dynamic status display:

- green → approved
- yellow → pending
- red → rejected
- gray → cancelled

### 5. Cancel Booking

Users can cancel only `approved` bookings

Includes:

- confirmation popup
- loading state
- success / error alerts

## UI Theme

Theme used:

| Color     | Hex       |
| :-------- | :-------- |
| Deep Teal | `#134e4a` |
| Teal      | `#0f766e` |
| Accent    | `#14b8a6` |
| Pale Teal | `#ccfbf1` |
| Surface   | `#f8fafc` |

Design goal:

- clean
- academic
- readable
- calm user experience

## API Integration

Frontend uses `Axios`:

- `createBWBooking()`
- `getBWBookingsByUser()`
- `cancelBWBooking()`

All API calls connect to Spring Boot backend:

`http://localhost:8080/api/bookings`

## Current Workflow
1. User creates booking
2. Spring Boot validates
3. Conflict check
4. MongoDB save
5. Status = `PENDING`
6. User can view booking
7. User can cancel if `APPROVED`

## Future Enhancements

Planned:

- role-based login integration
- admin booking approval dashboard
- approve / reject UI
- booking analytics cards
- date/time filters
- notifications

## Important Notes

Admin and User are separate actors.

Role-based login will be integrated by another team member.

Current implementation focuses on Member 2 booking workflow responsibilities.

## Contribution Summary

This module was implemented as Member 2 contribution and includes:

- backend booking workflow
- MongoDB persistence
- API integration
- React frontend pages
- status workflow
- user cancellation flow
- UI theme and layout
