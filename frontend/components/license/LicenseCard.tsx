'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Shield, CheckCircle, AlertCircle, Clock, Camera, Zap, Crown, Star } from 'lucide-react';

export interface LicenseTier {
  name: string;
  price: string;
  duration: string;
  maxCameras: number;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  current?: boolean;
}

interface LicenseCardProps {
  tier: LicenseTier;
  onUpgrade?: () => void;
  onManage?: () => void;
}

const licenseTiers: Record<string, LicenseTier> = {
  STANDARD: {
    name: 'Standard',
    price: '$49',
    duration: '/month',
    maxCameras: 5,
    features: [
      'Basic AI Monitoring',
      'Person Detection',
      'Email Support',
      '5 Camera Connections',
      'Basic Analytics',
      'Mobile App Access'
    ],
    icon: <Shield className="w-6 h-6" />,
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: '$149',
    duration: '/month',
    maxCameras: 20,
    features: [
      'Advanced AI Analytics',
      'Face Recognition',
      'Emotion Analysis',
      '20 Camera Connections',
      'Priority Support',
      'API Access',
      'Custom Reports',
      'Real-time Alerts'
    ],
    icon: <Zap className="w-6 h-6" />,
    popular: true,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 'Custom',
    duration: '/month',
    maxCameras: 999,
    features: [
      'Unlimited Cameras',
      'Custom Integrations',
      'Dedicated Support',
      'White-label Options',
      'Advanced Analytics',
      'SLA Guarantee',
      'On-premise Deployment',
      'Custom AI Models'
    ],
    icon: <Crown className="w-6 h-6" />,
  },
};

export function LicenseCard({ tier, onUpgrade, onManage }: LicenseCardProps) {
  const isCurrent = tier.current;
  const isPopular = tier.popular;

  return (
    <Card className={`relative ${isPopular ? 'border-blue-500 shadow-lg' : ''} ${isCurrent ? 'border-green-500 bg-green-50/50' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-500 text-white px-3 py-1">
            <Star className="w-3 h-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      
      {isCurrent && (
        <div className="absolute -top-3 right-4">
          <Badge className="bg-green-500 text-white px-3 py-1">
            <CheckCircle className="w-3 h-3 mr-1" />
            Current Plan
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-2">
          <div className={`p-3 rounded-full ${isPopular ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
            {tier.icon}
          </div>
        </div>
        <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
        <CardDescription className="text-2xl font-bold text-gray-900">
          {tier.price}
          <span className="text-sm font-normal text-gray-600">{tier.duration}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-center text-sm text-gray-600">
          <Camera className="w-4 h-4 mr-2" />
          Up to {tier.maxCameras === 999 ? 'Unlimited' : tier.maxCameras} cameras
        </div>

        <div className="space-y-2">
          {tier.features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          {isCurrent ? (
            <Button 
              onClick={onManage}
              variant="outline" 
              className="w-full"
            >
              Manage Plan
            </Button>
          ) : (
            <Button 
              onClick={onUpgrade}
              className={`w-full ${isPopular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              {tier.price === 'Custom' ? 'Contact Sales' : 'Upgrade Plan'}
            </Button>
          )}
        </div>

        {isCurrent && (
          <div className="text-center text-xs text-gray-500">
            <Clock className="w-3 h-3 inline mr-1" />
            Renews automatically
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { licenseTiers };
