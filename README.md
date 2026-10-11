# ImpactHub AI — Connect. Act. Create Impact.

**ImpactHub AI** is an end-to-end full-stack MERN social-impact platform designed with a warm editorial aesthetic. It bridges the gap between scattered community volunteering opportunities and verified, measurable real-world outcomes.

Unlike superficial social platforms or static landing pages, ImpactHub AI enforces the fundamental integrity rule:
> **Discover → Connect → Join → Participate → Verify → Measure Impact**  
> *Joining an initiative registers intent. Only organizer-reviewed on-site evidence creates verified volunteer hours and authoritative impact badges.*

---

## 1. Technology Architecture (Strict MERN Stack)

- **Frontend**: React.js 18 (Vite SPA, JavaScript) with custom warm editorial CSS design system (zero component libraries / no Tailwind).
- **Backend**: Node.js & Express.js REST API with modular MVC architecture.
- **Database**: MongoDB with MongoDB Atlas & Mongoose ODM (with automated schema indexing and authoritative aggregations).
- **Authentication**: Stateless JWT with bcrypt password hashing and cryptographic reset tokens.
- **Explainable AI Engine**: Pure Node.js rule-based heuristic recommendation and opportunity-gap engine (no external paid AI APIs or Python microservices).
- **Security**: Helmet security headers, CORS origin whitelisting, Express Rate Limiting, role authorization guards.

---

## 2. Directory Structure

```
ImpactHub-AI_new/
├── client/                     # Vite + React 18 SPA (JavaScript, Pure CSS)
│   ├── public/                 # Static assets, SVG icons, favicon.svg
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Navbar, Footer, Icons, ReportModal
│   │   │   └── initiative/     # InitiativeCard
│   │   ├── context/            # AuthContext, NotificationContext
│   │   ├── layouts/            # MainLayout
│   │   ├── pages/              # 20 Complete Application Pages
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   ├── DiscoverPage.jsx
│   │   │   ├── InitiativeDetailPage.jsx
│   │   │   ├── CreateInitiativePage.jsx
│   │   │   ├── CommunityFeedPage.jsx
│   │   │   ├── MyActivitiesPage.jsx
│   │   │   ├── ImpactDashboardPage.jsx
│   │   │   ├── AiActionAssistantPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── UserProfilePage.jsx
│   │   │   ├── OrgProfilePage.jsx
│   │   │   ├── OrgDashboardPage.jsx
│   │   │   ├── OrgVerificationPage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── routes/             # ProtectedRoute, RoleRoute
│   │   ├── services/           # api.js, authService, initiativeService, etc.
│   │   ├── styles/             # design-system.css, components.css, pages.css
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json             # SPA routing rewrite configuration
│   └── .env.example
├── server/                     # Node.js + Express REST API
│   ├── config/                 # db.js, env.js
│   ├── controllers/            # auth, user, org, initiative, participation, impact, feed, ai, admin
│   ├── middleware/             # auth.js, roleGuard.js, rateLimiter.js, errorHandler.js, validation.js
│   ├── models/                 # User, Organization, Initiative, Participation, ImpactRecord, Post, Comment, Follow, Notification, Report, AuditLog, PasswordResetToken
│   ├── routes/                 # auth, users, orgs, initiatives, participations, impact, feed, ai, admin, health
│   ├── services/               # recommendationEngine.js, impactAggregator.js, aiActionService.js, auditService.js, notificationService.js
│   ├── utils/                  # tokenUtils.js, validators.js
│   ├── scripts/                # seedAdmin.js, seedData.js
│   ├── tests/                  # api.test.js (Automated Node test suite)
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── README.md
└── .gitignore
```

---

## 3. Required User Roles & Portals

### A. Individual / Student / Volunteer
- Register, login, manage profile, bio, skills, interests, and schedule availability.
- Discover causes with search and multi-factor filters (cause, city, skill, date).
- Join initiatives with capacity tracking and cancellation safeguards.
- Submit on-the-ground completion evidence (hours claimed, outcome notes, photo links).
- View verified volunteer hours, milestone badges, and activity ledger.
- Participate in community feed discussions (posts, likes, comments, follows).
- Access personalized AI recommendations and the "What Can I Do?" wizard.

### B. Community Organization / NGO
- Register organization with name, category, headquarters, and mission description.
- Submit registration documents for administrative review.
- Access organizer portal to draft, publish, and close initiatives with volunteer limits.
- Manage volunteer registrations and attendance.
- Review submitted evidence with **Approve** or **Reject** decisions (recording reasons).
- Leverage the AI Initiative Creation Assistant for structured draft generation.

### C. Platform Administrator
- Protected governance dashboard (`/admin`) guarded by server-side role validation.
- Real-time platform overview calculated from authoritative database records.
- Approve or reject organization verification requests with recorded audit notes.
- Moderate user accounts (suspend / restore).
- Review and resolve community moderation and spam reports.
- Comprehensive administrative audit trail (`AuditLog`) tracking all sensitive operations.

---

## 4. Environment Variables

### Backend (`server/.env`)
```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.mongodb.net/impacthub?retryWrites=true&w=majority
JWT_SECRET=impacthub_super_secret_jwt_key_development_32chars_min
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@impacthub.ai
ADMIN_PASSWORD=Admin@ImpactHub2026!
```

### Frontend (`client/.env`)
```ini
VITE_API_URL=http://localhost:5000/api
```

---

## 5. Local Setup and Execution

### Prerequisites
- Node.js v18+ (tested on v25.6.0)
- npm v9+

### 1. Backend Server Setup
```bash
cd server
npm install
npm test            # Run automated backend test suite
node server.js      # Runs server on http://localhost:5000
```

### 2. Frontend Client Setup
```bash
cd client
npm install
npm run build       # Validates production Vite build
npm run dev         # Starts dev server on http://127.0.0.1:5173
```

### 3. Pre-Seeded Demo Accounts
For immediate testing and verification, use the pre-configured accounts:
- **Volunteer**: `ananya.sharma@example.com` | `VolunteerPass1!`
- **Organization**: `aahaar@impacthub.ai` | `OrgPassword2026!`
- **Platform Admin**: `admin@impacthub.ai` | `Admin@ImpactHub2026!`

*(Convenient one-click quick-fill buttons are provided on the Login page).*

---

## 6. Important API Endpoints

| Method | Endpoint | Description | Role / Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & database connection state | Public |
| `POST` | `/api/auth/register` | Register user (Individual or Organization) | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | Public |
| `GET` | `/api/auth/me` | Fetch active user & organization profile | Authenticated |
| `POST` | `/api/auth/forgot-password` | Request password reset token | Public |
| `POST` | `/api/auth/reset-password` | Set new password using token | Public |
| `GET` | `/api/initiatives` | Discover initiatives with filters & search | Public |
| `POST` | `/api/initiatives` | Create/publish new initiative | Organization / Admin |
| `POST` | `/api/participations/:id/join` | Join an initiative (capacity checked) | Authenticated |
| `POST` | `/api/participations/:id/submit-evidence` | Submit completion proof & claimed hours | Authenticated |
| `POST` | `/api/participations/:id/verify` | Organization review (Approve / Reject) | Org Owner / Admin |
| `GET` | `/api/impact/my-dashboard` | Verified hours, badges, and cause share | Authenticated |
| `GET` | `/api/impact/platform-overview` | Aggregated platform-wide verified impact | Public |
| `GET` | `/api/ai/recommendations` | Explainable multi-factor initiative scoring | Public / Authenticated |
| `POST` | `/api/ai/what-can-i-do` | Interactive action wizard & DIY guides | Public |
| `POST` | `/api/ai/occasion-ideas` | Birthday & milestone impact idea generator | Public |
| `GET` | `/api/ai/gap-insights` | Cause coverage & under-served analysis | Public |
| `POST` | `/api/ai/assist-draft` | NGO initiative creation draft assistant | Authenticated |
| `GET` | `/api/admin/overview` | Platform totals & moderation statistics | Admin Only |
| `PUT` | `/api/admin/organizations/:id/verify` | Approve or reject NGO verification | Admin Only |
| `PUT` | `/api/admin/users/:id/status` | Suspend or restore user accounts | Admin Only |
| `GET` | `/api/admin/audit-logs` | Immutable administrative audit ledger | Admin Only |

---

## 7. Deployment Guide

### A. MongoDB Atlas Configuration
1. Log in to [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a Project and launch a free shared cluster (M0).
3. Under **Database Access**, create a database user with read/write permissions and a strong password.
4. Under **Network Access**, add an IP Access List entry. For cloud deployment on Render, add `0.0.0.0/0` (or specify Render's outbound IP ranges).
5. Click **Connect** → **Drivers** (Node.js) and copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/impacthub?retryWrites=true&w=majority
   ```
6. Set this value as `MONGODB_URI` in the backend environment.

### B. Backend Deployment on Render
1. Create a new **Web Service** on [Render](https://render.com) connected to your GitHub repository.
2. Configure settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
3. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or leave default, Render sets `PORT` automatically)
   - `MONGODB_URI`: *Your MongoDB Atlas connection URI*
   - `JWT_SECRET`: *A secure random string (at least 32 characters)*
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: *Your deployed Vercel frontend URL (e.g. `https://impacthub-ai.vercel.app`)*
   - `ADMIN_EMAIL`: `admin@impacthub.ai`
   - `ADMIN_PASSWORD`: *Strong production admin password*
4. Deploy the service. Verify deployment using `https://your-render-service.onrender.com/api/health`.

### C. Frontend Deployment on Vercel
1. Import the repository on [Vercel](https://vercel.com).
2. Configure settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-render-service.onrender.com/api`
4. The repository includes `client/vercel.json` configured with SPA rewrites (`"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]`) to ensure direct route refreshes and deep links resolve correctly.
5. Deploy the project. Confirm that direct navigation to `/initiatives`, `/feed`, and `/impact-dashboard` works smoothly.

---

## 8. Verification & Testing Results

The automated integration test suite (`npm test` in `server`) validates all core operations:
```
✔ 1. Health check endpoint reports database status (127ms)
✔ 2. Authentication flow & role guard invariants (247ms)
✔ 3. End-to-End Participation, Evidence Submission & Verification Workflow (353ms)
✔ 4. Transparent AI Recommendation & Assistant Engine (24ms)

tests 4 | suites 0 | pass 4 | fail 0 | cancelled 0
```
- **Invariants Verified**:
  - Joining an initiative registers participation but **does not** increase verified hours.
  - Unverified or pending submissions **do not** increase verified totals.
  - Organization verification approval generates an authoritative `ImpactRecord` and updates volunteer stats.
  - Duplicate verification attempts are rejected with idempotent safety.
  - Public registration strictly prevents selecting the administrator role.
  - All metrics displayed in dashboards originate directly from database queries.

---

## 9. License & Integrity Commitment
ImpactHub AI is released under the **MIT License**. The platform strictly adheres to zero-fabrication metrics standards to restore trust and transparency to social service.
