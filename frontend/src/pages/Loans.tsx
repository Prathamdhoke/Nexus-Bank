import { useEffect, useState } from 'react'
import { Plus, Search, FileText } from 'lucide-react'
import api from '../api/client'
import type { Loan } from '../types'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'

interface Form {
  loan_reference: string; customer_id: string; loan_type: string; principal_amount: string
  interest_rate: string; tenure_months: string; monthly_emi: string; remaining_balance: string
}
const empty: Form = { loan_reference: '', customer_id: '', loan_type: 'Home', principal_amount: '', interest_rate: '', tenure_months: '', monthly_emi: '', remaining_balance: '' }

export default function Loans() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [modal, setModal] = useState<'add' | 'status' | null>(null)
  const [selected, setSelected] = useState<Loan | null>(null)
  const [form, setForm] = useState<Form>(empty)
  const [newStatus, setNewStatus] = useState('Pending')
  const [approvedBy, setApprovedBy] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/loans', { params: { search, status: statusFilter, type: typeFilter, page, limit } })
      setLoans(data.data); setTotal(data.total)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, statusFilter, typeFilter, page])

  const calcEMI = () => {
    const P = Number(form.principal_amount), r = Number(form.interest_rate) / 12 / 100, n = Number(form.tenure_months)
    if (P && r && n) { const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1); setForm(f => ({ ...f, monthly_emi: emi.toFixed(0), remaining_balance: form.remaining_balance || String(P) })) }
  }

  const handleSave = async () => {
    if (!form.loan_reference || !form.customer_id || !form.principal_amount || !form.interest_rate || !form.tenure_months) { setError('Required fields missing'); return }
    setSaving(true); setError('')
    try {
      await api.post('/loans', { ...form, customer_id: Number(form.customer_id), principal_amount: Number(form.principal_amount), interest_rate: Number(form.interest_rate), tenure_months: Number(form.tenure_months), monthly_emi: Number(form.monthly_emi), remaining_balance: Number(form.remaining_balance) })
      setModal(null); load()
    } catch (e: any) { setError(e.message) } finally { setSaving(false) }
  }

  const handleStatus = async () => {
    if (!selected) return
    setSaving(true); setError('')
    try {
      await api.patch(`/loans/${selected.loan_id}/status`, { loan_status: newStatus, approved_by: approvedBy ? Number(approvedBy) : undefined })
      setModal(null); load()
    } catch (e: any) { setError(e.message) } finally { setSaving(false) }
  }

  const pages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search loans..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="input w-auto" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            <option>Pending</option><option>Approved</option><option>Rejected</option><option>Closed</option>
          </select>
          <select className="input w-auto" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
            <option value="">All Types</option>
            <option>Home</option><option>Personal</option><option>Education</option><option>Vehicle</option><option>Business</option>
          </select>
        </div>
        <button onClick={() => { setForm(empty); setError(''); setModal('add') }} className="btn-primary flex items-center gap-2"><Plus size={15} /> New Loan</button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? <Loader /> : loans.length === 0 ? (
          <EmptyState icon={FileText} title="No loans found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="table-header">Reference</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Principal</th>
                  <th className="table-header">Rate</th>
                  <th className="table-header">EMI</th>
                  <th className="table-header">Remaining</th>
                  <th className="table-header">Tenure</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Approved By</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.map(l => (
                  <tr key={l.loan_id} className="hover:bg-slate-50">
                    <td className="table-cell font-mono text-xs text-indigo-700">{l.loan_reference}</td>
                    <td className="table-cell font-medium">{l.customer_name}</td>
                    <td className="table-cell"><Badge value={l.loan_type} /></td>
                    <td className="table-cell font-semibold">₹{Number(l.principal_amount).toLocaleString()}</td>
                    <td className="table-cell text-slate-500">{l.interest_rate}%</td>
                    <td className="table-cell text-slate-700">₹{Number(l.monthly_emi || 0).toLocaleString()}</td>
                    <td className="table-cell text-slate-700">₹{Number(l.remaining_balance || 0).toLocaleString()}</td>
                    <td className="table-cell text-slate-500">{l.tenure_months}mo</td>
                    <td className="table-cell"><Badge value={l.loan_status} /></td>
                    <td className="table-cell text-slate-500">{l.approved_by_name || '—'}</td>
                    <td className="table-cell">
                      <button onClick={() => { setSelected(l); setNewStatus(l.loan_status); setApprovedBy(''); setError(''); setModal('status') }} className="text-xs btn-secondary py-1 px-2">Update Status</button>
                    </td>
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

      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Create New Loan" size="lg">
        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Loan Reference *</label><input className="input" placeholder="LN20260006" value={form.loan_reference} onChange={e => setForm(f => ({ ...f, loan_reference: e.target.value }))} /></div>
          <div><label className="label">Customer ID *</label><input className="input" type="number" value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} /></div>
          <div><label className="label">Loan Type *</label>
            <select className="input" value={form.loan_type} onChange={e => setForm(f => ({ ...f, loan_type: e.target.value }))}>
              <option>Home</option><option>Personal</option><option>Education</option><option>Vehicle</option><option>Business</option>
            </select>
          </div>
          <div><label className="label">Principal Amount *</label><input className="input" type="number" value={form.principal_amount} onChange={e => setForm(f => ({ ...f, principal_amount: e.target.value }))} /></div>
          <div><label className="label">Interest Rate (%) *</label><input className="input" type="number" step="0.1" value={form.interest_rate} onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} /></div>
          <div><label className="label">Tenure (Months) *</label><input className="input" type="number" value={form.tenure_months} onChange={e => setForm(f => ({ ...f, tenure_months: e.target.value }))} /></div>
          <div className="col-span-2">
            <button type="button" onClick={calcEMI} className="btn-secondary w-full">Calculate EMI</button>
          </div>
          {form.monthly_emi && <div><label className="label">Monthly EMI</label><input className="input bg-slate-50" readOnly value={`₹${Number(form.monthly_emi).toLocaleString()}`} /></div>}
          <div className="col-span-2"><label className="label">Remaining Balance</label><input className="input" type="number" value={form.remaining_balance} onChange={e => setForm(f => ({ ...f, remaining_balance: e.target.value }))} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Loan'}</button>
        </div>
      </Modal>

      <Modal open={modal === 'status'} onClose={() => setModal(null)} title="Update Loan Status">
        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
        {selected && <p className="text-sm text-slate-600 mb-4">Loan: <span className="font-mono text-indigo-700">{selected.loan_reference}</span> — {selected.customer_name}</p>}
        <div className="space-y-4">
          <div><label className="label">New Status</label>
            <select className="input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              <option>Pending</option><option>Approved</option><option>Rejected</option><option>Closed</option>
            </select>
          </div>
          {newStatus === 'Approved' && <div><label className="label">Approved By (Employee ID)</label><input className="input" type="number" value={approvedBy} onChange={e => setApprovedBy(e.target.value)} /></div>}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleStatus} disabled={saving} className="btn-primary">{saving ? 'Updating...' : 'Update'}</button>
        </div>
      </Modal>
    </div>
  )
}
