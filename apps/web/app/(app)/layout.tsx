import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      {/* Desktop: content offset by sidebar width */}
      <div className="md:pl-60">
        {children}
      </div>
      {/* Mobile: extra padding so content doesn't sit under BottomNav */}
      <div className="h-16 md:hidden" aria-hidden="true" />
      <BottomNav />
    </div>
  )
}
