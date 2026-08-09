# CampusCare – University Complaint Portal 🎓

**CampusCare** is a modern, responsive, SaaS-style single-page web application (SPA) designed for universities and colleges to streamline student complaint submission, real-time status tracking, and administrative resolution workflows.

---

## ✨ Key Features

### 👨‍🎓 Student Features
- **Interactive Dashboard**: Welcome banner, quick statistics, and recent complaints overview.
- **Complaint Submission**: Comprehensive form with category selection, location details, priority assignment, date picker, file/evidence upload support, and optional contact info.
- **Auto-Generated Complaint IDs**: Instant ID generation in format `CMP-YYYY-NNNNN`.
- **My Complaints**: Search bar, category filter, status filter, priority filter, and multi-field sorting (newest/oldest, priority).
- **Complaint Details & Visual Timeline**: Detailed complaint history with a dynamic multi-step status timeline (`Submitted` → `Reviewed` → `Assigned` → `In Progress` → `Resolved`).
- **Student Feedback**: Star rating and review system for resolved complaints.
- **In-App Notifications**: Real-time notification system with badge count alerts for status updates and department assignments.
- **Student Profile**: View and edit user details (Name, Course, Year, Phone).
- **Help & Support**: Comprehensive FAQ section, complaint guidelines, and campus contact directory.

### 👨‍💼 Admin Features
- **Admin Dashboard**: Overview of key statistics, urgent alerts, and interactive CSS/SVG data charts (Status Distribution Donut Chart & Monthly Trend Bar Chart).
- **All Complaints Management**: Filterable and sortable table listing all student complaints across campus.
- **Complaint Resolution & Management**: Change complaint status (`Pending`, `In Progress`, `Resolved`), assign departments, alter priority levels, add internal admin notes, and write resolution messages.
- **Urgent Complaints Monitor**: Dedicated view focusing strictly on critical and high-priority pending issues.
- **Departments Directory**: Overview of all campus departments, assigned heads, and resolution metrics.
- **Students Directory**: Overview of enrolled students and their complaint resolution statistics.
- **Analytics & Reports**: Visual reports broken down by status, category, monthly trends, and department resolution rates.
- **Settings**: Appearance toggle (Light/Dark mode), notification preferences, and data reset options.

---

## 🎨 Design System & UX

- **Color Palette**: Deep Blue (`#1a365d`), Teal/Cyan (`#0d9488`), Success Green (`#22c55e`), Warning Amber (`#f59e0b`), and Urgent Red (`#ef4444`).
- **Responsive Layout**: Sidebar + Header for desktop, collapsible drawer overlay and card-based table transformations for mobile and tablet screens.
- **Theme**: Dark/Light mode support with CSS custom properties.
- **Data Persistence**: Powered by `localStorage` for offline-first demo persistence.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+)
- **Architecture**: Single Page Application (SPA) with Hash Routing
- **Icons**: Font Awesome 6
- **Typography**: Google Fonts (Inter)
- **Data Layer**: Web Storage API (`localStorage`)

---

## 🔑 Demo Credentials

### 🎓 Student Login
- **Email**: `student@university.edu`
- **Password**: `student123`

### 🛡️ Admin Login
- **Email**: `admin@university.edu`
- **Password**: `admin123`

---

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shrutiyadav-ai/CampusCare.git
   cd CampusCare
   ```

2. **Run locally**:
   Simply open `index.html` in any web browser, or serve using any static web server (e.g. VS Code Live Server, `npx http-server`, `python -m http.server`).

---

## 📄 Project Structure

```text
CampusCare/
├── index.html            # SPA Entry Point & HTML Shell
├── README.md             # Documentation
├── css/
│   └── style.css         # Complete Design System & Component Styles
└── js/
    ├── app.js            # Router, Init & Event Delegation
    ├── auth.js           # Authentication & Session Management
    ├── complaints.js     # Complaint CRUD, Filters & Search Logic
    ├── admin.js          # Admin Actions & Data Aggregations
    ├── notifications.js  # Notification Engine
    ├── charts.js         # SVG/CSS Chart Renderers
    ├── data.js           # Data Storage & Pre-seeded Sample Data
    ├── utils.js          # Toasts, Modals, Validation & Formatting
    └── views.js          # Component Views & HTML Templates
```

---

## 📜 License

MIT License © 2026 CampusCare
