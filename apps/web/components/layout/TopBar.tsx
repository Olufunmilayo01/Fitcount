'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface TopBarProps {
  title: string
  displayName?: string
}

export function TopBar({ title, displayName }: TopBarProps) {
  const router = useRouter()
  const qc = useQueryClient()

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      qc.clear()
      router.push('/')   // return to landing page after logout
    },
  })

  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'FC'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-green-100 text-green-700 text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logoutMutation.mutate()}
          className="text-gray-500 hover:text-gray-700"
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
