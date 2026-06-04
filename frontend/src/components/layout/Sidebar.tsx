import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, CreditCard, ArrowLeftRight,
  Send, FileText, Building2, UserCog, ScrollText,
  BarChart3, X, Landmark
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/accounts', icon: CreditCard, label: 'Accounts' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/transfer', icon: Send, label: 'Money Transfer' },
  { to: '/loans', icon: FileText, label: 'Loans' },
  { to: '/branches', icon: Building2, label: 'Branches' },
  { to: '/employees', icon: UserCog, label: 'Employees' },
  { to: '/audit-logs', icon: ScrollText, label: 'Audit Logs' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: Props) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Landmark size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Nexus Bank</p>
              <p className="text-xs text-slate-400">Management System</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-700">
          <p className="text-xs text-slate-500">Banking Management System v1.0</p>
        </div>
      </aside>
    </>
  )
}
