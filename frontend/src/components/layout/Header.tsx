import { Menu, Bell } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customer Management',
  '/accounts': 'Account Management',
  '/transactions': 'Transactions',
  '/transfer': 'Money Transfer Center',
  '/loans': 'Loan Management',
  '/branches': 'Branch Analytics',
  '/employees': 'Employee Management',
  '/audit-logs': 'Audit Logs',
  '/reports': 'Reports & Analytics',
}

interface Props {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: Props) {
  const { pathname } = useLocation()
  const title = titles[pathname] || 'Banking System'

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600">
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
          A
        </div>
      </div>
    </header>
  )
}
