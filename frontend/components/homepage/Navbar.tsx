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
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'py-4' : 'py-6'}`}>
      <div className="container mx-auto px-6">
        <div className={`glass rounded-[32px] px-8 py-4 flex items-center justify-between border border-white/5 shadow-2xl backdrop-blur-3xl transition-all duration-500 ${isScrolled ? 'bg-black/20 translate-y-2' : 'bg-transparent'}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#60A5FA] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tighter uppercase leading-none">AI Monitor</span>
              <span className="text-[10px] text-[#2563EB] font-black uppercase tracking-[0.2em]">Workplace</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-sm font-bold text-[#94A3B8] hover:text-[#2563EB] transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563EB] group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/auth/login"
              className="px-6 py-3 text-sm font-bold text-white hover:text-[#2563EB] transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/auth/register"
              className="px-8 py-3 bg-[#2563EB] text-white text-sm font-black rounded-2xl hover:bg-[#1D4ED8] transition-all flex items-center gap-2 active:scale-95 shadow-[0_10px_30px_rgba(37,99,235,0.3)]"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full p-6 animate-in slide-in-from-top duration-300">
          <div className="glass p-8 rounded-[40px] flex flex-col gap-6 border border-white/10">
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
