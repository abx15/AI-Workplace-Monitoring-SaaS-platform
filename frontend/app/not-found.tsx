import { FileSearch, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-md w-full glass p-10 rounded-[40px] border border-[#334155]/50 text-center space-y-8">
        <div className="w-24 h-24 bg-[#2563EB]/10 rounded-[40px] flex items-center justify-center mx-auto border border-[#2563EB]/20 relative">
          <FileSearch className="w-12 h-12 text-[#2563EB]" />
          <div className="absolute -top-2 -right-2 bg-[#EF4444] text-white text-[10px] font-black px-2 py-1 rounded-full px-3">404</div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tighter">Lost in Space</h1>
          <p className="text-[#94A3B8] text-sm leading-relaxed">
            The page you are looking for doesn't exist or has been moved to another dimension.
          </p>
        </div>

        <Link
          href="/"
          className="w-full py-5 bg-[#2563EB] text-white font-black rounded-[24px] hover:bg-[#1D4ED8] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_20px_40px_rgba(37,99,235,0.25)]"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Safety
        </Link>
      </div>
    </div>
  )
}
