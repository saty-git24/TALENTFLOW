import React from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { exportData, clearDatabase } from '../db/index.js';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = React.useState('profile');
  const [exportLoading, setExportLoading] = React.useState(false);
  const [clearLoading, setClearLoading] = React.useState(false);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'data', name: 'Data Management', icon: Database },
    { id: 'appearance', name: 'Appearance', icon: Palette }
  ];

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `talentflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleClearDatabase = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setClearLoading(true);
      try {
        await clearDatabase();
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear database:', error);
      } finally {
        setClearLoading(false);
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    defaultValue="John"
                    placeholder="Enter your first name"
                  />
                  <Input
                    label="Last Name"
                    defaultValue="Doe"
                    placeholder="Enter your last name"
                  />
                </div>
                
                <Input
                  label="Email"
                  type="email"
                  defaultValue="john.doe@company.com"
                  placeholder="Enter your email"
                />
                
                <Input
                  label="Job Title"
                  defaultValue="HR Manager"
                  placeholder="Enter your job title"
                />
                
                <Select
                  label="Department"
                  defaultValue="hr"
                  options={[
                    { label: 'Human Resources', value: 'hr' },
                    { label: 'Engineering', value: 'engineering' },
                    { label: 'Product', value: 'product' },
                    { label: 'Marketing', value: 'marketing' },
                    { label: 'Sales', value: 'sales' }
                  ]}
                />
                
                <div className="flex justify-end">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">New candidate applications</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Candidate stage changes</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Assessment completions</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Weekly hiring reports</span>
                    <input type="checkbox" className="rounded" />
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Browser notifications</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Desktop notifications</span>
                    <input type="checkbox" className="rounded" />
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="Enter current password"
                />
                
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                />
                
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm new password"
                />
                
                <div className="flex justify-end">
                  <Button>Update Password</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Two-factor authentication</p>
                    <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Badge variant="secondary">Not Enabled</Badge>
                </div>
                <div className="mt-4">
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Export & Import</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Export Data</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Download all your jobs, candidates, and assessments as a JSON file.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleExportData}
                      loading={exportLoading}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Import Data</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Import data from a previously exported JSON file.
                    </p>
                    <Button variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Danger Zone</h4>
                  <p className="text-sm text-yellow-700 mb-4">
                    These actions are irreversible. Please proceed with caution.
                  </p>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Application
                    </Button>
                    
                    <Button 
                      variant="destructive"
                      onClick={handleClearDatabase}
                      loading={clearLoading}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Color Theme"
                  defaultValue="blue"
                  options={[
                    { label: 'Blue (Default)', value: 'blue' },
                    { label: 'Green', value: 'green' },
                    { label: 'Purple', value: 'purple' },
                    { label: 'Orange', value: 'orange' }
                  ]}
                />
                
                <Select
                  label="Display Mode"
                  defaultValue="light"
                  options={[
                    { label: 'Light Mode', value: 'light' },
                    { label: 'Dark Mode', value: 'dark' },
                    { label: 'System Default', value: 'system' }
                  ]}
                />
                
                <Select
                  label="Sidebar Style"
                  defaultValue="expanded"
                  options={[
                    { label: 'Always Expanded', value: 'expanded' },
                    { label: 'Collapsible', value: 'collapsible' },
                    { label: 'Compact', value: 'compact' }
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Show animations</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Compact view</span>
                    <input type="checkbox" className="rounded" />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Show tooltips</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;