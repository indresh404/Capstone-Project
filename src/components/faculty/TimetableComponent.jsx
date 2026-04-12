import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, MapPin, BookOpen,
  Users, Coffee, GraduationCap, Beaker, FileText,
  X, RefreshCw, Sparkles, Layers, Sun, Moon,
} from "lucide-react";
import axios from "axios";
import LottieComponent from "lottie-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Lottie = LottieComponent.default ?? LottieComponent;

import mainAnimation  from "../../assets/tt_loading_main.json";
import sideAnimation1 from "../../assets/tt_loading1.json";
import sideAnimation2 from "../../assets/tt_loading2.json";
import errorAnimation from "../../assets/tt_error.json";

// ── Constants ────────────────────────────────────────────────────────────────

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const TIME_SLOTS = {
  1: { start: "09:15", end: "10:15", name: "Slot 1" },
  2: { start: "10:15", end: "11:15", name: "Slot 2" },
  3: { start: "11:15", end: "12:15", name: "Slot 3" },
  4: { start: "12:15", end: "12:45", name: "Break" },
  5: { start: "12:45", end: "13:45", name: "Slot 5" },
  6: { start: "13:45", end: "14:45", name: "Slot 6" },
  7: { start: "14:45", end: "15:45", name: "Slot 7" },
  8: { start: "15:45", end: "16:45", name: "Slot 8" },
};

const BREAK_SLOT = 4;

const SUBJECT_CODES = {
  "Sampling Theory & Optimization": "STO-401",
  "Design Thinking": "DT-402",
  "Software Engineering & Project Management": "SEPM-403",
  "Agentic AI": "AAI-404",
  "Full Stack Development Lab": "FSD-405",
  "Idea Lab": "IDEA-406",
  "Tutorial Test": "TEST-407",
  "FREE PERIOD": "FREE",
  "BREAK": "BREAK",
};

// ── Style helpers ─────────────────────────────────────────────────────────────

const SESSION_STYLES = {
  theory: {
    card: "bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-l-blue-500",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <BookOpen size={16} className="text-blue-600" />,
  },
  lab: {
    card: "bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-l-green-500",
    badge: "bg-green-100 text-green-700 border-green-200",
    icon: <Beaker size={16} className="text-green-600" />,
  },
  test: {
    card: "bg-gradient-to-br from-red-50 to-amber-50 border-l-4 border-l-red-500",
    badge: "bg-red-100 text-red-700 border-red-200",
    icon: <FileText size={16} className="text-red-600" />,
  },
  break: {
    card: "bg-gradient-to-br from-yellow-50 to-amber-50 border-l-4 border-l-yellow-400",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200 font-bold",
    icon: <Coffee size={16} className="text-yellow-600" />,
  },
  zero: {
    card: "bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-l-purple-500",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    icon: <Clock size={16} className="text-purple-600" />,
  },
  default: {
    card: "bg-gradient-to-br from-slate-50 to-gray-50 border-l-4 border-l-slate-500",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    icon: <Clock size={16} className="text-slate-600" />,
  },
};

const getStyle = (type) => SESSION_STYLES[type?.toLowerCase()] ?? SESSION_STYLES.default;

// ── Stat computation from timetable data ──────────────────────────────────────

function computeStats(timetable, division) {
  if (!timetable) return { theory: 0, lab: 0, test: 0, total: 0 };
  let theory = 0, lab = 0, test = 0;
  for (const day of DAYS) {
    const sessions = timetable[day]?.[division] ?? [];
    for (const s of sessions) {
      const t = s.type?.toLowerCase();
      if (t === "theory") theory++;
      else if (t === "lab") lab++;
      else if (t === "test") test++;
    }
  }
  return { theory, lab, test, total: theory + lab + test };
}

// ── Sub-components ────────────────────────────────────────────────────────────

// Break card — always shown for slot 4, non-interactive
const BreakCard = () => (
  <div className="rounded-xl overflow-hidden shadow-md ring-2 ring-yellow-300 ring-offset-1 h-[120px] flex flex-col">
    <div className="bg-slate-900/5 px-3 py-1.5 text-xs font-medium text-slate-600 flex justify-between items-center border-b border-white/20">
      <span className="flex items-center gap-1">
        <Clock size={12} />
        {TIME_SLOTS[BREAK_SLOT].start} – {TIME_SLOTS[BREAK_SLOT].end}
      </span>
      <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full text-[10px] font-bold">
        <Coffee size={10} /> BREAK
      </span>
    </div>
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-50">
      <div className="flex flex-col items-center gap-1">
        <Coffee size={20} className="text-yellow-500" />
        <span className="text-xs font-bold text-yellow-600">Lunch Break</span>
        <span className="text-[10px] text-yellow-500">30 min</span>
      </div>
    </div>
  </div>
);

// Session card (single session)
const SingleSessionCard = ({ session, day, slotNumber, isCurrent, hoveredSlot, setHoveredSlot, setSubjectTooltip, subjectTooltip, onClick }) => {
  const style = getStyle(session.type);
  const tooltipKey = `${day}-${slotNumber}`;
  const showTooltip = subjectTooltip === tooltipKey && session.type !== "break" && session.type !== "zero";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02, y: -2, boxShadow: "0 20px 30px -10px rgba(79,70,229,0.3)" }}
      onHoverStart={() => setHoveredSlot(tooltipKey)}
      onHoverEnd={() => setHoveredSlot(null)}
      onClick={onClick}
      className={`
        relative rounded-xl overflow-hidden cursor-pointer h-[120px] flex flex-col
        ${isCurrent ? "ring-2 ring-indigo-400 ring-offset-2" : ""}
        transition-all duration-300
        ${hoveredSlot === tooltipKey ? "shadow-2xl" : "shadow-md"}
      `}
    >
      {/* Time bar */}
      <div className="bg-slate-900/5 px-3 py-1.5 text-xs font-medium text-slate-600 flex justify-between items-center border-b border-white/20 shrink-0">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {TIME_SLOTS[slotNumber].start} – {TIME_SLOTS[slotNumber].end}
        </span>
      </div>

      {/* Body */}
      <div
        className={`p-3 ${style.card} flex flex-col flex-1 relative`}
        onMouseEnter={() => setSubjectTooltip(tooltipKey)}
        onMouseLeave={() => setSubjectTooltip(null)}
      >
        <div className="flex items-start gap-2 flex-1">
          <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
            <div className="relative">
              <div className="font-bold text-sm text-slate-800 mb-0.5 line-clamp-1">
                {SUBJECT_CODES[session.subject] || session.subject?.substring(0, 10) || "FREE"}
              </div>
              {showTooltip && (
                <div className="absolute z-50 bg-slate-800 text-white text-xs rounded py-1 px-2 -top-7 left-0 whitespace-nowrap shadow-xl">
                  {session.subject}
                </div>
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-[10px] text-slate-600">
                {session.batch && session.batch !== "NULL" && session.batch !== "-"
                  ? <span className="bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-700 font-medium">B{session.batch}</span>
                  : <span className="flex items-center gap-1"><Users size={10} /> Full</span>
                }
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <MapPin size={9} /><span className="truncate">{session.room || "—"}</span>
              </div>
              {session.faculty && session.faculty !== "NULL" && session.faculty !== "-" && (
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <GraduationCap size={9} />
                  <span className="truncate max-w-[90px]">{session.faculty.split(" ")[0]}</span>
                </div>
              )}
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-md border ${style.badge}`}
          >
            {style.icon}
          </motion.div>
        </div>
      </div>

      {isCurrent && (
        <motion.div
          className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

// Split session card (multiple sessions in same slot)
const SplitSessionCard = ({ sessions, day, slotNumber, isCurrent, hoveredSlot, setHoveredSlot, setSubjectTooltip, subjectTooltip, onClick }) => {
  const tooltipKey = `${day}-${slotNumber}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02, y: -2, boxShadow: "0 20px 30px -10px rgba(79,70,229,0.3)" }}
      onHoverStart={() => setHoveredSlot(tooltipKey)}
      onHoverEnd={() => setHoveredSlot(null)}
      onClick={onClick}
      className={`
        relative rounded-xl overflow-hidden cursor-pointer h-[120px] flex flex-col
        ${isCurrent ? "ring-2 ring-indigo-400 ring-offset-2" : ""}
        transition-all duration-300
        ${hoveredSlot === tooltipKey ? "shadow-2xl" : "shadow-md"}
      `}
    >
      {/* Time bar */}
      <div className="bg-slate-900/5 px-3 py-1.5 text-xs font-medium text-slate-600 flex justify-between items-center border-b border-white/20 shrink-0">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {TIME_SLOTS[slotNumber].start} – {TIME_SLOTS[slotNumber].end}
        </span>
        <motion.span
          className="flex items-center gap-1 text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full text-[10px]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Layers size={10} /> {sessions.length} Sessions
        </motion.span>
      </div>

      {/* Split body */}
      <div className="grid grid-cols-2 gap-1 p-1.5 flex-1 bg-white/40">
        {sessions.map((session, idx) => {
          const style = getStyle(session.type);
          const tipKey = `${day}-${slotNumber}-${idx}`;
          return (
            <div
              key={idx}
              className={`p-1.5 rounded-lg ${style.card} flex flex-col justify-between relative`}
              onMouseEnter={() => setSubjectTooltip(tipKey)}
              onMouseLeave={() => setSubjectTooltip(null)}
            >
              {subjectTooltip === tipKey && session.type !== "break" && session.type !== "zero" && (
                <div className="absolute z-50 bg-slate-800 text-white text-xs rounded py-1 px-2 -top-7 left-0 whitespace-nowrap shadow-xl">
                  {session.subject}
                </div>
              )}
              <div className="font-bold text-[10px] text-slate-800 line-clamp-1">
                {SUBJECT_CODES[session.subject] || session.subject?.substring(0, 8) || "FREE"}
              </div>
              <div className="space-y-0.5 mt-0.5">
                {session.batch && session.batch !== "NULL" && session.batch !== "-" && (
                  <span className="bg-indigo-100 px-1 py-0.5 rounded text-indigo-700 font-medium text-[9px]">
                    B{session.batch}
                  </span>
                )}
                <div className="flex items-center gap-0.5 text-[9px] text-slate-500">
                  <MapPin size={8} /><span className="truncate">{session.room || "—"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isCurrent && (
        <motion.div
          className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

// Free period card
const FreePeriodCard = ({ slotNumber, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.9)" }}
    onClick={onClick}
    className="h-[120px] flex flex-col p-2 bg-slate-50/50 backdrop-blur-sm rounded-xl border border-dashed border-slate-300 hover:border-indigo-300 transition-all cursor-pointer shadow-sm"
  >
    <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1 shrink-0">
      <Clock size={10} />
      {TIME_SLOTS[slotNumber].start} – {TIME_SLOTS[slotNumber].end}
    </div>
    <div className="flex-1 flex items-center justify-center">
      <span className="bg-slate-200/50 px-3 py-1.5 rounded-full text-xs text-slate-400">
        Free Period
      </span>
    </div>
  </motion.div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const TimetableComponent = () => {
  const [timetable, setTimetable]               = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [divisionLoading, setDivisionLoading]   = useState(false);
  const [loadingState, setLoadingState]         = useState("loading");
  const [selectedDivision, setSelectedDivision] = useState("A");
  const [currentTime, setCurrentTime]           = useState(new Date());
  const [error, setError]                       = useState(null);
  const [hoveredSlot, setHoveredSlot]           = useState(null);
  const [selectedSlot, setSelectedSlot]         = useState(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [sideAnimationIndex, setSideAnimationIndex] = useState(0);
  const [showSideAnimation, setShowSideAnimation]   = useState(true);
  const [subjectTooltip, setSubjectTooltip]     = useState(null);

  const hasInitiallyLoaded = useRef(false);

  // Compute stats from timetable data (excludes break/zero, avoids API zero bug)
  const stats = useMemo(() => computeStats(timetable, selectedDivision), [timetable, selectedDivision]);

  const fetchTimetable = useCallback(async (division, showLoading = true) => {
    if (showLoading) setDivisionLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) { setError("Please login to view timetable"); setLoadingState("error"); return; }
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/timetable?division=${division}`,
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
    } finally {
      if (showLoading) setDivisionLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let mounted = true;
    let maxTimer, minTimer, animationCycleTimer;

    const initialLoad = async () => {
      setLoadingState("loading");
      setLoading(true);

      animationCycleTimer = setInterval(() => {
        if (!mounted) return;
        setShowSideAnimation(false);
        setTimeout(() => {
          if (!mounted) return;
          setSideAnimationIndex(prev => prev === 0 ? 1 : 0);
          setShowSideAnimation(true);
        }, 400);
      }, 2500);

      maxTimer = setTimeout(() => {
        if (mounted) { setLoadingState("error"); clearInterval(animationCycleTimer); }
      }, 10000);

      await fetchTimetable("A", false);

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
    const timeInterval = setInterval(() => { if (mounted) setCurrentTime(new Date()); }, 60000);

    return () => {
      mounted = false;
      clearTimeout(maxTimer);
      clearTimeout(minTimer);
      clearInterval(animationCycleTimer);
      clearInterval(timeInterval);
    };
  }, []);

  // Division change
  useEffect(() => {
    if (!hasInitiallyLoaded.current) return;
    fetchTimetable(selectedDivision, true);
  }, [selectedDivision, fetchTimetable]);

  const isCurrentSession = useCallback((day, slotNumber) => {
    const now = currentTime;
    const currentDay = DAYS[now.getDay() - 1];
    if (currentDay !== day) return false;
    const slot = TIME_SLOTS[slotNumber];
    if (!slot) return false;
    const [sh, sm] = slot.start.split(":").map(Number);
    const [eh, em] = slot.end.split(":").map(Number);
    const cur = now.getHours() * 60 + now.getMinutes();
    return cur >= sh * 60 + sm && cur < eh * 60 + em;
  }, [currentTime]);

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
    setSelectedSlot({ day, slotNumber, sessions, timeRange: TIME_SLOTS[slotNumber] });
    setIsDetailViewOpen(true);
  };

  const closeDetailView = () => {
    setIsDetailViewOpen(false);
    setTimeout(() => setSelectedSlot(null), 300);
  };

  const handleRequestSwap = (session) => {
    alert(`Swap request sent for ${session.subject} with ${session.faculty}`);
  };

  // ── Loading / Error Screen ────────────────────────────────────────────────

  if (loading || loadingState === "error") {
    return (
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center overflow-hidden px-4">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          <motion.div
            initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}
            className="w-80 h-80 lg:w-96 lg:h-96"
          >
            <AnimatePresence mode="wait">
              {loadingState === "loading" ? (
                <motion.div key="main-loading" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.5 }} className="w-full h-full">
                  <Lottie animationData={mainAnimation} loop className="w-full h-full" />
                </motion.div>
              ) : (
                <motion.div key="main-error" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.5 }} className="w-full h-full">
                  <Lottie animationData={errorAnimation} loop className="w-full h-full" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {loadingState === "loading" && (
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="relative w-64 h-64 lg:w-72 lg:h-72">
              <AnimatePresence mode="wait">
                {showSideAnimation && (
                  <motion.div key={sideAnimationIndex} initial={{ opacity: 0, x: 60, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -60, scale: 0.9 }} transition={{ duration: 0.4, ease: "easeInOut" }} className="absolute inset-0">
                    <Lottie animationData={sideAnimationIndex === 0 ? sideAnimation1 : sideAnimation2} loop className="w-full h-full" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="mt-10 text-center">
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

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center overflow-hidden px-4">
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-64 h-64">
          <Lottie animationData={errorAnimation} loop className="w-full h-full" />
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 text-center">
          <h3 className="text-2xl font-bold text-slate-700 mb-2">Oops! Something went wrong</h3>
          <p className="text-slate-400 text-sm">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (divisionLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 px-6 py-6 relative">
        <div className="opacity-30 pointer-events-none">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Calendar className="text-white" size={28} />
              </div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Timetable</h1>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50">
          <div className="text-center">
            <div className="w-64 h-64 mx-auto">
              <Lottie animationData={mainAnimation} loop className="w-full h-full" />
            </div>
            <p className="text-xl font-semibold text-indigo-600 mt-4">Loading Division {selectedDivision}...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main View ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 px-6 py-6">
      <div className="w-full space-y-6">

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, type: "spring" }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <motion.div className="flex items-center gap-3" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Calendar className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Timetable</h1>
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
                    selectedDivision === div ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-indigo-600"
                  }`}
                >
                  Div {div}
                </button>
              ))}
            </div>
          </div>

          {/* Stats — computed from timetable, excludes break/zero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Theory", value: stats.theory, icon: BookOpen, color: "from-blue-500 to-indigo-500",   bg: "from-blue-50 to-indigo-50" },
              { label: "Labs",   value: stats.lab,    icon: Beaker,   color: "from-green-500 to-emerald-500", bg: "from-green-50 to-emerald-50" },
              { label: "Tests",  value: stats.test,   icon: FileText, color: "from-red-500 to-rose-500",      bg: "from-red-50 to-rose-50" },
              { label: "Total",  value: stats.total,  icon: Calendar, color: "from-slate-500 to-gray-500",    bg: "from-slate-50 to-gray-50" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`bg-gradient-to-br ${stat.bg} rounded-xl p-4 shadow-lg border border-white/50 backdrop-blur-sm`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg shadow-lg`}>
                    <stat.icon className="text-white" size={16} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timetable Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden"
        >
          {/* Day headers */}
          <div className="grid grid-cols-5 gap-px bg-slate-200/50">
            {DAYS.map((day, index) => {
              const sessionCount = Object.values(getSessionsForDay(day))
                .flat()
                .filter(s => s.type !== "break" && s.type !== "zero").length;
              const isToday = index === new Date().getDay() - 1;

              return (
                <motion.div
                  key={day}
                  className={`bg-white/80 backdrop-blur-sm p-4 ${isToday ? "bg-gradient-to-br from-yellow-50 to-amber-50" : ""}`}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.95)" }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div animate={isToday ? { rotate: [0, 360] } : {}} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                      {isToday ? <Sun className="text-yellow-500" size={20} /> : <Moon className="text-slate-400" size={20} />}
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
            {DAYS.map(day => {
              const groupedSessions = getSessionsForDay(day);

              return (
                <div key={day} className="bg-white/80 backdrop-blur-sm p-3 min-h-[700px]">
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(slotNumber => {
                      const sessions  = groupedSessions[slotNumber] || [];
                      const isCurrent = isCurrentSession(day, slotNumber);
                      const isBreakSlot = slotNumber === BREAK_SLOT;

                      // Slot 4 is always a break — show non-clickable break card
                      if (isBreakSlot) {
                        return <BreakCard key={slotNumber} />;
                      }

                      const commonProps = {
                        day, slotNumber, isCurrent,
                        hoveredSlot, setHoveredSlot,
                        subjectTooltip, setSubjectTooltip,
                      };

                      if (sessions.length === 0) {
                        return (
                          <FreePeriodCard
                            key={slotNumber}
                            slotNumber={slotNumber}
                            onClick={() => handleSlotClick(day, slotNumber, [])}
                          />
                        );
                      }

                      if (sessions.length > 1) {
                        return (
                          <SplitSessionCard
                            key={slotNumber}
                            sessions={sessions}
                            onClick={() => handleSlotClick(day, slotNumber, sessions)}
                            {...commonProps}
                          />
                        );
                      }

                      return (
                        <SingleSessionCard
                          key={slotNumber}
                          session={sessions[0]}
                          onClick={() => handleSlotClick(day, slotNumber, sessions)}
                          {...commonProps}
                        />
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
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
          className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/50"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              {[
                { color: "bg-blue-500",   label: "Theory" },
                { color: "bg-green-500",  label: "Lab" },
                { color: "bg-red-500",    label: "Test" },
                { color: "bg-yellow-500", label: "Break" },
                { color: "bg-purple-500", label: "Free" },
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
              <span>{currentTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailViewOpen && selectedSlot && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeDetailView}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full border border-white/50 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
                <button onClick={closeDetailView} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                  <X size={18} />
                </button>
                <h3 className="text-2xl font-bold mb-1">{selectedSlot.day}</h3>
                <p className="text-white/80 flex items-center gap-2">
                  <Clock size={14} />
                  {selectedSlot.timeRange.start} – {selectedSlot.timeRange.end} • {selectedSlot.timeRange.name}
                </p>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {selectedSlot.sessions.length > 0 ? (
                  selectedSlot.sessions.map((session, idx) => {
                    const style = getStyle(session.type);
                    const isBreak = session.type?.toLowerCase() === "break";
                    return (
                      <motion.div
                        key={idx}
                        initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }}
                        className={`p-5 rounded-xl ${style.card} border border-white/50 shadow-lg`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-slate-800">{session.subject}</h4>
                            {session.subject && !isBreak && session.type !== "zero" && (
                              <p className="text-sm text-indigo-600 mt-1">Code: {SUBJECT_CODES[session.subject] || "—"}</p>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${style.badge}`}>
                            {session.type?.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Users size={16} className="text-indigo-500" />
                              <span className="font-medium">
                                {session.batch && session.batch !== "NULL" && session.batch !== "-"
                                  ? `Batch ${session.batch}`
                                  : isBreak ? "All Divisions" : "Full Division"}
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
                              <span className="font-medium">{selectedSlot.timeRange.start} – {selectedSlot.timeRange.end}</span>
                            </div>
                          </div>
                        </div>
                        {/* No swap button for break or zero sessions */}
                        {!isBreak && session.type !== "zero" && (
                          <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => handleRequestSwap(session)}
                            className="mt-5 w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                          >
                            <RefreshCw size={16} /> Request Swap
                          </motion.button>
                        )}
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-10">
                    <div className="text-7xl mb-4">🕊️</div>
                    <h4 className="text-2xl font-bold text-slate-800 mb-2">Free Period</h4>
                    <p className="text-slate-500">No classes scheduled during this time</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50/50 backdrop-blur-sm px-6 py-4 border-t border-white/50 flex justify-end">
                <button onClick={closeDetailView} className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium">
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