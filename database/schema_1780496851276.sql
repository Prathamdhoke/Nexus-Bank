CREATE DATABASE banking_system;
USE banking_system;

CREATE TABLE customers(
	customer_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15) UNIQUE,
    dob DATE,
    address VARCHAR(255),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE branches(
	branch_id INT PRIMARY KEY AUTO_INCREMENT,
    branch_name VARCHAR(100) NOT NULL,
    branch_code VARCHAR(20) UNIQUE NOT NULL,
    IFSC_Code VARCHAR(20) UNIQUE NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    manager_name VARCHAR(100),
    contact_number VARCHAR(15) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts(
	account_id INT PRIMARY KEY AUTO_INCREMENT,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    branch_id INT NOT NULL,
    account_type ENUM('Saving','Current') NOT NULL,
    balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    minimum_balance DECIMAL(12,2) DEFAULT 1000,
    status ENUM('Active','Frozen','Closed') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_balance
    CHECK (balance >= 0),
    
    CONSTRAINT fk_customer
    FOREIGN KEY (customer_id)
    REFERENCES customers (customer_id),
    
    CONSTRAINT fk_branch
    FOREIGN KEY (branch_id)
    REFERENCES branches(branch_id)
);

CREATE TABLE transactions(
	transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_reference VARCHAR(30) UNIQUE NOT NULL,
    sender_account_id INT,
    receiver_account_id INT,
    amount DECIMAL(12,2) NOT NULL,
    transaction_type ENUM('Transfer','Deposit','Withdraw') NOT NULL,
    transaction_mode ENUM('UPI','NEFT','RTGS','IMPS','Cash') NOT NULL,
    status ENUM('Pending','Success','Failed','Reversed') DEFAULT 'Pending',
    remark VARCHAR(255),
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_transaction_amount
    CHECK (amount > 0),
    
    CONSTRAINT fk_sender_account
    FOREIGN KEY (sender_account_id)
    REFERENCES accounts(account_id),
    
    CONSTRAINT fk_receiver_account
    FOREIGN KEY (receiver_account_id)
    REFERENCES accounts(account_id)
);

CREATE TABLE employees (
	employee_id INT PRIMARY KEY AUTO_INCREMENt,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    branch_id INT NOT NULL,
    role ENUM('Teller','Manager','Auditor','Admin') NOT NULL,
    salary DECIMAL(12,2) NOT NULL,
    hire_date DATE NOT NULL,
    status ENUM('Active','Inactive','Suspended') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_salary
    CHECK (salary > 0),
    
    CONSTRAINt fk_employee_branch
    FOREIGN KEY (branch_id)
    REFERENCES branches(branch_id)
);

CREATE TABLE loans (
	loan_id INT PRIMARY KEY AUTO_INCREMENT,
    loan_reference VARCHAR(30) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    loan_type ENUM('Home','Personal','Education','Vehicle','Business') NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    tenure_months INT NOT NULL,
    monthly_emi DECIMAL(12,2),
    remaining_balance DECIMAL(15,2),
    loan_status ENUM('Pending','Approved','Rejected','Closed') DEFAULT 'Pending',
    approved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_loan_amount
    CHECK (principal_amount > 0),
    
    CONSTRAINT chk_interest_rate
    CHECK (interest_rate > 0),
    
    CONSTRAINT chk_tenure
    CHECK (tenure_months > 0),
    
    CONSTRAINT fk_loan_customer
    FOREIGN KEY (customer_id)
    REFERENCES customers(customer_id),
    
    CONSTRAINT fk_loan_approver
    FOREIGN KEY (approved_by)
    REFERENCES employees(employee_id)
);

CREATE TABLE audit_logs (
	log_id INT PRIMARY KEY AUTO_INCREMENt,
    account_id INT,
    old_balance DECIMAL(12,2),
    new_balance DECIMAL(12,2),
    action_type VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_audit_account
    FOREIGN KEY (account_id)
    REFERENCES accounts(account_id)
);

