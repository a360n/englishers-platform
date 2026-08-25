<div align="center">

# englishers-platform — Enterprise Academy Management & Cryptographic Ledger System

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_14+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Cryptography](https://img.shields.io/badge/Security-HMAC--SHA256_Signatures-critical?style=for-the-badge&logo=auth0&logoColor=white)](https://nodejs.org/api/crypto.html)
[![PDFKit](https://img.shields.io/badge/Documents-PDFKit_Engine-red?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)](https://pdfkit.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<p align="center">
  A high-concurrency educational enterprise resource planning (ERP) platform and financial ledger engineered with <b>Express.js</b>, <b>PostgreSQL</b>, <b>HMAC-SHA256 cryptographic receipt signing</b>, and automated <b>PDF forensic verification</b>.
</p>

</div>

---

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Key Features](#key-features)
- [Cryptographic Receipt Verification](#cryptographic-receipt-verification)
- [Database Schema & Data Modeling](#database-schema--data-modeling)
- [API Reference](#api-reference)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Author & License](#author--license)

---

## Overview

**englishers-platform** is a full-stack institutional management system built for educational academies and language institutes. The platform unifies student admissions, placement level grading, course scheduling, attendance auditing, installment tracking, and payment processing into a secure, role-restricted web application.

### Core Problems Solved
- **Anti-Tamper Financial Auditing:** Eliminates receipt fraud by embedding cryptographic HMAC-SHA256 signatures and QR verification hashes directly into generated PDF receipts.
- **Automated Forensic Verification:** Integrated parser (`verifier.js`) that analyzes uploaded receipt PDFs, reconstructs payload signatures, and checks validity against the PostgreSQL ledger.
- **Relational Integrity & Financial Precision:** PostgreSQL database enforcing strict financial constraints, cascade delete rules, and installment reconciliation.

---

## System Architecture

```mermaid
flowchart TD
    subgraph Client["Client Interface (HTML5 / ES6+ / FontAwesome)"]
        UI["SPA Web Interface (public/js/app.js)"]
        Scanner["PDF Receipt Verification Portal"]
    end

    subgraph Server["Express.js Application Server (server.js)"]
        AuthMiddleware["Session & RBAC Middleware
(bcryptjs / express-session)"]
        StudentController["Student & Admission Service"]
        CourseController["Course & Attendance Service"]
        FinanceController["Financial Ledger & Installment Engine"]
        PDFEngine["PDFKit Document Generator
(utils/pdf.js)"]
        VerifyEngine["Forensic PDF Verifier
(utils/verifier.js)"]
    end

    subgraph Security["Security & Cryptographic Primitives"]
        HMAC["HMAC-SHA256 Signature Engine"]
        QRGen["Dynamic QR Code Generator"]
    end

    subgraph Database["Relational Persistence Layer (PostgreSQL)"]
        StudentsTable["students (Demographics & Fees)"]
        CoursesTable["courses & attendance"]
        InstallmentsTable["student_installments & custom_dues"]
        PaymentsTable["payments (Ledger & Signatures)"]
    end

    UI -->|HTTP / JSON| AuthMiddleware
    AuthMiddleware --> StudentController & CourseController & FinanceController
    FinanceController --> PDFEngine
    PDFEngine --> HMAC
    HMAC --> QRGen
    QRGen --> PDFEngine
    FinanceController --> PaymentsTable & InstallmentsTable
    StudentController --> StudentsTable
    CourseController --> CoursesTable
    Scanner -->|Upload Receipt PDF| VerifyEngine
    VerifyEngine --> HMAC
    VerifyEngine -.->|Audit Query| PaymentsTable
```

---

## Key Features

### 1. Student Lifecycle & Placement Management
- Complete student intake workflow tracking personal demographics, contact info, study intent, and CEFR proficiency levels (`A1`, `A2`, `B1`, `B2`).
- Flexible shift scheduling (Morning, Afternoon, Evening) and study mode options (`in_person` or `online`).
- Automated graduation and withdrawal state tracking.

### 2. Course Scheduling & Attendance Auditing
- Modular course assignment engine supporting odd/even scheduling systems (`even`: Sat/Mon/Wed | `odd`: Sun/Tue/Thu).
- Granular per-session attendance tracking (`attendance`) linked directly to student transcripts.

### 3. Installment Engine & Flexible Payment Plans
- Dual payment plan architecture (`cash` vs `installment`).
- Automated generation of monthly installment schedules (`student_installments`) with due dates, payment status (`unpaid`, `partially_paid`, `paid`), and lecture balance limits.
- Support for arbitrary custom dues (curriculum fees, registration fees, workshops).

### 4. Role-Based Access Control (RBAC)
- Multi-tier permission levels:
  - **`manager`**: Full financial ledger control, user management, and institutional analytics.
  - **`admin`**: Student registration, course assignments, and payment collection.
  - **`teacher`**: Attendance logging and class rosters.
  - **`student`**: Self-service profile, attendance records, and installment status.

---

## Cryptographic Receipt Verification

To prevent forged receipts, all generated payment vouchers are cryptographically sealed at the time of transaction creation:

### 1. Signature Generation (`utils/pdf.js`)
A deterministic data string is constructed and signed using an HMAC-SHA256 key:
$$	ext{Data String} = 	exttt{"Serial:\{ID\}|Student:\{Name\}|Amount:\{Amount\}|Date:\{Date\}"}$$
$$	ext{Signature} = 	ext{HMAC-SHA256}(	ext{Data String}, 	ext{Secret Key})$$

The signature is stored in the `payments` table and embedded both in text and inside a high-density QR code rendered onto the generated A5 PDF receipt.

### 2. Automated Forensic Verification (`utils/verifier.js`)
When an administrator uploads a physical or digital PDF receipt:
1. `pdf-parse` extracts raw text streams and parses the receipt serial number and metadata.
2. The verification engine re-derives the cryptographic HMAC signature from extracted values.
3. The signature is compared with constant-time equality against the database record to confirm zero alteration.

---

## Database Schema & Data Modeling

```mermaid
erDiagram
    students ||--o{ users : "has login account"
    students ||--o{ course_students : "enrolled in"
    courses ||--o{ course_students : "contains"
    courses ||--o{ attendance : "logs"
    students ||--o{ attendance : "recorded for"
    students ||--o{ payments : "makes payments"
    students ||--o{ student_installments : "scheduled for"
    students ||--o{ student_custom_dues : "charged for"
    courses ||--o{ course_dates : "scheduled on"

    students {
        int id PK
        string name
        string national_id UK
        string level
        string period
        numeric total_due
        numeric total_paid
        string payment_plan
        string status
    }

    payments {
        int id PK
        int student_id FK
        numeric amount
        string payment_type
        string signature
        timestamp created_at
    }

    student_installments {
        int id PK
        int student_id FK
        int month_index
        date due_date
        numeric amount
        numeric paid_amount
        string status
    }

    courses {
        int id PK
        string name
        string teacher
        string schedule_type
        string time_slot
    }
```

---

## API Reference

### Authentication & Users
- `POST /api/login` — Authenticate user and initialize secure session.
- `POST /api/logout` — Terminate session.
- `GET /api/me` — Retrieve current session profile and RBAC role.

### Student Management
- `GET /api/students` — Query student directory with pagination and filters.
- `POST /api/students` — Register new student with placement data.
- `PUT /api/students/:id` — Update demographic and fee configurations.
- `DELETE /api/students/:id` — Cascade delete student record.

### Financials & Receipts
- `POST /api/payments` — Log payment, generate cryptographic signature, and return A5 PDF receipt.
- `GET /api/receipts/:id` — Download student or admin copy of payment receipt.
- `POST /api/verify-receipt` — Multipart upload of PDF receipt for forensic tamper analysis.

---

## Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v18+) | JavaScript Asynchronous Runtime |
| **Framework** | Express.js 5.x | High-Performance Web Server & API Framework |
| **Database** | PostgreSQL | ACID-Compliant Relational Database |
| **Document Engine** | PDFKit | Vector & Bilingual PDF Generation |
| **PDF Extraction** | pdf-parse | Forensic Text Stream Extraction |
| **Cryptography** | Node.js `crypto` / `bcryptjs` | HMAC-SHA256 Signatures & Password Hashing |
| **Frontend** | Vanilla JS / CSS3 / FontAwesome | Responsive SPA Interface |

---

## Project Structure

```
englishers-platform/
├── server.js                        # Express Application Entry & Routes
├── package.json                     # Node Dependencies & Build Scripts
├── .env                             # Environment Variables (Database & Secret)
├── db/                              # Database Management
│   ├── schema.sql                   # Relational Schema Definition
│   ├── index.js                     # PostgreSQL Connection Pool (pg)
│   └── seed.js                      # Initial Data Seeding Script
├── utils/                           # Core Utilities
│   ├── pdf.js                       # PDFKit Bilingual Receipt Generator
│   └── verifier.js                  # PDF Signature Extraction & Verification Engine
├── public/                          # Static Frontend Assets
│   ├── index.html                   # SPA Dashboard Interface
│   ├── splash.html                  # Brand Intro Screen
│   ├── css/style.css                # Custom Responsive Theme
│   ├── js/app.js                    # Client MVC Logic & API Calls
│   └── uploads/                     # Student Profile Avatars
├── receipts/                        # Output Archive for Generated Receipts
│   ├── student/                     # Student Copy PDFs
│   └── admin/                       # Admin Audit Copy PDFs
└── scripts/                         # Utility & Build Automation
    ├── build_protected.js           # Production Obfuscation Script
    └── test-verification.js         # Forensic Test Harness
```

---

## Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- PostgreSQL 14+ running locally or in Docker

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/a360n/englishers-platform.git
   cd englishers-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   DATABASE_URL=postgres://postgres:password@localhost:5432/englishers_db
   RECEIPT_SECRET=your_super_secret_hmac_sha256_key_here
   SESSION_SECRET=your_express_session_secret_key_here
   ```

4. **Initialize Database Schema:**
   ```bash
   psql -U postgres -d englishers_db -f db/schema.sql
   node db/seed.js
   ```

5. **Start the Platform:**
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your web browser.

---

## Author

**Ali Nasser (Ali Al-Khazali)**
- Portfolio: [www.ali-nasser.dev](https://www.ali-nasser.dev)
- GitHub: [@a360n](https://github.com/a360n)
- LinkedIn: [Ali Nasser](https://www.linkedin.com/in/ali-nasser-dev/)

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
