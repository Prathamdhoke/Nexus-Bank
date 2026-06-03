interface Props {
  value: string
  type?: 'status' | 'loan' | 'txn' | 'emp'
}

const map: Record<string, string> = {
  Active: 'badge-active',
  Frozen: 'badge-frozen',
  Closed: 'badge-closed',
  Pending: 'badge-pending',
  Approved: 'badge-approved',
  Rejected: 'badge-rejected',
  Success: 'badge-success',
  Failed: 'badge-failed',
  Reversed: 'badge-pending',
  Inactive: 'badge-closed',
  Suspended: 'badge-rejected',
  Home: 'bg-purple-100 text-purple-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  Personal: 'bg-orange-100 text-orange-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  Education: 'bg-blue-100 text-blue-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  Vehicle: 'bg-teal-100 text-teal-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  Business: 'bg-indigo-100 text-indigo-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  Transfer: 'bg-blue-100 text-blue-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  Deposit: 'bg-green-100 text-green-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  Withdraw: 'bg-red-100 text-red-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  Saving: 'bg-emerald-100 text-emerald-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  Current: 'bg-violet-100 text-violet-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
}

export default function Badge({ value }: Props) {
  const cls = map[value] || 'badge-closed'
  return <span className={cls}>{value}</span>
}
