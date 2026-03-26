import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, BookMarked,
  CalendarRange, BarChart2, Settings, Bell,
} from "lucide-react";

// Import admin components
import HomeComponent from "../components/admin/HomeComponent";
import FacultyComponent from "../components/admin/FacultyComponent";
import CoursesComponent from "../components/admin/CoursesComponent";
import TimetableEditorComponent from "../components/admin/TimetableEditorComponent";
import AnalyticsComponent from "../components/admin/AnalyticsComponent";
import SettingsComponent from "../components/admin/SettingsComponent";
import LogoPng from "../assets/Logo.png";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showNotifications, setShowNotifications] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const adminData = {
    name: "Admin Coordinator",
    role: "Super Admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=c0aede",
    notifications: 4,
  };

  const menuItems = [
    { key: "home",             label: "Home",          icon: <LayoutDashboard size={22} /> },
    { key: "faculty",          label: "Faculty",       icon: <Users size={22} /> },
    { key: "courses",          label: "Courses",       icon: <BookMarked size={22} /> },
    { key: "timetable-editor", label: "TT Editor",     icon: <CalendarRange size={22} /> },
    { key: "analytics",        label: "Analytics",     icon: <BarChart2 size={22} /> },
    { key: "settings",         label: "Settings",      icon: <Settings size={22} /> },
  ];

  const sidebarVariants = {
    collapsed: { width: "6rem", transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
    expanded:  { width: "16rem", transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
  };

  const labelVariants = {
    hidden:  { opacity: 0, x: -20, filter: "blur(4px)" },
    visible: (i) => ({
      opacity: 1, x: 0, filter: "blur(0px)",
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
    exit: { opacity: 0, x: -10, transition: { duration: 0.2 } },
  };

  const renderComponent = () => {
    switch (activeTab) {
      case "home":             return <HomeComponent setActiveTab={setActiveTab} />;
      case "faculty":          return <FacultyComponent />;
      case "courses":          return <CoursesComponent />;
      case "timetable-editor": return <TimetableEditorComponent />;
      case "analytics":        return <AnalyticsComponent />;
      case "settings":         return <SettingsComponent />;
      default:                 return <HomeComponent setActiveTab={setActiveTab} />;
    }
  };

  const activeItem = menuItems.find(m => m.key === activeTab);

  const notifItems = [
    { msg: "Conflict in EC Dept timetable", time: "5 min ago", type: "warning" },
    { msg: "Dr. Priya's schedule updated", time: "30 min ago", type: "info" },
    { msg: "New faculty added: Prof. Kiran", time: "1 hr ago", type: "success" },
    { msg: "Timetable export completed", time: "2 hr ago", type: "success" },
  ];

  return (
    <div className="h-screen flex bg-gradient-to-r from-[#EEF0FF] via-[#F8F4FF] to-[#FFFFFF] text-slate-700 overflow-hidden font-sans p-5">

      {/* SIDEBAR */}
      <motion.aside
        initial={false}
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        className="bg-gradient-to-b -left-5 from-indigo-700 to-purple-700 shadow-2xl rounded-r-[3rem] flex flex-col items-center py-10 gap-8 relative overflow-visible z-50"
      >
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none rounded-r-[3rem]" />

        {/* Logo Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative z-10 w-14 h-14 bg-black/50 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/10 shadow-inner hover:scale-110 active:scale-95 transition-transform cursor-pointer p-2"
        >
          <motion.img
            src={LogoPng}
            alt="Logo"
            initial={false}
            animate={{ rotate: isExpanded ? 360 : 0, scale: isExpanded ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        </button>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 flex flex-col gap-3 mt-2 w-full px-4">
          {menuItems.map((item, i) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`p-3.5 rounded-2xl transition-all duration-500 relative group flex items-center
                ${isExpanded ? "justify-start gap-4 px-5" : "justify-center px-4"}
                ${activeTab === item.key
                  ? "bg-white text-[#7C3AED] shadow-xl"
                  : "text-white/70 hover:text-white hover:bg-white/10"}`}
            >
              {activeTab === item.key && (
                <motion.div
                  layoutId="adminSidebarActive"
                  className="absolute -left-4 top-[10%] w-2 h-[80%] bg-white rounded-r-full shadow-[4px_0_15px_rgba(255,255,255,0.8)]"
                />
              )}

              <div className="relative z-10 transition-transform duration-300 group-hover:rotate-6 shrink-0">
                {item.icon}
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    custom={i}
                    variants={labelVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="font-bold tracking-wide whitespace-nowrap text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {!isExpanded && (
                <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-lg border border-white/20 text-black text-[13px] px-4 py-2.5 rounded-xl pointer-events-none uppercase tracking-widest font-bold whitespace-nowrap origin-left scale-x-0 opacity-0 transition-all duration-300 ease-out group-hover:scale-x-100 group-hover:opacity-100 shadow-xl">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Profile */}
        <div className="relative z-10 px-4 w-full">
          <div className={`flex items-center gap-3 transition-all duration-500 ${isExpanded ? "bg-white/10 p-2 rounded-2xl" : "justify-center"}`}>
            <div className="w-10 h-10 rounded-xl bg-white/20 p-0.5 border border-white/30 overflow-hidden shrink-0">
              <img src={adminData.avatar} alt="avatar" className="rounded-lg bg-violet-100 w-full h-full object-cover" />
            </div>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="overflow-hidden"
              >
                <p className="text-white text-xs font-bold truncate">{adminData.name}</p>
                <p className="text-white/50 text-[10px] truncate">{adminData.role}</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col px-12 pt-6 overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Schedula</span>{" "}
              <span className="text-slate-300 font-light">|</span>{" "}
              <span className="text-2xl font-black text-slate-700">{activeItem?.label}</span>
            </h1>
            <p className="text-slate-400 font-medium mt-1 text-sm">
              Admin Panel · {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="flex items-center gap-5">
            {/* Notifications */}
            <div className="relative">
              <button
                className="relative p-2.5 bg-white/80 hover:bg-white rounded-xl transition-all shadow-sm group"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} className="text-slate-500 group-hover:text-violet-600 transition-colors" />
                {adminData.notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-black shadow-lg animate-pulse">
                    {adminData.notifications}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-black text-slate-800">Notifications</p>
                    </div>
                    {notifItems.map((n, i) => (
                      <div key={i} className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                        <p className="text-xs font-bold text-slate-800">{n.msg}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Admin Profile */}
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm pl-3 pr-5 py-2 rounded-2xl shadow-md border border-white/50 hover:shadow-lg transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-violet-400 to-indigo-500 p-0.5">
                <img src={adminData.avatar} alt={adminData.name} className="w-full h-full rounded-xl bg-white" />
              </div>
              <div>
                <p className="font-black text-sm text-slate-800">{adminData.name}</p>
                <p className="text-xs text-violet-500 font-bold">{adminData.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {renderComponent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

    </div>
  );
};

export default AdminDashboard;