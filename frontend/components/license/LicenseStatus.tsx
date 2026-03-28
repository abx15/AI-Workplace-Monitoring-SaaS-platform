'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Camera, 
  Zap, 
  Shield, 
  Settings,
  RefreshCw,
  Calendar
} from 'lucide-react';

export interface LicenseInfo {
  id: string;
  tier: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'INACTIVE';
  startDate: string;
  endDate: string;
  maxCameras: number;
  usedCameras: number;
  features: string[];
  apiKey: string;
  lastValidated: string;
}

interface LicenseStatusProps {
  license: LicenseInfo;
  onRenew?: () => void;
  onUpgrade?: () => void;
  onManage?: () => void;
  onRegenerateKey?: () => void;
}

export function LicenseStatus({ 
  license, 
  onRenew, 
  onUpgrade, 
  onManage, 
  onRegenerateKey 
}: LicenseStatusProps) {
  const daysUntilExpiry = Math.ceil(
    (new Date(license.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const cameraUsagePercentage = (license.usedCameras / license.maxCameras) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'EXPIRED':
        return 'bg-red-500';
      case 'SUSPENDED':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4" />;
      case 'EXPIRED':
        return <AlertCircle className="w-4 h-4" />;
      case 'SUSPENDED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'STANDARD':
        return <Shield className="w-5 h-5" />;
      case 'PROFESSIONAL':
        return <Zap className="w-5 h-5" />;
      case 'ENTERPRISE':
        return <Settings className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full text-white ${getStatusColor(license.status)}`}>
                {getStatusIcon(license.status)}
              </div>
              <div>
                <CardTitle className="text-lg">License Status</CardTitle>
                <CardDescription>
                  {license.tier} Plan • {license.status}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {getTierIcon(license.tier)}
              <span className="ml-2">{license.tier}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Expiry Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Valid Until</label>
              <div className="flex items-center mt-1">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm">
                  {new Date(license.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Days Remaining</label>
              <div className="flex items-center mt-1">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span className={`text-sm font-medium ${
                  daysUntilExpiry <= 7 ? 'text-red-600' : 
                  daysUntilExpiry <= 30 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'}
                </span>
              </div>
            </div>
          </div>

          {/* Camera Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-500">Camera Usage</label>
              <span className="text-sm text-gray-600">
                {license.usedCameras} / {license.maxCameras === 999 ? 'Unlimited' : license.maxCameras}
              </span>
            </div>
            <Progress 
              value={license.maxCameras === 999 ? 0 : cameraUsagePercentage} 
              className="h-2"
            />
            <div className="flex items-center mt-1">
              <Camera className="w-3 h-3 mr-1 text-gray-400" />
              <span className="text-xs text-gray-500">
                {license.maxCameras === 999 ? 'Unlimited cameras' : `${Math.round(cameraUsagePercentage)}% used`}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            {license.status === 'ACTIVE' && (
              <>
                <Button onClick={onManage} variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </Button>
                <Button onClick={onUpgrade} variant="outline" size="sm">
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade
                </Button>
              </>
            )}
            {license.status !== 'ACTIVE' && (
              <Button onClick={onRenew} size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                {license.status === 'EXPIRED' ? 'Renew' : 'Activate'}
              </Button>
            )}
            <Button onClick={onRegenerateKey} variant="outline" size="sm">
              <Shield className="w-4 h-4 mr-2" />
              Regenerate Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Key Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Key</CardTitle>
          <CardDescription>
            Used for authenticating API requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono">
              {license.apiKey.substring(0, 12)}••••••••••••••••{license.apiKey.substring(28)}
            </code>
            <Button 
              onClick={() => navigator.clipboard.writeText(license.apiKey)}
              variant="outline" 
              size="sm"
            >
              Copy
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Last validated: {new Date(license.lastValidated).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Features</CardTitle>
          <CardDescription>
            Features included in your {license.tier} plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {license.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
