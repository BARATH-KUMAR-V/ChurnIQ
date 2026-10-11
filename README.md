# ChurnIQ — Customer Churn Prediction & Retention Intelligence System

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.1-EB5424?logo=xgboost&logoColor=white)](https://xgboost.readthedocs.io/)
[![SHAP](https://img.shields.io/badge/SHAP-0.46-FF6F00)](https://shap.readthedocs.io/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**ChurnIQ** is an enterprise-grade customer churn prediction and retention intelligence platform designed for subscription and telecommunications businesses. By leveraging **XGBoost gradient boosted decision trees** and **SHAP (SHapley Additive exPlanations)**, ChurnIQ replaces reactive customer retention with transparent, data-driven proactive interventions.

---

## 📑 Table of Contents
- [Executive Overview](#-executive-overview)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Machine Learning & Explainability](#-machine-learning--explainability)
- [Security & Hardening](#-security--hardening)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup (FastAPI)](#backend-setup-fastapi)
  - [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
- [Docker & DevOps Deployment](#-docker--devops-deployment)
- [API Reference](#-api-reference)
- [Repository Structure](#-repository-structure)
- [Author & Academic Credits](#-author--academic-credits)

---

## 🎯 Executive Overview

In subscription businesses, losing customers directly diminishes recurring revenue, and acquiring a replacement customer costs 5–7x more than retaining an existing one.

Traditional retention efforts are often:
1. **Reactive:** Customer outreach occurs only after a cancellation request has been filed.
2. **Untargeted:** Generic retention campaigns burn budget on loyal accounts that were never going to leave.

**ChurnIQ solves this by:**
- Analyzing **7,043 customer accounts** to compute individualized churn probabilities (0%–100%).
- Categorizing customers into actionable risk tiers: **High (≥65%)**, **Medium (35%–64%)**, and **Low (<35%)**.
- Explaining the precise drivers behind each prediction using **SHAP TreeExplainer**.
- Surfacing financial exposure through an **Annual Recurring Revenue (ARR) at Risk** executive dashboard.

---

## 🏛 System Architecture

```mermaid
graph TD
    A[Telco Customer Records\n7,043 Profiles] --> B[Feature Engineering\nContract Risk, Fiber Risk, Tenure Cohorts]
    B --> C[XGBoost Classifier\nAUC-ROC: 84.7% | F1: 63.8%]
    C --> D[SHAP TreeExplainer\nGlobal & Local Feature Attributions]
    D --> E[FastAPI REST API\nInput Validation & Security Headers]
    E -->|JSON REST Endpoints| F[React 19 + TypeScript Dashboard]
    F --> G1[Executive Summary & KPI Cards]
    F --> G2[At-Risk Accounts with SHAP Drawers]
    F --> G3[Live Churn Predictor & Simulator]
    F --> G4[Why Customers Leave Insights]
    F --> G5[Model Validation ROC & Confusion Matrix]
    F --> G6[Segment Breakdown & PDF Export]
    H[Docker Multi-Stage Build] --> I[Hardened Nginx Alpine Server]
    I --> F
```

---

## ✨ Key Features

The ChurnIQ frontend dashboard provides 7 dedicated operational views:

1. **Executive Summary:**
   - Real-time **ARR at Risk Banner** ($2.4M tracked).
   - High-impact KPI cards: High-Risk accounts, Actual Churn Rate, Model AUC-ROC, and F1 Score.
   - Churn probability distribution charts and risk tier breakdown.
   - One-click executive summary **PDF Report generator** using `jsPDF`.

2. **At-Risk Accounts:**
   - Filterable table ranking accounts by churn probability.
   - Filter by High, Medium, or Low risk tiers and real-time customer ID search.
   - Interactive slide-out drawer with individualized SHAP feature contribution bar charts.

3. **Churn Over Time:**
   - 12-month rolling trend analysis of churn rate and high-risk count.
   - Estimated monthly ARR recovered via retention actions.

4. **Live Churn Predictor:**
   - Interactive parameter sliders (Tenure, Monthly Charges, Contract type, Internet service, Tech support, etc.).
   - Instant XGBoost scoring with live SHAP attribution bars (Red = raises risk, Green = reduces risk).
   - Actionable prescriptive recommendations (e.g., offer contract upgrades within 48h).

5. **Why Customers Leave (Global Explainability):**
   - Global feature ranking using mean absolute SHAP values.
   - Clear explanations of macro churn drivers (Contract duration, Fiber optic churn sensitivity, Lack of tech support).

6. **Model Validation & Metrics:**
   - Evaluated on a 20% stratified hold-out test set.
   - Interactive ROC Curve (AUC-ROC 84.7%) and Confusion Matrix (TN, FP, FN, TP).
   - Precision (68.4%), Recall (59.8%), and Accuracy (80.4%) transparency.

7. **Customer Segments:**
   - Deep-dive risk breakdown across Contract types, Internet Service types, Tenure cohorts, and Payment methods.

---

## 🧠 Machine Learning & Explainability

### Engineered Features
| Feature | Type | Description | Churn Impact |
| :--- | :--- | :--- | :--- |
| `Contract Risk` | Binary | Flag for month-to-month contracts | **Strongest churn driver** (+0.64 SHAP) |
| `Fiber Risk` | Binary | Flag for fiber optic internet service | High sensitivity (+0.51 SHAP) |
| `M2M Fiber Risk` | Interaction | Month-to-month contract + fiber optic | Highest-risk combination (+0.38 SHAP) |
| `Long Tenure Safe`| Binary | Customer tenure > 24 months | Strong stabilizer (-0.25 SHAP) |
| `Charge Per Tenure`| Continuous | Monthly charges / (Tenure + 1) | Higher ratio indicates higher flight risk |
| `No Support` | Binary | Absence of technical support subscription | Significant churn catalyst (+0.31 SHAP) |

---

## 🛡️ Security & Hardening

This repository implements defensive security practices across frontend, backend, and container layers:

### 1. Frontend Security
- **Resolved Package Vulnerabilities:** Audited with `npm audit` and upgraded dependencies (including critical patches for `vite`, `react-router-dom`, and build tools).
- **Environment Isolation:** `.env` removed from Git tracking and added to `.gitignore`. Template provided in `.env.example`.
- **API Client Hardening:**
  - Base URL sanitation (trailing slash stripping and origin fallback).
  - Strict parameter sanitization and URI encoding on all query inputs.
  - Built-in `AbortController` timeouts (15s request timeout, 5s health check timeout) to prevent connection starvation.
- **Security Meta Tags:** Added `nosniff`, `strict-origin-when-cross-origin` referrer policy, and meta descriptions to `index.html`.

### 2. Backend Security (FastAPI)
- **Strict CORS Protection:** Restricted to configurable allowed origins via `CORS_ORIGINS` (defaults to local origins; no wildcard `*` with credentials).
- **Security Headers Middleware:** Automatic injection of `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and `Referrer-Policy`.
- **Input Validation & Bound Checking:** Pydantic validation on query parameters (`ge`, `le`, regex patterns) prevents buffer overflows, NaN crashes, and denial-of-service.
- **CSV Injection Prevention:** Cell sanitization on `/api/export` escapes leading formula characters (`=`, `+`, `-`, `@`) preventing spreadsheet code execution.
- **Sanitized Exception Handling:** Global exception handler logs server details privately and returns clean, sanitized errors to clients without stack traces.

### 3. Container & Infrastructure Security
- **Multi-Stage Docker Build:** Node.js build tools are completely discarded in Stage 1; only static assets are copied to a lightweight Nginx Alpine runtime image.
- **Nginx Hardening:** `server_tokens off;` disabled version disclosure; custom CSP and security headers; denied access to hidden files (`/\.`).
- **Comprehensive `.dockerignore`:** Excludes `.git`, `.env*`, `node_modules`, `__pycache__`, and temporary build files from image layers.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Python**: v3.10, v3.11, or v3.12
- **Git**

---

### Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   # Windows PowerShell:
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # Linux / macOS:
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment (optional):
   ```bash
   cp .env.example .env
   ```
5. Launch the FastAPI server:
   ```bash
   python main.py
   ```
   *The API will start at `http://localhost:8000`.*

---

### Frontend Setup (React + Vite)

1. Open a new terminal in the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   ```bash
   cp .env.example .env
   ```
   *Ensure `VITE_API_URL=http://localhost:8000` is set in `.env`.*
4. Start development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## 🐳 Docker & DevOps Deployment

The dashboard is packaged using a multi-stage Docker build for reproducible, production-ready deployment:

### 1. Build the Docker Image
```bash
docker build --build-arg VITE_API_URL=http://localhost:8000 -t churniq-app:1.0 .
```

### 2. Run the Container
```bash
docker run -d -p 8080:80 --name churniq churniq-app:1.0
```

### 3. Verify Container Status
```bash
docker ps
docker logs churniq
```

### 4. Access the Application
Open your web browser at **`http://localhost:8080`**.

### 5. Stop and Clean Up
```bash
docker stop churniq
docker rm churniq
```

---

## 📡 API Reference

| Endpoint | Method | Query Parameters | Description |
| :--- | :---: | :--- | :--- |
| `/api/health` | `GET` | — | Liveness & health probe |
| `/api/summary` | `GET` | — | Executive summary metrics & model evaluation |
| `/api/customers` | `GET` | `risk` (all/high/medium/low), `q` (search), `limit` | Paginated and filtered customer risk list |
| `/api/customers/{id}` | `GET` | — | Account profile and individual SHAP drivers |
| `/api/score` | `GET` | `tenure`, `monthly`, `contract`, `internet`, etc. | Live prediction and feature contributions |
| `/api/shap` | `GET` | — | Global feature importance ranking |
| `/api/metrics` | `GET` | — | Validation scores, ROC curve, confusion matrix |
| `/api/distribution` | `GET` | — | Churn probability histogram buckets |
| `/api/by_tenure` | `GET` | — | Tenure cohort churn analysis |
| `/api/trend` | `GET` | — | 12-month rolling churn trend |
| `/api/segments` | `GET` | — | Churn breakdown across customer segments |
| `/api/export` | `GET` | — | Secure CSV export of high-risk accounts |

---

## 📂 Repository Structure

```
ChurnIQ/
├── Dockerfile                  # Production multi-stage Dockerfile
├── nginx.conf                  # Security-hardened Nginx server configuration
├── .dockerignore               # Container build exclusion rules
├── .gitignore                  # Global Git exclusion rules
├── README.md                   # Project documentation & reference
│
├── backend/
│   ├── main.py                 # FastAPI application & ML inference endpoints
│   ├── notebook.ipynb          # End-to-end model training & SHAP notebook
│   ├── requirements.txt        # Pinned secure Python dependencies
│   ├── .env.example            # Backend environment template
│   └── .gitignore              # Backend-specific exclusions
│
└── frontend/
    ├── index.html              # HTML entry point with security meta tags
    ├── package.json            # Frontend dependencies & scripts
    ├── package-lock.json       # Audited lockfile
    ├── vite.config.ts          # Vite configuration
    ├── tailwind.config.js      # Custom theme styling & colors
    ├── .env.example            # Frontend environment template
    ├── .gitignore              # Frontend-specific exclusions
    ├── public/
    │   └── favicon.svg         # Platform icon
    └── src/
        ├── App.tsx             # Main dashboard layout & view routing
        ├── main.tsx            # React application root
        ├── index.css           # Global typography & Fluent Design tokens
        ├── api/
        │   └── client.ts       # Hardened, timeout-safe API client
        ├── components/
        │   ├── Sidebar.tsx     # Navigation sidebar
        │   ├── ThemeToggle.tsx # Light / Dark mode toggle
        │   └── ui/             # Reusable UI cards, badges, and SHAP bars
        ├── context/
        │   └── ThemeContext.tsx# Theme state provider
        ├── pages/
        │   ├── Home.tsx        # Executive summary & ARR at risk
        │   ├── Customers.tsx   # At-risk customer accounts table
        │   ├── Predictor.tsx   # Live churn simulator & scoring
        │   ├── WhyLeave.tsx    # SHAP global feature importance
        │   ├── Accuracy.tsx    # Model validation, ROC curve, confusion matrix
        │   ├── Segments.tsx    # Cohort & segment analysis
        │   └── Trend.tsx       # 12-month rolling churn trends
        └── utils/
            └── pdfReport.ts    # Executive PDF generation utility
```

---

## 👨‍💻 Author & Academic Credits

- **Author:** Barath Kumar V
- **Institution:** National Engineering College (Autonomous, Affiliated to Anna University)
- **Department:** Artificial Intelligence and Data Science
- **Course:** DevOps & Agile Methodologies Micro Project (23AD52C)
- **Repository:** [https://github.com/BARATH-KUMAR-V/ChurnIQ](https://github.com/BARATH-KUMAR-V/ChurnIQ.git)
