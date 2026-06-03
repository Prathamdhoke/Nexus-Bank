import { useEffect, useState } from 'react'
import { Plus, Building2 } from 'lucide-react'
import api from '../api/client'
import type { Branch } from '../types'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Form { branch_name: string; branch_code: string; IFSC_Code: string; city: string; state: string; manager_name: string; contact_number: string }
const empty: Form = { branch_name: '', branch_code: '', IFSC_Code: '', city: '', state: '', manager_name: '', contact_number: '' }

function fmt(n: number) {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`
  return `₹${Number(n).toLocaleString()}`
}

export default function Branches() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | null>(null)
  const [form, setForm] = useState<Form>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try { const { data } = await api.get('/branches'); setBranches(data.data) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.branch_name || !form.branch_code || !form.IFSC_Code || !form.city || !form.state) { setError('Required fields missing'); return }
    setSaving(true); setError('')
    try { await api.post('/branches', form); setModal(null); load() }
    catch (e: any) { setError(e.message) } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => { setForm(empty); setError(''); setModal('add') }} className="btn-primary flex items-center gap-2"><Plus size={15} /> Add Branch</button>
      </div>

      {loading ? <Loader /> : branches.length === 0 ? (
        <EmptyState icon={Building2} title="No branches found" />
      ) : (
        <>
          <div className="card">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Branch Deposits Overview</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={branches} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => fmt(Number(v))} />
                <YAxis dataKey="branch_name" type="category" tick={{ fontSize: 11 }} width={130} />
                <Tooltip formatter={(v: any) => [fmt(Number(v)), 'Total Deposits']} />
                <Bar dataKey="total_balance" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {branches.map(b => (
              <div key={b.branch_id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">{b.branch_name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{b.branch_code} • {b.IFSC_Code}</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Building2 size={16} className="text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="font-medium">{b.city}, {b.state}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Manager</span><span className="font-medium">{b.manager_name || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Contact</span><span className="font-medium">{b.contact_number || '—'}</span></div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-blue-700">{b.employee_count ?? 0}</p>
                    <p className="text-xs text-slate-500">Employees</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-700">{b.account_count ?? 0}</p>
                    <p className="text-xs text-slate-500">Accounts</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-indigo-700">{fmt(Number(b.total_balance ?? 0))}</p>
                    <p className="text-xs text-slate-500">Deposits</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Add Branch" size="lg">
        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="label">Branch Name *</label><input className="input" value={form.branch_name} onChange={e => setForm(f => ({ ...f, branch_name: e.target.value }))} /></div>
          <div><label className="label">Branch Code *</label><input className="input" placeholder="BR006" value={form.branch_code} onChange={e => setForm(f => ({ ...f, branch_code: e.target.value }))} /></div>
          <div><label className="label">IFSC Code *</label><input className="input" placeholder="SBIN0001006" value={form.IFSC_Code} onChange={e => setForm(f => ({ ...f, IFSC_Code: e.target.value }))} /></div>
          <div><label className="label">City *</label><input className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
          <div><label className="label">State *</label><input className="input" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></div>
          <div><label className="label">Manager Name</label><input className="input" value={form.manager_name} onChange={e => setForm(f => ({ ...f, manager_name: e.target.value }))} /></div>
          <div><label className="label">Contact Number</label><input className="input" value={form.contact_number} onChange={e => setForm(f => ({ ...f, contact_number: e.target.value }))} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Add Branch'}</button>
        </div>
      </Modal>
    </div>
  )
}
