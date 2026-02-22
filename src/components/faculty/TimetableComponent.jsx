import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, MapPin, BookOpen,
  Users, Coffee, GraduationCap, Beaker, FileText,
  X, RefreshCw, Sparkles, Layers, Sun, Moon,
} from "lucide-react";
import axios from "axios";
import LottieComponent from "lottie-react";
const Lottie = LottieComponent.default ?? LottieComponent;

import mainAnimation  from "../../assets/tt_loading_main.json";
import sideAnimation1 from "../../assets/tt_loading1.json";
import sideAnimation2 from "../../assets/tt_loading2.json";
import errorAnimation from "../../assets/tt_error.json";

const TimetableComponent = () => {
  const [timetable, setTimetable]               = useState(null);
  const [loading, setLoading]                   = useState(true);       // only true on first load
  const [loadingState, setLoadingState]         = useState("loading");  // 'loading' | 'error'
  const [selectedDivision, setSelectedDivision] = useState("A");
  const [stats, setStats]                       = useState({ theory: 0, lab: 0, test: 0, total: 0 });
  const [currentTime, setCurrentTime]           = useState(new Date());
  const [error, setError]                       = useState(null);
  const [hoveredSlot, setHoveredSlot]           = useState(null);
  const [selectedSlot, setSelectedSlot]         = useState(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [sideAnimationIndex, setSideAnimationIndex] = useState(0);
  const [showSideAnimation, setShowSideAnimation]   = useState(true);

  // Track if initial load has already completed
  const hasInitiallyLoaded = useRef(false);

  const days = useMemo(() => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], []);

  const timeSlots = useMemo(() => ({
    1: { start: "09:15", end: "10:15", name: "Slot 1" },
    2: { start: "10:15", end: "11:15", name: "Slot 2" },
    3: { start: "11:15", end: "12:15", name: "Slot 3" },
    4: { start: "12:15", end: "12:45", name: "Slot 4" },
    5: { start: "12:45", end: "13:45", name: "Slot 5" },
    6: { start: "13:45", end: "14:45", name: "Slot 6" },
    7: { start: "14:45", end: "15:45", name: "Slot 7" },
    8: { start: "15:45", end: "16:45", name: "Slot 8" },
  }), []);

  // ── Fetch (accepts division param so it doesn't need it as a dependency) ──

  const fetchTimetable = useCallback(async (division) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to view timetable");
        setLoadingState("error");
        return;
      }
      const response = await axios.get(
        `http://localhost:5000/api/timetable?division=${division}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setTimetable(response.data.data);
        setError(null);
      } else {
        setError("Failed to load timetable");
      }
    } catch (err) {
      console.error("Error fetching timetable:", err);
      setError(err.response?.data?.message || "Error loading timetable");
    }
  }, []); // no dependencies — division is passed as argument

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/timetable/stats",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) setStats(response.data.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, []);

  // ── Initial load effect — runs ONCE only ─────────────────────────────────

  useEffect(() => {
    let mounted = true;
    let maxTimer, minTimer, animationCycleTimer;

    const initialLoad = async () => {
      setLoadingState("loading");
      setLoading(true);

      // Side animation cycling
      animationCycleTimer = setInterval(() => {
        if (!mounted) return;
        setShowSideAnimation(false);
        setTimeout(() => {
          if (!mounted) return;
          setSideAnimationIndex(prev => (prev === 0 ? 1 : 0));
          setShowSideAnimation(true);
        }, 400);
      }, 2500);

      // Hard cap 10s → error state
      maxTimer = setTimeout(() => {
        if (mounted) {
          setLoadingState("error");
          clearInterval(animationCycleTimer);
        }
      }, 10000);

      await Promise.all([fetchTimetable("A"), fetchStats()]);

      // Minimum 5s loading screen
      minTimer = setTimeout(() => {
        if (mounted) {
          clearTimeout(maxTimer);
          clearInterval(animationCycleTimer);
          setLoading(false);
          hasInitiallyLoaded.current = true;
        }
      }, 5000);
    };

    initialLoad();

    const timeInterval = setInterval(() => {
      if (mounted) setCurrentTime(new Date());
    }, 60000);

    return () => {
      mounted = false;
      clearTimeout(maxTimer);
      clearTimeout(minTimer);
      clearInterval(animationCycleTimer);
      clearInterval(timeInterval);
    };
  }, []); // empty deps — runs once on mount only

  // ── Division change effect — silent fetch, no loading screen ─────────────

  useEffect(() => {
    // Skip on first render (initial load handles it)
    if (!hasInitiallyLoaded.current) return;
    fetchTimetable(selectedDivision);
  }, [selectedDivision, fetchTimetable]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getSessionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "theory": return <BookOpen size={16} className="text-blue-600" />;
      case "lab":    return <Beaker   size={16} className="text-green-600" />;
      case "test":   return <FileText size={16} className="text-red-600" />;
      case "break":  return <Coffee   size={16} className="text-gray-600" />;
      case "zero":   return <Clock    size={16} className="text-purple-600" />;
      default:       return <Clock    size={16} className="text-slate-600" />;
    }
  };

  const getSessionColor = (type) => {
    switch (type?.toLowerCase()) {
      case "theory": return "bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-l-blue-500";
      case "lab":    return "bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-l-green-500";
      case "test":   return "bg-gradient-to-br from-red-50 to-amber-50 border-l-4 border-l-red-500";
      case "break":  return "bg-gradient-to-br from-yellow-50 to-amber-50 border-l-4 border-l-yellow-500 ring-2 ring-yellow-200";
      case "zero":   return "bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-l-purple-500";
      default:       return "bg-gradient-to-br from-slate-50 to-gray-50 border-l-4 border-l-slate-500";
    }
  };

  const getSessionBadgeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "theory": return "bg-blue-100 text-blue-700 border-blue-200";
      case "lab":    return "bg-green-100 text-green-700 border-green-200";
      case "test":   return "bg-red-100 text-red-700 border-red-200";
      case "break":  return "bg-yellow-100 text-yellow-700 border-yellow-200 font-bold";
      case "zero":   return "bg-purple-100 text-purple-700 border-purple-200";
      default:       return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const isCurrentSession = useCallback((day, slotNumber) => {
    const now = currentTime;
    const currentDay = days[now.getDay() - 1];
    if (currentDay !== day) return false;
    const slot = timeSlots[slotNumber];
    if (!slot) return false;
    const [sh, sm] = slot.start.split(":").map(Number);
    const [eh, em] = slot.end.split(":").map(Number);
    const cur = now.getHours() * 60 + now.getMinutes();
    return cur >= sh * 60 + sm && cur < eh * 60 + em;
  }, [currentTime, days, timeSlots]);

  const getSessionsForDay = useCallback((day) => {
    if (!timetable || !timetable[day]) return {};
    const sessions = timetable[day][selectedDivision] || [];
    const grouped = {};
    sessions.forEach(session => {
      const slot = session.slot;
      if (!grouped[slot]) grouped[slot] = [];
      grouped[slot].push(session);
    });
    return grouped;
  }, [timetable, selectedDivision]);

  const handleSlotClick = (day, slotNumber, sessions) => {
    setSelectedSlot({ day, slotNumber, sessions, timeRange: timeSlots[slotNumber] });
    setIsDetailViewOpen(true);
  };

  const closeDetailView = () => {
    setIsDetailViewOpen(false);
    setTimeout(() => setSelectedSlot(null), 300);
  };

  const handleRequestSwap = (session) => {
    alert(`Swap request sent for ${session.subject} with ${session.faculty}`);
  };

  // ── Loading / Error Screen (one-time only) ────────────────────────────────

  if (loading || loadingState === "error") {
    return (
      <div className="h-screen flex flex-col items-center justify-center overflow-hidden px-4">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-80 h-80 lg:w-96 lg:h-96"
          >
            <AnimatePresence mode="wait">
              {loadingState === "loading" ? (
                <motion.div
                  key="main-loading"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full"
                >
                  <Lottie animationData={mainAnimation} loop={true} className="w-full h-full" />
                </motion.div>
              ) : (
                <motion.div
                  key="main-error"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full"
                >
                  <Lottie animationData={errorAnimation} loop={true} className="w-full h-full" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {loadingState === "loading" && (
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-64 h-64 lg:w-72 lg:h-72"
            >
              <AnimatePresence mode="wait">
                {showSideAnimation && (
                  <motion.div
                    key={sideAnimationIndex}
                    initial={{ opacity: 0, x: 60, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -60, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <Lottie
                      animationData={sideAnimationIndex === 0 ? sideAnimation1 : sideAnimation2}
                      loop={true}
                      className="w-full h-full"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center"
        >
          <h2 className="text-3xl font-bold text-slate-700 mb-2">
            {loadingState === "loading" ? "Loading Your Schedule" : "Taking Too Long?"}
          </h2>
          <p className="text-slate-400 text-sm">
            {loadingState === "loading"
              ? "Please wait while we prepare your personalized timetable..."
              : "We're having trouble connecting. Please refresh the page."}
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Post-load Error ───────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center overflow-hidden px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-64 h-64"
        >
          <Lottie animationData={errorAnimation} loop={true} className="w-full h-full" />
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <h3 className="text-2xl font-bold text-slate-700 mb-2">Oops! Something went wrong</h3>
          <p className="text-slate-400 text-sm">{error}</p>
        </motion.div>
      </div>
    );
  }

  // ── Main View ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <motion.div
              className="flex items-center gap-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Calendar className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Timetable
                </h1>
                <p className="text-slate-500 flex items-center gap-2">
                  <Sparkles size={14} className="text-yellow-500" />
                  Computer Engineering • Even Semester • 2026
                </p>
              </div>
            </motion.div>

            <div className="flex items-center gap-2 bg-slate-200/50 p-1.5 rounded-2xl border border-white">
              {["A", "B"].map(div => (
                <button
                  key={div}
                  onClick={() => setSelectedDivision(div)}
                  className={`px-10 py-3 rounded-xl font-black text-sm transition-all duration-500 ${
                    selectedDivision === div
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "text-slate-500 hover:text-indigo-600"
                  }`}
                >
                  Div {div}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Theory", value: stats.theory, icon: BookOpen, color: "from-blue-500 to-indigo-500",   bg: "from-blue-50 to-indigo-50" },
              { label: "Labs",   value: stats.lab,    icon: Beaker,   color: "from-green-500 to-emerald-500", bg: "from-green-50 to-emerald-50" },
              { label: "Tests",  value: stats.test,   icon: FileText, color: "from-red-500 to-rose-500",      bg: "from-red-50 to-rose-50" },
              { label: "Total",  value: stats.total,  icon: Clock,    color: "from-purple-500 to-pink-500",   bg: "from-purple-50 to-pink-50" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`bg-gradient-to-br ${stat.bg} rounded-xl p-4 shadow-lg border border-white/50 backdrop-blur-sm`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg shadow-lg`}>
                    <stat.icon className="text-white" size={16} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stat.value || 0}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timetable Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden"
        >
          {/* Day headers */}
          <div className="grid grid-cols-5 gap-px bg-slate-200/50">
            {days.map((day, index) => {
              const groupedSessions = getSessionsForDay(day);
              const sessionCount = Object.values(groupedSessions).flat().length;
              const isToday = index === new Date().getDay() - 1;

              return (
                <motion.div
                  key={day}
                  className={`bg-white/80 backdrop-blur-sm p-4 ${isToday ? "bg-gradient-to-br from-yellow-50 to-amber-50" : ""}`}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.95)" }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={isToday ? { rotate: [0, 360] } : {}}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      {isToday
                        ? <Sun  className="text-yellow-500" size={20} />
                        : <Moon className="text-slate-400"  size={20} />
                      }
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">{day}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{sessionCount} sessions</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Slot columns */}
          <div className="grid grid-cols-5 gap-px bg-slate-200/50">
            {days.map(day => {
              const groupedSessions = getSessionsForDay(day);

              return (
                <div key={day} className="bg-white/80 backdrop-blur-sm p-3 min-h-[700px]">
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(slotNumber => {
                      const sessions    = groupedSessions[slotNumber] || [];
                      const hasMultiple = sessions.length > 1;
                      const isCurrent   = isCurrentSession(day, slotNumber);
                      const isBreak     = sessions.some(s => s.type === "break");

                      return (
                        <AnimatePresence key={slotNumber}>
                          {sessions.length > 0 ? (
                            <motion.div
                              layout
                              initial={{ opacity: 0, scale: 0.9, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              whileHover={{
                                scale: 1.02,
                                y: -2,
                                boxShadow: "0 20px 30px -10px rgba(79, 70, 229, 0.3)"
                              }}
                              onHoverStart={() => setHoveredSlot(`${day}-${slotNumber}`)}
                              onHoverEnd={() => setHoveredSlot(null)}
                              onClick={() => handleSlotClick(day, slotNumber, sessions)}
                              className={`
                                relative rounded-xl overflow-hidden cursor-pointer
                                ${isCurrent ? "ring-2 ring-indigo-400 ring-offset-2" : ""}
                                ${isBreak   ? "ring-2 ring-yellow-400 ring-offset-2" : ""}
                                transition-all duration-300
                                ${hoveredSlot === `${day}-${slotNumber}` ? "shadow-2xl" : "shadow-md"}
                              `}
                            >
                              {/* Time bar */}
                              <div className="bg-slate-900/5 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-slate-600 flex justify-between items-center border-b border-white/20">
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {timeSlots[slotNumber].start} - {timeSlots[slotNumber].end}
                                </span>
                                {hasMultiple && (
                                  <motion.span
                                    className="flex items-center gap-1 text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full text-[10px]"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    <Layers size={10} />
                                    {sessions.length} Sessions
                                  </motion.span>
                                )}
                                {isBreak && (
                                  <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    <Coffee size={10} /> BREAK
                                  </span>
                                )}
                              </div>

                              {/* Multiple sessions side by side */}
                              {hasMultiple ? (
                                <div className="grid grid-cols-2 gap-2 p-2 h-[116px]">
                                  {sessions.map((session, idx) => (
                                    <motion.div
                                      key={idx}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.1 }}
                                      className={`
                                        p-2 rounded-lg ${getSessionColor(session.type)}
                                        border-2 ${session.type === "lab" ? "border-green-300" : "border-transparent"}
                                        h-full flex flex-col shadow-sm
                                      `}
                                    >
                                      <div className="font-bold text-sm text-slate-800 mb-1 line-clamp-1">
                                        {session.subject}
                                      </div>
                                      <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                                        {session.batch && session.batch !== "NULL" ? (
                                          <span className="bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-700 font-medium text-[10px]">
                                            {session.batch}
                                          </span>
                                        ) : (
                                          <span className="flex items-center gap-1 text-[10px]">
                                            <Users size={10} /> Full
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1 text-[10px] text-slate-600 mt-auto">
                                        <MapPin size={10} />
                                        <span className="truncate">{session.room || "—"}</span>
                                      </div>
                                      {session.faculty && session.faculty !== "NULL" && (
                                        <div className="flex items-center gap-1 text-[10px] text-slate-600">
                                          <GraduationCap size={10} />
                                          <span className="truncate">{session.faculty.split(" ")[0]}</span>
                                        </div>
                                      )}
                                    </motion.div>
                                  ))}
                                </div>
                              ) : (
                                <div className={`p-3 ${getSessionColor(sessions[0].type)} h-[120px] flex flex-col`}>
                                  <div className="flex items-start gap-2 h-full">
                                    <div className="flex-1 min-w-0 flex flex-col h-full">
                                      <div className="font-bold text-base text-slate-800 mb-1 line-clamp-1">
                                        {sessions[0].subject}
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap mb-1">
                                        {sessions[0].batch && sessions[0].batch !== "NULL" ? (
                                          <span className="bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-700 font-medium text-[10px]">
                                            Batch {sessions[0].batch}
                                          </span>
                                        ) : (
                                          <span className="flex items-center gap-1 text-[10px]">
                                            <Users size={10} /> Full Division
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3 text-xs text-slate-600 mt-auto">
                                        <div className="flex items-center gap-1">
                                          <MapPin size={12} />
                                          <span>{sessions[0].room || "—"}</span>
                                        </div>
                                        {sessions[0].faculty && sessions[0].faculty !== "NULL" && (
                                          <>
                                            <span className="text-slate-300">|</span>
                                            <div className="flex items-center gap-1">
                                              <GraduationCap size={12} />
                                              <span className="truncate max-w-[80px]">{sessions[0].faculty}</span>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <motion.div
                                      whileHover={{ scale: 1.1, rotate: 5 }}
                                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${getSessionBadgeColor(sessions[0].type)}`}
                                    >
                                      {getSessionIcon(sessions[0].type)}
                                    </motion.div>
                                  </div>
                                </div>
                              )}

                              {isCurrent && (
                                <motion.div
                                  className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"
                                  animate={{ scale: [1, 1.5, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              )}
                            </motion.div>
                          ) : (
                            <motion.div
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.9)" }}
                              onClick={() => handleSlotClick(day, slotNumber, [])}
                              className="p-3 bg-slate-50/50 backdrop-blur-sm rounded-xl border border-dashed border-slate-300 hover:border-indigo-300 transition-all cursor-pointer h-[120px] flex flex-col"
                            >
                              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                <Clock size={10} />
                                {timeSlots[slotNumber].start} - {timeSlots[slotNumber].end}
                              </div>
                              <div className="flex-1 flex items-center justify-center">
                                <span className="bg-slate-200/50 px-4 py-2 rounded-full text-sm text-slate-400">
                                  Free Period
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/50"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              {[
                { color: "bg-blue-500",   label: "Theory" },
                { color: "bg-green-500",  label: "Lab" },
                { color: "bg-red-500",    label: "Test" },
                { color: "bg-yellow-500", label: "Break" },
                { color: "bg-slate-300",  label: "Free" },
                { color: "bg-indigo-500", label: "Split Session", icon: Layers },
              ].map(item => (
                <motion.div key={item.label} className="flex items-center gap-2" whileHover={{ scale: 1.1 }}>
                  <div className={`w-3 h-3 rounded-full ${item.color} shadow-lg`} />
                  <span className="text-sm text-slate-600">{item.label}</span>
                  {item.icon && <item.icon size={14} className="text-indigo-500" />}
                </motion.div>
              ))}
            </div>
            <motion.div
              className="flex items-center gap-2 text-sm text-slate-500 bg-white/50 px-3 py-1.5 rounded-full"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Clock size={16} className="text-indigo-500" />
              <span>
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric"
                })}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailViewOpen && selectedSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeDetailView}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full border border-white/50 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
                <button
                  onClick={closeDetailView}
                  className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <X size={18} />
                </button>
                <h3 className="text-2xl font-bold mb-1">{selectedSlot.day}</h3>
                <p className="text-white/80 flex items-center gap-2">
                  <Clock size={14} />
                  {selectedSlot.timeRange.start} - {selectedSlot.timeRange.end} • {selectedSlot.timeRange.name}
                </p>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {selectedSlot.sessions.length > 0 ? (
                  selectedSlot.sessions.map((session, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-5 rounded-xl ${getSessionColor(session.type)} border border-white/50 shadow-lg`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-bold text-slate-800">{session.subject}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSessionBadgeColor(session.type)}`}>
                          {session.type?.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Users size={16} className="text-indigo-500" />
                            <span className="font-medium">
                              {session.batch && session.batch !== "NULL" ? `Batch ${session.batch}` : "Full Division"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin size={16} className="text-green-500" />
                            <span className="font-medium">Room {session.room || "—"}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-slate-600">
                            <GraduationCap size={16} className="text-purple-500" />
                            <span className="font-medium">{session.faculty || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock size={16} className="text-red-500" />
                            <span className="font-medium">
                              {selectedSlot.timeRange.start} - {selectedSlot.timeRange.end}
                            </span>
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleRequestSwap(session)}
                        className="mt-5 w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                      >
                        <RefreshCw size={16} /> Request Swap
                      </motion.button>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <div className="text-7xl mb-4">🕊️</div>
                    <h4 className="text-2xl font-bold text-slate-800 mb-2">Free Period</h4>
                    <p className="text-slate-500">No classes scheduled during this time</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50/50 backdrop-blur-sm px-6 py-4 border-t border-white/50 flex justify-end">
                <button
                  onClick={closeDetailView}
                  className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimetableComponent;