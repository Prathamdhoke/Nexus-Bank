import { useEffect, useState } from 'react'
import { ScrollText, Search, TrendingUp, TrendingDown } from 'lucide-react'
import api from '../api/client'
import type { AuditLog } from '../types'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [accountId, setAccountId] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/audit-logs', { params: { account_id: accountId || undefined, page, limit } })
      setLogs(data.data); setTotal(data.total)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [accountId, page])

  const pages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="card bg-amber-50 border-amber-200 p-4">
        <div className="flex gap-3">
          <ScrollText size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Trigger-Based Audit Trail</p>
            <p className="text-xs text-amber-700 mt-0.5">Every balance change on any account is automatically logged here by the <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">account_audit_trigger</code> AFTER UPDATE trigger. This cannot be bypassed.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Filter by Account ID..." type="number" value={accountId} onChange={e => { setAccountId(e.target.value); setPage(1) }} />
        </div>
        <span className="text-sm text-slate-500">Total: <strong>{total}</strong> audit entries</span>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? <Loader /> : logs.length === 0 ? (
          <EmptyState icon={ScrollText} title="No audit logs found" description="Audit entries are created automatically when account balances change" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="table-header">Log ID</th>
                  <th className="table-header">Account</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Old Balance</th>
                  <th className="table-header">New Balance</th>
                  <th className="table-header">Change</th>
                  <th className="table-header">Action</th>
                  <th className="table-header">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map(l => {
                  const change = Number(l.new_balance) - Number(l.old_balance)
                  const isUp = change >= 0
                  return (
                    <tr key={l.log_id} className="hover:bg-slate-50">
                      <td className="table-cell text-xs text-slate-400 font-mono">#{l.log_id}</td>
                      <td className="table-cell font-mono text-xs text-blue-700">{l.account_number || `#${l.account_id}`}</td>
                      <td className="table-cell font-medium">{l.customer_name || '—'}</td>
                      <td className="table-cell text-slate-600">₹{Number(l.old_balance).toLocaleString()}</td>
                      <td className="table-cell font-semibold text-slate-800">₹{Number(l.new_balance).toLocaleString()}</td>
                      <td className="table-cell">
                        <div className={`flex items-center gap-1 text-sm font-semibold ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                          {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                          {isUp ? '+' : ''}₹{Math.abs(change).toLocaleString()}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">{l.action_type}</span>
                      </td>
                      <td className="table-cell text-xs text-slate-400">{new Date(l.updated_at).toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Prev</button>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
