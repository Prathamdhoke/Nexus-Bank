import { useEffect, useState } from 'react'
import { Plus, Search, UserCog, Pencil, Trash2 } from 'lucide-react'
import api from '../api/client'
import type { Employee } from '../types'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'

interface Form { employee_code: string; first_name: string; last_name: string; email: string; phone: string; branch_id: string; role: string; salary: string; hire_date: string; status: string }
const empty: Form = { employee_code: '', first_name: '', last_name: '', email: '', phone: '', branch_id: '', role: 'Teller', salary: '', hire_date: '', status: 'Active' }

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Employee | null>(null)
  const [form, setForm] = useState<Form>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/employees', { params: { search, role: roleFilter, page, limit } })
      setEmployees(data.data); setTotal(data.total)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, roleFilter, page])

  const openEdit = (e: Employee) => {
    setSelected(e)
    setForm({ employee_code: e.employee_code, first_name: e.first_name, last_name: e.last_name || '', email: e.email, phone: e.phone, branch_id: String(e.branch_id), role: e.role, salary: String(e.salary), hire_date: e.hire_date?.slice(0, 10) || '', status: e.status })
    setError(''); setModal('edit')
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      if (modal === 'add') {
        await api.post('/employees', { ...form, branch_id: Number(form.branch_id), salary: Number(form.salary) })
      } else {
        await api.put(`/employees/${selected?.employee_id}`, { ...form, branch_id: Number(form.branch_id), salary: Number(form.salary) })
      }
      setModal(null); load()
    } catch (e: any) { setError(e.message) } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this employee?')) return
    try { await api.delete(`/employees/${id}`); load() } catch (e: any) { alert(e.message) }
  }

  const pages = Math.ceil(total / limit)
  const roleColors: Record<string, string> = {
    Manager: 'bg-purple-100 text-purple-800',
    Teller: 'bg-blue-100 text-blue-800',
    Auditor: 'bg-amber-100 text-amber-800',
    Admin: 'bg-rose-100 text-rose-800',
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search employees..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="input w-auto" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}>
            <option value="">All Roles</option>
            <option>Teller</option><option>Manager</option><option>Auditor</option><option>Admin</option>
          </select>
        </div>
        <button onClick={() => { setForm(empty); setError(''); setModal('add') }} className="btn-primary flex items-center gap-2"><Plus size={15} /> Add Employee</button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? <Loader /> : employees.length === 0 ? (
          <EmptyState icon={UserCog} title="No employees found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="table-header">Code</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header">Branch</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Salary</th>
                  <th className="table-header">Hire Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map(e => (
                  <tr key={e.employee_id} className="hover:bg-slate-50">
                    <td className="table-cell font-mono text-xs text-slate-600">{e.employee_code}</td>
                    <td className="table-cell font-medium">{e.first_name} {e.last_name}</td>
                    <td className="table-cell text-slate-500 text-xs">{e.email}</td>
                    <td className="table-cell text-slate-500">{e.phone}</td>
                    <td className="table-cell text-slate-500">{e.branch_name}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[e.role] || 'bg-slate-100 text-slate-700'}`}>{e.role}</span>
                    </td>
                    <td className="table-cell font-semibold text-slate-700">₹{Number(e.salary).toLocaleString()}</td>
                    <td className="table-cell text-xs text-slate-500">{new Date(e.hire_date).toLocaleDateString()}</td>
                    <td className="table-cell"><Badge value={e.status} /></td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(e)} className="p-1.5 rounded hover:bg-amber-50 text-amber-600"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(e.employee_id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
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
          <span>Page {page} of {pages}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Prev</button>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Employee' : 'Edit Employee'} size="lg">
        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Employee Code *</label><input className="input" disabled={modal === 'edit'} value={form.employee_code} onChange={e => setForm(f => ({ ...f, employee_code: e.target.value }))} /></div>
          <div><label className="label">First Name *</label><input className="input" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
          <div><label className="label">Last Name</label><input className="input" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
          <div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div><label className="label">Phone *</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div><label className="label">Branch ID *</label><input className="input" type="number" value={form.branch_id} onChange={e => setForm(f => ({ ...f, branch_id: e.target.value }))} /></div>
          <div><label className="label">Role *</label>
            <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option>Teller</option><option>Manager</option><option>Auditor</option><option>Admin</option>
            </select>
          </div>
          <div><label className="label">Salary *</label><input className="input" type="number" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} /></div>
          <div><label className="label">Hire Date *</label><input className="input" type="date" value={form.hire_date} onChange={e => setForm(f => ({ ...f, hire_date: e.target.value }))} /></div>
          <div><label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option>Active</option><option>Inactive</option><option>Suspended</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </Modal>
    </div>
  )
}
