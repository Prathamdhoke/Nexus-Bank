import { useEffect, useState } from 'react'
import { Search, ArrowLeftRight } from 'lucide-react'
import api from '../api/client'
import type { Transaction } from '../types'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'

export default function Transactions() {
  const [txns, setTxns] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modeFilter, setModeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 15

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/transactions', {
        params: { search, type: typeFilter, status: statusFilter, mode: modeFilter, page, limit }
      })
      setTxns(data.data)
      setTotal(data.total)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, typeFilter, statusFilter, modeFilter, page])

  const pages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search by reference or account..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input w-auto" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
          <option value="">All Types</option>
          <option>Transfer</option><option>Deposit</option><option>Withdraw</option>
        </select>
        <select className="input w-auto" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Status</option>
          <option>Success</option><option>Pending</option><option>Failed</option><option>Reversed</option>
        </select>
        <select className="input w-auto" value={modeFilter} onChange={e => { setModeFilter(e.target.value); setPage(1) }}>
          <option value="">All Modes</option>
          <option>UPI</option><option>NEFT</option><option>RTGS</option><option>IMPS</option><option>Cash</option>
        </select>
      </div>

      <div className="text-sm text-slate-500">
        Total: <strong>{total}</strong> transaction(s)
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? <Loader /> : txns.length === 0 ? (
          <EmptyState icon={ArrowLeftRight} title="No transactions found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="table-header">Reference</th>
                  <th className="table-header">Sender</th>
                  <th className="table-header">Receiver</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Mode</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Remarks</th>
                  <th className="table-header">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {txns.map(t => (
                  <tr key={t.transaction_id} className="hover:bg-slate-50">
                    <td className="table-cell font-mono text-xs text-blue-700">{t.transaction_reference}</td>
                    <td className="table-cell text-sm">
                      {t.sender_name ? <><div className="font-medium">{t.sender_name}</div><div className="text-xs text-slate-400 font-mono">{t.sender_account_number}</div></> : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="table-cell text-sm">
                      {t.receiver_name ? <><div className="font-medium">{t.receiver_name}</div><div className="text-xs text-slate-400 font-mono">{t.receiver_account_number}</div></> : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="table-cell font-bold text-slate-800">₹{Number(t.amount).toLocaleString()}</td>
                    <td className="table-cell"><Badge value={t.transaction_type} /></td>
                    <td className="table-cell">
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">{t.transaction_mode}</span>
                    </td>
                    <td className="table-cell"><Badge value={t.status} /></td>
                    <td className="table-cell text-xs text-slate-500 max-w-[120px] truncate">{t.remarks || t.remark || '—'}</td>
                    <td className="table-cell text-xs text-slate-400">{new Date(t.transaction_time).toLocaleString()}</td>
                  </tr>
                ))}
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
