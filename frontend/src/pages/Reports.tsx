import { useEffect, useState } from 'react'
import { BarChart3, Download } from 'lucide-react'
import api from '../api/client'
import Loader from '../components/ui/Loader'
import Badge from '../components/ui/Badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

function fmt(n: number) {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`
  return `₹${Number(n).toLocaleString()}`
}

type ReportTab = 'customer-summary' | 'loan-summary' | 'frozen-accounts' | 'high-value' | 'branch-deposits'

export default function Reports() {
  const [tab, setTab] = useState<ReportTab>('customer-summary')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const endpointMap: Record<ReportTab, string> = {
    'customer-summary': '/reports/customer-account-summary',
    'loan-summary': '/reports/loan-summary',
    'frozen-accounts': '/reports/frozen-closed-accounts',
    'high-value': '/reports/high-value-transactions',
    'branch-deposits': '/reports/branch-wise-deposits',
  }

  useEffect(() => {
    setLoading(true)
    api.get(endpointMap[tab]).then(r => setData(r.data.data)).finally(() => setLoading(false))
  }, [tab])

  const tabs: { key: ReportTab; label: string }[] = [
    { key: 'customer-summary', label: 'Customer Account Summary' },
    { key: 'loan-summary', label: 'Loan Summary' },
    { key: 'frozen-accounts', label: 'Frozen / Closed Accounts' },
    { key: 'high-value', label: 'High-Value Transactions' },
    { key: 'branch-deposits', label: 'Branch Deposits' },
  ]

  return (
    <div className="space-y-4">
      <div className="card p-1 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${tab === t.key ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500"><strong>{data.length}</strong> record(s) — {tabs.find(t => t.key === tab)?.label}</p>
        <button onClick={() => {
          const csv = data.length ? Object.keys(data[0]).join(',') + '\n' + data.map(r => Object.values(r).join(',')).join('\n') : ''
          const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `${tab}.csv`; a.click()
        }} className="btn-secondary flex items-center gap-2 text-xs"><Download size={13} /> Export CSV</button>
      </div>

      {tab === 'branch-deposits' && data.length > 0 && (
        <div className="card">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => fmt(Number(v))} />
              <YAxis dataKey="branch_name" type="category" tick={{ fontSize: 11 }} width={130} />
              <Tooltip formatter={(v: any) => [fmt(Number(v)), 'Total Deposits']} />
              <Bar dataKey="total_branch_balance" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'loan-summary' && data.length > 0 && (
        <div className="card flex justify-center">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={[...new Set(data.map(d => d.loan_status))].map(s => ({ name: s, value: data.filter(d => d.loan_status === s).length })) } dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {data.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        {loading ? <Loader /> : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-sm gap-3">
            <BarChart3 size={28} />
            <p>No data found for this report</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {Object.keys(data[0]).map(k => (
                    <th key={k} className="table-header">{k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    {Object.entries(row).map(([k, v], j) => (
                      <td key={j} className="table-cell">
                        {k.includes('status') || k.includes('type') ? (
                          <Badge value={String(v)} />
                        ) : k.includes('balance') || k.includes('amount') || k.includes('emi') ? (
                          <span className="font-semibold text-slate-700">{v != null ? fmt(Number(v)) : '—'}</span>
                        ) : k.includes('rate') ? (
                          <span>{v != null ? `${v}%` : '—'}</span>
                        ) : (
                          <span>{v != null ? String(v) : '—'}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
