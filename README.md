# Smart Expense Tracker Website — Personal Finance Management

> **Engineering College Project Demonstration**  
> A full-stack, responsive personal finance management web application featuring automated expense tracking, budget monitoring, real-time analytics, and persistent SQLite storage.

---

## 📌 Project Overview
The **Smart Expense Tracker** empowers individuals to track income and expenses, monitor spending patterns, maintain category-wise monthly budgets, analyze financial health with interactive visualizations, and export financial summaries. 

Designed with a high-end dark navy and teal design system inspired by leading financial applications, it supports Indian Rupee (`₹`) formatting, role/user-isolated persistent storage, and responsive layouts across desktop, tablet, and mobile devices.

---

## 🛠️ Technology Stack
- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React (Icons), Recharts (Interactive Financial Visualizations), React Router DOM
- **Backend:** Node.js, Express.js (RESTful API), Parameterized SQLite (`node:sqlite`), JWT Authentication, bcryptjs password hashing, express-rate-limit
- **Database:** SQLite with relational integrity, foreign key cascades, indices, and ACID compliance
- **Currency Support:** Indian Rupee (`₹`) with Indian numbering format (e.g. `₹1,04,953.00`)

---

## 🏗️ Architecture & Core Principles

```
┌────────────────────────────────────────────────────────┐
│                   React 19 + Vite                      │
│   Tailwind CSS • Lucide Icons • Recharts Visualizer    │
│   AuthContext • Modular API Client • ₹ Indian Format   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / REST API (Port 5000)
┌───────────────────────────▼────────────────────────────┐
│                  Express.js Backend                    │
│   JWT Auth Middleware • Rate Limiting • Central Errors │
│   Auth, Transactions, Categories, Budgets, Reports     │
└───────────────────────────┬────────────────────────────┘
                            │ Parameterized Prepared Queries
┌───────────────────────────▼────────────────────────────┐
│             Persistent SQLite Database                 │
│      users • categories • transactions • budgets       │
│      ACID Transactions • Foreign Keys • WAL Mode       │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Implementation Roadmap (All Phases Completed)

- [x] **Phase 1: Project Scaffolding & Architecture**
  - [x] Clean directory structure setup (`backend/`, `frontend/`)
  - [x] Global runtime configuration and package scripts
  - [x] Initial project documentation and roadmap
- [x] **Phase 2: Backend Development & Database Layer**
  - [x] Relational schema (`users`, `categories`, `transactions`, `budgets`)
  - [x] Secure JWT authentication & bcryptjs password hashing
  - [x] Rate limiting on sensitive auth endpoints
  - [x] REST APIs for Auth, Transactions, Categories, Budgets, Reports, and Settings
  - [x] Automated test suite verifying all 12 backend endpoints (`test_api.js`)
  - [x] Multi-month demo database seeder (`npm run seed`)
- [x] **Phase 3: Frontend Architecture & UI Design System**
  - [x] Vite React application with Tailwind CSS configuration
  - [x] Dark navy (`#0B132B`, `#1C2541`), teal/emerald accents, crisp cards
  - [x] AuthContext with persistent tokens and automatic session recovery
  - [x] Indian Rupee (`₹`) currency and date formatting utilities
  - [x] Reusable component library (Modals, ConfirmDialog, StatCard, Badge, EmptyState, CategoryIcon)
- [x] **Phase 4: Application Pages & Features**
  - [x] Landing page with Hero, feature matrix, how-it-works, and quick demo credentials
  - [x] Auth pages (Login & Register with one-click Demo autofill)
  - [x] Dashboard (Available balance calculation, Income vs Expense chart, Category Donut, Monthly trend, Active budget progress, Recent transactions)
  - [x] Transactions page (CRUD, instant search, date range filter, type/category filter, multi-criteria sorting, pagination, CSV export)
  - [x] Categories management (Default & custom categories, color/icon picker, safe transaction reassignment, default restore)
  - [x] Budgets page (Monthly category allocation, live spent tracking, progress bars, warning >80% & exceeded >=100% alert states)
  - [x] Reports & Analytics (Monthly & Yearly analysis, cashflow time series, payment method distribution, highest spending leaderboard)
  - [x] Settings (Profile name, Opening balance configuration, password update, system metadata)
- [x] **Phase 5: End-to-End Verification & College Project Deliverables**
  - [x] Automated test suite covering all 10 core verification workflows (`verify_e2e.js`)
  - [x] Persistence validation across server restarts
  - [x] Multi-tenant isolation verified (Zero cross-user data exposure)

---

## 💻 Quick Start & Setup Instructions

### Prerequisites
- **Node.js** (v18, v20, or v24+)
- **npm** or **pnpm**

### 1. Database Seeding & Backend Startup
```bash
# Navigate to backend directory
cd backend

# Install dependencies (only once)
npm install

# Seed the database with 3 months of realistic demo records
npm run seed

# Start the Express server (runs on port 5000)
npm run dev
```

### 2. Frontend Startup
Open a second terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (only once)
npm install

# Start Vite React development server (runs on http://localhost:5173)
npm run dev
```

Visit **http://localhost:5173** in your web browser.

---

## 🔑 Demo Account Credentials

For college demonstration and evaluator review, a complete demo account with 3 months of financial records has been pre-seeded:

- **Email:** `demo@expensetracker.com`
- **Password:** `Demo@123`

*(You can also click the **"Fill Demo Login"** button on the Login page to autofill these credentials instantly!)*

### Pre-loaded Scenarios Demonstrated in Demo Data:
1. **August 2026:** High Savings Month (~59% savings rate, ₹53,200 saved).
2. **September 2026:** Overspending Month (electronics shopping + healthcare expenses resulting in a deficit).
3. **October 2026 (Current Month):** Active month with real-time budget warnings:
   - **Shopping:** Budget ₹10,000, Spent ₹14,200 (142% utilization -> **Exceeded Alert**).
   - **Food and Dining:** Budget ₹12,000, Spent ₹10,800 (90% utilization -> **Warning Alert**).
   - **Bills and Utilities:** Budget ₹6,000, Spent ₹4,300 (71.6% utilization -> **Normal/On Track**).

---

## 📐 Core Calculations

All financial values are computed directly from database transaction records:

1. **Total Income:**
   $$\text{Total Income} = \sum_{\text{selected period}} \text{Amount of Income Transactions}$$
2. **Total Expenses:**
   $$\text{Total Expenses} = \sum_{\text{selected period}} \text{Amount of Expense Transactions}$$
3. **Net Savings:**
   $$\text{Net Savings} = \text{Total Income} - \text{Total Expenses}$$
4. **Available Balance:**
   $$\text{Available Balance} = \text{Opening Balance} + \sum_{\text{all time}} \text{Income} - \sum_{\text{all time}} \text{Expenses}$$
5. **Budget Utilization Percentage:**
   $$\text{Utilization \%} = \left( \frac{\text{Amount Spent in Category for Month}}{\text{Budget Allocated}} \right) \times 100$$
   - **Normal State:** $< 80\%$ (Green)
   - **Warning State:** $80\% - 99.9\%$ (Amber)
   - **Exceeded State:** $\ge 100\%$ (Red Alert)

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new account & auto-provision default categories |
| `POST` | `/api/auth/login` | Authenticate and receive JWT token |
| `GET` | `/api/auth/me` | Fetch active user profile and preferences |
| `POST` | `/api/auth/change-password` | Update account password securely |

### Transactions (`/api/transactions`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/transactions` | Paginated list with search, date range, type & category filters |
| `GET` | `/api/transactions/:id` | Get details of a single transaction |
| `POST` | `/api/transactions` | Record a new income or expense transaction |
| `PUT` | `/api/transactions/:id` | Update an existing transaction |
| `DELETE` | `/api/transactions/:id` | Permanently delete a transaction |

### Categories (`/api/categories`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | Retrieve all user categories with transaction volume |
| `POST` | `/api/categories` | Create custom category with color and icon |
| `PUT` | `/api/categories/:id` | Update category details |
| `DELETE` | `/api/categories/:id` | Safely delete category with transaction reassignment |
| `POST` | `/api/categories/reset-defaults` | Restore missing default categories |

### Budgets (`/api/budgets`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/budgets?month=YYYY-MM` | Fetch category budgets with calculated spent & alert status |
| `POST` | `/api/budgets` | Create or update category monthly budget |
| `DELETE` | `/api/budgets/:id` | Delete a budget |

### Reports & Analytics (`/api/reports`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reports/overview` | Dashboard summary metrics, balance, trend & breakdown |
| `GET` | `/api/reports/analytics` | Time-series data, payment distribution, highest spending |
| `GET` | `/api/reports/export/csv` | Download filtered transaction history as CSV |

### Settings (`/api/settings`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/settings` | Retrieve user preferences and opening balance |
| `PUT` | `/api/settings` | Update user preferences and opening balance |

---

## 🧪 Testing & Quality Assurance Verification

An automated end-to-end verification script is included to test all mandatory workflows:

```bash
# Run the complete test suite
node backend/src/scripts/verify_e2e.js
```

### Verified Test Cases:
- [x] **Test 1:** Register and Log In.
- [x] **Test 2:** Add Income and Expense Transactions.
- [x] **Test 3:** Edit and Delete Transactions.
- [x] **Test 4:** Dashboard Calculations (Income, Expense, Net Savings, Available Balance with Opening Balance).
- [x] **Test 5:** Create and Exceed a Budget with Alert Triggers.
- [x] **Test 6:** Filter Transactions by Date Range and Category.
- [x] **Test 7:** Dynamic CSV Export generation and download.
- [x] **Test 8:** Data Persistence across server restart.
- [x] **Test 9:** Multi-Tenant Isolation (Unauthorized cross-user access rejected).
- [x] **Test 10:** Demo Account verified with multi-month data.

---

## 📂 Project Structure

```
finance/
├── package.json                 # Root script runner
├── README.md                    # Master documentation & guide
├── backend/
│   ├── .env.example             # Environment configuration template
│   ├── .env                     # Local configuration
│   ├── package.json             # Backend dependencies
│   ├── data/
│   │   └── expense_tracker.db   # Persistent SQLite Database
│   └── src/
│       ├── server.js            # Express application entry point
│       ├── config/
│       │   └── db.js            # SQLite connection, schema & default categories
│       ├── middleware/
│       │   ├── auth.js          # JWT authentication middleware
│       │   └── errorHandler.js  # Centralized error handler
│       ├── controllers/         # Business logic & query controllers
│       ├── routes/              # Express API route definitions
│       └── scripts/
│           ├── seed.js          # Multi-month demo account seeder
│           ├── test_api.js      # Backend API test suite
│           └── verify_e2e.js    # Comprehensive QA verification suite
└── frontend/
    ├── package.json             # Frontend dependencies
    ├── vite.config.js           # Vite server configuration & API proxy
    ├── tailwind.config.js       # Design tokens & color palette
    ├── index.html               # Main HTML entry with Inter font
    └── src/
        ├── main.jsx             # React DOM entry point
        ├── App.jsx              # Router & route protections
        ├── index.css            # Tailwind directives & sleek scrollbar
        ├── api/                 # Modular API service wrappers
        ├── context/             # AuthContext (state & tokens)
        ├── utils/               # Currency (₹) & date formatters
        ├── components/
        │   ├── common/          # Modal, ConfirmModal, StatCard, Badge, EmptyState
        │   └── layout/          # Sidebar, Navbar, AppLayout
        └── pages/               # LandingPage, Login, Register, Dashboard,
                                 # Transactions, Categories, Budgets, Reports, Settings
```

---

## 🎓 College Demonstration Guide

1. **Start the backend:** `cd backend && npm run dev`
2. **Start the frontend:** `cd frontend && npm run dev`
3. **Open browser:** Go to `http://localhost:5173`.
4. **Landing Page:** Showcase the hero section, core feature highlights, and how it works.
5. **Login:** Click "Explore Demo Account" or "Fill Demo Login" on the Login page to authenticate with `demo@expensetracker.com`.
6. **Dashboard:**
   - Review the summary cards: Available Balance, Income, Expense, Net Savings.
   - Show the Monthly Spending & Income Bar Chart.
   - Point out the Spending Breakdown Donut Chart.
   - Highlight the Budget Progress cards showing warning and exceeded states.
7. **Transactions:**
   - Add a new transaction (+ Add Transaction button).
   - Filter by category or search by description (e.g. "Swiggy" or "Rent").
   - Click "Export CSV" to demonstrate report downloading.
   - Edit a transaction and observe instant dashboard balance update.
8. **Budgets:**
   - View category budgets with progress bars and color-coded alert statuses.
   - Create or edit a budget limit to demonstrate real-time percentage recalculation.
9. **Categories:**
   - Showcase pre-configured categories and add a custom category with custom icon and color.
10. **Reports & Analytics:**
   - Toggle between Monthly and Yearly views.
   - Review payment method distribution and category spending leaderboard.
11. **Settings:**
    - Adjust opening balance and demonstrate that Available Balance updates correctly.
