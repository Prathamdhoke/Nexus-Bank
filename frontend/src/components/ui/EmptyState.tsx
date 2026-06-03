import { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  description?: string
}

export default function EmptyState({ icon: Icon, title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="p-4 bg-slate-100 rounded-full">
        <Icon size={28} className="text-slate-400" />
      </div>
      <p className="font-medium text-slate-600">{title}</p>
      {description && <p className="text-sm text-slate-400 max-w-xs">{description}</p>}
    </div>
  )
}
