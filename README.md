# 🎓 Smart School Management System (SaaS Enterprise Platform)

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://reactjs.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/)

**Smart School Management System (SMS)** is an enterprise-grade, cloud-native School ERP & SaaS platform engineered to digitize, automate, and streamline the end-to-end academic and administrative workflows of K-12 schools, colleges, and educational institutions.

Built with modern MERN architecture, responsive glassmorphic UI, and multi-role access control, the system transforms paper-heavy school administration into a seamless, automated digital ecosystem.

---

## 💡 What Problems Does This Software Solve?

Traditional educational institutions struggle with manual paperwork, disjointed communication, and inefficient administrative processes. **Smart School ERP** directly solves these pain points:

| Traditional School Pain Points | Smart School ERP Solution |
| :--- | :--- |
| **Hours Wasted on Certificate Drafting** <br>Handwriting Leaving Certificates (LC) and Bonafide Certificates is slow, error-prone, and repetitive. | **1-Click PDF Certificate Generator** <br>Generates official, beautifully formatted LC and Bonafide PDF certificates instantly (`jsPDF`) complete with auto-converted birth dates in words and official seals. |
| **Manual Student Data Entry** <br>Enrolling hundreds of new scholars at the start of an academic year takes weeks of data entry. | **Instant Bulk Excel Import** <br>Import up to 1,000 student or staff records in a single click using structured Excel templates (`xlsx`). |
| **Duplicate & Conflicting GR Numbers** <br>Manual General Register (GR) assignment leads to duplicate numbers and compliance audit failures. | **Smart Auto-Incrementing GR Engine** <br>Automatically fetches and assigns the next sequential GR number for new enrollments per school. |
| **Lost Official Records & Documents** <br>Paper affiliation certificates, audit records, and legal files get damaged or mislaid. | **Institutional Document Vault** <br>Secure, cloud-stored document repository with automatic client-side image compression (<300KB) and role-scoped retrieval. |
| **Tedious Attendance & Marks Recordkeeping** <br>Teachers spend valuable classroom time filling physical registers and computing exam grades manually. | **Bulk Attendance & Marks Portal** <br>Interactive matrix UI allowing teachers to mark attendance or record exam scores for an entire class in seconds. |
| **Unresolved Complaints & Poor Visibility** <br>Student grievances and administrative notices get buried in paperwork or lost on physical notice boards. | **Digital Notice Board & Ticketing System** <br>Real-time announcement broadcasts and an automated student complaint portal with status tracking. |
| **Super Admin Onboarding Overhead** <br>Difficulty onboarding new school branches and managing software subscriptions across multiple campuses. | **Centralized SaaS Super Admin Portal** <br>Managed demo request workflow, automated email invitations (`Nodemailer`), Razorpay payment integration, and tenant management. |

---

## 🚀 Key Benefits to Educational Institutions

### ⏱️ 1. Up to 90% Reduction in Administrative Time
- **Automated Document Generation:** Issue official School Leaving Certificates (LC) and Bonafide Certificates in seconds instead of hours.
- **Mass Enrollment:** Onboard entire academic cohorts in minutes via Excel uploads.
- **Sequential Registration:** Zero-friction student entry allowing admins to add multiple scholars sequentially without re-authenticating.

### 🛡️ 2. Total Compliance & Data Integrity
- **Audit-Ready Registers:** Maintain flawless General Register (GR) numbers, Unique Identification (UID), PEN numbers, and demographic details.
- **Secure Cloud Storage:** Protect legal, financial, and academic records in an encrypted document vault.
- **Role-Based Isolation:** Multi-tenant architecture ensuring data privacy between different school branches.

### 💰 3. Reduced Operational & Printing Costs
- Eliminate thousands of paper forms, physical registers, and printed certificate templates.
- Digital fee tracking and receipt logging lower administrative bookkeeping costs.

### 📊 4. Real-Time Insights & Operational Visibility
- Live dashboards for School Principals, Teachers, Students, and SaaS Super Admins.
- Interactive charts (`Recharts`) summarizing student strength, gender distribution, attendance trends, and academic performance.

---

## 👥 Multi-Role Access Control Architecture

The platform provides dedicated, scoped portals tailored to four primary user roles:

```
                          ┌──────────────────────────┐
                          │   SUPER ADMIN PORTAL     │
                          │ (SaaS Subscription & ERP)│
                          └─────────────┬────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
┌──────────────────────────┐ ┌──────────────────────────┐ ┌──────────────────────────┐
│   SCHOOL ADMIN PORTAL    │ │      TEACHER PORTAL      │ │  STUDENT & PARENT PORTAL │
│ (Operations & Registry)  │ │(Academics & Attendance)  │ │ (Grades, Fees & Notices) │
└──────────────────────────┘ └──────────────────────────┘ └──────────────────────────┘
```

### 1. 🌐 Super Admin (SaaS Platform Owner)
- Oversees multi-school SaaS ecosystem & demo requests.
- Provisions new school accounts with custom plans (Basic, Standard, Enterprise).
- Tracks platform analytics, total active schools, and revenue metrics.
- Integrates payment gateways (**Razorpay**) and automated onboarding emails (**Nodemailer**).

### 2. 🏛️ School Admin (Principal / Management)
- Complete administrative control over classes, subjects, teachers, and students.
- Automated GR Number generation and instant bulk Excel student import.
- Instant PDF generation for **School Leaving Certificates (LC)** and **Bonafide Certificates**.
- **Institutional Document Vault** for storing legal, academic, and accreditation files safely.
- School notice broadcasting and complaint resolution system.

### 3. 👩‍🏫 Teacher / Educator
- View assigned classes and subjects.
- Mark bulk daily attendance for student cohorts.
- Input and update bulk exam marks with automated grade summaries.
- View class rosters and individual student profiles.

### 4. 🎓 Student / Parent
- Personal profile dashboard displaying enrollment info and academic records.
- Real-time subject-wise attendance tracking and exam performance reports.
- Access digital campus Notice Board.
- Submit complaints/grievances and track resolution progress.

---

## 🎨 Design & User Experience (UX)

- **Modern Aesthetics:** Elegant glassmorphic styling, curated serif/sans-serif typography, subtle box-shadows, and harmonized color palettes.
- **Micro-Animations:** Fluid layout transitions powered by **Framer Motion**.
- **Responsive Layout:** Works seamlessly across desktop monitors, laptops, tablets, and smartphones.
- **Client-Side Optimization:** Automatic image compression canvas engine for ultra-fast document uploads on cloud hosting environments.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React.js (v18)
- **State Management:** Redux Toolkit
- **UI Component Library:** Material-UI (MUI v5) & Styled Components
- **Animations:** Framer Motion
- **Data Visualization:** Recharts
- **PDF Generation:** `jsPDF` & `jspdf-autotable`
- **Routing:** React Router DOM (v6)
- **Icons:** MUI Icons Material

### Backend
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB Atlas & Mongoose ODM
- **Authentication:** JSON Web Token (JWT) & `bcrypt` password hashing
- **File Processing:** `Multer` (Memory Storage) & `xlsx` (Excel parsing)
- **Payment Gateway:** Razorpay API & Webhook Verification
- **Email Service:** Nodemailer (SMTP)

---

## 📁 Repository Structure

```
SMS/
├── backend/
│   ├── controllers/         # Business logic for Admin, Student, Teacher, Docs, etc.
│   ├── middleware/          # JWT verification & role authorization middleware
│   ├── models/              # Mongoose schemas (Student, Teacher, Document, etc.)
│   ├── routes/              # Express API endpoints
│   ├── utils/               # Helper utilities & configuration
│   └── index.js             # Express server entry point
│
└── frontend/
    ├── public/              # Static assets & HTML template
    └── src/
        ├── components/      # Reusable UI components (Popup, Certificate Modal, etc.)
        ├── pages/
        │   ├── admin/       # School Admin pages (AddStudent, SchoolDocuments, etc.)
        │   ├── student/     # Student Portal pages
        │   ├── superadmin/  # SaaS Super Admin pages
        │   └── teacher/     # Teacher Portal pages
        ├── redux/           # Redux slices & handles
        └── utils/           # API configuration & helper functions
```

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js**: v16.x or higher
- **npm** or **yarn**
- **MongoDB**: Local instance or MongoDB Atlas connection URI

### 1. Clone the Repository
```bash
git clone https://github.com/OmkarDeshmukh16/School-Management-System.git
cd School-Management-System
```

### 2. Configure & Start Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/SMS?retryWrites=true&w=majority
SECRET_KEY=your_jwt_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_USER=your_email@domain.com
EMAIL_PASS=your_email_app_password
```

Run the backend server:
```bash
npm start
```

### 3. Configure & Start Frontend

```bash
cd ../frontend
npm install
```

Run the React development server:
```bash
npm start
```
The application will launch automatically at `http://localhost:3000`.

---

## ☁️ Deployment Guide

### Deploying on Vercel / Render / AWS
1. **Frontend Base URL:** The frontend automatically uses relative API endpoints when hosted on the same origin. For separate domain deployments, set `REACT_APP_BASE_URL` in environment variables.
2. **Serverless Compatibility:** The backend uses `multer.memoryStorage()`, making it fully compatible with read-only serverless file systems (Vercel Functions, AWS Lambda, Netlify).
3. **Payload Limits:** Uploaded image files in the Document Vault are compressed client-side (<300KB), ensuring compliance with serverless payload limits (4.5MB).

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.

---

<p align="center">
  Crafted with ❤️ for modern educational institutions.
</p>
