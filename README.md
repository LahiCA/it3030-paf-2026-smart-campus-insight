# Smart Campus Operations Hub 🎓

**IT3030 – PAF Assignment 2026 (Semester 1) - Faculty of Computing – SLIIT**

A complete, production-inspired web system designed to manage facility and asset bookings, maintenance/incident handling, and advanced backend campus operations. 

## 👥 Team Members & Contribution

| Member | ID | Responsibilities & Implemented Features |
| :--- | :--- | :--- |
| **Member 1** | ITXXXXXXXX | **Module A: Facilities & Assets Catalogue** <br>- Resource management REST endpoints (CRUD).<br>- React catalogue UI with search, filtering, and metadata tracking.<br>- File uploads for resource images and status toggling (`ACTIVE` / `OUT_OF_SERVICE`). |
| **Member 2** | ITXXXXXXXX | **Module B: Booking Management** <br>- End-to-end booking workflow (`PENDING` -> `APPROVED` / `REJECTED`).<br>- Automated conflict checking & overlapping time prevention across resources.<br>- Admin booking dashboard and user booking history views. |
| **Member 3** | ITXXXXXXXX | **Module C: Maintenance & Incident Ticketing** <br>- Ticketing workflows (`OPEN` -> `IN_PROGRESS` -> `RESOLVED` -> `CLOSED`).<br>- Complex form handling with up to 3 image attachments for issue evidence.<br>- Technician updates, ticket timeline views, and threaded commenting system. |
| **Member 4** | ITXXXXXXXX | **Module D & E: Notifications, Auth & Innovation** <br>- OAuth 2.0 Auth (Google Sign-In) & Role-Based Access Control (`USER`, `ADMIN`, `TECHNICIAN`).<br>- Real-time notification panel & notification logic.<br>- Gemini AI Chatbot Integration for smart campus queries (Innovation).<br>- Usage analytics dashboard & PDF/Excel reporting exports (Innovation). |

## 🛠️ Technology Stack

- **Frontend:** React (Vite), TailwindCSS, Context API, Axios, jsPDF
- **Backend:** Java, Spring Boot 3.x, Spring Security (JWT + OAuth2)
- **Database:** MongoDB Atlas (NoSQL)
- **CI/CD:** GitHub Actions (Automated Build & Test)
- **AI Integration:** Google Gemini API 

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

## 🚀 Getting Started

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
