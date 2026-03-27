'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-md w-full glass p-10 rounded-[40px] border border-[#EF4444]/20 text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#EF4444] to-transparent opacity-20" />
        
        <div className="w-20 h-20 bg-[#EF4444]/10 rounded-3xl flex items-center justify-center mx-auto border border-[#EF4444]/20">
          <AlertTriangle className="w-10 h-10 text-[#EF4444]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight">System Error</h1>
          <p className="text-[#94A3B8] text-sm leading-relaxed">
            Something went wrong while processing your request. Our team has been notified.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full py-4 bg-[#EF4444] text-white font-black rounded-2xl hover:bg-[#DC2626] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_10px_30px_rgba(239,68,68,0.3)]"
          >
            <RefreshCcw className="w-5 h-5" /> Try Again
          </button>
          
          <Link
            href="/"
            className="w-full py-4 bg-[#1E293B] text-[#F1F5F9] font-bold rounded-2xl border border-[#334155] hover:bg-[#334155] transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" /> Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
