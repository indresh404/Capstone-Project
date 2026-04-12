import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, BookOpen, Calendar, Zap,
  TrendingUp, Clock, CheckCircle, AlertCircle,
  ArrowUpRight, Sparkles, Activity, Target,
  PieChart as PieChartIcon, BarChart2, RefreshCw
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area,
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];

const AISkeleton = () => (
  <div className="space-y-6 animate-pulse w-full">
    <div className="flex items-center gap-4">
      <div className="h-4 bg-white/10 rounded-full w-48"></div>
    </div>
    <div className="space-y-3">
      <div className="h-3 bg-white/10 rounded-full w-full"></div>
      <div className="h-3 bg-white/10 rounded-full w-5/6"></div>
      <div className="h-3 bg-white/10 rounded-full w-4/6"></div>
    </div>
    <div className="h-px bg-white/5 w-full"></div>
    <div className="space-y-3">
      <div className="h-3 bg-white/10 rounded-full w-full"></div>
      <div className="h-3 bg-white/10 rounded-full w-3/4"></div>
    </div>
  </div>
);

const TypewriterEffect = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsDone(false);
    
    let currentText = "";
    const words = text.split(" ");
    let i = 0;

    const interval = setInterval(() => {
      if (i < words.length) {
        currentText += (i === 0 ? "" : " ") + words[i];
        setDisplayedText(currentText);
        i++;
      } else {
        setIsDone(true);
        clearInterval(interval);
      }
    }, 40); // 40ms per word for a smooth but readable pace

    return () => clearInterval(interval);
  }, [text]);

  const lines = displayedText.split("\n");

  return (
    <div className="space-y-4 font-serif w-full">
      <AnimatePresence mode="popLayout">
        {lines.map((line, li) => {
          if (!line.trim() && li < lines.length - 1) return <div key={li} className="h-4" />;
          if (!line.trim()) return null;
          
          return (
            <motion.p
              key={li + (isDone ? "-done" : "-typing")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/90 text-lg md:text-xl leading-relaxed tracking-wide"
            >
              {line}
            </motion.p>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

const HomeComponent = ({ setActiveTab }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [facultyData, setFacultyData] = useState([]);
  const [subjectsData, setSubjectsData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [userName, setUserName] = useState("Admin");
  const [aiSummary, setAiSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState("Both");

  const toggleSubjectSelection = (id) => {
    setSelectedSubjects(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.name || "Admin");
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

      const [summaryRes, facultyRes, subjectsRes, weeklyRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/summary`, { headers }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/faculty-workload`, { headers }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/subject-progress`, { headers }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/weekly-distribution`, { headers })
      ]);

      const sData = await summaryRes.json();
      const fData = await facultyRes.json();
      const subData = await subjectsRes.json();
      const wData = await weeklyRes.json();

      if (sData.success) setSummary(sData.data);
      if (fData.success) setFacultyData(fData.data);
      if (subData.success) setSubjectsData(subData.data);
      if (wData.success) setWeeklyData(wData.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAISummary = async () => {
    setIsGenerating(true);
    setAiSummary("");
    try {
      const payload = {
        summaryData: summary,
        facultyWorkload: facultyData,
        subjectProgress: subjectsData,
        weeklyDistribution: weeklyData,
        filters: {
          subjects: subjectsData.filter(s => selectedSubjects.includes(s.id)).map(s => s.name),
          division: selectedDivision
        }
      };

      // Call the local backend proxy instead of calling Groq directly
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/ai-summary`, { payload });

      if (response.data.success) {
        setAiSummary(response.data.data);
      } else {
        throw new Error(response.data.message || "Backend failed to provide AI insights");
      }
    } catch (err) {
      console.error('AI Insight Error:', err);
      setAiSummary("System alert: Connection to AI Intelligence lost. Please verify your backend server is active and the Groq API key is configured correctly in the backend .env file.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Process data for charts
  const truncateName = (name) => name.split(' ')[0];

  const pieData = [
    { name: 'Theory', value: subjectsData.filter(s => s.type === 'theory').length || 0 },
    { name: 'Practical', value: subjectsData.filter(s => s.type === 'lab').length || 0 },
    { name: 'Tutorial/Test', value: subjectsData.filter(s => s.type === 'test' || s.type === 'tutorial').length || 0 },
  ];

  const horizontalBarData = facultyData.map(f => ({
    name: truncateName(f.name),
    lectures: Number(f.scheduled_hours) || 0,
    total: Number(f.max_hours) || 20
  })).slice(0, 6);

  const areaData = weeklyData.map(w => ({
    name: w.day.slice(0, 3),
    sessions: parseInt(w.total_classes) || 0
  }));

  const stats = [
    { label: "Total Faculty", value: summary?.total_faculty || 0, icon: <Users size={20} />, bg: "bg-indigo-500/10", text: "text-indigo-600", delta: "+2 this sem" },
    { label: "Total Subjects", value: summary?.total_subjects || 0, icon: <BookOpen size={20} />, bg: "bg-purple-500/10", text: "text-purple-600", delta: `${summary?.covered_subjects || 0} covered` },
    { label: "Avg Workload", value: `${summary?.avg_faculty_load || 0}h`, icon: <Activity size={20} />, bg: "bg-emerald-500/10", text: "text-emerald-600", delta: summary?.avg_faculty_load >= 18 ? 'High' : 'Optimal' },
    { label: "Conflicts", value: summary?.schedule_conflicts || 0, icon: <AlertCircle size={20} />, bg: "bg-rose-500/10", text: "text-rose-600", delta: summary?.schedule_conflicts === 0 ? 'Resolved' : 'Action needed' },
  ];

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full" />
        <p className="text-slate-400 font-black tracking-widest text-xs uppercase animate-pulse">Initializing Dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div className="space-y-10 pb-12" variants={containerVariants} initial="hidden" animate="visible">

      {/* Hero Welcome Section */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
          <Sparkles size={160} />
        </div>
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-4xl font-black mb-4 tracking-tighter leading-tight flex items-center gap-3">
              Hello, {userName}! <Sparkles className="text-yellow-300" size={32} />
            </h2>
            <p className="text-indigo-100 font-medium text-lg leading-relaxed opacity-90 max-w-sm">
              The semester is progressing smoothly. You have no pending critical conflicts today.
            </p>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setActiveTab('timetable-editor')} className="px-8 py-3.5 bg-white text-indigo-700 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-indigo-50 transition-all shadow-xl active:scale-95">
                Optimize Schedule <ArrowUpRight size={18} />
              </button>
              <button onClick={fetchDashboardData} className="p-3.5 bg-indigo-500/30 backdrop-blur-md rounded-2xl border border-white/20 text-white hover:bg-indigo-500/50 transition-all">
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-4 bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 self-start">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-indigo-200">
              <span>System Efficiency</span>
              <span className="text-white">98.4%</span>
            </div>
            <div className="h-2 w-full bg-indigo-900/30 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "98.4%" }} className="h-full bg-emerald-400" />
            </div>
            <p className="text-xs text-indigo-200/80 font-bold leading-relaxed">
              Server latency is minimal and database synchronization is active.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={containerVariants}>
        {stats.map((s, i) => (
          <motion.div key={i} variants={itemVariants} whileHover={{ y: -8 }} className="bg-white/80 backdrop-blur-xl rounded-[2.2rem] p-7 shadow-sm border border-white transition-all group overflow-hidden relative">
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.text} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                {s.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">{s.delta}</span>
            </div>
            <p className="text-4xl font-black text-slate-800 tracking-tighter mb-1">{s.value}</p>
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest leading-none">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Interactive Charts Section - THE BIG ADDITION */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Horizontal Bar: Lectures Completed */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Lectures Completion Progress</h3>
              <p className="text-xs font-bold text-slate-400 mt-1">Teaching velocity per faculty member</p>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><BarChart2 size={20} /></div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={horizontalBarData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 700, fontSize: 12 }} width={80} />
                <Tooltip cursor={{ fill: '#f8fafc' }} content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-black">
                        {payload[0].payload.name}: {payload[0].value} / {payload[0].payload.total} Lectures
                      </div>
                    );
                  }
                  return null;
                }} />
                <Bar dataKey="lectures" radius={[0, 8, 8, 0]} barSize={24}>
                  {horizontalBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Circular Distribution */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-sm flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Curriculum Mix</h3>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><PieChartIcon size={20} /></div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-5 bg-slate-50/80 rounded-3xl border border-slate-100 w-full text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Theoretical Focus</p>
            <p className="text-xl font-black text-indigo-600">62.5% Weighted</p>
          </div>
        </div>

        {/* Area Chart: Weekly Density */}
        <div className="lg:col-span-3 bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Weekly Session Density</h3>
              <p className="text-sm font-bold text-slate-400 mt-1">Live traffic distribution across the academic week</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center gap-3">
              <Activity size={24} />
              <span className="font-black text-xs uppercase tracking-widest">Live Feed</span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800, fontSize: 13 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800, fontSize: 13 }} />
                <Tooltip content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-5 border border-indigo-100 rounded-2xl shadow-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                        <p className="text-2xl font-black text-indigo-600 leading-none">{payload[0].value}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Classes Scheduled</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Area type="monotone" dataKey="sessions" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorSessions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* AI Analytical Card - Placement: Before Graph Section */}
      <motion.div
        variants={itemVariants}
        className="bg-black rounded-[2.8rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/5 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 z-20">
          <button
            onClick={generateAISummary}
            disabled={isGenerating}
            className="px-6 py-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 backdrop-blur-md border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
          >
            {isGenerating ? "Analyzing System..." : "Generate AI Insights"}
            <Sparkles size={16} className={`text-indigo-400 group-hover/btn:text-indigo-600 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="relative z-10 flex flex-col gap-8 w-full">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10 shadow-inner">
              <Zap size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">System Intelligence</h3>
              <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mt-1">Real-time scheduling analytics</p>
            </div>
          </div>

          {/* New Selection Filters */}
          <div className="flex flex-col gap-8 p-8 bg-white/[0.03] rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Target Subjects</p>
                <button 
                  onClick={() => setSelectedSubjects([])}
                  className="text-[10px] font-black text-white/20 hover:text-white uppercase transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar-hidden scroll-smooth">
                {subjectsData.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => toggleSubjectSelection(sub.id)}
                    className={`px-6 py-3.5 rounded-2xl font-black text-xs whitespace-nowrap transition-all duration-300 border ${
                      selectedSubjects.includes(sub.id) 
                        ? "bg-white text-black border-white shadow-[0_10px_20px_rgba(255,255,255,0.2)] scale-105" 
                        : "bg-slate-800/40 text-white/40 border-white/5 hover:border-white/20"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] pl-1">Division Context</p>
              <div className="flex gap-2 p-1.5 bg-black/40 rounded-[1.5rem] w-fit border border-white/5 shadow-inner">
                {['A', 'B', 'Both'].map(div => (
                  <button
                    key={div}
                    onClick={() => setSelectedDivision(div)}
                    className={`px-10 py-3 rounded-xl font-black text-xs transition-all duration-300 ${
                      selectedDivision === div 
                        ? "bg-white text-black shadow-xl scale-100" 
                        : "text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="min-h-[160px] flex items-start pt-4 w-full">
            {isGenerating ? (
              <AISkeleton />
            ) : aiSummary ? (
              <TypewriterEffect text={aiSummary} />
            ) : (
              <div className="space-y-4 w-full">
                <p className="text-white/30 font-medium italic text-lg">Ready to analyze latest timetable and workload updates...</p>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-12 bg-indigo-500/30 rounded-full" />
                  <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Click generate to start AI analysis</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <div className="px-5 py-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none">AI Engine Active</span>
            </div>
            <div className="px-5 py-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Model: Llama 3 (Groq)</span>
            </div>
            <div className="px-5 py-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Context: Live Database</span>
            </div>
          </div>
        </div>

        {/* Decorative corner element */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      </motion.div>

      {/* Quick Actions Restored */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.25em]">Critical Operations</h2>
          <div className="h-px flex-1 bg-slate-100 mx-6 opacity-50" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Run Scheduler", icon: <Zap size={20} />, color: "bg-indigo-600 text-white shadow-indigo-200", tab: "autogenerate" },
            { label: "System Metrics", icon: <TrendingUp size={20} />, color: "bg-white text-slate-700 shadow-sm border border-slate-100", tab: "analytics" },
            { label: "Faculty Roster", icon: <Users size={20} />, color: "bg-white text-slate-700 shadow-sm border border-slate-100", tab: "faculty" },
            { label: "Live Editor", icon: <Clock size={20} />, color: "bg-white text-slate-700 shadow-sm border border-slate-100", tab: "timetable-editor" },
          ].map((q, i) => (
            <button key={i} onClick={() => setActiveTab && setActiveTab(q.tab)} className={`${q.color} flex items-center gap-4 px-8 py-5 rounded-[1.8rem] font-black text-sm transition-all hover:scale-[1.05] active:scale-95 shadow-xl group border-b-4 border-black/5`}>
              <span className="p-2.5 rounded-xl bg-black/5 group-hover:rotate-[15deg] transition-transform">{q.icon}</span>
              {q.label}
            </button>
          ))}
        </div>
      </motion.div>
      <style jsx global>{`
        .custom-scrollbar-hidden::-webkit-scrollbar {
          height: 0px;
          display: none;
        }
        .custom-scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.div>
  );
};

export default HomeComponent;
