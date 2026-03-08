import React from "react";
import { motion } from "framer-motion";
import {
  Users, BookOpen, Calendar, Zap,
  TrendingUp, Clock, CheckCircle, AlertCircle
} from "lucide-react";

const stats = [
  { label: "Total Faculty", value: "24", icon: <Users size={20} />, color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50", text: "text-indigo-600", delta: "+2 this sem" },
  { label: "Courses", value: "38", icon: <BookOpen size={20} />, color: "from-purple-500 to-purple-600", bg: "bg-purple-50", text: "text-purple-600", delta: "6 depts" },
  { label: "Timetables", value: "12", icon: <Calendar size={20} />, color: "from-violet-500 to-violet-600", bg: "bg-violet-50", text: "text-violet-600", delta: "3 pending" },
  { label: "Conflicts", value: "2", icon: <AlertCircle size={20} />, color: "from-rose-500 to-rose-600", bg: "bg-rose-50", text: "text-rose-600", delta: "Needs fix" },
];

const recentActivity = [
  { action: "Timetable generated", dept: "Computer Science", time: "10 min ago", status: "success" },
  { action: "Faculty assigned", dept: "Dr. Meera → Data Structures", time: "1 hr ago", status: "success" },
  { action: "Conflict detected", dept: "Electronics Dept", time: "2 hr ago", status: "warning" },
  { action: "Schedule updated", dept: "Mechanical Engineering", time: "Yesterday", status: "success" },
  { action: "New faculty added", dept: "Prof. Raghav Nair", time: "Yesterday", status: "success" },
];

const quickLinks = [
  { label: "Auto-Generate Timetable", icon: <Zap size={18} />, color: "bg-gradient-to-br from-indigo-600 to-purple-600 text-white", tab: "autogenerate" },
  { label: "View Analytics", icon: <TrendingUp size={18} />, color: "bg-gradient-to-br from-violet-500 to-purple-500 text-white", tab: "analytics" },
  { label: "Manage Faculty", icon: <Users size={18} />, color: "bg-white border border-slate-200 text-slate-700", tab: "faculty" },
  { label: "Edit Timetable", icon: <Clock size={18} />, color: "bg-white border border-slate-200 text-slate-700", tab: "timetable-editor" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const HomeComponent = ({ setActiveTab }) => {
  return (
    <motion.div
      className="space-y-7"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stats Grid */}
      <motion.div className="grid grid-cols-4 gap-5" variants={containerVariants}>
        {stats.map((s, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-default"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.text} flex items-center justify-center`}>
                {s.icon}
              </div>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{s.delta}</span>
            </div>
            <p className="text-3xl font-black text-slate-800">{s.value}</p>
            <p className="text-sm text-slate-500 font-medium mt-1">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-4">
          {quickLinks.map((q, i) => (
            <button
              key={i}
              onClick={() => setActiveTab && setActiveTab(q.tab)}
              className={`${q.color} flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm shadow-sm hover:scale-[1.03] active:scale-95 transition-all`}
            >
              {q.icon}
              {q.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Activity Feed */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-base font-black text-slate-800 mb-5">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${a.status === "success" ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"}`}>
                {a.status === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-700">{a.action}</p>
                <p className="text-xs text-slate-400 truncate">{a.dept}</p>
              </div>
              <span className="text-[11px] text-slate-400 whitespace-nowrap font-medium">{a.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HomeComponent;
