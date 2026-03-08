import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, BookOpen, Clock, AlertTriangle, CheckCircle, BarChart2 } from "lucide-react";

const facultyLoad = [
  { name: "Dr. Priya Mehta", assigned: 14, max: 18, dept: "CS" },
  { name: "Prof. Suresh Nair", assigned: 18, max: 18, dept: "CS" },
  { name: "Dr. Ananya Rao", assigned: 10, max: 20, dept: "Math" },
  { name: "Prof. Rajesh Kumar", assigned: 16, max: 16, dept: "EC" },
  { name: "Dr. Meera Patel", assigned: 8, max: 14, dept: "Phy" },
  { name: "Prof. Kiran Desai", assigned: 12, max: 18, dept: "CS" },
];

const deptStats = [
  { dept: "Computer Science", subjects: 12, faculty: 8, coverage: 95, color: "from-indigo-500 to-indigo-600" },
  { dept: "Electronics", subjects: 9, faculty: 5, coverage: 88, color: "from-purple-500 to-purple-600" },
  { dept: "Mathematics", subjects: 6, faculty: 4, coverage: 100, color: "from-violet-500 to-violet-600" },
  { dept: "Physics", subjects: 5, faculty: 3, coverage: 80, color: "from-sky-500 to-sky-600" },
  { dept: "Mechanical", subjects: 8, faculty: 6, coverage: 75, color: "from-emerald-500 to-emerald-600" },
];

const weeklyHours = [
  { day: "Mon", hrs: 28 },
  { day: "Tue", hrs: 24 },
  { day: "Wed", hrs: 30 },
  { day: "Thu", hrs: 26 },
  { day: "Fri", hrs: 18 },
];

const maxHrs = Math.max(...weeklyHours.map(w => w.hrs));

const insights = [
  { type: "warning", msg: "Prof. Suresh Nair is at 100% workload capacity", dept: "CS" },
  { type: "success", msg: "Mathematics dept has 100% subject coverage", dept: "Math" },
  { type: "warning", msg: "Mechanical dept has 3 unmapped subjects", dept: "Mech" },
  { type: "success", msg: "No scheduling conflicts detected this week", dept: "All" },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const AnalyticsComponent = () => {
  const [view, setView] = useState("overview");

  return (
    <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="visible">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Analytics</h2>
          <p className="text-sm text-slate-400 mt-0.5">Overview of scheduling health and faculty workload</p>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-1">
          {["overview", "faculty", "departments"].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${view === v ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "overview" && (
        <>
          {/* Summary KPIs */}
          <motion.div className="grid grid-cols-4 gap-4" variants={containerVariants}>
            {[
              { label: "Avg Load", value: "78%", icon: <Clock size={18} />, color: "text-indigo-600 bg-indigo-50", sub: "across faculty" },
              { label: "Coverage", value: "88%", icon: <CheckCircle size={18} />, color: "text-emerald-600 bg-emerald-50", sub: "subjects mapped" },
              { label: "Conflicts", value: "0", icon: <AlertTriangle size={18} />, color: "text-emerald-600 bg-emerald-50", sub: "this week" },
              { label: "Overloaded", value: "1", icon: <Users size={18} />, color: "text-amber-600 bg-amber-50", sub: "faculty members" },
            ].map((k, i) => (
              <motion.div key={i} variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className={`w-9 h-9 rounded-xl ${k.color} flex items-center justify-center mb-3`}>{k.icon}</div>
                <p className="text-3xl font-black text-slate-800">{k.value}</p>
                <p className="text-sm font-bold text-slate-600 mt-0.5">{k.label}</p>
                <p className="text-xs text-slate-400">{k.sub}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Weekly Distribution */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-700 mb-5 flex items-center gap-2"><BarChart2 size={16} className="text-indigo-500" /> Weekly Class Distribution</h3>
            <div className="flex items-end gap-4 h-32">
              {weeklyHours.map((w, i) => (
                <div key={w.day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">{w.hrs}h</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(w.hrs / maxHrs) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                    className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-xl min-h-[8px]"
                  />
                  <span className="text-xs font-bold text-slate-600">{w.day}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Insights */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-700 mb-4">Insights</h3>
            <div className="space-y-3">
              {insights.map((ins, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${ins.type === "warning" ? "bg-amber-50" : "bg-emerald-50"}`}>
                  {ins.type === "warning"
                    ? <AlertTriangle size={15} className="text-amber-500 shrink-0" />
                    : <CheckCircle size={15} className="text-emerald-500 shrink-0" />}
                  <p className="text-sm text-slate-700 font-medium">{ins.msg}</p>
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${ins.type === "warning" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>{ins.dept}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {view === "faculty" && (
        <motion.div variants={containerVariants} className="space-y-4" initial="hidden" animate="visible">
          {facultyLoad.map((f, i) => {
            const pct = Math.round((f.assigned / f.max) * 100);
            return (
              <motion.div key={i} variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                  {f.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-black text-slate-800">{f.name}</p>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{f.dept}</span>
                    </div>
                    <span className={`text-sm font-black ${pct >= 100 ? "text-rose-500" : pct >= 80 ? "text-amber-500" : "text-emerald-500"}`}>{pct}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(pct, 100)}%` }}
                      transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" }}
                      className={`h-full rounded-full ${pct >= 100 ? "bg-rose-500" : pct >= 80 ? "bg-amber-400" : "bg-emerald-400"}`}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">{f.assigned} / {f.max} hours assigned</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {view === "departments" && (
        <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4" initial="hidden" animate="visible">
          {deptStats.map((d, i) => (
            <motion.div key={i} variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-5">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${d.color} text-white font-black text-sm flex items-center justify-center shrink-0`}>
                {d.dept.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-black text-slate-800">{d.dept}</p>
                  <span className={`text-xs font-bold ${d.coverage >= 90 ? "text-emerald-600 bg-emerald-50" : d.coverage >= 80 ? "text-amber-600 bg-amber-50" : "text-rose-600 bg-rose-50"} px-2 py-0.5 rounded-full`}>
                    {d.coverage}% coverage
                  </span>
                </div>
                <div className="flex gap-5">
                  <span className="text-xs text-slate-500"><span className="font-bold text-slate-700">{d.subjects}</span> subjects</span>
                  <span className="text-xs text-slate-500"><span className="font-bold text-slate-700">{d.faculty}</span> faculty</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${d.coverage}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className={`h-full rounded-full bg-gradient-to-r ${d.color}`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnalyticsComponent;
