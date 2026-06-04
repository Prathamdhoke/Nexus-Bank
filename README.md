# Nexus Bank

A full-stack banking platform designed to simulate real-world banking operations including account management, money transfers, loan processing, employee administration, audit tracking, and analytical reporting.

The project was built to explore end-to-end system design using a modern React frontend, RESTful Node.js backend, and a relational MySQL database with stored procedures, triggers, views, and indexing strategies.

## Live Architecture

Frontend (Vercel)
->
Node.js / Express API (Render)
->
MySQL Database (Railway)

## Key Features

### Banking Operations

- Customer onboarding and profile management
- Savings and Current account management
- Secure money transfers between accounts
- Deposit and withdrawal workflows
- Loan application and approval system

### Analytics Dashboard

- Customer and account statistics
- Loan portfolio insights
- Branch performance analytics
- Transaction volume tracking
- High-value transaction monitoring

### Administrative Features

- Employee management
- Branch administration
- Audit log monitoring
- Reporting and data exports

## Technical Highlights

### Transaction Integrity

Money transfers are executed through a MySQL stored procedure that ensures transactional consistency and prevents partial updates during failures.

### Automated Audit Trail

Database triggers automatically record balance modifications, creating an immutable audit history for account activity.

### Reporting Layer

Custom SQL views provide optimized reporting for:

- Customer account summaries
- Loan performance tracking
- Branch-wise analytics

### Query Optimization

Indexes were introduced on frequently accessed columns to improve filtering, search performance, and reporting efficiency.

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Recharts

### Backend

- Node.js
- Express.js
- MySQL2
- REST API Architecture

### Database

- MySQL
- Stored Procedures
- Triggers
- Views
- Indexes

### Deployment

- Vercel (Frontend)
- Render (Backend)
- Railway (Database)

## Database Components

### Core Tables

- customers
- accounts
- transactions
- loans
- employees
- branches
- audit_logs

### Stored Procedure

TransferMoney(sender_id, receiver_id, amount, mode)

### Triggers

- Prevent negative account balances
- Automatic balance audit logging

### Views

- customer_account_summary
- loan_summary

## Lessons Learned

During development I worked on:

- Designing relational database schemas
- Implementing transactional banking operations
- Building REST APIs with Express
- Managing frontend-backend integration
- Deploying distributed services across Vercel, Render, and Railway
- Debugging production networking and database connectivity issues

## Future Improvements

- JWT authentication and role-based access control
- Multi-factor authentication
- Account statements in PDF format
- Notification system for transactions
- Containerized deployment using Docker
- Automated testing and CI/CD pipelines
