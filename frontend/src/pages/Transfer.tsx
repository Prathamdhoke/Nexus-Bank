import { useState } from 'react'
import { Send, CheckCircle, AlertCircle, ArrowLeftRight, Plus, Minus } from 'lucide-react'
import api from '../api/client'

type Tab = 'transfer' | 'deposit' | 'withdraw'

interface TxnForm { sender_account_id: string; receiver_account_id: string; amount: string; mode: string }
interface DepForm { account_id: string; amount: string; mode: string; remarks: string }

const emptyTxn: TxnForm = { sender_account_id: '', receiver_account_id: '', amount: '', mode: 'UPI' }
const emptyDep: DepForm = { account_id: '', amount: '', mode: 'Cash', remarks: '' }

export default function Transfer() {
  const [tab, setTab] = useState<Tab>('transfer')
  const [txnForm, setTxnForm] = useState<TxnForm>(emptyTxn)
  const [depForm, setDepForm] = useState<DepForm>(emptyDep)
  const [wdForm, setWdForm] = useState<DepForm>({ ...emptyDep, mode: 'Cash' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)

  const doTransfer = async () => {
    if (!txnForm.sender_account_id || !txnForm.receiver_account_id || !txnForm.amount || !txnForm.mode) {
      setResult({ success: false, message: 'All fields are required' }); return
    }
    setLoading(true); setResult(null)
    try {
      const { data } = await api.post('/transactions/transfer', {
        sender_account_id: Number(txnForm.sender_account_id),
        receiver_account_id: Number(txnForm.receiver_account_id),
        amount: Number(txnForm.amount),
        mode: txnForm.mode,
      })
      setResult({ success: true, message: 'Transfer completed successfully!', data: data.data })
      setTxnForm(emptyTxn)
    } catch (e: any) { setResult({ success: false, message: e.message }) } finally { setLoading(false) }
  }

  const doDeposit = async () => {
    if (!depForm.account_id || !depForm.amount) { setResult({ success: false, message: 'Account ID and amount required' }); return }
    setLoading(true); setResult(null)
    try {
      const { data } = await api.post('/transactions/deposit', { account_id: Number(depForm.account_id), amount: Number(depForm.amount), mode: depForm.mode, remarks: depForm.remarks })
      setResult({ success: true, message: 'Deposit successful!', data: data.data })
      setDepForm(emptyDep)
    } catch (e: any) { setResult({ success: false, message: e.message }) } finally { setLoading(false) }
  }

  const doWithdraw = async () => {
    if (!wdForm.account_id || !wdForm.amount) { setResult({ success: false, message: 'Account ID and amount required' }); return }
    setLoading(true); setResult(null)
    try {
      const { data } = await api.post('/transactions/withdraw', { account_id: Number(wdForm.account_id), amount: Number(wdForm.amount), mode: wdForm.mode, remarks: wdForm.remarks })
      setResult({ success: true, message: 'Withdrawal successful!', data: data.data })
      setWdForm({ ...emptyDep, mode: 'Cash' })
    } catch (e: any) { setResult({ success: false, message: e.message }) } finally { setLoading(false) }
  }

  const modes = ['UPI', 'NEFT', 'RTGS', 'IMPS', 'Cash']

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card p-1">
        <div className="flex">
          {[
            { key: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
            { key: 'deposit', label: 'Deposit', icon: Plus },
            { key: 'withdraw', label: 'Withdraw', icon: Minus },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key as Tab); setResult(null) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${tab === key ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {result.success ? <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" /> : <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />}
          <div>
            <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>{result.message}</p>
            {result.data && (
              <p className="text-xs text-green-600 mt-1">Reference: <span className="font-mono">{result.data.transaction_reference}</span></p>
            )}
          </div>
        </div>
      )}

      <div className="card">
        {tab === 'transfer' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <ArrowLeftRight size={18} className="text-blue-600" />
              <h2 className="font-semibold text-slate-800">Money Transfer</h2>
              <span className="text-xs text-slate-500 ml-auto">Uses stored procedure — ACID compliant</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              This transfer uses the <strong>CALL TransferMoney()</strong> stored procedure which validates sender status, checks balance, performs atomic debit/credit, and logs the transaction in a single ACID transaction.
            </div>
            <div><label className="label">Sender Account ID *</label>
              <input className="input" type="number" placeholder="e.g. 1" value={txnForm.sender_account_id} onChange={e => setTxnForm(f => ({ ...f, sender_account_id: e.target.value }))} />
            </div>
            <div><label className="label">Receiver Account ID *</label>
              <input className="input" type="number" placeholder="e.g. 2" value={txnForm.receiver_account_id} onChange={e => setTxnForm(f => ({ ...f, receiver_account_id: e.target.value }))} />
            </div>
            <div><label className="label">Amount (₹) *</label>
              <input className="input" type="number" placeholder="e.g. 5000" value={txnForm.amount} onChange={e => setTxnForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div><label className="label">Transaction Mode *</label>
              <select className="input" value={txnForm.mode} onChange={e => setTxnForm(f => ({ ...f, mode: e.target.value }))}>
                {modes.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <button onClick={doTransfer} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              <Send size={16} /> {loading ? 'Processing...' : 'Transfer Money'}
            </button>
          </div>
        )}

        {tab === 'deposit' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Plus size={18} className="text-emerald-600" />
              <h2 className="font-semibold text-slate-800">Cash / Online Deposit</h2>
            </div>
            <div><label className="label">Account ID *</label>
              <input className="input" type="number" placeholder="e.g. 1" value={depForm.account_id} onChange={e => setDepForm(f => ({ ...f, account_id: e.target.value }))} />
            </div>
            <div><label className="label">Amount (₹) *</label>
              <input className="input" type="number" placeholder="e.g. 10000" value={depForm.amount} onChange={e => setDepForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div><label className="label">Mode *</label>
              <select className="input" value={depForm.mode} onChange={e => setDepForm(f => ({ ...f, mode: e.target.value }))}>
                {modes.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div><label className="label">Remarks</label>
              <input className="input" placeholder="Optional" value={depForm.remarks} onChange={e => setDepForm(f => ({ ...f, remarks: e.target.value }))} />
            </div>
            <button onClick={doDeposit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3" style={{ background: '#059669' }}>
              <Plus size={16} /> {loading ? 'Processing...' : 'Deposit Funds'}
            </button>
          </div>
        )}

        {tab === 'withdraw' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Minus size={18} className="text-red-600" />
              <h2 className="font-semibold text-slate-800">Withdrawal</h2>
            </div>
            <div><label className="label">Account ID *</label>
              <input className="input" type="number" placeholder="e.g. 1" value={wdForm.account_id} onChange={e => setWdForm(f => ({ ...f, account_id: e.target.value }))} />
            </div>
            <div><label className="label">Amount (₹) *</label>
              <input className="input" type="number" placeholder="e.g. 5000" value={wdForm.amount} onChange={e => setWdForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div><label className="label">Mode *</label>
              <select className="input" value={wdForm.mode} onChange={e => setWdForm(f => ({ ...f, mode: e.target.value }))}>
                {modes.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div><label className="label">Remarks</label>
              <input className="input" placeholder="Optional" value={wdForm.remarks} onChange={e => setWdForm(f => ({ ...f, remarks: e.target.value }))} />
            </div>
            <button onClick={doWithdraw} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3" style={{ background: '#dc2626' }}>
              <Minus size={16} /> {loading ? 'Processing...' : 'Withdraw Funds'}
            </button>
          </div>
        )}
      </div>

      <div className="card bg-slate-900 text-white">
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Business Rules Enforced</h3>
        <ul className="space-y-1.5 text-xs text-slate-400">
          <li>• Sender account must be <span className="text-green-400">Active</span> — Frozen or Closed accounts cannot send</li>
          <li>• Sufficient balance required — Triggers prevent negative balance</li>
          <li>• All transfers are <span className="text-blue-400">ACID</span> transactions — rollback on failure</li>
          <li>• Every balance change is logged to <span className="text-yellow-400">audit_logs</span> via trigger</li>
          <li>• Transfer amount must be <span className="text-purple-400">&gt; 0</span></li>
        </ul>
      </div>
    </div>
  )
}
