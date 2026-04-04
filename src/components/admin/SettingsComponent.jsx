import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Bell, Shield, Monitor, Globe, 
  Database, Save, Trash2, HelpCircle,
  Moon, Sun, Smartphone, Mail,
  Lock, Key, Sliders, ChevronRight
} from "lucide-react";

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.4 } } };

const SettingsComponent = () => {
  const [activeSetTab, setActiveSetTab] = useState("general");

  const settingsOptions = [
    { id: "general", label: "General", icon: <Sliders size={20} /> },
    { id: "security", label: "Security", icon: <Shield size={20} /> },
    { id: "notifications", label: "Alerts", icon: <Bell size={20} /> },
    { id: "display", label: "Appearance", icon: <Monitor size={20} /> },
    { id: "system", label: "System Info", icon: <Database size={20} /> },
  ];

  return (
    <motion.div className="max-w-6xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Settings Header */}
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter">System Configuration</h2>
        <p className="text-slate-400 font-medium mt-1">Manage global parameters, security protocols, and visual preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Nav */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-3 rounded-[2rem] shadow-sm sticky top-6">
            <nav className="flex flex-col gap-2">
              {settingsOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setActiveSetTab(opt.id)}
                  className={`flex items-center justify-between px-6 py-4 rounded-2xl font-black text-sm transition-all ${
                    activeSetTab === opt.id 
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" 
                      : "text-slate-500 hover:text-slate-800 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {opt.icon}
                    {opt.label}
                  </div>
                  {activeSetTab === opt.id && <ChevronRight size={18} />}
                </button>
              ))}
            </nav>
            <div className="mt-8 pt-8 border-t border-slate-100/50 px-4">
              <button className="flex items-center gap-3 text-rose-500 font-black text-xs uppercase tracking-widest hover:opacity-70 transition-opacity">
                <Trash2 size={16} /> Reset All Config
              </button>
            </div>
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1">
          <motion.div 
            key={activeSetTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-xl border border-white/50 p-10 rounded-[3rem] shadow-sm min-h-[600px]"
          >
            {activeSetTab === "general" && (
              <div className="space-y-10">
                <div>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Global Preferences</h3>
                   <div className="grid gap-6">
                      <div className="flex items-center justify-between p-6 bg-white/40 rounded-3xl border border-white/50 group hover:bg-white transition-all">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform"><Globe size={24} /></div>
                          <div>
                            <p className="font-black text-slate-700">Language Distribution</p>
                            <p className="text-sm text-slate-400 font-medium">Auto-detect system locale for faculty.</p>
                          </div>
                        </div>
                        <select className="bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 border-none outline-none ring-1 ring-slate-200">
                          <option>English (IN)</option>
                          <option>English (US)</option>
                          <option>Hindi</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-6 bg-white/40 rounded-3xl border border-white/50 group hover:bg-white transition-all">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform"><Smartphone size={24} /></div>
                          <div>
                            <p className="font-black text-slate-700">Mobile Syncing</p>
                            <p className="text-sm text-slate-400 font-medium">Push updates to Schedula Mobile app.</p>
                          </div>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="pt-10 border-t border-slate-100">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6">Administrator Details</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Display Name</label>
                       <input type="text" placeholder="Admin Coordinator" className="w-full px-6 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Email Address</label>
                       <input type="email" placeholder="admin@schedula.edu" className="w-full px-6 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSetTab === "security" && (
              <div className="space-y-10">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Security Protocols</h3>
                 <div className="grid gap-6">
                    {[
                      { l: "Two-Factor Authentication", d: "Add an extra layer of security to your admin account.", icon: <Shield className="text-emerald-500" />, check: true },
                      { l: "Session Persistence", d: "Maximum duration for an active admin dashboard session.", icon: <Clock className="text-amber-500" />, check: false },
                      { l: "Encrypted Database Exports", d: "Always encrypt CSV/Report exports from the system.", icon: <Lock className="text-indigo-500" />, check: true },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl group transition-all cursor-pointer">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-slate-100 transition-colors">
                            {s.icon}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-lg leading-tight">{s.l}</p>
                            <p className="text-sm text-slate-400 font-medium mt-1">{s.d}</p>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all shadow-sm">
                          <Key size={24} />
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* Display / Themes View */}
            {activeSetTab === "display" && (
              <div className="space-y-8">
                 <h3 className="text-2xl font-black text-slate-800 tracking-tight">Interface Theme</h3>
                 <div className="grid grid-cols-3 gap-6">
                    {[
                      { id: "light", label: "Light Mode", icon: <Sun size={32} /> },
                      { id: "dark", label: "Dark Mode", icon: <Moon size={32} /> },
                      { id: "system", label: "System Sync", icon: <Monitor size={32} /> },
                    ].map(t => (
                      <button key={t.id} className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 ${t.id === "light" ? "border-indigo-600 bg-white shadow-2xl shadow-indigo-100" : "border-slate-100 bg-slate-50 text-slate-400"}`}>
                        <div className={t.id === "light" ? "text-indigo-600 scale-125 transition-transform" : ""}>{t.icon}</div>
                        <span className="font-black text-sm tracking-widest uppercase">{t.label}</span>
                      </button>
                    ))}
                 </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between pt-10 border-t border-slate-100">
               <div className="flex items-center gap-2 text-slate-400 text-sm font-black italic">
                 <HelpCircle size={16} /> Need assistance? View documentation.
               </div>
               <button className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-base shadow-xl shadow-indigo-200 hover:scale-105 transition-all active:scale-95">
                 <Save size={20} /> Deploy Configuration
               </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsComponent;
