import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, BookMarked,
  CalendarRange, BarChart2, Settings, Bell,
  Search, LogOut, ChevronRight, Menu, X,
  Maximize, Command, Sparkles, AlertCircle, ArrowUpRight
} from "lucide-react";

// Import admin components
import HomeComponent from "../components/admin/HomeComponent";
import FacultyComponent from "../components/admin/FacultyComponent";
import CoursesComponent from "../components/admin/CoursesComponent";
import TimetableEditorComponent from "../components/admin/TimetableEditorComponent";
import AnalyticsComponent from "../components/admin/AnalyticsComponent";
import SettingsComponent from "../components/admin/SettingsComponent";
import LogoPng from "../assets/logo.png";

// Safety "Coming Soon" Component
const ComingSoon = ({ activeTab }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl border border-white p-12 rounded-[3.5rem] shadow-sm text-center gap-6"
  >
    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[2rem] flex items-center justify-center text-indigo-600 animate-pulse">
      <AlertCircle size={48} />
    </div>
    <div>
      <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">Feature Under Optimization</h2>
      <p className="text-slate-500 font-bold max-w-sm">
        We're currently refining the <span className="text-indigo-600 uppercase">'{activeTab}'</span> module for a more premium scheduling experience.
      </p>
    </div>
    <div className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center gap-3">
      Coming Soon <Sparkles size={16} className="text-yellow-300" />
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [adminData, setAdminData] = useState({
    name: "Admin",
    role: "Super Admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=c0aede",
  });

  // Fetch real user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAdminData({
          name: user.name || "Admin",
          role: user.role || "Super Admin",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}&backgroundColor=c0aede`
        });
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsExpanded(false);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const menuItems = [
    { key: "home", label: "Dashboard", icon: <LayoutDashboard size={24} /> },
    { key: "faculty", label: "Faculty", icon: <Users size={24} /> },
    { key: "courses", label: "Academic", icon: <BookMarked size={24} /> },
    { key: "timetable-editor", label: "Scheduler", icon: <CalendarRange size={24} /> },
    { key: "analytics", label: "Analytics", icon: <BarChart2 size={24} /> },
    { key: "settings", label: "Config", icon: <Settings size={24} /> },
  ];

  const sidebarVariants = {
    collapsed: { width: "6rem", transition: { type: "spring", stiffness: 300, damping: 30 } },
    expanded: { width: "16rem", transition: { type: "spring", stiffness: 300, damping: 30 } },
  };

  const labelVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.2, ease: "easeOut" }
    }),
    exit: { opacity: 0, x: -10, transition: { duration: 0.1 } }
  };

  const renderComponent = () => {
    switch (activeTab) {
      case "home": return <HomeComponent setActiveTab={setActiveTab} />;
      case "faculty": return <FacultyComponent />;
      case "courses": return <CoursesComponent />;
      case "timetable-editor": return <TimetableEditorComponent />;
      case "analytics": return <AnalyticsComponent />;
      case "settings": return <SettingsComponent />;
      default: return <ComingSoon activeTab={activeTab} />;
    }
  };

  const activeItem = menuItems.find(m => m.key === activeTab);

  return (
    <div className="h-screen flex bg-gradient-to-r from-[#EEF0FF] via-[#F8F4FF] to-[#FFFFFF] text-slate-700 overflow-hidden font-sans selection:bg-indigo-100 p-5">

      {/* SIDEBAR - Responsive Scroll Fix */}
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative z-10 px-8 pt-2">
        <header className="flex items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="hidden sm:block">
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
                {activeItem?.label} <Sparkles size={20} className="text-indigo-400" />
              </h2>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden lg:block">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input type="text" placeholder="Global system search..." className="pl-14 pr-6 py-4 bg-white border border-indigo-100/50 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all text-sm font-bold shadow-sm w-80" />
            </div>

            <button className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all relative group">
              <Bell size={24} />
              <div className="absolute top-4 right-4 w-2 h-2 bg-rose-500 rounded-full border-2 border-white group-hover:animate-ping" />
            </button>

            <div className="hidden sm:flex items-center gap-4 bg-white p-2.5 pr-6 rounded-[1.8rem] shadow-sm border border-indigo-100/30 group hover:shadow-lg transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
                {adminData.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 leading-none lowercase truncate max-w-[100px]">{adminData.name}</p>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Admin Panel</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Container - Safety Refinement */}
        <section className="flex-1 overflow-y-auto pb-10 custom-scrollbar pr-2 min-h-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="h-full"
            >
              {renderComponent()}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;