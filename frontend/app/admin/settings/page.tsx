'use client'

import { useState } from 'react'
import { Settings, User, Shield, Bell, Database, Globe, Save, RotateCcw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { clsx } from 'clsx'

const settingsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email'),
  timezone: z.string(),
  language: z.string(),
  alertThreshold: z.number().min(1).max(100),
  dataRetention: z.number().min(7).max(365),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      companyName: 'AI Workplace Monitor',
      email: 'admin@company.com',
      timezone: 'UTC',
      language: 'en',
      alertThreshold: 85,
      dataRetention: 30,
    }
  })

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'data', name: 'Data & Storage', icon: Database },
  ]

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Settings updated successfully!')
    } catch (error) {
      toast.error('Failed to update settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    reset()
    toast.info('Settings reset to defaults')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#F1F5F9] tracking-tight">Settings</h1>
        <p className="text-[#94A3B8]">Manage your system configuration and preferences.</p>
      </div>

      <div className="flex gap-1 bg-[#1E293B] p-1 rounded-2xl border border-[#334155] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all',
              activeTab === tab.id 
                ? 'bg-[#2563EB] text-white shadow-lg' 
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      <div className="glass rounded-[40px] border border-[#334155]/50 p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#2563EB]" />
                  General Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#F1F5F9]">Company Name</label>
                    <input
                      {...register('companyName')}
                      className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#2563EB]/50"
                    />
                    {errors.companyName && <p className="text-[#EF4444] text-xs">{errors.companyName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#F1F5F9]">Admin Email</label>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#2563EB]/50"
                    />
                    {errors.email && <p className="text-[#EF4444] text-xs">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#F1F5F9]">Timezone</label>
                    <select
                      {...register('timezone')}
                      className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#2563EB]/50 appearance-none"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">EST</option>
                      <option value="PST">PST</option>
                      <option value="IST">IST</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#F1F5F9]">Language</label>
                    <select
                      {...register('language')}
                      className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#2563EB]/50 appearance-none"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#2563EB]" />
                  Security Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#0F172A]/30 rounded-2xl border border-[#334155]/50">
                    <div>
                      <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                      <p className="text-xs text-[#94A3B8]">Add an extra layer of security to your account</p>
                    </div>
                    <button className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl">Enable</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#0F172A]/30 rounded-2xl border border-[#334155]/50">
                    <div>
                      <p className="text-sm font-medium text-white">Session Timeout</p>
                      <p className="text-xs text-[#94A3B8]">Automatically log out after inactivity</p>
                    </div>
                    <select className="bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-1 text-xs">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>4 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#2563EB]" />
                  Notification Settings
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#F1F5F9]">Alert Sensitivity (%)</label>
                    <input
                      {...register('alertThreshold', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      max="100"
                      className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#2563EB]/50"
                    />
                    {errors.alertThreshold && <p className="text-[#EF4444] text-xs">{errors.alertThreshold.message}</p>}
                  </div>
                  <div className="space-y-3">
                    {['Email Alerts', 'Push Notifications', 'SMS Alerts', 'Desktop Notifications'].map((setting) => (
                      <div key={setting} className="flex items-center justify-between p-3 bg-[#0F172A]/30 rounded-xl border border-[#334155]/50">
                        <span className="text-sm text-white">{setting}</span>
                        <button className="w-12 h-6 bg-[#2563EB] rounded-full relative transition-all">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#2563EB]" />
                  Data & Storage Settings
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#F1F5F9]">Data Retention Period (days)</label>
                    <input
                      {...register('dataRetention', { valueAsNumber: true })}
                      type="number"
                      min="7"
                      max="365"
                      className="w-full bg-[#0F172A]/50 border border-[#334155] rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#2563EB]/50"
                    />
                    {errors.dataRetention && <p className="text-[#EF4444] text-xs">{errors.dataRetention.message}</p>}
                  </div>
                  <div className="p-4 bg-[#0F172A]/30 rounded-2xl border border-[#334155]/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-white">Storage Usage</p>
                      <span className="text-xs text-[#94A3B8]">64.2 GB / 100 GB</span>
                    </div>
                    <div className="h-2 w-full bg-[#1E293B] rounded-full overflow-hidden">
                      <div className="h-full w-[64.2%] bg-[#2563EB] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-[#334155]/50">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 bg-[#1E293B] text-[#94A3B8] font-bold rounded-2xl border border-[#334155] hover:bg-[#334155] transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-[#2563EB] text-white font-bold rounded-2xl shadow-lg hover:bg-[#1D4ED8] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}