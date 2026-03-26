import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Users, BookOpen, Clock, AlertTriangle, 
  CheckCircle, BarChart2, PieChart, Calendar, 
  Loader, UserCheck, Book, Building, Activity, 
  Award, Target, Zap, Info, ChevronRight, Download,
  RefreshCw, Eye, LayoutGrid, List
} from "lucide-react";

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const AnalyticsComponent = () => {
  const [view, setView] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [chartView, setChartView] = useState("bar");
  
  // State for real data
  const [summary, setSummary] = useState(null);
  const [subjectsData, setSubjectsData] = useState([]);
  const [facultyData, setFacultyData] = useState([]);
  const [departmentsData, setDepartmentsData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [insightsData, setInsightsData] = useState([]);

  // Fetch all analytics data
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const [summaryRes, subjectsRes, facultyRes, departmentsRes, weeklyRes, insightsRes] = await Promise.all([
        fetch('http://localhost:5000/api/analytics/summary', { headers }),
        fetch('http://localhost:5000/api/analytics/subjects', { headers }),
        fetch('http://localhost:5000/api/analytics/faculty', { headers }),
        fetch('http://localhost:5000/api/analytics/departments', { headers }),
        fetch('http://localhost:5000/api/analytics/weekly-distribution', { headers }),
        fetch('http://localhost:5000/api/analytics/insights', { headers })
      ]);

      const summaryData = await summaryRes.json();
      const subjectsData = await subjectsRes.json();
      const facultyData = await facultyRes.json();
      const departmentsData = await departmentsRes.json();
      const weeklyData = await weeklyRes.json();
      const insightsData = await insightsRes.json();

      if (summaryData.success) setSummary(summaryData.data);
      if (subjectsData.success) setSubjectsData(subjectsData.data);
      if (facultyData.success) setFacultyData(facultyData.data);
      if (departmentsData.success) setDepartmentsData(departmentsData.data);
      if (weeklyData.success) setWeeklyData(weeklyData.data);
      if (insightsData.success) setInsightsData(insightsData.data);

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate weekly statistics
  // Function to parse and ensure numbers
const parseNumber = (value) => {
  const num = parseInt(value);
  return isNaN(num) ? 0 : num;
};

// Calculate weekly statistics - FIXED
const totalClasses = weeklyData.reduce((sum, item) => {
  const classes = parseNumber(item.total_classes);
  return sum + classes;
}, 0);

const avgDailyClasses = weeklyData.length > 0 ? totalClasses / weeklyData.length : 0;

const busiestDay = weeklyData.reduce((max, item) => {
  const currentClasses = parseNumber(item.total_classes);
  const maxClasses = parseNumber(max.total_classes);
  return currentClasses > maxClasses ? item : max;
}, { total_classes: 0, day: 'N/A' });

// Sort weekly data by day order
const dayOrder = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
const sortedWeeklyData = [...weeklyData]
  .filter(item => item.day)
  .map(item => ({
    ...item,
    total_classes: parseNumber(item.total_classes) // Ensure numbers
  }))
  .sort((a, b) => (dayOrder[a.day] || 0) - (dayOrder[b.day] || 0));

// Find max classes for scaling
const maxClasses = Math.max(...sortedWeeklyData.map(w => w.total_classes), 1);

// Log to verify
console.log('Weekly Data:', sortedWeeklyData);
console.log('Total Classes:', totalClasses);
console.log('Busiest Day:', busiestDay);
console.log('Max Classes:', maxClasses);
  // Calculate additional metrics
  const subjectCompletionRate = subjectsData.filter(s => (s.completion_percentage || 0) >= 100).length;
  const facultyUtilization = facultyData.length > 0 
    ? facultyData.reduce((sum, f) => sum + (f.workload_percentage || 0), 0) / facultyData.length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchAnalyticsData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" variants={containerVariants}  animate="visible">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Real-time insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchAnalyticsData}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all hover:shadow-md"
          >
            <RefreshCw size={18} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
  <div className="flex gap-3">
    {[
      { id: "overview", label: "Overview", icon: <Activity size={18} />, color: "indigo", gradient: "from-indigo-500 to-indigo-600" },
      { id: "subjects", label: "Subjects", icon: <Book size={18} />, color: "emerald", gradient: "from-emerald-500 to-emerald-600" },
      { id: "faculty", label: "Faculty", icon: <Users size={18} />, color: "purple", gradient: "from-purple-500 to-purple-600" },
      { id: "departments", label: "Departments", icon: <Building size={18} />, color: "orange", gradient: "from-orange-500 to-orange-600" }
    ].map(v => (
      <motion.button
        key={v.id}
        onClick={() => setView(v.id)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`relative flex-1 py-5 px-4 rounded-xl text-base font-bold transition-all duration-300 flex items-center justify-center gap-3 ${
          view === v.id 
            ? `bg-gradient-to-r ${v.gradient} text-white shadow-lg` 
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200"
        }`}
      >
        {/* Animated background for active state */}
        {view === v.id && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 rounded-xl bg-gradient-to-r"
            style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          />
        )}
        
        {/* Content */}
        <div className="relative z-10 flex items-center gap-3">
          <div className={view === v.id ? "text-white" : `text-${v.color}-500`}>
            {v.icon}
          </div>
          <span className="font-bold">{v.label}</span>
          {view === v.id && (
            <motion.div
              initial={{ x: -5, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <ChevronRight size={16} />
            </motion.div>
          )}
        </div>
        
        {/* Hover effect */}
        {view !== v.id && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-slate-100 to-transparent opacity-0 rounded-xl"
            whileHover={{ opacity: 0.5 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.button>
    ))}
  </div>
</div>

      {/* Overview View */}
      {view === "overview" && summary && (
        <>
          {/* Summary KPIs */}
          <motion.div className="grid grid-cols-4 gap-5" variants={containerVariants}>
            {[
              { 
                label: "Avg Faculty Load", 
                value: `${summary.avg_faculty_load || 0} hrs`, 
                icon: <Clock size={22} />, 
                color: "indigo", 
                sub: "per week", 
                trend: summary.avg_faculty_load > 15 ? "+12%" : "-5%",
                trendUp: summary.avg_faculty_load <= 15,
                description: "Average weekly teaching hours per faculty"
              },
              { 
                label: "Subject Coverage", 
                value: `${summary.subject_coverage || 0}%`, 
                icon: <Target size={22} />, 
                color: "emerald", 
                sub: `${summary.covered_subjects || 0}/${summary.total_subjects || 0} subjects`,
                trend: summary.subject_coverage > 80 ? "Excellent" : "Needs improvement",
                trendUp: summary.subject_coverage > 80,
                description: "Percentage of subjects with scheduled classes"
              },
              { 
                label: "Schedule Conflicts", 
                value: `${summary.schedule_conflicts || 0}`, 
                icon: <AlertTriangle size={22} />, 
                color: summary.schedule_conflicts > 0 ? "amber" : "emerald", 
                sub: "conflicts detected",
                trend: summary.schedule_conflicts === 0 ? "All clear" : "Fix required",
                trendUp: summary.schedule_conflicts === 0,
                description: "Room or faculty time conflicts"
              },
              { 
                label: "Overloaded Faculty", 
                value: `${summary.overloaded_faculty || 0}`, 
                icon: <Zap size={22} />, 
                color: summary.overloaded_faculty > 0 ? "amber" : "emerald", 
                sub: "members at capacity",
                trend: summary.overloaded_faculty === 0 ? "Balanced" : "Overloaded",
                trendUp: summary.overloaded_faculty === 0,
                description: "Faculty exceeding 20 hours/week"
              },
            ].map((k, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl bg-${k.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <div className={`text-${k.color}-600`}>{k.icon}</div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      k.trendUp ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                    }`}>
                      {k.trend}
                    </span>
                  </div>
                  <p className="text-3xl font-black text-slate-800">{k.value}</p>
                  <p className="text-sm font-bold text-slate-600 mt-0.5">{k.label}</p>
                  <p className="text-xs text-slate-400">{k.sub}</p>
                  <AnimatePresence>
                    {hoveredCard === i && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-3 left-5 right-5 text-xs text-slate-500 bg-white p-2 rounded-lg shadow-lg border border-slate-100"
                      >
                        {k.description}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full -mr-10 -mt-10" />
              </motion.div>
            ))}
          </motion.div>

          {/* Additional Metrics Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-5">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Award size={18} className="text-indigo-600" />
                <span className="text-xs font-bold text-indigo-600 uppercase">Completion Rate</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{subjectCompletionRate}/{subjectsData.length}</p>
              <p className="text-xs text-slate-600 mt-1">Subjects fully completed</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-purple-600" />
                <span className="text-xs font-bold text-purple-600 uppercase">Faculty Utilization</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{Math.round(facultyUtilization)}%</p>
              <p className="text-xs text-slate-600 mt-1">Average workload across faculty</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-600 uppercase">Busiest Day</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{busiestDay.day || 'N/A'}</p>
              <p className="text-xs text-slate-600 mt-1">{busiestDay.total_classes || 0} classes scheduled</p>
            </div>
          </motion.div>

          {/* Weekly Distribution Chart - Fixed Bar Graph */}
          {sortedWeeklyData.length > 0 && (
            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-500" /> 
                  Weekly Class Distribution
                </h3>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <span className="text-slate-600">Classes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-indigo-300 rounded-full"></div>
                    <span className="text-slate-600">Average: {avgDailyClasses.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              
              {/* Bar Chart Container */}
              <div className="relative pl-10">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-slate-400" style={{ height: '280px' }}>
                  <span>{maxClasses}</span>
                  <span>{Math.floor(maxClasses * 0.75)}</span>
                  <span>{Math.floor(maxClasses * 0.5)}</span>
                  <span>{Math.floor(maxClasses * 0.25)}</span>
                  <span>0</span>
                </div>
                
                {/* Bars Container */}
                <div className="flex items-end gap-3" style={{ height: '280px' }}>
                  {sortedWeeklyData.map((item, i) => {
                    const barHeightPercent = maxClasses > 0 ? (item.total_classes / maxClasses) * 100 : 0;
                    const isAboveAvg = item.total_classes > avgDailyClasses;
                    
                    return (
                      <div key={item.day} className="flex-1 flex flex-col items-center h-full">
                        <div className="relative w-full flex-1 flex flex-col justify-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${barHeightPercent}%` }}
                            transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                            className="w-full group cursor-pointer"
                            style={{ height: `${barHeightPercent}%`, minHeight: '4px' }}
                          >
                            <div 
                              className={`w-full rounded-t-lg transition-all duration-300 ${
                                isAboveAvg 
                                  ? 'bg-gradient-to-t from-indigo-600 to-indigo-500' 
                                  : 'bg-gradient-to-t from-indigo-400 to-indigo-300'
                              } group-hover:from-indigo-500 group-hover:to-indigo-400`}
                              style={{ height: '100%' }}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none z-10">
                                {item.total_classes} lectures
                              </div>
                            </div>
                          </motion.div>
                        </div>
                        
                        <div className="text-center mt-2 w-full">
                          <span className="text-xs font-semibold text-slate-600 block">{item.day.slice(0, 3)}</span>
                          <span className="text-xs font-bold text-indigo-600 block mt-0.5">{item.total_classes}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Statistics Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Total Lectures</p>
                    <p className="text-2xl font-bold text-slate-800">{totalClasses}</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Peak Day</p>
                    <p className="text-xl font-bold text-indigo-600">{busiestDay.day || 'N/A'}</p>
                    <p className="text-sm font-semibold text-indigo-500">{busiestDay.total_classes || 0} lectures</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Daily Average</p>
                    <p className="text-2xl font-bold text-slate-800">{avgDailyClasses.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Insights */}
          {insightsData.length > 0 && (
            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Info size={18} className="text-indigo-500" />
                Key Insights & Recommendations
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {insightsData.slice(0, 4).map((ins, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-start gap-3 p-4 rounded-xl ${ins.type === "warning" ? "bg-amber-50 border border-amber-100" : "bg-emerald-50 border border-emerald-100"} hover:shadow-md transition-all cursor-pointer`}
                  >
                    {ins.type === "warning"
                      ? <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                      : <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 font-medium">{ins.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ins.type === "warning" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
                          {ins.department}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Subjects View */}
      {view === "subjects" && subjectsData.length > 0 && (
        <motion.div variants={containerVariants} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                  <Book size={18} className="text-emerald-500" />
                  Subject Hours Completion Analysis
                </h3>
                <p className="text-xs text-slate-400 mt-1">{subjectsData.length} total subjects</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setChartView("bar")}
                  className={`p-2 rounded-lg transition-all ${chartView === "bar" ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"}`}
                >
                  <BarChart2 size={16} />
                </button>
                <button 
                  onClick={() => setChartView("list")}
                  className={`p-2 rounded-lg transition-all ${chartView === "list" ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
            
            {chartView === "bar" && (
              <div className="space-y-5">
                {subjectsData.map((subject, i) => {
                  const percentage = Math.min(subject.completion_percentage || 0, 100);
                  let barColor = "bg-rose-500";
                  let statusText = "Critical";
                  if (percentage >= 100) {
                    barColor = "bg-emerald-500";
                    statusText = "Complete";
                  } else if (percentage >= 75) {
                    barColor = "bg-indigo-500";
                    statusText = "Good";
                  } else if (percentage >= 50) {
                    barColor = "bg-amber-500";
                    statusText = "Average";
                  }
                  
                  return (
                    <motion.div key={subject.id} variants={itemVariants}>
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-700">{subject.code}</span>
                            <span className="text-xs text-slate-500 truncate max-w-md">{subject.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              percentage >= 100 ? "bg-emerald-100 text-emerald-600" :
                              percentage >= 75 ? "bg-indigo-100 text-indigo-600" :
                              percentage >= 50 ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-600"
                            }`}>
                              {statusText}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-400">Required: {subject.required_hours} hrs/week</span>
                            <span className="text-xs text-slate-400">Scheduled: {subject.scheduled_hours} hrs</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${
                            percentage >= 100 ? "text-emerald-600" : 
                            percentage >= 75 ? "text-indigo-600" : 
                            percentage >= 50 ? "text-amber-600" : "text-rose-600"
                          }`}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="relative h-10 bg-slate-100 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: i * 0.03, duration: 0.6, ease: "easeOut" }}
                          className={`absolute inset-y-0 left-0 ${barColor} rounded-lg flex items-center justify-end pr-2`}
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 15 && (
                            <span className="text-white text-xs font-bold">
                              {subject.scheduled_hours}/{subject.required_hours} hrs
                            </span>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
            
            {chartView === "list" && (
              <div className="grid grid-cols-2 gap-4">
                {subjectsData.map((subject) => {
                  const percentage = Math.min(subject.completion_percentage || 0, 100);
                  return (
                    <div key={subject.id} className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-slate-800">{subject.code}</p>
                          <p className="text-xs text-slate-500">{subject.name}</p>
                        </div>
                        <span className={`text-sm font-bold ${
                          percentage >= 100 ? "text-emerald-600" : 
                          percentage >= 75 ? "text-indigo-600" : "text-amber-600"
                        }`}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>Scheduled: {subject.scheduled_hours}h</span>
                        <span>Required: {subject.required_hours}h</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Faculty View */}
      {view === "faculty" && facultyData.length > 0 && (
        <motion.div variants={containerVariants} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                  <UserCheck size={18} className="text-purple-500" />
                  Faculty Workload Distribution
                </h3>
                <p className="text-xs text-slate-400 mt-1">{facultyData.length} faculty members</p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 bg-rose-100 text-rose-600 rounded-full">Overloaded (100%+)</span>
                <span className="px-2 py-1 bg-amber-100 text-amber-600 rounded-full">High (80-99%)</span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full">Normal (Below 80%)</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {facultyData.map((faculty, i) => {
                const percentage = Math.min(faculty.workload_percentage || 0, 100);
                let statusColor = "bg-emerald-500";
                let statusText = "Normal";
                let badgeColor = "bg-emerald-100 text-emerald-600";
                
                if (percentage >= 100) {
                  statusColor = "bg-rose-500";
                  statusText = "Overloaded";
                  badgeColor = "bg-rose-100 text-rose-600";
                } else if (percentage >= 80) {
                  statusColor = "bg-amber-500";
                  statusText = "High";
                  badgeColor = "bg-amber-100 text-amber-600";
                }
                
                return (
                  <motion.div 
                    key={faculty.id} 
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    className="p-5 border border-slate-100 rounded-xl hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 text-white font-bold text-lg flex items-center justify-center">
                          {faculty.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{faculty.name}</p>
                          <span className="text-xs text-slate-500">{faculty.subjects_count || 0} subjects assigned</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xl font-bold ${
                          percentage >= 100 ? "text-rose-600" : 
                          percentage >= 80 ? "text-amber-600" : "text-emerald-600"
                        }`}>
                          {percentage}%
                        </span>
                        <div className="text-xs text-slate-500 mt-1">
                          {faculty.scheduled_hours || 0}/{faculty.max_hours || 20} hrs
                        </div>
                        <span className={`inline-block text-xs font-bold px-2 py-1 rounded-full mt-1 ${badgeColor}`}>
                          {statusText}
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        className={`h-full rounded-full ${statusColor}`}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-400">
                      <span>0 hrs</span>
                      <span>{faculty.max_hours || 20} hrs</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Departments View */}
      {view === "departments" && departmentsData.length > 0 && (
        <motion.div variants={containerVariants} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <Building size={18} className="text-orange-500" />
                Department Performance Overview
              </h3>
              <p className="text-xs text-slate-400 mt-1">{departmentsData.length} departments</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {departmentsData.map((dept, i) => {
                const colors = [
                  { from: "from-indigo-500", to: "to-indigo-600", bg: "bg-indigo-50", light: "bg-indigo-100" },
                  { from: "from-purple-500", to: "to-purple-600", bg: "bg-purple-50", light: "bg-purple-100" },
                  { from: "from-emerald-500", to: "to-emerald-600", bg: "bg-emerald-50", light: "bg-emerald-100" },
                  { from: "from-amber-500", to: "to-amber-600", bg: "bg-amber-50", light: "bg-amber-100" },
                  { from: "from-rose-500", to: "to-rose-600", bg: "bg-rose-50", light: "bg-rose-100" }
                ];
                const color = colors[i % colors.length];
                const coverage = Math.min(dept.coverage_percentage || 0, 100);
                
                return (
                  <motion.div 
                    key={dept.id} 
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className="border border-slate-100 rounded-xl p-5 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color.from} ${color.to} text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-lg`}>
                        {dept.department?.charAt(0) || 'D'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-bold text-slate-800">{dept.department}</h4>
                          <div className="flex gap-2">
                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                              coverage >= 90 ? "bg-emerald-100 text-emerald-600" : 
                              coverage >= 80 ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-600"
                            }`}>
                              {coverage}% Coverage
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-2xl font-bold text-slate-800">{dept.total_subjects || 0}</p>
                            <p className="text-xs text-slate-500">Subjects</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-800">{dept.faculty_count || 0}</p>
                            <p className="text-xs text-slate-500">Faculty</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-800">{dept.batches_count || 0}</p>
                            <p className="text-xs text-slate-500">Batches</p>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${coverage}%` }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className={`h-full rounded-full bg-gradient-to-r ${color.from} ${color.to}`}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnalyticsComponent;