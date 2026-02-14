import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Bell, Moon, Globe, Lock, Mail, Phone, 
  User, Shield, Eye, EyeOff, Save,
  ChevronRight
} from "lucide-react";

const SettingsComponent = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    darkMode: false,
    twoFactorAuth: false,
    language: 'English',
    timezone: 'IST (UTC+5:30)',
    email: 'indresh.kumar@university.edu',
    phone: '+91 98765 43210'
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <h2 className="text-3xl font-black text-slate-800">Settings</h2>

      {/* Settings Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="col-span-2 space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <User size={18} className="text-indigo-600" />
              Profile Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1 block">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue="Dr. Indresh Kumar"
                    className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1 block">Department</label>
                  <input 
                    type="text" 
                    defaultValue="Computer Science"
                    className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="email" 
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                    className="w-full pl-10 pr-4 p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="tel" 
                    value={settings.phone}
                    onChange={(e) => setSettings({...settings, phone: e.target.value})}
                    className="w-full pl-10 pr-4 p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-indigo-600" />
              Security
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-800">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500 mt-1">Add an extra layer of security</p>
                </div>
                <button
                  onClick={() => toggleSetting('twoFactorAuth')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.twoFactorAuth ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.twoFactorAuth ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-800">Change Password</p>
                  <p className="text-xs text-slate-500 mt-1">Last changed 3 months ago</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors">
                  Update
                </button>
              </div>

              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Current Password"
                  className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 pr-10"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={18} className="text-slate-400" /> : <Eye size={18} className="text-slate-400" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preferences */}
        <div className="space-y-6">
          {/* Preferences */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Preferences</h3>
            
            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Email Notifications</span>
                </div>
                <button
                  onClick={() => toggleSetting('emailNotifications')}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    settings.emailNotifications ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon size={18} className="text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Dark Mode</span>
                </div>
                <button
                  onClick={() => toggleSetting('darkMode')}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    settings.darkMode ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                    settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Language Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Language</span>
                </div>
                <select className="px-3 py-1 bg-slate-50 rounded-lg text-sm border border-slate-200">
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                </select>
              </div>

              {/* Timezone */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock size={18} className="text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Timezone</span>
                </div>
                <select className="px-3 py-1 bg-slate-50 rounded-lg text-sm border border-slate-200">
                  <option>IST (UTC+5:30)</option>
                  <option>EST (UTC-5:00)</option>
                  <option>PST (UTC-8:00)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              <Save size={18} />
              Save Changes
            </button>
            
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button className="w-full py-2 text-red-600 hover:text-red-700 text-sm font-medium flex items-center justify-center gap-2">
                <Lock size={16} />
                Sign Out from All Devices
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsComponent;