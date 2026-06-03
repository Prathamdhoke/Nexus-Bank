export interface Customer {
  customer_id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  dob: string
  address: string
  create_at: string
  accounts?: Account[]
  loans?: Loan[]
}

export interface Branch {
  branch_id: number
  branch_name: string
  branch_code: string
  IFSC_Code: string
  city: string
  state: string
  manager_name: string
  contact_number: string
  created_at: string
  employee_count?: number
  account_count?: number
  total_balance?: number
}

export interface Account {
  account_id: number
  account_number: string
  customer_id: number
  branch_id: number
  account_type: 'Saving' | 'Current'
  balance: number
  minimum_balance: number
  status: 'Active' | 'Frozen' | 'Closed'
  created_at: string
  updated_at: string
  customer_name?: string
  branch_name?: string
  city?: string
  IFSC_Code?: string
}

export interface Transaction {
  transaction_id: number
  transaction_reference: string
  sender_account_id: number | null
  receiver_account_id: number | null
  amount: number
  transaction_type: 'Transfer' | 'Deposit' | 'Withdraw'
  transaction_mode: 'UPI' | 'NEFT' | 'RTGS' | 'IMPS' | 'Cash'
  status: 'Pending' | 'Success' | 'Failed' | 'Reversed'
  remarks: string
  remark?: string
  transaction_time: string
  sender_account_number?: string
  receiver_account_number?: string
  sender_name?: string
  receiver_name?: string
}

export interface Employee {
  employee_id: number
  employee_code: string
  first_name: string
  last_name: string
  email: string
  phone: string
  branch_id: number
  role: 'Teller' | 'Manager' | 'Auditor' | 'Admin'
  salary: number
  hire_date: string
  status: 'Active' | 'Inactive' | 'Suspended'
  created_at: string
  branch_name?: string
  city?: string
}

export interface Loan {
  loan_id: number
  loan_reference: string
  customer_id: number
  loan_type: 'Home' | 'Personal' | 'Education' | 'Vehicle' | 'Business'
  principal_amount: number
  interest_rate: number
  tenure_months: number
  monthly_emi: number
  remaining_balance: number
  loan_status: 'Pending' | 'Approved' | 'Rejected' | 'Closed'
  approved_by: number | null
  created_at: string
  customer_name?: string
  customer_email?: string
  approved_by_name?: string
}

export interface AuditLog {
  log_id: number
  account_id: number
  old_balance: number
  new_balance: number
  action_type: string
  updated_at: string
  account_number?: string
  customer_name?: string
}

export interface DashboardStats {
  totalCustomers: number
  totalAccounts: number
  activeAccounts: number
  totalBalance: number
  totalTransactions: number
  totalLoans: number
  pendingLoans: number
  approvedLoans: number
  totalLoanAmount: number
  totalEmployees: number
  totalBranches: number
  todayTransactions: number
  highValueTxn: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  total?: number
  error?: string
}
