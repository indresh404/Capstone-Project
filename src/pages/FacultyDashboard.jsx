import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Calendar, Users, FileText, 
  Settings, Bell, ClipboardClock,
} from "lucide-react";

// Import faculty components
import HomeComponent from "../components/faculty/HomeComponent";
import ScheduleComponent from "../components/faculty/ScheduleComponent";
import AttendanceComponent from "../components/faculty/AttendanceComponent";
import TimetableComponent from "../components/faculty/TimetableComponent";
import RequestsComponent from "../components/faculty/RequestsComponent";
import SettingsComponent from "../components/faculty/SettingsComponent";

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showNotifications, setShowNotifications] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fake user data
  const userData = {
    name: "Dr. Indresh Suresh",
    role: "Professor",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Indresh&backgroundColor=b6e3f4",
    notifications: 3
  };

  const menuItems = [
    { key: "home", label: "Home", icon: <LayoutDashboard size={22} /> },
    { key: "schedule", label: "Schedule", icon: <ClipboardClock size={22} /> },
    { key: "attendance", label: "Attendance", icon: <Users size={22} /> },
    { key: "timetable", label: "Timetable", icon: <Calendar size={22} /> },
    { key: "requests", label: "Requests", icon: <FileText size={22} /> },
    { key: "settings", label: "Settings", icon: <Settings size={22} /> },
  ];

  // Animation Variants for Sidebar
  const sidebarVariants = {
    collapsed: { 
      width: "6rem", 
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } 
    },
    expanded: { 
      width: "16rem", 
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } 
    }
  };

  // Variants for staggered children (the labels)
  const labelVariants = {
    hidden: { opacity: 0, x: -20, filter: "blur(4px)" },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { 
        delay: i * 0.1, // Creates the one-by-one cascading effect
        duration: 0.4,
        ease: "easeOut" 
      }
    }),
    exit: { 
      opacity: 0, 
      x: -10, 
      transition: { duration: 0.2 } 
    }
  };

  const renderComponent = () => {
    switch(activeTab) {
      case "home": return <HomeComponent activeTab={activeTab} menuItems={menuItems} />;
      case "schedule": return <ScheduleComponent activeTab={activeTab} menuItems={menuItems} />;
      case "attendance": return <AttendanceComponent activeTab={activeTab} menuItems={menuItems} />;
      case "timetable": return <TimetableComponent activeTab={activeTab} menuItems={menuItems} />;
      case "requests": return <RequestsComponent activeTab={activeTab} menuItems={menuItems} />;
      case "settings": return <SettingsComponent activeTab={activeTab} menuItems={menuItems} />;
      default: return <HomeComponent activeTab={activeTab} menuItems={menuItems} />;
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-r from-[#E8E8FF] via-[#FFF5FF] to-[#FFFFFF] text-slate-700 overflow-hidden font-sans p-5">
      
      {/* GRADIENT FLOATING SIDEBAR */}
      <motion.aside 
        initial={false}
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        className="bg-gradient-to-b -left-5 from-[#00017A] via-[#8545FF] to-[#670082] shadow-2xl rounded-r-[3rem] flex flex-col items-center py-10 gap-8 relative overflow-visible z-50"
      >
        {/* Subtle glass overlay */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none rounded-r-[3rem]" />

        {/* LOGO - Clickable Toggle */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative z-10 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/30 shadow-inner hover:scale-110 active:scale-95 transition-transform cursor-pointer"
        >
          <span className="font-black text-2xl tracking-tighter">S</span>
        </button>

        {/* Navigation Items */}
        <nav className="relative z-10 flex-1 flex flex-col gap-4 mt-4 w-full px-4">
          {menuItems.map((item, i) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`p-4 rounded-2xl transition-all duration-500 relative group flex items-center
                ${isExpanded ? "justify-start gap-4 px-6" : "justify-center px-4"}
                ${activeTab === item.key 
                  ? "bg-white text-[#8B5CF6] shadow-xl" 
                  : "text-white/70 hover:text-white hover:bg-white/10"}`}
            >
              {activeTab === item.key && (
                <motion.div 
                  layoutId="sidebarActive"
                  className="absolute -left-4 top-[20%] w-2 h-[60%] bg-white rounded-r-full shadow-[4px_0_15px_rgba(255,255,255,0.8)]"
                />
              )}
              
              <div className="relative z-10 transition-transform duration-300 group-hover:rotate-6 shrink-0">
                {item.icon}
              </div>
              
              {/* One-by-one sliding labels */}
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
              
              {/* Tooltip - only visible when collapsed */}
              {!isExpanded && (
                <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-lg border border-white/20 text-black text-[15px] px-5 py-3 rounded-xl pointer-events-none uppercase tracking-widest font-bold whitespace-nowrap origin-left scale-x-0 opacity-0 transition-all duration-300 ease-out group-hover:scale-x-100 group-hover:opacity-100 shadow-xl">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Profile Section */}
        <div className="relative z-10 px-4 w-full">
          <div className={`flex items-center gap-3 transition-all duration-500 ${isExpanded ? "bg-white/10 p-2 rounded-2xl" : "justify-center"}`}>
            <div className="w-10 h-10 rounded-xl bg-white/20 p-0.5 border border-white/30 overflow-hidden shrink-0">
              <img 
                src={userData.avatar}
                alt="avatar" 
                className="rounded-lg bg-indigo-100 w-full h-full object-cover"
              />
            </div>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.3 }}
                className="overflow-hidden"
              >
                <p className="text-white text-xs font-bold truncate">{userData.name}</p>
                <p className="text-white/50 text-[10px] truncate">{userData.role}</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col px-12 pt-6 overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Schedula</span>
            </h1>
            <p className="text-slate-400 font-medium mt-1">Faculty : Indresh</p>
          </div>

          <div className="flex items-center gap-6">
            {/* Notification Icon */}
            <button 
              className="relative p-2 hover:bg-white/80 rounded-xl transition-all group"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={22} className="text-slate-600 group-hover:text-indigo-600 transition-colors" />
              {userData.notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {userData.notifications}
                </span>
              )}
              
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-800">Notifications</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                    <p className="text-xs font-medium text-slate-800">New attendance request</p>
                    <p className="text-[10px] text-slate-500">2 min ago</p>
                  </div>
                </div>
              )}
            </button>

            {/* Profile Section */}
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm pl-3 pr-5 py-2 rounded-2xl shadow-md border border-white/50 hover:shadow-lg transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-400 p-0.5">
                <img 
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-full h-full rounded-xl bg-white"
                />
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-slate-800">{userData.name}</p>
                <p className="text-xs text-slate-500">{userData.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderComponent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default FacultyDashboard;