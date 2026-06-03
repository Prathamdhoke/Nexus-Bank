import { useEffect, useState } from 'react'
import {
  Users, CreditCard, ArrowLeftRight, FileText,
  Building2, UserCog, TrendingUp, AlertTriangle, DollarSign, Activity
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'
import api from '../api/client'
import StatCard from '../components/ui/StatCard'
import Loader from '../components/ui/Loader'
import Badge from '../components/ui/Badge'
import type { DashboardStats, Transaction } from '../types'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function fmt(n: number) {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${n.toLocaleString()}`
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [topCustomers, setTopCustomers] = useState<any[]>([])
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([])
  const [loanAnalytics, setLoanAnalytics] = useState<any>({ byStatus: [], byType: [] })
  const [branchData, setBranchData] = useState<any[]>([])
  const [trends, setTrends] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/top-customers'),
      api.get('/dashboard/recent-transactions'),
      api.get('/dashboard/loan-analytics'),
      api.get('/dashboard/branch-analytics'),
      api.get('/dashboard/transaction-trends'),
    ]).then(([s, tc, rt, la, ba, tt]) => {
      setStats(s.data.data)
      setTopCustomers(tc.data.data)
      setRecentTxns(rt.data.data)
      setLoanAnalytics(la.data.data)
      setBranchData(ba.data.data)
      setTrends(tt.data.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader text="Loading dashboard..." />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Customers" value={stats?.totalCustomers ?? 0} icon={Users} color="bg-blue-600" />
        <StatCard title="Total Accounts" value={stats?.totalAccounts ?? 0} icon={CreditCard} color="bg-emerald-600" sub={`${stats?.activeAccounts} active`} />
        <StatCard title="Total Balance" value={fmt(stats?.totalBalance ?? 0)} icon={DollarSign} color="bg-violet-600" />
        <StatCard title="Transactions" value={stats?.totalTransactions ?? 0} icon={ArrowLeftRight} color="bg-amber-600" sub={`${stats?.todayTransactions} today`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Loans" value={stats?.totalLoans ?? 0} icon={FileText} color="bg-rose-600" sub={`${stats?.pendingLoans} pending`} />
        <StatCard title="Loan Portfolio" value={fmt(stats?.totalLoanAmount ?? 0)} icon={TrendingUp} color="bg-indigo-600" />
        <StatCard title="Branches" value={stats?.totalBranches ?? 0} icon={Building2} color="bg-teal-600" />
        <StatCard title="Employees" value={stats?.totalEmployees ?? 0} icon={UserCog} color="bg-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Transaction Volume (Last 30 Days)</h2>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => [fmt(Number(v)), 'Volume']} />
                <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} fill="url(#volGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              <Activity size={18} className="mr-2" /> No transaction data for last 30 days
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Loan Status Distribution</h2>
          {loanAnalytics.byStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={loanAnalytics.byStatus} dataKey="total_loans" nameKey="loan_status" cx="50%" cy="50%" outerRadius={80} label={({ loan_status, percent }) => `${loan_status} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {loanAnalytics.byStatus.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm">No loan data</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Branch Deposits Comparison</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={branchData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => fmt(Number(v))} />
              <YAxis dataKey="branch_name" type="category" tick={{ fontSize: 10 }} width={110} />
              <Tooltip formatter={(v: any) => [fmt(Number(v)), 'Total Deposits']} />
              <Bar dataKey="total_deposits" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Top 5 Customers by Balance</h2>
          <div className="space-y-3">
            {topCustomers.map((c, i) => (
              <div key={c.customer_id} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-semibold flex-shrink-0">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{c.customer_name}</p>
                  <p className="text-xs text-slate-400">{c.account_count} account(s)</p>
                </div>
                <p className="text-sm font-semibold text-slate-700">{fmt(Number(c.total_balance))}</p>
              </div>
            ))}
            {topCustomers.length === 0 && <p className="text-slate-400 text-sm">No data</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">Recent Transactions</h2>
          {stats && stats.highValueTxn > 0 && (
            <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
              <AlertTriangle size={12} /> {stats.highValueTxn} high-value txns
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header">Reference</th>
                <th className="table-header">From</th>
                <th className="table-header">To</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Type</th>
                <th className="table-header">Mode</th>
                <th className="table-header">Status</th>
                <th className="table-header">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTxns.map(t => (
                <tr key={t.transaction_id} className="hover:bg-slate-50">
                  <td className="table-cell font-mono text-xs text-blue-700">{t.transaction_reference}</td>
                  <td className="table-cell">{t.sender_name || t.sender_account_number || '—'}</td>
                  <td className="table-cell">{t.receiver_name || t.receiver_account_number || '—'}</td>
                  <td className="table-cell font-semibold">₹{Number(t.amount).toLocaleString()}</td>
                  <td className="table-cell"><Badge value={t.transaction_type} /></td>
                  <td className="table-cell text-xs text-slate-500">{t.transaction_mode}</td>
                  <td className="table-cell"><Badge value={t.status} /></td>
                  <td className="table-cell text-xs text-slate-400">{new Date(t.transaction_time).toLocaleString()}</td>
                </tr>
              ))}
              {recentTxns.length === 0 && (
                <tr><td colSpan={8} className="table-cell text-center text-slate-400 py-8">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
