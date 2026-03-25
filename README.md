# HEM∆ — Blood Management Network

HEM∆ is a premium, real-time blood management platform designed to streamline the lifecycle of blood products from donation to transfusion. It connects donors, hospitals, and blood banks through a unified, high-performance interface.

## 🚀 Project Overview

This repository contains both the **Frontend** and **Backend** implementations of the HEM∆ platform. The system provides role-based access for admins, hospitals, blood banks, and donors, with real-time inventory management and secure authentication.

### 🛠 Tech Stack
- **Frontend:**
  - Framework: React 18+ (via Vite)
  - Styling: Vanilla CSS (CSS Variables) + Framer Motion
  - Icons: Lucide React
  - Charts: Recharts
  - Navigation: React Router DOM v6
  - Asset Management: Static assets in `/public`

- **Backend:**
  - Runtime: Node.js with Express.js
  - Database: MySQL
  - Authentication: JWT with refresh tokens
  - Security: bcrypt for password hashing
  - ORM: Custom query utilities

---

## 🏗 Project Structure

```
blood-management-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── controllers/              # Business logic
│   ├── db/
│   │   └── init.sql             # Database schema
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT authentication
│   │   └── cookieParserMiddleware.js
│   ├── routes/                  # API endpoints
│   │   ├── authRoutes.js        # Authentication & registration
│   │   ├── adminRoutes.js       # Admin analytics & management
│   │   ├── bloodBankRoutes.js   # Blood bank operations
│   │   ├── hospitalRoutes.js    # Hospital operations
│   │   ├── donorRoutes.js       # Donor operations
│   │   └── ...
│   ├── services/
│   │   └── authService.js       # Auth utilities
│   ├── utils/
│   │   └── dbQuery.js           # Database query helpers
│   ├── server.js                # Main server file
│   └── package.json
├── frontend/
│   ├── public/                  # Static assets (maps, logos)
│   ├── src/
│   │   ├── assets/              # Global styles and branding
│   │   ├── components/          # Reusable UI components
│   │   │   ├── admin/           # Admin-specific layouts
│   │   │   ├── donor/           # Donor portal elements
│   │   │   ├── hospital/        # Hospital portal elements
│   │   │   └── bloodbank/       # Blood bank portal elements
│   │   ├── pages/               # Portal pages & Landing pages
│   │   │   ├── admin/           # Admin screens
│   │   │   ├── donor/           # Donor portal screens
│   │   │   ├── hospital/        # Hospital portal screens
│   │   │   └── bloodbank/       # Blood bank portal screens
│   │   ├── data/                # Mock data & Analytics seeds
│   │   ├── services/            # API client utilities
│   │   ├── auth/                # Authentication components
│   │   └── App.jsx              # Main router
│   └── package.json
└── README.md
```

---

## 🔑 Portals & Access

| Portal | Base Route | Key Features |
|---|---|---|
| **Admin** | `/admin/*` | Global inventory, hospital/bank approvals, audit logs, reports, system settings. |
| **Blood Bank** | `/bloodbank/*` | Local stock management, donation intake, health checks, issue management. |
| **Hospital** | `/hospital/*` | Blood requests, patient tracking, order history, billing & payments. |
| **Donor** | `/donor/*` | Schedule donations, health check history, nearby blood bank discovery. |

---

## 🎨 Design System

We use a specific "Dark Premium" design language:
- **Red (Primary):** `var(--red)` (`#D90025`)
- **Background:** `var(--bg)` (`#0A0A12`)
- **Card Background:** `var(--card)` (`#0F0F17`)
- **Typography:** Satoshi (Headings) & Inter (Body)
- **Animations:** Use `motion.div` for page transitions (typically `initial={{ opacity: 0, y: 16 }}`).

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v16+)
- MySQL database
- npm or yarn

### Backend Setup
1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the backend directory with:
   ```env
   DB_HOST=your_mysql_host
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_database_name
   JWT_SECRET=your_jwt_secret_key
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   ```

4. **Database Setup:**
   Run the SQL script to initialize the database:
   ```bash
   mysql -u your_user -p your_database < db/init.sql
   ```

5. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup
1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

### Login Credentials
- **Admin:** Use admin role during login
- **Hospital:** Use hospital role
- **Blood Bank:** Use blood_bank role
- **Donor:** Use donor role

---

## 📡 API Documentation

### Authentication Endpoints
- `POST /auth/login` - User login (requires email, password, role)
- `POST /auth/register/donor` - Donor registration
- `POST /auth/register/hospital` - Hospital registration
- `POST /auth/register/blood-bank` - Blood bank registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### Admin Endpoints
- `GET /admin/blood-utilization` - Blood utilization analytics
- `GET /admin/donor-retention` - Donor retention metrics
- `GET /admin/hospital-performance` - Hospital performance data
- `GET /admin/blood-bank-efficiency` - Blood bank efficiency metrics
- `GET /admin/system-overview` - System-wide overview

### Blood Bank Endpoints
- `GET /blood-banks/:id/stock` - Get blood stock
- `PUT /blood-banks/:id/stock/:group` - Update blood stock
- `POST /blood-banks/:id/issues` - Issue blood
- `POST /blood-banks/:id/donors` - Record donation
- `POST /blood-banks/:id/health-checks` - Record health check

### Hospital Endpoints
- `GET /hospitals/:id/patients` - Get hospital patients
- `POST /hospitals/:id/patients` - Add patient
- `PUT /hospitals/:id/patients/:id` - Update patient
- `DELETE /hospitals/:id/patients/:id` - Delete patient
- `GET /hospitals/:id/requests` - Get blood requests
- `POST /hospitals/:id/requests` - Create blood request
- `PUT /hospitals/:id/requests/:id` - Update request status

### Donor Endpoints
- `GET /donors/:id/profile` - Get donor profile
- `PUT /donors/:id/profile` - Update donor profile
- `GET /donors/:id/donations` - Get donation history
- `GET /donors/:id/health-checks` - Get health check history

### Blood Request Endpoints
- `GET /blood-requests` - Get all requests (filtered by role)
- `PUT /blood-requests/:id` - Update request status

---

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test  # Note: Test script needs to be configured
```

### Frontend Testing
```bash
cd frontend
npm run lint  # ESLint checks
```

### Manual Testing
1. Start both backend and frontend servers
2. Test login with different roles
3. Verify CRUD operations for each portal
4. Check API responses using tools like Postman

---

## 📊 Mock Data System

The frontend includes a comprehensive mock data system in `src/data/` for development:
- `mockData.js`: Core data for users, hospitals, and blood banks
- `adminMockData.js`: Advanced data for admin analytics
- `hospitalMockData.js`: Hospital-specific mock data
- `bloodBankMockData.js`: Blood bank mock data

*Note: Mock data is used for UI development; production uses real API data.*

---

## 📍 Geographical Integration

The **Kerala Network Map** (`kerala-map.png`) is used in the Admin Dashboard and Donor "Find Bank" pages. It is styled with CSS filters to align with the dark theme.

---

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation and sanitization
- Secure cookie handling for refresh tokens

---

## 📝 Roadmap
- [ ] Phase 1-5: Portal UI Development
- [ ] Backend API Implementation
- [ ] Authentication & Authorization
- [ ] Database Integration
- [ ] Comprehensive Test Suite
- [ ] API Documentation (Swagger/OpenAPI)
- [ ] Production Deployment Guide
- [ ] Performance Optimization

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📄 License

This project is licensed under the ISC License.
