'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/homepage/Navbar'
import { Shield, Camera, Bell, UserCheck, BarChart3, Users, Play, Check, ChevronRight, Star, ArrowRight, Zap, Target } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="bg-[#020617] min-h-screen text-white overflow-hidden font-sans selection:bg-[#2563EB]/30 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 md:pt-48 pb-16 sm:pb-24 overflow-hidden min-h-screen flex flex-col justify-center">
        {/* Advanced Animated Background */}
        <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden">
          <motion.div 
            style={{ y }}
            className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120vw] h-[120vw] md:w-[60vw] md:h-[60vw] bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15)_0%,transparent_60%)] opacity-70 blur-[80px]" 
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-5xl mx-auto text-center space-y-8 sm:space-y-10"
          >
            <motion.div variants={fadeInUp} className="flex justify-center">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[#1E293B]/80 border border-[#334155] shadow-lg backdrop-blur-md">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2563EB]"></span>
                </span>
                <span className="text-[#94A3B8] text-sm font-semibold tracking-wide">Introducing Vision AI 2.0</span>
              </div>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter leading-[1.05] text-white"
            >
              Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-[#93C5FD] glow-text">Workplace</span> <br className="hidden sm:block" /> Intelligence.
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-lg sm:text-xl md:text-2xl text-[#94A3B8] max-w-3xl mx-auto font-medium leading-relaxed"
            >
              Transform your security operations with real-time neural face recognition, behavioral analysis, and automated instant alerts.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-8"
            >
              <Link 
                href="/auth/register"
                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white text-lg font-black rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)]"
              >
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <button 
                className="w-full sm:w-auto px-10 py-5 glass-panel text-white text-lg font-bold rounded-2xl hover:bg-white/5 transition-all flex items-center justify-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#2563EB] transition-colors">
                  <Play className="w-4 h-4 fill-white translate-x-0.5" />
                </div>
                Watch Demo
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Hero Mockup Dashboard */}
      <section className="pb-20 sm:pb-32 relative z-20 -mt-10 sm:-mt-20">
         <div className="container mx-auto px-4 sm:px-6">
            <motion.div 
              initial={{ opacity: 0, y: 100, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, type: 'spring', bounce: 0.3 }}
              style={{ perspective: 2000 }}
              className="relative p-2 sm:p-4 glass-panel rounded-[24px] sm:rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden mx-auto max-w-6xl border border-white/10"
            >
              <div className="bg-[#020617] rounded-[20px] sm:rounded-[36px] aspect-[16/10] sm:aspect-[16/9] flex flex-col overflow-hidden border border-white/5 relative">
                {/* Fake Browser Toolbar */}
                <div className="h-12 border-b border-white/5 bg-[#0F172A] flex items-center px-6 gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]/80"></div>
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]/80"></div>
                    <div className="w-3 h-3 rounded-full bg-[#22C55E]/80"></div>
                  </div>
                  <div className="h-6 w-64 bg-[#1E293B] rounded-md mx-auto hidden sm:block"></div>
                </div>
                {/* Fake Dashboard Content */}
                <div className="flex-1 p-4 sm:p-8 flex gap-6 bg-[url('/noise.png')] bg-repeat opacity-90">
                  <div className="w-64 hidden lg:block space-y-4">
                    <div className="h-10 w-full bg-[#1E293B] rounded-xl animate-pulse"></div>
                    <div className="h-8 w-3/4 bg-white/5 rounded-xl"></div>
                    <div className="h-8 w-5/6 bg-white/5 rounded-xl"></div>
                  </div>
                  <div className="flex-1 space-y-6">
                    <div className="flex gap-4">
                      <div className="h-32 flex-1 glass rounded-2xl flex items-center justify-center">
                         <Camera className="w-10 h-10 text-[#2563EB]/40" />
                      </div>
                      <div className="h-32 flex-1 glass rounded-2xl hidden md:flex items-center justify-center">
                         <Users className="w-10 h-10 text-[#22C55E]/40" />
                      </div>
                      <div className="h-32 flex-1 glass rounded-2xl hidden sm:flex items-center justify-center">
                         <BarChart3 className="w-10 h-10 text-[#F59E0B]/40" />
                      </div>
                    </div>
                    <div className="h-[40vh] w-full glass rounded-3xl border border-[#2563EB]/20 relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-t from-[#2563EB]/10 to-transparent"></div>
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <Target className="w-24 h-24 text-[#2563EB]/30 animate-ping duration-[3000ms]" />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
         </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 border-y border-white/5 bg-[#0F172A]/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
            {[
              { num: "99.9%", label: "Accuracy Rate" },
              { num: "10ms", label: "Latency Insight" },
              { num: "500+", label: "Enterprise Clients" },
              { num: "24/7", label: "Active Monitoring" },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white">{stat.num}</div>
                <div className="text-xs sm:text-sm text-[#64748B] font-bold uppercase tracking-widest mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-20 sm:py-32 relative">
         <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mb-16 sm:mb-24">
               <h2 className="text-[#2563EB] text-sm font-black uppercase tracking-[0.3em] mb-4">Powerful Arsenal</h2>
               <h3 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-tight">Everything you need to <br className="hidden md:block"/>secure your workforce.</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[280px]">
               {/* Large Feature 1 */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="md:col-span-2 lg:col-span-2 row-span-2 glass-panel rounded-[32px] p-8 sm:p-12 relative overflow-hidden group hover:border-[#2563EB]/50 transition-colors"
               >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563EB]/20 rounded-full blur-[80px] group-hover:bg-[#2563EB]/30 transition-colors"></div>
                  <UserCheck className="w-16 h-16 text-[#60A5FA] mb-8" />
                  <h4 className="text-3xl font-black mb-4">Neural Face Recognition</h4>
                  <p className="text-[#94A3B8] text-lg font-medium max-w-md">Industry-leading facial mapping technology that identifies personnel in under 10 milliseconds, even in low light or crowded environments.</p>
                  <div className="mt-12 w-full h-48 bg-[#0F172A] rounded-2xl border border-white/5 relative overflow-hidden">
                     <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>
                     <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl border-2 border-[#22C55E] flex items-center justify-center bg-[#22C55E]/10 glow-blue">
                           <Check className="text-[#22C55E]" />
                        </div>
                     </div>
                  </div>
               </motion.div>

               {/* Smaller Feature 2 */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.1 }}
                 className="md:col-span-1 lg:col-span-2 glass rounded-[32px] p-8 relative overflow-hidden group hover:border-white/20 transition-colors"
               >
                  <Bell className="w-12 h-12 text-[#F59E0B] mb-6" />
                  <h4 className="text-2xl font-black mb-3">Instant Smart Alerts</h4>
                  <p className="text-[#94A3B8] font-medium">Get notified immediately on Telegram, WhatsApp, or SMS when unauthorized access or specific behaviors are detected.</p>
               </motion.div>

               {/* Smaller Feature 3 */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2 }}
                 className="md:col-span-1 lg:col-span-1 glass rounded-[32px] p-8 relative overflow-hidden group hover:border-white/20 transition-colors"
               >
                  <Zap className="w-12 h-12 text-[#8B5CF6] mb-6" />
                  <h4 className="text-2xl font-black mb-3">Zero Latency</h4>
                  <p className="text-[#94A3B8] font-medium text-sm">Edge-optimized models ensure your stream is parsed locally instantly.</p>
               </motion.div>

               {/* Smaller Feature 4 */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.3 }}
                 className="md:col-span-1 lg:col-span-1 glass rounded-[32px] p-8 relative overflow-hidden group hover:border-white/20 transition-colors"
               >
                  <Camera className="w-12 h-12 text-[#EC4899] mb-6" />
                  <h4 className="text-2xl font-black mb-3">Global RTSP Integration</h4>
                  <p className="text-[#94A3B8] font-medium text-sm">Connects seamlessly with any existing IP camera setup worldwide.</p>
               </motion.div>
            </div>
         </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-32 bg-[#0F172A]/50 border-y border-white/5 relative overflow-hidden">
         <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-[#2563EB]/5 rounded-full blur-[150px] -z-10" />
         <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto space-y-6 mb-20">
               <h2 className="text-sm text-[#2563EB] font-black uppercase tracking-[0.3em]">Plans & Pricing</h2>
               <h3 className="text-4xl md:text-6xl font-black tracking-tighter">Scale with confidence.</h3>
            </div>

            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-center">
               {[
                  { name: "Starter", price: "4,999", duration: "mo", desc: "Perfect for small retail shops and single-location offices.", features: ["Up to 5 Cameras", "7 Days Cloud History", "Standard AI Models", "Email Alerts"] },
                  { name: "Professional", price: "12,999", duration: "mo", popular: true, desc: "For growing businesses requiring advanced behavioral analytics and fast alerts.", features: ["Up to 25 Cameras", "30 Days Cloud History", "Premium Facial Recognition", "WhatsApp/SMS Alerts", "Priority Support", "Custom Blacklists"] },
                  { name: "Enterprise", price: "Custom", duration: "yr", desc: "Unlimited scale for multi-city corporate environments.", features: ["Unlimited Cameras", "On-Premise Deployment", "Custom Model Training", "Dedicated Success Manager", "API Access"] },
               ].map((plan, i) => (
                  <motion.div 
                     key={i} 
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.1 }}
                     className={`relative rounded-[40px] ${plan.popular ? 'p-1 bg-gradient-to-b from-[#2563EB] to-[#0F172A] shadow-[0_20px_60px_rgba(37,99,235,0.2)] scale-100 md:scale-105 z-10' : 'p-px bg-white/10 scale-100'}`}
                  >
                     {plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#2563EB] text-white text-xs font-black uppercase tracking-widest rounded-full glow-blue">Most Popular</div>
                     )}
                     <div className="bg-[#020617] rounded-[38px] p-8 sm:p-10 h-full flex flex-col relative overflow-hidden">
                        {plan.popular && <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/10 rounded-full blur-[40px]"></div>}
                        
                        <h4 className="text-2xl font-black text-white mb-2">{plan.name}</h4>
                        <p className="text-[#94A3B8] text-sm font-medium mb-8 h-10">{plan.desc}</p>
                        
                        <div className="flex items-baseline gap-1 mb-8">
                           {plan.price !== 'Custom' && <span className="text-2xl font-bold text-[#64748B]">₹</span>}
                           <span className="text-5xl font-black text-white">{plan.price}</span>
                           <span className="text-lg font-bold text-[#64748B]">/{plan.duration}</span>
                        </div>

                        <ul className="space-y-4 mb-12 flex-grow">
                           {plan.features.map((feat, k) => (
                              <li key={k} className="flex items-start gap-3 text-sm text-[#F1F5F9] font-medium">
                                 <div className="w-5 h-5 rounded-full bg-[#2563EB]/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-[#60A5FA]" />
                                 </div>
                                 {feat}
                              </li>
                           ))}
                        </ul>

                        <Link 
                           href="/auth/register"
                           className={`w-full py-5 rounded-2xl font-black text-center transition-all ${plan.popular ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white' : 'glass hover:bg-white/10 text-white border-white/10'}`}
                        >
                           {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                        </Link>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 sm:py-32 relative">
         <div className="container mx-auto px-4 sm:px-6">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="glass-panel rounded-[40px] sm:rounded-[60px] p-10 sm:p-20 border border-[#2563EB]/30 relative overflow-hidden text-center group"
            >
               <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-[#2563EB]/20 rounded-full blur-[100px] -z-10 group-hover:scale-110 transition-transform duration-1000" />
               
               <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 relative z-10">Stop watching.<br className="hidden sm:block"/>Start knowing.</h2>
               <p className="text-lg sm:text-xl text-[#94A3B8] font-medium max-w-2xl mx-auto mb-12 relative z-10">Deploy state-of-the-art vision AI across your entire facility network in less than 5 minutes.</p>
               
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                  <Link 
                     href="/auth/register"
                     className="w-full sm:w-auto px-12 py-6 bg-white text-[#0F172A] text-xl font-black rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                  >
                     Create Account Now
                  </Link>
               </div>
            </motion.div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-16 sm:py-24 bg-[#020617] border-t border-white/5 relative overflow-hidden">
         <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
               <div className="max-w-xs">
                  <Link href="/" className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center glow-blue">
                        <Shield className="w-5 h-5 text-white" />
                     </div>
                     <span className="text-xl font-black tracking-tighter uppercase">AI Monitor</span>
                  </Link>
                  <p className="text-[#64748B] font-medium text-sm leading-relaxed">
                     Empowering modern enterprises with actionable visual intelligence and robust security automation.
                  </p>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
                  <div className="space-y-6">
                     <div className="text-xs text-white font-black uppercase tracking-widest">Product</div>
                     <ul className="space-y-3 text-sm text-[#64748B] font-bold">
                        <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                     </ul>
                  </div>
                  <div className="space-y-6">
                     <div className="text-xs text-white font-black uppercase tracking-widest">Company</div>
                     <ul className="space-y-3 text-sm text-[#64748B] font-bold">
                        <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                     </ul>
                  </div>
                  <div className="space-y-6 col-span-2 md:col-span-1">
                     <div className="text-xs text-white font-black uppercase tracking-widest">Connect</div>
                     <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors text-white font-bold">X</div>
                        <div className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors text-white font-bold">in</div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="text-[#475569] text-xs font-semibold">© 2026 AI Workplace Monitor. All rights reserved.</div>
               <div className="flex gap-6 text-[#475569] text-xs font-semibold">
                  <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                  <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
               </div>
            </div>
         </div>
      </footer>
    </div>
  )
}