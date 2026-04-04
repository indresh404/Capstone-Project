import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import LottieComponent from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, BookOpen, Clock, CheckCircle, 
  AlertCircle, Search, Calendar, RefreshCw, 
  Plus, MoreVertical, Edit3, UserPlus, 
  Filter, Download, ChevronRight, GraduationCap,
  Award, Smartphone, Mail, Phone, Info,
  Check, X, Minus, HelpCircle, Layers
} from "lucide-react";

const Lottie = LottieComponent.default ?? LottieComponent;
import mainAnimation from "../../assets/tt_loading_main.json";
import sideAnimation1 from "../../assets/tt_loading1.json";
import sideAnimation2 from "../../assets/tt_loading2.json";
import errorAnimation from "../../assets/tt_error.json";

// ── Helpers ───────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().split("T")[0];

const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const AVATAR_GRADIENTS = [
  ["from-indigo-500", "to-indigo-600"],
  ["from-emerald-500", "to-emerald-600"],
  ["from-rose-500", "to-rose-600"],
  ["from-amber-500", "to-amber-600"],
  ["from-cyan-500", "to-cyan-600"],
  ["from-violet-500", "to-violet-600"],
  ["from-pink-500", "to-pink-600"],
  ["from-teal-500", "to-teal-600"],
];

const getGradient = (id) => AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length];

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

async function api(url, opts = {}) {
  const r = await fetch(`http://localhost:5000${url}`, {
    ...opts,
    headers: { ...authHeaders(), ...(opts.headers ?? {}) },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.message ?? `HTTP ${r.status}`);
  return data;
}

// ── Shared Component Logic ───────────────────────────────────────────────────

const containerVariants = { hidden: { opacity: 1 }, visible: { transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const STATUS_CFG = {
  present: { label: "Present", color: "emerald", icon: <CheckCircle size={14} /> },
  absent:  { label: "Absent",  color: "rose",    icon: <AlertCircle size={14} /> },
  leave:   { label: "Leave",   color: "amber",   icon: <Calendar size={14} /> },
  unmarked:{ label: "Status",  color: "slate",   icon: <HelpCircle size={14} /> }
};

// ── Sub-components REFACTORED for Premium UI ────────────────────────────────

const FacultyCard = memo(({ f, onEdit }) => {
  const [from, to] = getGradient(f.id);
  
  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -8 }}
      className="bg-white/70 backdrop-blur-xl border border-white p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity rotate-12">
        <Users size={80} />
      </div>
      
      <div className="flex items-start gap-5 mb-8">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${from} ${to} flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-100`}>
          {getInitials(f.name)}
        </div>
        <div className="min-w-0">
          <h4 className="text-xl font-black text-slate-800 tracking-tighter truncate">{f.name}</h4>
          <p className="text-indigo-500 font-black text-[10px] uppercase tracking-widest leading-none mt-1">{f.college_id}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-600 transition-colors">
          <Mail size={16} />
          <span className="text-xs font-bold truncate">{f.email}</span>
        </div>
        {f.phone && (
          <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-600 transition-colors">
            <Phone size={16} />
            <span className="text-xs font-bold">{f.phone}</span>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
        <div className="flex -space-x-3 overflow-hidden">
          {f.subjects?.slice(0, 3).map((s, idx) => (
            <div key={idx} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-600 uppercase border border-white">
              {s.code.substring(0, 2)}
            </div>
          ))}
          {f.subjects?.length > 3 && (
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-50 flex items-center justify-center text-[8px] font-black text-indigo-600 border border-white">
              +{f.subjects.length - 3}
            </div>
          )}
        </div>
        <button 
          onClick={() => onEdit(f)}
          className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm group/btn"
        >
          <Edit3 size={18} className="group-hover/btn:rotate-12 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
});

const AttendanceRow = memo(({ f, status, onStatusChange }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.unmarked;
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }} 
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white border border-slate-100 rounded-[2rem] hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 border border-slate-200/50 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
          {getInitials(f.name)}
        </div>
        <div>
          <p className="font-black text-slate-700 text-sm">{f.name}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.college_id}</p>
        </div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
        {["present", "absent", "leave"].map((type) => {
          const typeCfg = STATUS_CFG[type];
          const active = status === type;
          return (
            <button
              key={type}
              onClick={() => onStatusChange(f.id, type)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                active 
                  ? `bg-${typeCfg.color}-500 text-white shadow-lg` 
                  : "text-slate-400 hover:text-slate-600 hover:bg-white"
              }`}
            >
              {typeCfg.icon}
              <span className="hidden sm:inline">{type}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
});

// Toast Component
const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className={`fixed bottom-10 right-10 z-[1000] px-8 py-5 rounded-[2rem] shadow-2xl backdrop-blur-xl border flex items-center gap-4 ${
      type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-rose-500/90 border-rose-400 text-white'
    }`}
  >
    {type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
    <span className="font-black text-sm tracking-tight">{message}</span>
    <button onClick={onClose} className="ml-4 p-1 hover:bg-white/20 rounded-lg transition-colors">
      <X size={16} />
    </button>
  </motion.div>
);

// ── Main Component ────────────────────────────────────────────────────────────

export default function FacultyComponent() {
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("roster");

  // Filter state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Attendance state
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [attendanceMap, setAttendanceMap] = useState({});

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (activeTab === "attendance") fetchAttendance(); }, [selectedDate, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fRes, sRes] = await Promise.all([
        api("/api/timetable/faculty/all"),
        api("/api/timetable/subjects/all"),
      ]);
      setSubjects(sRes.data || []);
      const subMap = {};
      (sRes.data || []).forEach(s => subMap[s.id] = s);
      setFaculty((fRes.data || []).map(f => ({
        ...f,
        subjects: (f.subject_ids || []).map(id => subMap[id]).filter(Boolean)
      })));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const fetchAttendance = async () => {
    try {
      const data = await api(`/api/faculty/attendance?date=${selectedDate}`);
      const map = {};
      if (data.success) data.data.forEach(r => map[r.faculty_id] = r.status);
      setAttendanceMap(map);
    } catch { setAttendanceMap({}); }
  };

  const handleStatusChange = async (fid, status) => {
    const newStatus = attendanceMap[fid] === status ? "unmarked" : status;
    setAttendanceMap(prev => ({ ...prev, [fid]: newStatus }));
  };

  const handleMarkAll = (status) => {
    const newMap = { ...attendanceMap };
    faculty.forEach(f => {
      newMap[f.id] = status;
    });
    setAttendanceMap(newMap);
  };

  const saveAttendance = async () => {
    try {
      const records = Object.entries(attendanceMap)
        .filter(([_, status]) => status !== "unmarked")
        .map(([fid, status]) => ({ faculty_id: fid, status }));
      await api("/api/faculty/attendance", { method: "PUT", body: JSON.stringify({ date: selectedDate, records }) });
      showToast("Attendance synchronized with cloud database!");
    } catch (err) { showToast(err.message, 'error'); }
  };

  const filteredFaculty = useMemo(() => {
    return faculty.filter(f => 
      (f.name.toLowerCase().includes(search.toLowerCase()) || f.college_id.toLowerCase().includes(search.toLowerCase())) &&
      (typeFilter === "all" || (typeFilter === "assigned" ? f.subjects.length > 0 : f.subjects.length === 0))
    );
  }, [faculty, search, typeFilter]);

  if (loading) {
     return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
           <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full" />
           <p className="text-slate-400 font-black tracking-widest text-xs uppercase">Syncing Staff Database...</p>
        </div>
     );
  }

  return (
    <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
      
      {/* Premium Header / Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="md:col-span-1 bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-sm flex flex-col justify-center">
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">Faculty Hub</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{faculty.length} Active Staff Members</p>
         </div>
         <div className="md:col-span-2 flex gap-4 bg-white/40 backdrop-blur-md p-2 rounded-[2rem] border border-white/50 shadow-inner overflow-x-auto custom-scrollbar">
            {[
              { id: "roster", label: "Staff Roster", icon: <Users size={18} /> },
              { id: "attendance", label: "Attendance Feed", icon: <CheckCircle size={18} /> },
              { id: "schedules", label: "Workload Matrix", icon: <Clock size={18} /> }
            ].map(t => (
              <button 
                key={t.id} 
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-sm whitespace-nowrap transition-all ${
                  activeTab === t.id ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "text-slate-500 hover:bg-white hover:text-slate-800"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
         </div>
      </div>

      {activeTab === "roster" && (
         <motion.div key="roster" variants={containerVariants} className="space-y-8">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
               <div className="flex-1 relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search by name, ID or department..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 shadow-sm"
                  />
               </div>
               <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                  {["all", "assigned", "unassigned"].map(f => (
                    <button 
                      key={f} 
                      onClick={() => setTypeFilter(f)}
                      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        typeFilter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
               </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredFaculty.map(f => <FacultyCard key={f.id} f={f} onEdit={setSelectedFaculty} />)}
            </div>
         </motion.div>
      )}

      {activeTab === "attendance" && (
         <motion.div key="attendance" variants={containerVariants} className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[3rem] border border-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-6">
                  <button onClick={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() - 1);
                    setSelectedDate(d.toISOString().split('T')[0]);
                  }} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-colors">
                     <ChevronRight size={24} className="rotate-180" />
                  </button>
                  <div className="text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Tracking Logic</p>
                     <p className="text-2xl font-black text-slate-800 tracking-tighter">{fmtDate(selectedDate)}</p>
                  </div>
                  <button onClick={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() + 1);
                    setSelectedDate(d.toISOString().split('T')[0]);
                  }} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-colors">
                     <ChevronRight size={24} />
                  </button>
               </div>
               
               {/* Bulk Actions */}
               <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2">
                 <button onClick={() => handleMarkAll('present')} className="px-4 py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-100 hover:scale-105 transition-all">All Present</button>
                 <button onClick={() => handleMarkAll('absent')} className="px-4 py-2.5 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-rose-100 hover:scale-105 transition-all">All Absent</button>
                 <button onClick={() => handleMarkAll('leave')} className="px-4 py-2.5 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-amber-100 hover:scale-105 transition-all">All Leave</button>
               </div>

               <button 
                 onClick={saveAttendance}
                 className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
               >
                 <RefreshCw size={22} className="animate-pulse" /> Sync Attendance
               </button>
            </div>

            <div className="grid gap-4">
               {faculty.map(f => (
                 <AttendanceRow 
                   key={f.id} 
                   f={f} 
                   status={attendanceMap[f.id] || "unmarked"} 
                   onStatusChange={handleStatusChange} 
                 />
               ))}
            </div>
         </motion.div>
      )}

      {activeTab === "schedules" && (
        <motion.div key="schedules" variants={containerVariants} className="h-[500px] flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-[3rem] border border-slate-100 text-slate-400 gap-6">
           <Layers size={80} className="text-slate-200" />
           <div className="text-center">
              <h3 className="text-2xl font-black text-slate-700 tracking-tighter mb-2">Resource Workload Matrix</h3>
              <p className="text-sm font-medium">This module is currently processing real-time timetable data streams.</p>
           </div>
           <button onClick={() => setActiveTab("roster")} className="px-10 py-4 bg-white border border-slate-200 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-indigo-600 hover:bg-slate-50 transition-all">Back to staff database</button>
        </motion.div>
      )}

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}