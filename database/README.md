# Banking Management System

## Overview

This project is a SQL-based Banking Management System designed to simulate real-world banking operations and backend database workflows.

The system demonstrates advanced DBMS concepts including:

- Relational Schema Design
- ACID Transactions
- Stored Procedures
- Triggers
- Views
- Indexing & Query Optimization
- Audit Logging
- Analytical Queries
- Referential Integrity
- Banking Workflow Simulation

The project models core banking operations such as:

- Account Management
- Money Transfers
- Loan Processing
- Employee & Branch Management
- Audit Tracking
- Financial Reporting

---

# Features

## Customer Management

- Customer profile storage
- Multi-account support
- Contact and identity information

## Account Management

- Savings & Current accounts
- Account status tracking
- Minimum balance handling
- Secure balance updates

## Transaction System

- Money transfer operations
- ACID-compliant transaction handling
- Transaction logging
- Rollback support

## Loan Management

- Multiple loan types
- Approval workflow
- EMI and balance tracking
- Employee-authorized approvals

## Employee & Branch Management

- Branch-wise employee structure
- Role-based hierarchy
- Branch analytics support

## Audit & Security

- Automatic audit logging
- Trigger-based integrity enforcement
- Negative balance prevention

## Reporting & Analytics

- Customer account summary views
- Loan analytics
- High-value transaction detection
- Branch-wise financial analysis

---

# Advanced SQL Concepts Used

| Concept                | Usage                      |
| ---------------------- | -------------------------- |
| Primary & Foreign Keys | Referential integrity      |
| Constraints            | Business rule enforcement  |
| Transactions           | Atomic money transfers     |
| Stored Procedures      | Secure banking operations  |
| Triggers               | Audit logging & validation |
| Views                  | Reporting abstraction      |
| Indexes                | Query optimization         |
| Aggregations           | Banking analytics          |

---

# Project Structure

schema.sql -> Database schema and table creation
insert_data.sql -> Sample banking data
transactions.sql -> Transaction operations
procedures.sql -> Stored procedures
triggers.sql -> Database triggers
views.sql -> Reporting views
indexes.sql -> Performance optimization
queries.sql -> Analytical SQL queries
