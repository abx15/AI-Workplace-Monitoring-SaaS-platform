'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Shield, ArrowRight } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
  ]

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'py-4' : 'py-6'}`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className={`glass-panel rounded-[32px] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between border border-white/10 shadow-2xl transition-all duration-500 ${isScrolled ? 'bg-black/40 translate-y-2' : 'bg-transparent'}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#2563EB] to-[#60A5FA] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black text-white tracking-tighter uppercase leading-none">AI Monitor</span>
              <span className="text-[8px] sm:text-[10px] text-[#2563EB] font-black uppercase tracking-[0.2em]">Workplace</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-sm font-bold text-[#94A3B8] hover:text-white transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563EB] group-hover:w-full transition-all duration-300 glow-blue" />
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Link 
              href="/auth/login"
              className="px-4 py-3 text-sm font-bold text-[#94A3B8] hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/auth/register"
              className="px-6 sm:px-8 py-2.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white text-sm font-black rounded-xl hover:scale-105 transition-all flex items-center gap-2 active:scale-95 shadow-[0_10px_30px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.6)]"
            >
              Start Trial <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-[#94A3B8] hover:text-white transition-colors focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full p-4 sm:p-6 animate-in slide-in-from-top duration-300">
          <div className="glass p-6 sm:p-8 rounded-[40px] flex flex-col gap-6 border border-white/10">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-bold text-white"
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-white/5" />
            <Link href="/auth/login" className="text-lg font-bold text-white">Login</Link>
            <Link 
              href="/auth/register"
              className="w-full py-5 bg-[#2563EB] text-white font-black rounded-3xl text-center"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
