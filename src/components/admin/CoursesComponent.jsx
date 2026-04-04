import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Users, Building, DoorOpen, 
  Layers, Clock, Search, Filter, ChevronRight,
  Info, Award, GraduationCap, Microscope, Loader2
} from "lucide-react";

const containerVariants = { hidden: { opacity: 1 }, visible: { transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const CoursesComponent = () => {
  const [activeSubTab, setActiveSubTab] = useState("subjects");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Data state
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [divisions, setDivisions] = useState([]);

  useEffect(() => {
    fetchCourseData();
  }, [activeSubTab]);

  const fetchCourseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const endpoint = activeSubTab === "subjects" ? "subjects" : 
                       activeSubTab === "rooms" ? "rooms" : "divisions";
      
      const response = await fetch(`http://localhost:5000/api/courses/${endpoint}`, { headers });
      const resData = await response.json();

      if (resData.success) {
        if (activeSubTab === "subjects") setSubjects(resData.data);
        else if (activeSubTab === "rooms") setRooms(resData.data);
        else setDivisions(resData.data);
      } else {
        setError(resData.message || "Failed to fetch data");
      }
    } catch (err) {
      console.error(`Error fetching ${activeSubTab}:`, err);
      setError("Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = (subjects || []).filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRooms = (rooms || []).filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDivisions = (divisions || []).filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
             Academic Structure <GraduationCap className="text-indigo-600" size={32} />
          </h2>
          <p className="text-slate-400 font-medium mt-1">Explore subjects, faculty mapping, and facility allocations.</p>
        </div>

        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl gap-1">
          {[
            { id: "subjects", label: "Subjects", icon: <BookOpen size={16} /> },
            { id: "rooms", label: "Rooms & Labs", icon: <Building size={16} /> },
            { id: "divisions", label: "Divisions", icon: <Layers size={16} /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeSubTab === t.id ? "bg-white text-indigo-600 shadow-md translate-y-[-1px]" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
          <Search size={22} />
        </div>
        <input 
          type="text" 
          placeholder={`Search for ${activeSubTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-16 pr-8 py-5 bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 shadow-sm placeholder:text-slate-300"
        />
        <div className="absolute inset-y-0 right-6 flex items-center">
          <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Index</div>
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="h-96 flex flex-col items-center justify-center gap-4 text-indigo-600"
          >
            <Loader2 size={48} className="animate-spin" />
            <p className="font-black text-sm tracking-widest uppercase">Indexing Academic Data...</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-rose-50 border border-rose-100 p-10 rounded-[2.5rem] flex flex-col items-center text-center gap-4 shadow-sm"
          >
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center"><Info size={32} /></div>
            <p className="text-xl font-black text-slate-800 tracking-tight">{error}</p>
            <button onClick={fetchCourseData} className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-black text-sm hover:bg-rose-700 transition-all">Report Issue & Retry</button>
          </motion.div>
        ) : (
          <motion.div 
            key={activeSubTab}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* SUBJECTS VIEW */}
            {activeSubTab === "subjects" && filteredSubjects.map((s, i) => (
              <motion.div 
                key={s.id} 
                variants={itemVariants}
                whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)" }}
                className="bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                  <BookOpen size={100} />
                </div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black">
                    {s.code.substring(0,2)}
                  </div>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    s.type === 'lecture' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                  }`}>
                    {s.type}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{s.name}</h3>
                <p className="font-mono text-xs font-black text-slate-400 mb-6">{s.code}</p>
                
                <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty Head</span>
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs">👤</div>
                      {s.faculty_name || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex flex-col ml-auto text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hours</span>
                    <span className="text-sm font-black text-indigo-600 mt-1">{s.lectures_per_week} hrs/wk</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* ROOMS VIEW */}
            {activeSubTab === "rooms" && filteredRooms.map((r, i) => (
              <motion.div 
                key={r.id} 
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-[2rem] shadow-sm group"
              >
                <div className="flex items-center justify-between mb-8">
                   <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-black">
                    <Building size={24} />
                  </div>
                   <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-slate-800 tracking-tighter">{r.name}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">{r.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                   <Award size={20} className="text-teal-500" />
                   <p className="text-sm font-bold text-slate-500">Premium {r.type} resource facility.</p>
                </div>
              </motion.div>
            ))}

             {/* DIVISIONS VIEW */}
             {activeSubTab === "divisions" && filteredDivisions.map((d, i) => (
              <motion.div 
                key={d.id} 
                variants={itemVariants}
                className="bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-[2.5rem] shadow-sm lg:col-span-full"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-8 border-b border-dashed border-slate-200">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-indigo-100">
                      {d.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Division {d.name}</h3>
                      <p className="text-slate-400 font-bold tracking-widest text-xs uppercase mt-1">Batch Ecosystem</p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-4">
                    <div className="px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                      <p className="text-xl font-black text-indigo-600 leading-none">{d.batches?.length || 0}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Batches</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {d.batches?.map(batch => (
                    <div key={batch.id} className="p-5 bg-white border border-slate-100 rounded-3xl hover:border-indigo-100 transition-colors shadow-sm group">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cohort {batch.id}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{batch.name}</span>
                        <ChevronRight size={18} className="text-indigo-200 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                  {(!d.batches || d.batches.length === 0) && (
                    <p className="col-span-full py-10 text-center text-slate-400 font-medium italic">No batches found for this division.</p>
                  )}
                </div>
              </motion.div>
            ))}

            {activeSubTab === "subjects" && filteredSubjects.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-40 italic">No matching records found.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CoursesComponent;
