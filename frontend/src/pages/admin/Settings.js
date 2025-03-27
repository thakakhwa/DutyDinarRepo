import React, { useState } from 'react';
import { 
  User, Bell, Shield, Moon, Globe, 
  Save, Camera, ChevronRight, Toggle
} from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  // Form state
  const [profileForm, setProfileForm] = useState({
    name: 'Admin User',
    email: 'admin@dutydinar.com',
    phone: '+971 50 123 4567',
    role: 'Administrator'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    newUserAlerts: true,
    orderAlerts: true,
    systemUpdates: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30 minutes',
    passwordExpiry: '90 days'
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    language: 'English',
    timeFormat: '12 hour'
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSecurityChange = (setting, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleAppearanceChange = (setting, value) => {
    setAppearanceSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Settings tabs
  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Moon }
  ];

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button 
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
        ${enabled ? 'bg-green-600' : 'bg-gray-300'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 border-r border-b md:border-b-0">
            <nav className="p-4">
              <ul className="space-y-1">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors
                        ${activeTab === tab.id 
                          ? 'bg-green-100 text-green-600' 
                          : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <tab.icon size={20} className="mr-3" />
                      <span>{tab.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
                
                <div className="flex flex-col md:flex-row items-start mb-8">
                  <div className="w-full md:w-1/3 flex justify-center mb-6 md:mb-0">
                    <div className="relative">
                      <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        <User size={64} className="text-gray-400" />
                      </div>
                      <button className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700">
                        <Camera size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-2/3 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={profileForm.email}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                          type="text"
                          name="phone"
                          value={profileForm.phone}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          name="role"
                          value={profileForm.role}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option>Administrator</option>
                          <option>Manager</option>
                          <option>Editor</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                        <Save size={18} className="mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Additional Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                          type="text"
                          placeholder="Enter your address"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          placeholder="Enter your city"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input
                          type="text"
                          placeholder="Enter your country"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                        <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                          <option>GMT+04:00 Dubai</option>
                          <option>GMT+00:00 London</option>
                          <option>GMT-08:00 Los Angeles</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-4">Notification Channels</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive email notifications</p>
                        </div>
                        <ToggleSwitch 
                          enabled={notificationSettings.emailNotifications}
                          onChange={() => handleToggleChange('emailNotifications')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-sm text-gray-500">Receive push notifications</p>
                        </div>
                        <ToggleSwitch 
                          enabled={notificationSettings.pushNotifications}
                          onChange={() => handleToggleChange('pushNotifications')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">SMS Notifications</p>
                          <p className="text-sm text-gray-500">Receive SMS notifications</p>
                        </div>
                        <ToggleSwitch 
                          enabled={notificationSettings.smsNotifications}
                          onChange={() => handleToggleChange('smsNotifications')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-4">Notification Types</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">New User Alerts</p>
                          <p className="text-sm text-gray-500">Get notified when new users register</p>
                        </div>
                        <ToggleSwitch 
                          enabled={notificationSettings.newUserAlerts}
                          onChange={() => handleToggleChange('newUserAlerts')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order Alerts</p>
                          <p className="text-sm text-gray-500">Get notified about new orders</p>
                        </div>
                        <ToggleSwitch 
                          enabled={notificationSettings.orderAlerts}
                          onChange={() => handleToggleChange('orderAlerts')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">System Updates</p>
                          <p className="text-sm text-gray-500">Get notified about system updates</p>
                        </div>
                        <ToggleSwitch 
                          enabled={notificationSettings.systemUpdates}
                          onChange={() => handleToggleChange('systemUpdates')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <ToggleSwitch 
                        enabled={securitySettings.twoFactorAuth}
                        onChange={() => handleSecurityChange('twoFactorAuth', !securitySettings.twoFactorAuth)}
                      />
                    </div>
                    
                    {securitySettings.twoFactorAuth && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <p className="text-sm">Two-factor authentication is enabled. You will receive a verification code when logging in.</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-4">Password Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                          type="password"
                          placeholder="Enter current password"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                          type="password"
                          placeholder="Enter new password"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-4">Session Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout</label>
                        <select
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="15 minutes">15 minutes</option>
                          <option value="30 minutes">30 minutes</option>
                          <option value="1 hour">1 hour</option>
                          <option value="4 hours">4 hours</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Expiry</label>
                        <select
                          value={securitySettings.passwordExpiry}
                          onChange={(e) => handleSecurityChange('passwordExpiry', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="30 days">30 days</option>
                          <option value="60 days">60 days</option>
                          <option value="90 days">90 days</option>
                          <option value="Never">Never</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                        <div>
                          <p className="font-medium">Chrome on Windows</p>
                          <p className="text-xs text-gray-500">Dubai, UAE • Current session</p>
                        </div>
                        <button className="text-sm text-red-600 hover:text-red-700">
                          End Session
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                        <div>
                          <p className="font-medium">Safari on iPhone</p>
                          <p className="text-xs text-gray-500">Dubai, UAE • Last active: 2 hours ago</p>
                        </div>
                        <button className="text-sm text-red-600 hover:text-red-700">
                          End Session
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Appearance Settings</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-4">Theme</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div
                        onClick={() => handleAppearanceChange('theme', 'light')}
                        className={`p-4 rounded-lg border cursor-pointer
                          ${appearanceSettings.theme === 'light' ? 'border-green-500 bg-white' : 'bg-white border-gray-200'}
                        `}
                      >
                        <div className="h-24 bg-white border mb-2 flex items-center justify-center rounded-lg">
                          <div className="w-1/3 h-full bg-gray-100 border-r"></div>
                          <div className="w-2/3 p-2">
                            <div className="h-2 bg-gray-100 rounded mb-2 w-3/4"></div>
                            <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                          </div>
                        </div>
                        <p className="text-center">Light</p>
                      </div>
                      <div
                        onClick={() => handleAppearanceChange('theme', 'dark')}
                        className={`p-4 rounded-lg border cursor-pointer
                          ${appearanceSettings.theme === 'dark' ? 'border-green-500 bg-white' : 'bg-white border-gray-200'}
                        `}
                      >
                        <div className="h-24 bg-gray-800 border mb-2 flex items-center justify-center rounded-lg">
                          <div className="w-1/3 h-full bg-gray-900 border-r border-gray-700"></div>
                          <div className="w-2/3 p-2">
                            <div className="h-2 bg-gray-700 rounded mb-2 w-3/4"></div>
                            <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                          </div>
                        </div>
                        <p className="text-center">Dark</p>
                      </div>
                      <div
                        onClick={() => handleAppearanceChange('theme', 'system')}
                        className={`p-4 rounded-lg border cursor-pointer
                          ${appearanceSettings.theme === 'system' ? 'border-green-500 bg-white' : 'bg-white border-gray-200'}
                        `}
                      >
                        <div className="h-24 bg-gradient-to-r from-white to-gray-800 border mb-2 flex items-center justify-center rounded-lg">
                          <div className="text-sm font-medium text-gray-500">Auto</div>
                        </div>
                        <p className="text-center">System</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-4">Language & Region</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                        <div className="relative">
                          <select
                            value={appearanceSettings.language}
                            onChange={(e) => handleAppearanceChange('language', e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                          >
                            <option value="English">English</option>
                            <option value="Arabic">Arabic</option>
                            <option value="French">French</option>
                            <option value="Spanish">Spanish</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <ChevronRight size={16} className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="timeFormat"
                              checked={appearanceSettings.timeFormat === '12 hour'}
                              onChange={() => handleAppearanceChange('timeFormat', '12 hour')}
                              className="mr-2"
                            />
                            <span>12 hour (1:30 PM)</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="timeFormat"
                              checked={appearanceSettings.timeFormat === '24 hour'}
                              onChange={() => handleAppearanceChange('timeFormat', '24 hour')}
                              className="mr-2"
                            />
                            <span>24 hour (13:30)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;