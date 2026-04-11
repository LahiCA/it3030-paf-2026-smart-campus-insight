# 🎓 Smart Campus Insight

A full-stack, production-inspired web application designed to modernize university operations through centralized management of resources, bookings, and maintenance workflows.

---

##  Project Overview

The **Smart Campus Operations Hub** is a comprehensive system that enables:

-  Efficient facility & asset management  
-  Seamless booking workflows with conflict prevention  
-  Structured incident ticketing & maintenance tracking  
-  Real-time notifications for system events  
-  Secure authentication with role-based access control  
-  Analytics, reporting, and AI-powered assistance  

The system emphasizes **scalability, auditability, and real-world usability**.

---

##  Core System Features

###  Module A – Facilities & Assets Catalogue
- Manage campus resources (lecture halls, labs, equipment)
- Resource metadata:
  - Type, capacity, location
  - Availability windows
  - Status (`ACTIVE`, `OUT_OF_SERVICE`)
- Advanced search and filtering

---

###  Module B – Booking Management
- Booking workflow:  
  `PENDING → APPROVED / REJECTED → CANCELLED`
- Prevents overlapping bookings
- Admin approval/rejection with reasons
- User booking history & admin dashboard

---

###  Module C – Maintenance & Incident Ticketing
- Create incident tickets with:
  - Category, description, priority
  - Contact details
  - Up to **3 image attachments**
- Ticket workflow:


OPEN → IN_PROGRESS → RESOLVED → CLOSED
↘ REJECTED


- Technician assignment
- Resolution notes & updates
- Threaded comment system
- rating and feedback system of users
-  **Ticket Activity Timeline (Audit Trail)**

---

###  Module D – Notifications
- Real-time notifications for:
  - Booking approvals/rejections
  - Ticket status updates
  - New comments
- Integrated notification panel

---

###  Module E – Authentication & Authorization
- Google OAuth 2.0 login
- Role-based access:
  - `USER`
  - `ADMIN`
  - `TECHNICIAN`
- JWT-secured backend APIs

---

##  Innovation Features

-  Admin Analytics Dashboard (resource usage insights)
-  SLA Tracking:
  - First response time
  - Resolution time
-  Export Reports:
  - PDF reports
  - TXT reports
-  Gemini AI Chatbot Integration
-  Smart notification system
-  Secure image upload handling
-  Advanced comment system
-  Enhanced filtering & UI experience
-  Performance-optimized frontend

---

##  Technology Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router DOM
- Axios
- Chart.js / Recharts
- Google OAuth (`@react-oauth/google`)
- jsPDF (report generation)

### Backend
- Java (Spring Boot 3.x)
- Spring Security (JWT + OAuth2)
- RESTful API architecture

### Database
- MongoDB Atlas (NoSQL)

### DevOps
- GitHub Actions (CI/CD)

### AI Integration
- Google Gemini API

---

## 📂 Folder Structure

```text
smart-campus-insight/
├── backend/                          # Spring Boot Backend Application
│   ├── src/main/java/com/smartcampus/backend/
│   │   ├── bookingworkflow/          # Booking workflows & conflict logic (Member 2)
│   │   ├── controller/               # REST API Controllers (Member 1, 3, 4)
│   │   ├── model/                    # Data Models & Enums
│   │   ├── service/                  # Business logic (Ticketing, Chatbot, Resources)
│   │   └── tickets/                  # Incident management (Member 3)
│   ├── src/main/resources/           # App configuration (application.yaml)
│   ├── src/test/                     # Unit and Integration Tests
│   ├── uploads/                      # Asset image uploads & ticketing evidence
│   └── pom.xml                       # Maven dependencies
│
├── smart-campus-frontend/            # React (Vite) Frontend Application
│   ├── src/
│   │   ├── api/                      # Axios API client integrations
│   │   ├── assets/                   # Static assets
│   │   ├── chatbot/                  # AI Chatbot components (Innovation)
│   │   ├── components/               # Reusable UI widgets & Dashboards
│   │   ├── context/                  # React Contexts (AuthContext, etc.)
│   │   ├── pages/                    # Main application pages (ExportReports, etc.)
│   │   └── services/                 # Frontend services
│   ├── package.json                  # Node dependencies
│   ├── tailwind.config.cjs           # Tailwind styling configuration
│   └── vite.config.js                # Vite build configuration
│
├── .github/workflows/                # CI/CD GitHub Actions pipelines
├── README.md                         # Project documentation
└── Smart-Campus-API.postman_collection.json # Postman collection for API testing
```

👥 Team Contributions

##  Team Members & Contribution

| Member | ID | Responsibilities & Implemented Features |
| :--- | :--- | :--- |
| **Member 1** | ITXXXXXXXX | **Module A: Facilities & Assets Catalogue** <br>- Resource management REST endpoints (CRUD).<br>- React catalogue UI with search, filtering, and metadata tracking.<br>- File uploads for resource images and status toggling (`ACTIVE` / `OUT_OF_SERVICE`). |
| **Member 2** | ITXXXXXXXX | **Module B: Booking Management** <br>- End-to-end booking workflow (`PENDING` -> `APPROVED` / `REJECTED`).<br>- Automated conflict checking & overlapping time prevention across resources.<br>- Admin booking dashboard and user booking history views. |
| **Member 3** | ITXXXXXXXX | **Module C: Maintenance & Incident Ticketing** <br>- Ticketing workflows (`OPEN` -> `IN_PROGRESS` -> `RESOLVED` -> `CLOSED`).<br>- Complex form handling with up to 3 image attachments for issue evidence.<br>- Technician updates, ticket timeline views, and threaded commenting system. |
| **Member 4** | ITXXXXXXXX | **Module D & E: Notifications, Auth & Innovation** <br>- OAuth 2.0 Auth (Google Sign-In) & Role-Based Access Control (`USER`, `ADMIN`, `TECHNICIAN`).<br>- Real-time notification panel & notification logic.<br>- Gemini AI Chatbot Integration for smart campus queries (Innovation).<br>- Usage analytics dashboard & PDF/Excel reporting exports (Innovation). |


##  Getting Started

### Prerequisites
- JDK 17+
- Node.js 18+
- Maven
- MongoDB Atlas Account

### Backend Setup
1. Navigate to the backend folder: `cd backend`
2. Configure environment variables in `application.yaml` (MongoDB URI, JWT Secret, Gemini API Key).
3. Run the Spring Boot app: `./mvnw spring-boot:run`
4. The API will start on `http://localhost:8080`

### Frontend Setup
1. Navigate to the frontend folder: `cd smart-campus-frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open the application at `http://localhost:5173`


###  Testing & Quality

Postman collection included for API testing
Validation and error handling implemented
Modular architecture for maintainability

###  Key Highlights

✅ Full RESTful API with proper HTTP methods
✅ Clean layered backend architecture
✅ Fully functional React UI
✅ Secure authentication & authorization
✅ Real-time system feedback via notifications
✅ Advanced audit tracking with timeline
✅ Exportable reports (PDF/TXT)
✅ AI-powered chatbot integration

### 📎 Additional Notes

Designed to simulate a real-world production system
Focus on usability, performance, and scalability
Clean UI/UX with Tailwind CSS design system

# Smart Campus Insight — Bringing efficiency to campus management systems

