import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Accounts from './pages/Accounts'
import Transactions from './pages/Transactions'
import Transfer from './pages/Transfer'
import Loans from './pages/Loans'
import Branches from './pages/Branches'
import Employees from './pages/Employees'
import AuditLogs from './pages/AuditLogs'
import Reports from './pages/Reports'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="transfer" element={<Transfer />} />
          <Route path="loans" element={<Loans />} />
          <Route path="branches" element={<Branches />} />
          <Route path="employees" element={<Employees />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
