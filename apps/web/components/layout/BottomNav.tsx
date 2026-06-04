'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Dumbbell, Activity, Target, Award } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/track', label: 'Track', icon: Activity },
  { href: '/progress', label: 'Progress', icon: Target },
  { href: '/milestones', label: 'Badges', icon: Award },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                active ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'stroke-green-600')} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
