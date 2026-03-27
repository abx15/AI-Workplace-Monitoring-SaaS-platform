'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/homepage/Navbar'
import { Shield, Camera, Bell, UserCheck, BarChart3, Users, Play, Check, ChevronRight, Star, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="bg-[#020617] min-h-screen text-white overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-32 md:pt-40 pb-16 sm:pb-24 md:pb-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#2563EB]/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#2563EB]/10 rounded-full blur-[120px]" />
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#2563EB 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#60A5FA] text-xs font-black uppercase tracking-[0.2em]"
            >
               <span className="flex h-2 w-2 rounded-full bg-[#2563EB] animate-ping" />
               New Version 2.0 is Live
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-white"
            >
              AI-Powered <br />
              <span className="bg-gradient-to-r from-[#2563EB] to-[#60A5FA] bg-clip-text text-transparent">Workplace Intelligence</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl md:text-xl text-[#94A3B8] max-w-2xl mx-auto font-medium"
            >
              Monitor your workforce in real-time with advanced face recognition, 
              behavior analysis, and instant smart alerts.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8"
            >
              <Link 
                href="/auth/register"
                className="w-full md:w-auto px-12 py-6 bg-[#2563EB] text-white text-lg font-black rounded-3xl hover:bg-[#1D4ED8] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-[0_20px_40px_rgba(37,99,235,0.3)]"
              >
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <button 
                className="w-full md:w-auto px-12 py-6 glass text-white text-lg font-bold rounded-3xl border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5 fill-white" /> Watch Demo
              </button>
            </motion.div>

            {/* Stats Row */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 pt-20 border-t border-white/5"
            >
              {[
                { label: '500+', sub: 'Companies' },
                { label: '1M+', sub: 'Events Tracked' },
                { label: '99.9%', sub: 'Uptime' },
                { label: '10K+', sub: 'Cameras' },
              ].map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className="text-2xl sm:text-3xl md:text-3xl font-black text-white group-hover:text-[#2563EB] transition-colors">{stat.label}</div>
                  <div className="text-[8px] sm:text-[10px] md:text-[10px] text-[#64748B] font-black uppercase tracking-widest">{stat.sub}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Hero Mockup */}
      <section className="pb-32 relative">
         <div className="container mx-auto px-4 sm:px-6">
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-2 glass rounded-[40px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10" />
              <div className="bg-[#0F172A] rounded-[38px] aspect-[16/9] flex items-center justify-center overflow-hidden">
                 <div className="w-full h-full bg-[#1E293B]/50 animate-pulse relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Shield className="w-20 h-20 text-[#2563EB]/20" />
                    </div>
                 </div>
              </div>
            </motion.div>
         </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16 sm:py-24 md:py-32 bg-[#020617] relative">
         <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-xl mx-auto text-center space-y-4 mb-20">
               <h2 className="text-[10px] text-[#2563EB] font-black uppercase tracking-[0.4em]">The Process</h2>
               <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter">Your Setup in Seconds</h3>
            </div>

            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
               {[
                 { icon: Camera, title: "Connect Cameras", desc: "Easily integrate any IP/RTSP camera using our simple dashboard in seconds." },
                 { icon: Shield, title: "AI Analysis", desc: "Our neural networks process data instantly for face recognition & behavior." },
                 { icon: Bell, title: "Smart Alerts", desc: "Get real-time push notifications the moment an incident is detected." },
               ].map((step, i) => (
                 <div key={i} className="relative group p-6 sm:p-8 lg:p-10 glass rounded-[40px] border border-white/5 hover:border-[#2563EB]/30 transition-all">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#2563EB]/10 rounded-3xl flex items-center justify-center mb-6 sm:mb-8 border border-[#2563EB]/20 group-hover:scale-110 transition-transform">
                       <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#2563EB]" />
                    </div>
                    <div className="text-2xl sm:text-2xl lg:text-3xl font-black text-white mb-4 tracking-tight">{step.title}</div>
                    <p className="text-sm sm:text-base text-[#94A3B8] font-medium leading-relaxed">{step.desc}</p>
                    <div className="absolute bottom-10 right-10 text-8xl font-black text-white opacity-[0.02] tracking-tighter">{i+1}</div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#2563EB]/5 rounded-full blur-[200px] -z-10" />
         
         <div className="container mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center">
               <div className="space-y-10">
                  <div className="space-y-4">
                     <h2 className="text-[10px] text-[#2563EB] font-black uppercase tracking-[0.4em]">Core Capabilities</h2>
                     <h3 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95]">Powerful Features <br />For Modern Teams</h3>
                  </div>
                  
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                     {[
                       { icon: UserCheck, title: "Face Recognition", desc: "Identity tracking with 99.9% accuracy" },
                       { icon: BarChart3, title: "Live Analytics", desc: "Real-time workforce data visualizer" },
                       { icon: Bell, title: "Smart Alerts", desc: "AI-powered behavioral incident detection" },
                       { icon: Users, title: "Role Management", desc: "Granular access for Admin and Operators" },
                       { icon: Camera, title: "Multi-Camera", desc: "Monitor unlimited locations simultaneously" },
                       { icon: Shield, title: "Privacy First", desc: "GDPR compliant data handling and storage" },
                     ].map((item, i) => (
                        <div key={i} className="flex flex-col gap-4 p-6 glass rounded-3xl border border-white/5 hover:bg-white/5 transition-all cursor-default">
                           <item.icon className="w-8 h-8 text-[#2563EB]" />
                           <div className="font-black text-white tracking-tight">{item.title}</div>
                           <p className="text-xs text-[#64748B] font-medium">{item.desc}</p>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="relative">
                  <div className="glass rounded-[50px] p-8 border border-white/10 shadow-2xl">
                     <div className="bg-[#020617] rounded-[42px] overflow-hidden border border-white/5">
                        {/* Fake Dashboard View */}
                        <div className="p-8 space-y-8 animate-in fade-in zoom-in duration-1000">
                           <div className="flex justify-between">
                              <div className="h-6 w-32 bg-white/5 rounded-full" />
                              <div className="h-6 w-20 bg-[#2563EB]/20 rounded-full" />
                           </div>
                           <div className="grid grid-cols-3 gap-4">
                              {[1, 2, 3].map(j => (
                                 <div key={j} className="h-32 bg-white/5 rounded-3xl border border-white/5 border-dashed" />
                              ))}
                           </div>
                           <div className="space-y-4">
                              <div className="h-4 w-full bg-white/5 rounded-full" />
                              <div className="h-4 w-full bg-white/5 rounded-full" />
                              <div className="h-4 w-2/3 bg-white/5 rounded-full" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Pricing Section (Simplified from subscription page) */}
      <section id="pricing" className="py-16 sm:py-24 md:py-32 bg-[#020617]">
         <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto space-y-6 mb-20">
               <h2 className="text-[10px] text-[#2563EB] font-black uppercase tracking-[0.4em]">Pricing Plans</h2>
               <h3 className="text-4xl md:text-6xl font-black tracking-tighter">Scalable Plans for Everyone</h3>
               <p className="text-[#94A3B8] font-medium text-lg">Choose the perfect plan to grow your business.</p>
            </div>

            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
               {[
                  { name: "Basic", price: "999", cameras: "2", features: ["Real-time Monitoring", "7 Days History", "Email Notifications", "Standard Support"] },
                  { name: "Pro", price: "2,999", cameras: "10", features: ["Advanced Face Recognition", "30 Days History", "SMS & WhatsApp Alerts", "Dedicated Support", "Analytics Dashboard"], popular: true },
                  { name: "Enterprise", price: "Custom", cameras: "Unlimited", features: ["Custom AI Training", "On-Premise Deployment", "Unlimited History", "24/7 Priority Support", "White Label Options"] },
               ].map((plan, i) => (
                  <div key={i} className={`relative p-1 glass rounded-[40px] border ${plan.popular ? 'border-[#2563EB]' : 'border-white/5'} transition-all hover:translate-y-[-10px]`}>
                     {plan.popular && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-[#2563EB] text-white text-[10px] font-black uppercase tracking-widest rounded-full">Most Popular</div>
                     )}
                     <div className="p-10 space-y-8 flex flex-col h-full">
                        <div className="space-y-2">
                           <div className="text-xl font-black text-white">{plan.name}</div>
                           <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-black text-white">₹{plan.price}</span>
                              {plan.price !== 'Custom' && <span className="text-[#64748B] font-bold">/mo</span>}
                           </div>
                        </div>

                        <div className="space-y-4 flex-grow">
                           <div className="text-xs font-black uppercase tracking-widest text-[#2563EB]">{plan.cameras} Cameras Supported</div>
                           <div className="space-y-3">
                              {plan.features.map((feat, k) => (
                                 <div key={k} className="flex items-center gap-3 text-sm text-[#94A3B8] font-medium">
                                    <Check className="w-4 h-4 text-[#2563EB]" /> {feat}
                                 </div>
                              ))}
                           </div>
                        </div>

                        <Link 
                           href="/auth/register"
                           className={`w-full py-5 rounded-2xl font-black text-center transition-all ${plan.popular ? 'bg-[#2563EB] text-white shadow-[0_15px_30px_rgba(37,99,235,0.3)]' : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'}`}
                        >
                           Get Started
                        </Link>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 md:py-32 bg-[#020617] border-t border-white/5">
         <div className="container mx-auto px-4 sm:px-6">
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
               {[
                  { name: "Rahul Sharma", role: "Factory Manager, Delhi", quote: "The face recognition accuracy is incredible. It has completely transformed our attendance and security operations." },
                  { name: "Priya Malik", role: "HR Head, Mumbai", quote: "The alerts are instant. We've seen a 40% reduction in workplace incidents since deploying AI Monitor." },
                  { name: "Amit Varma", role: "Ops Director, Bangalore", quote: "Scalable and reliable. Monitoring 50+ locations from a single dashboard has never been easier." },
               ].map((t, i) => (
                  <div key={i} className="p-10 glass rounded-[40px] border border-white/5 space-y-6">
                     <div className="flex gap-1 text-[#FBBF24]">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                     </div>
                     <p className="text-lg font-medium text-white leading-relaxed italic">"{t.quote}"</p>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#60A5FA]" />
                        <div>
                           <div className="font-black text-white">{t.name}</div>
                           <div className="text-xs text-[#64748B] font-bold uppercase tracking-wider">{t.role}</div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-24 md:py-32 bg-[#020617]">
         <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
            <div className="text-center space-y-4 mb-20 text-balance">
               <h2 className="text-[10px] text-[#2563EB] font-black uppercase tracking-[0.4em]">Help Center</h2>
               <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Frequently Asked Questions</h3>
            </div>

            <div className="space-y-6">
               {[
                 { q: "How does face recognition work?", a: "We use state-of-the-art neural networks to create unique facial embeddings that are matched against your company database in real-time." },
                 { q: "Is my data secure?", a: "Yes, all data is encrypted at rest and in transit. We follow GDPR guidelines and ensure your workplace privacy is always protected." },
                 { q: "Can I add multiple locations?", a: "Absolutely. Our platform is designed to handle unlimited locations and cameras from a single centralized dashboard." },
                 { q: "What cameras are supported?", a: "We support any IP camera that provides an RTSP or HTTP stream. Our system is compatible with 99% of modern hardware." },
               ].map((item, i) => (
                  <div key={i} className="p-8 glass rounded-3xl border border-white/5 space-y-4 group hover:bg-white/5 transition-all">
                     <div className="flex justify-between items-center cursor-pointer">
                        <div className="text-lg font-black text-white leading-tight">{item.q}</div>
                        <ChevronRight className="w-5 h-5 text-[#2563EB] group-hover:rotate-90 transition-transform" />
                     </div>
                     <p className="text-[#94A3B8] font-medium leading-relaxed">{item.a}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 sm:py-24 md:py-32">
         <div className="container mx-auto px-4 sm:px-6">
            <div className="glass rounded-[60px] p-16 md:p-32 border border-[#2563EB]/20 relative overflow-hidden text-center space-y-10 group">
               <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/10 to-transparent -z-10 group-hover:scale-110 transition-transform duration-[3000ms]" />
               <div className="max-w-3xl mx-auto space-y-6">
                  <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">Ready to Transform Your Workplace?</h2>
                  <p className="text-xl text-[#94A3B8] font-medium">Start your 14-day free trial today. No credit card required.</p>
               </div>
               <div className="flex flex-col items-center gap-6">
                  <Link 
                     href="/auth/register"
                     className="px-16 py-8 bg-[#2563EB] text-white text-xl font-black rounded-3xl hover:bg-[#1D4ED8] transition-all active:scale-95 shadow-[0_25px_60px_rgba(37,99,235,0.4)]"
                  >
                     Start Free 14-Day Trial
                  </Link>
                  <div className="text-[10px] text-[#64748B] font-black uppercase tracking-widest">Available for iOS, Android, and Web</div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-[#020617] border-t border-white/5">
         <div className="container mx-auto px-4 sm:px-6">
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 lg:gap-20 mb-20 text-balance">
               <div className="space-y-8 sm:col-span-1 md:col-span-2 lg:col-span-2">
                  <Link href="/" className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-[#2563EB] rounded-2xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                     </div>
                     <span className="text-2xl font-black tracking-tighter uppercase">AI Monitor</span>
                  </Link>
                  <p className="text-[#94A3B8] font-medium text-lg leading-relaxed max-w-sm">
                     The world's most advanced AI workplace monitoring platform. 
                     Securing 500+ companies globally.
                  </p>
               </div>
               
               <div className="space-y-8">
                  <div className="text-[10px] text-white font-black uppercase tracking-[0.4em]">Company</div>
                  <ul className="space-y-4 text-[#94A3B8] font-bold">
                     <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                     <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                     <li><Link href="#" className="hover:text-white transition-colors">Case Studies</Link></li>
                     <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                  </ul>
               </div>

               <div className="space-y-8">
                  <div className="text-[10px] text-white font-black uppercase tracking-[0.4em]">Legal</div>
                  <ul className="space-y-4 text-[#94A3B8] font-bold">
                     <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                     <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                     <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                     <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
                  </ul>
               </div>
            </div>

            <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="text-[#64748B] text-sm font-medium italic">© 2026 AI Workplace Monitor Service. All rights reserved.</div>
               <div className="flex gap-10">
                  <Link href="#" className="text-[#64748B] hover:text-white transition-colors"><Image src="/facebook.svg" alt="Social" width={20} height={20} className="invert opacity-30 hover:opacity-100" />Facebook</Link>
                  <Link href="#" className="text-[#64748B] hover:text-white transition-colors">Twitter</Link>
                  <Link href="#" className="text-[#64748B] hover:text-white transition-colors">LinkedIn</Link>
               </div>
            </div>
         </div>
      </footer>
    </div>
  )
}