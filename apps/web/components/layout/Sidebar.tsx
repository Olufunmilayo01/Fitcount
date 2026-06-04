'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Dumbbell, Activity, Target, Award, User, Settings2, LayoutTemplate } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/track', label: 'Daily Tracking', icon: Activity },
  { href: '/progress', label: 'Progress', icon: Target },
  { href: '/milestones', label: 'Milestones', icon: Award },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex h-screen w-60 flex-col border-r bg-white fixed left-0 top-0 z-40">
      <Link href="/" className="flex h-16 items-center gap-3 px-6 border-b hover:bg-green-50 transition-colors group">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white text-sm font-bold group-hover:bg-green-600 transition-colors">F</div>
        <span className="text-lg font-semibold text-gray-900">Fitcount</span>
      </Link>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className={cn('h-4 w-4', active && 'text-green-600')} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-3 border-t space-y-1">
        <Link href="/profile"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <User className="h-4 w-4" />
          Profile
        </Link>
        <Link href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-green-50 hover:text-green-700 transition-colors">
          <LayoutTemplate className="h-4 w-4" />
          Home page
        </Link>
        <Link href="/setup"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-amber-50 hover:text-amber-700 transition-colors">
          <Settings2 className="h-4 w-4" />
          Image Setup
        </Link>
      </div>
    </aside>
  )
}
