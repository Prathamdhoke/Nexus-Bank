# Banking Management System

A full-stack Banking Management System built with React + TypeScript + Tailwind CSS (frontend) and Node.js + Express + MySQL (backend).

## Features

- Dashboard with charts and analytics
- Customer Management (CRUD)
- Account Management (Saving / Current)
- Money Transfer Center (uses stored procedure — ACID compliant)
- Transaction History (Transfer, Deposit, Withdrawal)
- Loan Management with EMI calculator
- Branch Analytics with charts
- Employee Management
- Audit Logs (trigger-based, auto-populated)
- Reports (DB views, CSV export)

## Project Structure

```
banking-management-system/
├── backend/            Node.js + Express API server
│   ├── config/         Database connection
│   ├── middleware/     Error handler
│   ├── routes/         API route handlers
│   ├── server.js       Entry point
│   └── .env.example    Environment variable template
├── frontend/           React + TypeScript + Vite + Tailwind CSS
│   └── src/
│       ├── api/        Axios API client
│       ├── components/ Reusable UI components + layout
│       ├── pages/      All 10 application pages
│       └── types/      TypeScript type definitions
└── database/           All SQL files (schema, data, procedures, triggers, views)
```

## Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or pnpm

## Setup

### 1. Database

```sql
-- Run SQL files in this order:
source database/schema_1780496851276.sql
source database/insert_data_1780496851275.sql
source database/procedures_1780496851275.sql
source database/triggers_1780496851278.sql
source database/views_1780496851278.sql
source database/indexes_1780496851274.sql
```

### 2. Backend

```bash
cd backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

npm start
# or for development:
npm run dev
```

Backend runs on http://localhost:5000

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000
The Vite dev server proxies /api → http://localhost:5000

### 4. Production Build

```bash
cd frontend
npm run build
# Static files will be in frontend/dist/
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/stats | Dashboard KPIs |
| GET | /api/dashboard/top-customers | Top 5 by balance |
| GET | /api/dashboard/recent-transactions | Last 10 transactions |
| GET | /api/dashboard/loan-analytics | Loan charts data |
| GET | /api/dashboard/branch-analytics | Branch comparison |
| GET | /api/dashboard/transaction-trends | 30-day volume trend |
| GET/POST | /api/customers | List / create customers |
| GET/PUT/DELETE | /api/customers/:id | Get / update / delete customer |
| GET/POST | /api/accounts | List / create accounts |
| GET/PUT | /api/accounts/:id | Get / update account |
| GET | /api/accounts/:id/transactions | Account transaction history |
| POST | /api/transactions/transfer | Money transfer (stored procedure) |
| POST | /api/transactions/deposit | Deposit funds |
| POST | /api/transactions/withdraw | Withdraw funds |
| GET | /api/transactions | List all transactions |
| GET/POST | /api/loans | List / create loans |
| PATCH | /api/loans/:id/status | Approve / reject loan |
| GET/POST | /api/branches | List / create branches |
| GET/POST | /api/employees | List / create employees |
| GET/PUT/DELETE | /api/employees/:id | Manage employee |
| GET | /api/audit-logs | View audit trail |
| GET | /api/reports/customer-account-summary | DB view: customer_account_summary |
| GET | /api/reports/loan-summary | DB view: loan_summary |
| GET | /api/reports/frozen-closed-accounts | Frozen/Closed accounts |
| GET | /api/reports/high-value-transactions | Transactions > ₹1,00,000 |
| GET | /api/reports/branch-wise-deposits | Branch deposit rankings |

## Database Design

### Tables
- `customers` — customer profiles
- `branches` — bank branches with IFSC codes
- `accounts` — savings/current accounts with status tracking
- `transactions` — all money movements
- `employees` — staff with role hierarchy
- `loans` — loan applications with EMI tracking
- `audit_logs` — auto-populated by trigger on every balance change

### Stored Procedures
- `TransferMoney(sender_id, receiver_id, amount, mode)` — ACID-compliant money transfer

### Triggers
- `prevent_negative_balance` — BEFORE UPDATE, blocks balance < 0
- `account_audit_trigger` — AFTER UPDATE, logs every balance change to audit_logs

### Views
- `customer_account_summary` — customer + account + branch joined view
- `loan_summary` — loan + customer + approver joined view

### Indexes
- `idx_customer_email` — fast email lookups
- `idx_account_number` — fast account number search
- `idx_transaction_time` — fast time-range queries
- `idx_loan_status` — fast loan status filters
- `idx_branch_city` — fast city-based branch search
