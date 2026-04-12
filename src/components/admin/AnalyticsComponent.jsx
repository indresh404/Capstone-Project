import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  BarChart2, TrendingUp, Users, BookOpen, 
  Target, Activity, Sparkles, RefreshCw,
  Calendar, CheckCircle
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from "recharts";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];

const AnalyticsComponent = () => {
  const [loading, setLoading] = useState(true);
  const [facultyWorkload, setFacultyWorkload] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalRequired: 0,
    totalScheduled: 0,
    totalCompleted: 0,
    avgEfficiency: 0
  });

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Data Fetching
      const [subRes, facRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/subject-progress`, { headers }),
        fetch(`${API_URL}/api/analytics/faculty-workload`, { headers })
      ]);

      const subData = await subRes.json();
      const facData = await facRes.json();

      if (subData.success) {
        setSubjects(subData.data);
        const stats = subData.data.reduce((acc, s) => ({
          totalRequired: acc.totalRequired + Number(s.required_hours || 0),
          totalScheduled: acc.totalScheduled + Number(s.scheduled_hours || 0),
          totalCompleted: acc.totalCompleted + Number(s.completed_hours || 0),
          totalPercent: acc.totalPercent + Number(s.completion_percentage || 0)
        }), { totalRequired: 0, totalScheduled: 0, totalCompleted: 0, totalPercent: 0 });
        
        setSummaryStats({
          ...stats,
          avgEfficiency: Math.round(stats.totalPercent / (subData.data.length || 1))
        });
      }
      
      if (facData.success) {
        setFacultyWorkload(facData.data);
      }

    } catch (err) {
      console.error("Analytics Load Error:", err);
    } finally {
      // Ensure a minimum loading time for visual consistency
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const subjectChartData = useMemo(() => {
    return subjects.map(s => {
      const sch = Number(s.scheduled_hours || 0);
      const req = Number(s.required_hours || 24); // DEFAULT 24 if 0
      return {
        name: s.code,
        fullName: s.name,
        scheduled: sch,
        required: req,
        // Calculate percentages so bar fills the whole card width
        schPercent: (sch / req) * 100,
        remPercent: Math.max(0, 100 - (sch / req) * 100),
        progress: Number(s.completion_percentage || 0)
      };
    }).sort((a, b) => b.progress - a.progress).slice(0, 8);
  }, [subjects]);

  const facultyChartData = useMemo(() => {
    return facultyWorkload.map(f => ({
      name: f.name.split(' ')[0],
      hours: Number(f.scheduled_hours || 0),
      college_id: f.college_id
    })).sort((a, b) => b.hours - a.hours).slice(0, 8);
  }, [facultyWorkload]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full" />
        <p className="text-slate-400 font-black tracking-widest text-xs uppercase animate-pulse">Computing Performance Metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">System Analytics</h2>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-xs">Live curriculum and faculty performance intelligence</p>
        </div>
        <button onClick={loadAnalytics} className="p-3 bg-white hover:bg-slate-50 text-indigo-600 rounded-2xl shadow-sm border border-indigo-50 transition-all active:scale-95">
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Hours Planned", value: summaryStats.totalRequired, icon: <BookOpen />, color: "bg-indigo-500" },
          { label: "Hours Scheduled", value: summaryStats.totalScheduled, icon: <Calendar />, color: "bg-purple-500" },
          { label: "Hours Completed", value: summaryStats.totalCompleted, icon: <CheckCircle />, color: "bg-emerald-500" },
          { label: "Overall Progress", value: `${summaryStats.avgEfficiency}%`, icon: <Target />, color: "bg-rose-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`p-4 rounded-2xl ${stat.color} text-white shadow-lg`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 leading-none">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Subject Progress Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><BookOpen size={20} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Subject Hour Progress</h3>
                <p className="text-xs font-bold text-slate-400">Scheduled vs. Planned Semester Hours</p>
              </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} layout="vertical" margin={{ left: 20, right: 40, top: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontWeight: 800, fontSize: 12}} 
                  width={60}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-5 rounded-[1.5rem] shadow-2xl border border-white/10 min-w-[200px]">
                        <p className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-2">{data.fullName}</p>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                             <span className="text-[10px] uppercase font-bold text-slate-400">Scheduled:</span>
                             <span className="text-sm font-black">{data.scheduled}h</span>
                           </div>
                           <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                             <span className="text-[10px] uppercase font-bold text-slate-400">Planned:</span>
                             <span className="text-sm font-black">{data.required}h</span>
                           </div>
                           <div className="pt-2 border-t border-white/10">
                              <p className="text-[10px] text-white/50 mb-1 font-bold">COMPLETION STATUS</p>
                              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div style={{ width: `${Math.min(data.progress, 100)}%` }} className="h-full bg-indigo-500" />
                              </div>
                           </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar 
                  dataKey="schPercent" 
                  stackId="prog"
                  radius={[0, 0, 0, 0]} 
                  barSize={25} 
                >
                  {subjectChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <Bar 
                  dataKey="remPercent" 
                  stackId="prog"
                  fill="#f1f5f9"
                  radius={[0, 10, 10, 0]} 
                  barSize={25} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Faculty Workload Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Users size={20} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Faculty Overload Analysis</h3>
                <p className="text-xs font-bold text-slate-400">Total hours scheduled per week</p>
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facultyChartData} layout="vertical" margin={{ left: 20, right: 40, top: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide domain={[0, 22]} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontWeight: 800, fontSize: 12}} 
                  width={60}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-white/10">
                        <p className="text-xs font-black uppercase tracking-widest">{payload[0].payload.name}</p>
                        <p className="text-2xl font-black text-indigo-400">{(payload[0].value).toFixed(1)} <span className="text-[10px] text-white/50 uppercase font-bold">Hours</span></p>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">College ID: {payload[0].payload.college_id}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="hours" radius={[0, 10, 10, 0]} barSize={25} background={{ fill: '#f1f5f9', radius: [0, 10, 10, 0] }}>
                   {facultyChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.hours >= 19.5 ? '#ef4444' : entry.hours > 14 ? '#f59e0b' : COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Bar>
                <ReferenceLine x={20} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'OVERLOAD', fill: '#ef4444', fontSize: 10, fontWeight: 900 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feature Placard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {[
          { key: "requests", label: "Permission Tracking", icon: <Activity className="text-emerald-500" /> },
          { key: "settings", label: "Smart Optimization", icon: <Sparkles className="text-indigo-500" /> },
          { key: "courses", label: "Predictive Analytics", icon: <TrendingUp className="text-purple-500" /> },
        ].map(item => (
          <motion.div
            key={item.key}
            whileHover={{ y: -5 }}
            className="bg-white/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-sm flex flex-col items-center text-center gap-4 group cursor-help"
          >
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-all">
              {item.icon}
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">{item.label}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Integration Coming Soon</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsComponent;