import React, { useState } from "react";
import { motion } from "framer-motion";
import { Save, Bell, Lock, Palette, Clock, Calendar, Check, Shield } from "lucide-react";

const SettingsComponent = () => {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    institutionName: "Schedula Institute of Technology",
    academicYear: "2025-26",
    semester: "Even",
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    dayStart: "08:00",
    dayEnd: "17:00",
    slotDuration: 60,
    breakStart: "12:00",
    breakDuration: 60,
    notifications: true,
    conflictAlerts: true,
    autoBackup: false,
    theme: "light",
    adminName: "Admin User",
    adminEmail: "admin@schedula.edu",
  });

  const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));
  const update = (key, val) => setSettings(p => ({ ...p, [key]: val }));
  const toggleDay = (d) => setSettings(p => ({
    ...p,
    workingDays: p.workingDays.includes(d) ? p.workingDays.filter(x => x !== d) : [...p.workingDays, d]
  }));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const Section = ({ icon, title, children }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">{icon}</div>
        <h3 className="text-sm font-black text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );

  const Field = ({ label, children }) => (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm font-medium text-slate-600 flex-shrink-0">{label}</label>
      {children}
    </div>
  );

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${value ? "bg-indigo-600" : "bg-slate-200"}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow ${value ? "left-6" : "left-1"}`} />
    </button>
  );

  const inputCls = "px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200 text-right";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Settings</h2>
          <p className="text-sm text-slate-400 mt-0.5">Configure your institution and scheduling preferences</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-md ${saved ? "bg-emerald-500 text-white" : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"}`}
        >
          {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Institution */}
        <Section icon={<Shield size={16} />} title="Institution">
          <Field label="Institution Name">
            <input value={settings.institutionName} onChange={e => update("institutionName", e.target.value)} className={`${inputCls} w-64`} />
          </Field>
          <Field label="Academic Year">
            <input value={settings.academicYear} onChange={e => update("academicYear", e.target.value)} className={`${inputCls} w-28`} />
          </Field>
          <Field label="Current Semester">
            <select value={settings.semester} onChange={e => update("semester", e.target.value)}
              className={`${inputCls} w-28`}>
              <option>Odd</option>
              <option>Even</option>
            </select>
          </Field>
          <Field label="Admin Name">
            <input value={settings.adminName} onChange={e => update("adminName", e.target.value)} className={`${inputCls} w-48`} />
          </Field>
          <Field label="Admin Email">
            <input value={settings.adminEmail} onChange={e => update("adminEmail", e.target.value)} className={`${inputCls} w-56`} />
          </Field>
        </Section>

        {/* Schedule Settings */}
        <Section icon={<Clock size={16} />} title="Schedule Configuration">
          <Field label="Day Start Time">
            <input type="time" value={settings.dayStart} onChange={e => update("dayStart", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Day End Time">
            <input type="time" value={settings.dayEnd} onChange={e => update("dayEnd", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Slot Duration (mins)">
            <select value={settings.slotDuration} onChange={e => update("slotDuration", Number(e.target.value))} className={inputCls}>
              {[45, 50, 60, 75, 90].map(v => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Break Start Time">
            <input type="time" value={settings.breakStart} onChange={e => update("breakStart", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Break Duration (mins)">
            <select value={settings.breakDuration} onChange={e => update("breakDuration", Number(e.target.value))} className={inputCls}>
              {[30, 45, 60].map(v => <option key={v}>{v}</option>)}
            </select>
          </Field>
        </Section>

        {/* Working Days */}
        <Section icon={<Calendar size={16} />} title="Working Days">
          <div className="flex gap-3 flex-wrap">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <button
                key={d}
                onClick={() => toggleDay(d)}
                className={`w-14 py-2.5 rounded-xl font-bold text-sm transition-all ${settings.workingDays.includes(d) ? "bg-indigo-600 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-1">{settings.workingDays.length} working days selected</p>
        </Section>

        {/* Notifications */}
        <Section icon={<Bell size={16} />} title="Notifications & Preferences">
          {[
            { key: "notifications", label: "Enable Notifications", desc: "Get notified about schedule changes" },
            { key: "conflictAlerts", label: "Conflict Alerts", desc: "Alert on scheduling conflicts" },
            { key: "autoBackup", label: "Auto Backup", desc: "Automatically backup timetables daily" },
          ].map(opt => (
            <div key={opt.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700">{opt.label}</p>
                <p className="text-xs text-slate-400">{opt.desc}</p>
              </div>
              <Toggle value={settings[opt.key]} onChange={() => toggle(opt.key)} />
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
};

export default SettingsComponent;
