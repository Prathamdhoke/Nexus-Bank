import { useEffect, useState } from 'react'
import { Plus, Search, CreditCard } from 'lucide-react'
import api from '../api/client'
import type { Account } from '../types'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'

interface Form { account_number: string; customer_id: string; branch_id: string; account_type: string; balance: string; minimum_balance: string; status: string }
const empty: Form = { account_number: '', customer_id: '', branch_id: '', account_type: 'Saving', balance: '0', minimum_balance: '1000', status: 'Active' }

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Account | null>(null)
  const [form, setForm] = useState<Form>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/accounts', { params: { search, status: statusFilter, type: typeFilter, page, limit } })
      setAccounts(data.data)
      setTotal(data.total)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, statusFilter, typeFilter, page])

  const openAdd = () => { setForm(empty); setError(''); setModal('add') }
  const openEdit = (a: Account) => {
    setSelected(a)
    setForm({ account_number: a.account_number, customer_id: String(a.customer_id), branch_id: String(a.branch_id), account_type: a.account_type, balance: String(a.balance), minimum_balance: String(a.minimum_balance), status: a.status })
    setError(''); setModal('edit')
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      if (modal === 'add') {
        await api.post('/accounts', { ...form, customer_id: Number(form.customer_id), branch_id: Number(form.branch_id), balance: Number(form.balance), minimum_balance: Number(form.minimum_balance) })
      } else {
        await api.put(`/accounts/${selected?.account_id}`, { status: form.status, minimum_balance: Number(form.minimum_balance) })
      }
      setModal(null); load()
    } catch (e: any) { setError(e.message) } finally { setSaving(false) }
  }

  const pages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search accounts..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="input w-auto" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            <option>Active</option><option>Frozen</option><option>Closed</option>
          </select>
          <select className="input w-auto" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
            <option value="">All Types</option>
            <option>Saving</option><option>Current</option>
          </select>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={15} /> Add Account</button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? <Loader /> : accounts.length === 0 ? (
          <EmptyState icon={CreditCard} title="No accounts found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="table-header">Account No.</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Branch</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Balance</th>
                  <th className="table-header">Min. Balance</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Created</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map(a => (
                  <tr key={a.account_id} className="hover:bg-slate-50">
                    <td className="table-cell font-mono text-xs text-blue-700">{a.account_number}</td>
                    <td className="table-cell font-medium">{a.customer_name}</td>
                    <td className="table-cell text-slate-500">{a.branch_name}</td>
                    <td className="table-cell"><Badge value={a.account_type} /></td>
                    <td className="table-cell font-semibold text-emerald-700">₹{Number(a.balance).toLocaleString()}</td>
                    <td className="table-cell text-slate-500">₹{Number(a.minimum_balance).toLocaleString()}</td>
                    <td className="table-cell"><Badge value={a.status} /></td>
                    <td className="table-cell text-xs text-slate-400">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <button onClick={() => openEdit(a)} className="text-xs btn-secondary py-1 px-2">Edit Status</button>
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
          <span>Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Prev</button>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Account' : 'Edit Account'}>
        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
        {modal === 'add' ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Account Number *</label><input className="input" value={form.account_number} onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))} /></div>
            <div><label className="label">Customer ID *</label><input className="input" type="number" value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} /></div>
            <div><label className="label">Branch ID *</label><input className="input" type="number" value={form.branch_id} onChange={e => setForm(f => ({ ...f, branch_id: e.target.value }))} /></div>
            <div><label className="label">Account Type *</label>
              <select className="input" value={form.account_type} onChange={e => setForm(f => ({ ...f, account_type: e.target.value }))}>
                <option>Saving</option><option>Current</option>
              </select>
            </div>
            <div><label className="label">Initial Balance</label><input className="input" type="number" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} /></div>
            <div><label className="label">Minimum Balance</label><input className="input" type="number" value={form.minimum_balance} onChange={e => setForm(f => ({ ...f, minimum_balance: e.target.value }))} /></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option>Active</option><option>Frozen</option><option>Closed</option>
              </select>
            </div>
            <div><label className="label">Minimum Balance</label><input className="input" type="number" value={form.minimum_balance} onChange={e => setForm(f => ({ ...f, minimum_balance: e.target.value }))} /></div>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </Modal>
    </div>
  )
}
