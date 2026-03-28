'use client';

import React, { useState, useEffect } from 'react';
import { LicenseCard, licenseTiers } from '@/components/license/LicenseCard';
import { LicenseStatus } from '@/components/license/LicenseStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Crown, Zap, AlertCircle, CheckCircle } from 'lucide-react';

// Mock data - replace with actual API call
const mockLicense = {
  id: 'lic_123456789',
  tier: 'PROFESSIONAL',
  status: 'ACTIVE' as const,
  startDate: '2024-01-15',
  endDate: '2024-04-15',
  maxCameras: 20,
  usedCameras: 8,
  features: [
    'Advanced AI Analytics',
    'Face Recognition',
    'Emotion Analysis',
    'Priority Support',
    'API Access',
    'Custom Reports'
  ],
  apiKey: 'awm_abc123def456ghi789jkl012mno345',
  lastValidated: '2024-03-28T10:30:00Z'
};

export default function LicensePage() {
  const [license, setLicense] = useState(mockLicense);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = (tierName: string) => {
    console.log(`Upgrading to ${tierName}`);
    // Implement upgrade logic
  };

  const handleManage = () => {
    console.log('Managing license');
    // Implement manage logic
  };

  const handleRenew = () => {
    console.log('Renewing license');
    // Implement renew logic
  };

  const handleRegenerateKey = () => {
    console.log('Regenerating API key');
    // Implement key regeneration logic
  };

  const getTierData = (tierName: string) => {
    const tier = licenseTiers[tierName];
    return {
      ...tier,
      current: tier.name === license.tier
    };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">License Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your subscription and monitor usage
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Shield className="w-4 h-4 mr-2" />
          {license.tier} Plan
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current License Status */}
          <LicenseStatus
            license={license}
            onRenew={handleRenew}
            onUpgrade={handleManage}
            onManage={handleManage}
            onRegenerateKey={handleRegenerateKey}
          />

          {/* Available Plans */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(licenseTiers).map(([key, tier]) => (
                <LicenseCard
                  key={key}
                  tier={getTierData(key)}
                  onUpgrade={() => handleUpgrade(tier.name)}
                  onManage={handleManage}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Manage your payment methods and billing history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Current Plan</p>
                    <p className="text-sm text-gray-600">{license.tier} - {licenseTiers[license.tier].price}{licenseTiers[license.tier].duration}</p>
                  </div>
                  <Button variant="outline">Update Payment</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Next Billing Date</p>
                    <p className="text-sm text-gray-600">{new Date(license.endDate).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Auto-renew enabled
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Cameras Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{license.usedCameras}</div>
                <p className="text-xs text-gray-600">of {license.maxCameras === 999 ? 'Unlimited' : license.maxCameras}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">API Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,543</div>
                <p className="text-xs text-gray-600">this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4 GB</div>
                <p className="text-xs text-gray-600">of 50 GB</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-gray-600">team members</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Feature Usage</CardTitle>
              <CardDescription>
                Monitor which features are being used most frequently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {license.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
