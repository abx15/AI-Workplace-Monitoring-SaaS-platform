'use client'

import { Loader2 } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-[#2563EB] animate-spin" />
        <div className="absolute inset-0 bg-[#2563EB]/20 blur-xl animate-pulse rounded-full" />
      </div>
      <p className="mt-4 text-[#94A3B8] font-bold text-xs uppercase tracking-[0.3em] animate-pulse">Initializing System...</p>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="glass p-5 rounded-3xl border border-[#334155]/50 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-2xl bg-[#334155]/50" />
        <div className="w-12 h-5 rounded-full bg-[#334155]/30" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-24 bg-[#334155]/50 rounded-full" />
        <div className="h-8 w-32 bg-[#334155]/30 rounded-full" />
      </div>
      <div className="h-1.5 w-full bg-[#334155]/20 rounded-full" />
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="glass rounded-[32px] border border-[#334155]/50 overflow-hidden animate-pulse">
        <div className="h-14 bg-[#1E293B]/50 border-b border-[#334155]/50" />
        <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#334155]/50" />
                        <div className="space-y-2">
                            <div className="h-3 w-32 bg-[#334155]/50 rounded-full" />
                            <div className="h-2 w-24 bg-[#334155]/30 rounded-full" />
                        </div>
                    </div>
                    <div className="h-4 w-20 bg-[#334155]/20 rounded-full" />
                </div>
            ))}
        </div>
    </div>
  )
}
