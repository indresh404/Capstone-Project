import React, { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
    collapsed: { width: "5rem", transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
    expanded:  { width: "16rem", transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
    mobileHidden: { width: "0rem", opacity: 0, transition: { duration: 0.3 } },
    mobileVisible: { width: "16rem", opacity: 1, transition: { duration: 0.3 } },
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

  // Determine which animation to use
  const getSidebarAnimation = () => {
    if (isMobile) {
      return isSidebarOpen ? "mobileVisible" : "mobileHidden";
    }
    return isExpanded ? "expanded" : "collapsed";
  };

  return (
    <div className="h-screen flex bg-gradient-to-r from-[#EEF0FF] via-[#F8F4FF] to-[#FFFFFF] text-slate-700 overflow-hidden font-sans">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={getSidebarAnimation()}
        variants={sidebarVariants}
        className={`bg-gradient-to-b from-indigo-700 to-purple-700 shadow-2xl rounded-r-[3rem] flex flex-col items-center py-10 gap-8 relative z-50
          ${isMobile ? 'fixed left-0 top-0 h-full' : 'relative'}`}
        style={{ 
          overflowY: "auto",
          overflowX: "visible",
          flexShrink: 0,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Hide scrollbar */}
        <style>
          {`
            .bg-gradient-to-b.from-indigo-700.to-purple-700::-webkit-scrollbar {
              display: none;
              width: 0;
              background: transparent;
            }
          `}
        </style>
        
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none rounded-r-[3rem]" />

        {/* Mobile Menu Toggle Button */}
        {isMobile && !isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-4 top-6 z-50 w-12 h-12 bg-gradient-to-b from-indigo-700 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
          >
            <LayoutDashboard size={24} className="text-white" />
          </button>
        )}

        {/* Logo Toggle */}
        <button
          onClick={() => {
            if (isMobile) {
              setIsSidebarOpen(false);
            } else {
              setIsExpanded(!isExpanded);
            }
          }}
          className="relative z-10 w-14 h-14 bg-black/50 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/10 shadow-inner hover:scale-110 active:scale-95 transition-transform cursor-pointer p-2 flex-shrink-0"
        >
          <motion.img
            src={LogoPng}
            alt="Logo"
            initial={false}
            animate={{ rotate: (!isMobile && isExpanded) ? 360 : 0, scale: (!isMobile && isExpanded) ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        </button>

        {/* Navigation - Scrollable */}
        <nav className="relative z-10 flex-1 flex flex-col gap-3 mt-2 w-full px-4 overflow-y-auto overflow-x-visible min-h-0">
          {menuItems.map((item, i) => (
            <div key={item.key} className="relative flex-shrink-0">
              <button
                onClick={() => {
                  setActiveTab(item.key);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className={`w-full p-3.5 rounded-2xl transition-all duration-500 relative group flex items-center
                  ${(!isMobile && isExpanded) ? "justify-start gap-4 px-5" : "justify-center px-4"}
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
                  {(!isMobile && isExpanded) && (
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
              </button>

              {/* Tooltip - Original style outside */}
              {(!isMobile && !isExpanded) && (
                <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-lg border border-white/20 text-black text-[13px] px-4 py-2.5 rounded-xl pointer-events-none uppercase tracking-widest font-bold whitespace-nowrap origin-left scale-x-0 opacity-0 transition-all duration-300 ease-out group-hover:scale-x-100 group-hover:opacity-100 shadow-xl z-[100]">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Profile */}
        <div className="relative z-10 px-4 w-full flex-shrink-0">
          <div className={`flex items-center gap-3 transition-all duration-500 ${(!isMobile && isExpanded) ? "bg-white/10 p-2 rounded-2xl" : "justify-center"}`}>
            <div className="w-10 h-10 rounded-xl bg-white/20 p-0.5 border border-white/30 overflow-hidden shrink-0">
              <img src={adminData.avatar} alt="avatar" className="rounded-lg bg-violet-100 w-full h-full object-cover" />
            </div>
            {(!isMobile && isExpanded) && (
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
      <main className="flex-1 flex flex-col px-4 md:px-12 pt-6 overflow-hidden min-w-0">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Schedula</span>{" "}
              <span className="text-slate-300 font-light">|</span>{" "}
              <span className="text-xl md:text-2xl font-black text-slate-700">{activeItem?.label}</span>
            </h1>
            <p className="text-slate-400 font-medium mt-1 text-xs md:text-sm">
              Admin Panel · {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {/* Notifications */}
            <div className="relative">
              <button
                className="relative p-2 md:p-2.5 bg-white/80 hover:bg-white rounded-xl transition-all shadow-sm group"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={18} className="text-slate-500 group-hover:text-violet-600 transition-colors md:w-5 md:h-5" />
                {adminData.notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-[8px] md:text-[10px] rounded-full flex items-center justify-center font-black shadow-lg animate-pulse">
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
                    className="absolute right-0 mt-3 w-64 md:w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs md:text-sm font-black text-slate-800">Notifications</p>
                    </div>
                    {notifItems.map((n, i) => (
                      <div key={i} className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                        <p className="text-[11px] md:text-xs font-bold text-slate-800">{n.msg}</p>
                        <p className="text-[9px] md:text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Admin Profile */}
            <div className="flex items-center gap-2 md:gap-3 bg-white/90 backdrop-blur-sm pl-2 md:pl-3 pr-3 md:pr-5 py-1.5 md:py-2 rounded-2xl shadow-md border border-white/50 hover:shadow-lg transition-all cursor-pointer">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden bg-gradient-to-br from-violet-400 to-indigo-500 p-0.5">
                <img src={adminData.avatar} alt={adminData.name} className="w-full h-full rounded-xl bg-white" />
              </div>
              <div className="hidden sm:block">
                <p className="font-black text-xs md:text-sm text-slate-800">{adminData.name}</p>
                <p className="text-[10px] md:text-xs text-violet-500 font-bold">{adminData.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
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

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c4b5fd;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a78bfa;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;