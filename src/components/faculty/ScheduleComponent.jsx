import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, MapPin, Users, BookOpen, 
  Calendar, CheckCircle2, Circle, AlertCircle,
  LayoutGrid, List, Sparkles, Coffee
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIME_SLOTS = {
  1: { start: "09:15", end: "10:15", name: "Slot 1" },
  2: { start: "10:15", end: "11:15", name: "Slot 2" },
  3: { start: "11:15", end: "12:15", name: "Slot 3" },
  4: { start: "12:15", end: "12:45", name: "Break", isBreak: true },
  5: { start: "12:45", end: "13:45", name: "Slot 5" },
  6: { start: "13:45", end: "14:45", name: "Slot 6" },
  7: { start: "14:45", end: "15:45", name: "Slot 7" },
  8: { start: "15:45", end: "16:45", name: "Slot 8" },
};

const ScheduleComponent = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const user = JSON.parse(localStorage.getItem("user"));
  const realToday = DAYS[currentTime.getDay()];
  const [selectedDay, setSelectedDay] = useState(realToday === "Saturday" || realToday === "Sunday" ? "Monday" : realToday);

  useEffect(() => {
    fetchTodaySchedule();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodaySchedule = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const resp = await axios.get(`${API_BASE_URL}/api/timetable/faculty/${user.name}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (resp.data.success) {
        setSchedule(resp.data.data);
      }
    } catch (err) {
      setError("Failed to sync agenda. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const selectedLectures = useMemo(() => {
    if (!schedule || !schedule[selectedDay]) return [];
    return schedule[selectedDay];
  }, [schedule, selectedDay]);

  const isActuallyToday = selectedDay === realToday;

  // Determine current slot
  const currentSlotId = useMemo(() => {
    if (!isActuallyToday) return null;
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    for (const [id, times] of Object.entries(TIME_SLOTS)) {
      const [sh, sm] = times.start.split(":").map(Number);
      const [eh, em] = times.end.split(":").map(Number);
      if (now >= sh * 60 + sm && now < eh * 60 + em) return parseInt(id);
    }
    return null;
  }, [currentTime, isActuallyToday]);

  const stats = useMemo(() => {
    const total = selectedLectures.length;
    const completed = selectedLectures.filter(l => {
        if (!isActuallyToday) return false;
        const slot = TIME_SLOTS[l.slot];
        const [eh, em] = slot.end.split(":").map(Number);
        const endMinutes = eh * 60 + em;
        const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        return nowMinutes > endMinutes;
    }).length;
    return { total, completed, remaining: total - completed };
  }, [selectedLectures, currentTime, isActuallyToday]);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
      />
      <p className="text-slate-400 font-bold animate-pulse">Synchronizing your agenda...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      {/* Day Selector Bar */}
      <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-white shadow-sm overflow-x-auto no-scrollbar">
        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-8 py-3 rounded-2xl text-xs font-black transition-all duration-300 whitespace-nowrap
              ${selectedDay === day 
                ? "bg-indigo-600 text-white shadow-lg scale-105" 
                : "text-slate-400 hover:text-indigo-600 hover:bg-white"}
            `}
          >
            {day}
            {day === realToday && (
              <span className="ml-2 inline-block w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Hero Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black tracking-tight mb-1">
              {isActuallyToday ? "Today's Agenda" : `${selectedDay}'s Agenda`}
            </h2>
            <p className="text-indigo-100 font-medium">
              {isActuallyToday ? `${realToday}, ${currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}` : "Browsing Schedule"}
            </p>
            
            <div className="mt-8 flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-4xl font-black">{stats.total}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">Total Lectures</span>
              </div>
              {isActuallyToday && (
                <>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="flex flex-col">
                    <span className="text-4xl font-black">{stats.remaining}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">Remaining</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
            <Calendar size={180} />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 flex flex-col justify-center shadow-sm">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
               <Clock size={24} />
             </div>
             <div>
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                 {isActuallyToday ? "Ongoing Slot" : "Daily Load"}
               </p>
               <p className="text-xl font-black text-slate-800 tracking-tight">
                 {isActuallyToday 
                   ? (currentSlotId ? TIME_SLOTS[currentSlotId].name : "No Active Slot")
                   : `${stats.total} Sessions`
                 }
               </p>
             </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: isActuallyToday ? `${(stats.completed / stats.total) * 100}%` : "100%" }}
               className={`h-full ${isActuallyToday ? "bg-indigo-600" : "bg-emerald-500"}`}
            />
          </div>
        </div>
      </div>

      {/* Agenda Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Daily Timeline</h3>
          {isActuallyToday && (
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> Live Now
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((slotIdx) => {
            const slotInfo = TIME_SLOTS[slotIdx];
            const lecture = selectedLectures.find(l => l.slot === slotIdx);
            const isCurrent = isActuallyToday && currentSlotId === slotIdx;
            const [eh, em] = slotInfo.end.split(":").map(Number);
            const isPast = isActuallyToday && (currentTime.getHours() * 60 + currentTime.getMinutes()) > (eh * 60 + em);

            return (
              <motion.div 
                key={`${selectedDay}-${slotIdx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: slotIdx * 0.05 }}
                className={`relative group flex gap-6 items-center p-6 rounded-[2rem] transition-all duration-500
                  ${isCurrent ? "bg-white shadow-2xl scale-[1.02] border-2 border-indigo-500/20 z-10" : "bg-white/40 hover:bg-white/60"}
                  ${isPast && !isCurrent ? "opacity-60" : "opacity-100"}
                `}
              >
                {/* Time Indicator */}
                <div className="w-24 shrink-0">
                  <p className={`text-sm font-black transition-colors ${isCurrent ? "text-indigo-600" : "text-slate-400"}`}>
                    {slotInfo.start}
                  </p>
                  <p className="text-[10px] font-bold text-slate-300 uppercase">{slotInfo.end}</p>
                </div>

                {/* Vertical Line Connector */}
                <div className="relative flex flex-col items-center justify-center">
                  <div className={`w-4 h-4 rounded-full border-4 transition-all duration-500
                    ${isCurrent ? "bg-indigo-600 border-indigo-100 scale-125" : isPast ? "bg-slate-300 border-white" : "bg-white border-slate-200"}
                  `} />
                  {slotIdx !== 8 && <div className="absolute top-4 w-px h-16 bg-slate-200" />}
                </div>

                {/* Content Card */}
                <div className="flex-1 flex items-center justify-between gap-4">
                  {slotInfo.isBreak ? (
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                         <Coffee size={20} />
                       </div>
                       <div>
                         <p className="text-sm font-black text-slate-700">Lunch Break</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rest & Recharge</p>
                       </div>
                    </div>
                  ) : lecture ? (
                    <div className="flex items-center gap-6">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg
                         ${lecture.type?.toLowerCase() === 'theory' ? "bg-blue-500 text-white shadow-blue-100" : "bg-emerald-500 text-white shadow-emerald-100"}
                       `}>
                         {lecture.subject_code?.substring(0, 2)}
                       </div>
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter
                              ${lecture.type?.toLowerCase() === 'theory' ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"}
                            `}>
                              {lecture.type || 'Theory'}
                            </span>
                            <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                              Div {lecture.division} • Batch {lecture.batch || 'Full'}
                            </span>
                         </div>
                         <h4 className="text-base font-black text-slate-800 tracking-tight leading-none mb-1">{lecture.subject}</h4>
                         <div className="flex items-center gap-3 text-slate-400">
                           <div className="flex items-center gap-1.5 text-[10px] font-bold">
                             <MapPin size={12} className="text-indigo-400" /> {lecture.room}
                           </div>
                         </div>
                       </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 opacity-40">
                       <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                         <Circle size={18} />
                       </div>
                       <p className="text-sm font-bold text-slate-400 italic">No assigned activities</p>
                    </div>
                  )}

                  {isCurrent && (
                     <motion.div 
                       initial={{ opacity: 0, scale: 0.8 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="hidden md:flex flex-col items-end"
                     >
                       <span className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                          In Progress
                       </span>
                     </motion.div>
                  )}
                  {isPast && !isCurrent && lecture && (
                     <CheckCircle2 size={24} className="text-emerald-500 opacity-60 ml-auto shrink-0" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default ScheduleComponent;
