'use client'

import { useState } from 'react'
import { Check, ShieldCheck, Zap, Globe, Clock, History, CreditCard, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { toast } from 'sonner'

export default function AdminSubscription() {
  const [selectedPlan, setSelectedPlan] = useState('Pro')

  const plans = [
    {
      name: 'Basic',
      price: '₹999',
      period: '/month',
      features: ['2 Cameras', 'Basic Alerts', 'Email Support', '7 Days Storage'],
      icon: Clock,
      color: 'blue'
    },
    {
      name: 'Pro',
      price: '₹2,999',
      period: '/month',
      features: ['10 Cameras', 'AI Alerts + Analytics', 'Priority Support', '30 Days Storage', 'Custom Rules'],
      icon: Zap,
      color: 'blue',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: ['Unlimited Cameras', 'Full AI Suite', 'Dedicated Support', '90 Days Storage', 'API Access'],
      icon: Globe,
      color: 'blue'
    }
  ]

  const handlePayment = async (plan: string) => {
    toast.info(`Initializing payment for ${plan} plan...`)
    // Razorpay logic integration placeholder
    setTimeout(() => {
      toast.success('Successfully subscribed to ' + plan)
    }, 2000)
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#F1F5F9] tracking-tight">Subscription</h1>
        <p className="text-[#94A3B8]">Manage your plan and billing information.</p>
      </div>

      <div className="glass p-8 rounded-[40px] border border-[#334155]/50 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563EB]/10 blur-[100px] rounded-full -mr-32 -mt-32" />
        
        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2563EB]/10 text-[#2563EB] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#2563EB]/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Active Plan
          </div>
          <h2 className="text-4xl font-black text-white">Pro Professional</h2>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
              <span className="text-white font-bold">4/10</span> Cameras Used
            </div>
            <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
              Expires on <span className="text-white font-bold">Dec 24, 2026</span>
            </div>
          </div>
        </div>

        <button className="relative z-10 px-8 py-4 bg-white text-black font-black rounded-3xl hover:bg-white/90 transition-all shadow-[0_4px_30px_rgba(255,255,255,0.2)] active:scale-95">
          Upgrade Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={clsx(
              'glass p-8 rounded-[40px] border transition-all duration-500 flex flex-col',
              plan.popular ? 'border-[#2563EB] shadow-[0_0_50px_rgba(37,99,235,0.15)] scale-105 z-10' : 'border-[#334155]/50 hover:border-[#2563EB]/30'
            )}
          >
            {plan.popular && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#2563EB] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                Most Popular
              </span>
            )}

            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#0F172A] border border-[#334155] flex items-center justify-center mb-6">
                <plan.icon className="w-6 h-6 text-[#2563EB]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-[#94A3B8] text-sm font-medium">{plan.period}</span>
              </div>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#22C55E]/10 flex items-center justify-center border border-[#22C55E]/20">
                    <Check className="w-3 h-3 text-[#22C55E]" />
                  </div>
                  <span className="text-sm text-[#94A3B8] font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handlePayment(plan.name)}
              className={clsx(
                'w-full py-4 rounded-3xl font-black transition-all active:scale-95 text-sm',
                plan.popular 
                  ? 'bg-[#2563EB] text-white shadow-[0_4px_25px_rgba(37,99,235,0.4)] hover:bg-[#1D4ED8]' 
                  : 'bg-[#1E293B] text-[#F1F5F9] border border-[#334155] hover:bg-[#334155]'
              )}
            >
              Choose Plan
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-[#2563EB]" />
          <h3 className="text-xl font-bold text-white tracking-tight">Payment History</h3>
        </div>

        <div className="glass rounded-[32px] border border-[#334155]/50 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#334155]/50 bg-[#1E293B]/30">
                <th className="px-8 py-5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em]">Transaction ID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em]">Date</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em]">Amount</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/30">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-[#334155]/10 transition-all group">
                  <td className="px-8 py-5 font-mono text-xs text-[#F1F5F9]">TXN-9023485-00{i}</td>
                  <td className="px-8 py-5 text-sm text-[#94A3B8]">Nov {12 + i}, 2025</td>
                  <td className="px-8 py-5 text-sm font-bold text-white">₹2,999</td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#22C55E]/20">
                      Success
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-[#2563EB] hover:underline text-xs font-bold flex items-center justify-end gap-1 ml-auto">
                      Download <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
