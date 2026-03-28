export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
      {/* Enhanced grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] z-0" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#2563EB]/10 rounded-full blur-[120px] z-0 animate-pulse-slow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7C3AED]/5 rounded-full blur-[100px] z-0 animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-[#2563EB]/3 rounded-full blur-[80px] z-0 animate-pulse-slow" style={{ animationDelay: '2s' }} />
      
      <div className="mb-8 flex flex-col items-center relative z-10">
        <div className="w-16 h-16 bg-[#2563EB] rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(37,99,235,0.4)] glow-blue">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter">AI Workplace Monitor</h1>
      </div>
      <div className="relative z-10 w-full flex justify-center">{children}</div>
    </div>
  )
}
