import { useEffect, useState } from 'react'
import { Plus, Search, Eye, Pencil, Trash2, Users } from 'lucide-react'
import api from '../api/client'
import type { Customer } from '../types'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'

interface Form { first_name: string; last_name: string; email: string; phone: string; dob: string; address: string }
const empty: Form = { first_name: '', last_name: '', email: '', phone: '', dob: '', address: '' }

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | null>(null)
  const [selected, setSelected] = useState<Customer | null>(null)
  const [form, setForm] = useState<Form>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const limit = 10

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/customers', { params: { search, page, limit } })
      setCustomers(data.data)
      setTotal(data.total)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, page])

  const openAdd = () => { setForm(empty); setError(''); setModal('add') }
  const openEdit = (c: Customer) => { setSelected(c); setForm({ first_name: c.first_name, last_name: c.last_name || '', email: c.email, phone: c.phone, dob: c.dob?.slice(0, 10) || '', address: c.address || '' }); setError(''); setModal('edit') }
  const openView = async (c: Customer) => {
    const { data } = await api.get(`/customers/${c.customer_id}`)
    setSelected(data.data); setModal('view')
  }

  const handleSave = async () => {
    if (!form.first_name || !form.email || !form.phone) { setError('Name, email and phone are required'); return }
    setSaving(true); setError('')
    try {
      if (modal === 'add') await api.post('/customers', form)
      else await api.put(`/customers/${selected?.customer_id}`, form)
      setModal(null); load()
    } catch (e: any) { setError(e.message) } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this customer?')) return
    try { await api.delete(`/customers/${id}`); load() } catch (e: any) { alert(e.message) }
  }

  const pages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search by name, email or phone..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Add Customer
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? <Loader /> : customers.length === 0 ? (
          <EmptyState icon={Users} title="No customers found" description="Add your first customer to get started" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="table-header">ID</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header">DOB</th>
                  <th className="table-header">Address</th>
                  <th className="table-header">Joined</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map(c => (
                  <tr key={c.customer_id} className="hover:bg-slate-50">
                    <td className="table-cell text-blue-700 font-mono text-xs">#{c.customer_id}</td>
                    <td className="table-cell font-medium">{c.first_name} {c.last_name}</td>
                    <td className="table-cell text-slate-500">{c.email}</td>
                    <td className="table-cell text-slate-500">{c.phone}</td>
                    <td className="table-cell text-slate-500">{c.dob ? new Date(c.dob).toLocaleDateString() : '—'}</td>
                    <td className="table-cell text-slate-500 max-w-[150px] truncate">{c.address || '—'}</td>
                    <td className="table-cell text-xs text-slate-400">{new Date(c.create_at).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openView(c)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600" title="View"><Eye size={14} /></button>
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-amber-50 text-amber-600" title="Edit"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(c.customer_id)} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Delete"><Trash2 size={14} /></button>
                      </div>
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

      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Customer' : 'Edit Customer'}>
        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">First Name *</label><input className="input" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
          <div><label className="label">Last Name</label><input className="input" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
          <div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div><label className="label">Phone *</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div><label className="label">Date of Birth</label><input className="input" type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} /></div>
          <div className="col-span-2"><label className="label">Address</label><input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </Modal>

      <Modal open={modal === 'view'} onClose={() => setModal(null)} title="Customer Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                {selected.first_name[0]}{selected.last_name?.[0]}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selected.first_name} {selected.last_name}</h3>
                <p className="text-sm text-slate-500">{selected.email} • {selected.phone}</p>
              </div>
            </div>
            {selected.accounts && selected.accounts.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Accounts</h4>
                <div className="space-y-2">
                  {selected.accounts.map((a: any) => (
                    <div key={a.account_id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-mono text-blue-700">{a.account_number}</p>
                        <p className="text-xs text-slate-500">{a.account_type} • {a.branch_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">₹{Number(a.balance).toLocaleString()}</p>
                        <Badge value={a.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selected.loans && selected.loans.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Loans</h4>
                <div className="space-y-2">
                  {selected.loans.map((l: any) => (
                    <div key={l.loan_id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-mono text-indigo-700">{l.loan_reference}</p>
                        <p className="text-xs text-slate-500">{l.loan_type} • {l.tenure_months}mo</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">₹{Number(l.principal_amount).toLocaleString()}</p>
                        <Badge value={l.loan_status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
