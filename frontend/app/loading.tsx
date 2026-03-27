export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center gap-8">
      <div className="relative w-24 h-24">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-[#2563EB]/10 rounded-full" />
        {/* Spinning Ring */}
        <div className="absolute inset-0 border-4 border-t-[#2563EB] rounded-full animate-spin shadow-[0_0_20px_rgba(37,99,235,0.3)]" />
        {/* Inner Pulse */}
        <div className="absolute inset-4 bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] rounded-full animate-pulse opacity-20" />
      </div>
      
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold bg-gradient-to-r from-white to-[#94A3B8] bg-clip-text text-transparent animate-pulse">
          Initializing System
        </h2>
        <p className="text-[10px] text-[#2563EB] font-black uppercase tracking-[0.3em]">
          Securing Connection...
        </p>
      </div>
    </div>
  )
}
