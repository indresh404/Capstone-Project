import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, MapPin, BookOpen,
  Users, Coffee, GraduationCap, Beaker, FileText,
  X, Sparkles, Layers, Sun, Moon, Plus, Save,
  Zap, AlertTriangle, CheckCircle, Edit3, Trash2,
  ChevronDown, GripVertical, RefreshCw, Shield,
} from "lucide-react";
import LottieComponent from "lottie-react";
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

// NOTE: Subjects / faculty / rooms must be loaded from DB via API.
// This component intentionally avoids hardcoded lists.

const SESSION_STYLES = {
  theory: {
    card: "bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-l-blue-500",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <BookOpen size={16} className="text-blue-600" />,
    dot: "bg-blue-500",
  },
  lab: {
    card: "bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-l-green-500",
    badge: "bg-green-100 text-green-700 border-green-200",
    icon: <Beaker size={16} className="text-green-600" />,
    dot: "bg-green-500",
  },
  test: {
    card: "bg-gradient-to-br from-red-50 to-amber-50 border-l-4 border-l-red-500",
    badge: "bg-red-100 text-red-700 border-red-200",
    icon: <FileText size={16} className="text-red-600" />,
    dot: "bg-red-500",
  },
  break: {
    card: "bg-gradient-to-br from-yellow-50 to-amber-50 border-l-4 border-l-yellow-400",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200 font-bold",
    icon: <Coffee size={16} className="text-yellow-600" />,
    dot: "bg-yellow-500",
  },
  default: {
    card: "bg-gradient-to-br from-slate-50 to-gray-50 border-l-4 border-l-slate-500",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    icon: <Clock size={16} className="text-slate-600" />,
    dot: "bg-slate-500",
  },
};

const getStyle = (type) => SESSION_STYLES[type?.toLowerCase()] ?? SESSION_STYLES.default;

// ── Clash Detection ───────────────────────────────────────────────────────────

function detectClashes(timetable) {
  const clashes = [];
  for (const day of DAYS) {
    for (let slot = 1; slot <= 8; slot++) {
      if (slot === BREAK_SLOT) continue;
      const sessionsA = (timetable[day]?.A || []).filter(s => s.slot === slot);
      const sessionsB = (timetable[day]?.B || []).filter(s => s.slot === slot);
      const allSessions = [...sessionsA, ...sessionsB];
      // Room clash
      const rooms = allSessions.map(s => s.room).filter(Boolean);
      const roomDupes = rooms.filter((r, i) => rooms.indexOf(r) !== i);
      roomDupes.forEach(room => {
        clashes.push({ day, slot, type: "room", message: `Room ${room} double-booked on ${day} Slot ${slot}` });
      });
      // Faculty clash
      const faculties = allSessions.map(s => s.faculty).filter(f => f && f !== "NULL" && f !== "-");
      const facDupes = faculties.filter((f, i) => faculties.indexOf(f) !== i);
      facDupes.forEach(faculty => {
        clashes.push({ day, slot, type: "faculty", message: `${faculty} has 2 classes on ${day} Slot ${slot}` });
      });
    }
  }
  return clashes;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

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

// Admin session card with edit/delete
const AdminSessionCard = ({
  session, day, slotNumber, division, isCurrent, hasClash,
  onEdit, onDelete, onDragStart, onDragOver, onDrop, isDragging,
}) => {
  const style = getStyle(session.type);
  return (
    <motion.div
      layout
      draggable
      onDragStart={() => onDragStart({ session, day, slotNumber, division })}
      onDragOver={(e) => { e.preventDefault(); onDragOver({ day, slotNumber, division }); }}
      onDrop={(e) => { e.preventDefault(); onDrop({ day, slotNumber, division }); }}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: isDragging ? 0.4 : 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`
        group relative rounded-xl overflow-hidden h-[120px] flex flex-col cursor-grab active:cursor-grabbing
        ${isCurrent ? "ring-2 ring-indigo-400 ring-offset-2" : ""}
        ${hasClash ? "ring-2 ring-red-400 ring-offset-1" : ""}
        shadow-md transition-all duration-300
      `}
    >
      <div className="bg-slate-900/5 px-3 py-1.5 text-xs font-medium text-slate-600 flex justify-between items-center border-b border-white/20 shrink-0">
        <span className="flex items-center gap-1">
          <GripVertical size={10} className="text-slate-400" />
          <Clock size={12} />
          {TIME_SLOTS[slotNumber].start} – {TIME_SLOTS[slotNumber].end}
        </span>
        <div className="flex items-center gap-1">
          {hasClash && (
            <span className="flex items-center gap-0.5 text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
              <AlertTriangle size={8} /> CLASH
            </span>
          )}
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${style.badge}`}>
            {session.type?.toUpperCase()}
          </span>
        </div>
      </div>
      <div className={`p-2 ${style.card} flex flex-col flex-1`}>
        <div className="font-bold text-xs text-slate-800 mb-1 line-clamp-1">
          {(session.subject_code || "").toString().trim() ? `${session.subject_code} — ` : ""}
          {(session.subject_name ?? session.subject ?? "FREE").toString().substring(0, 28)}
        </div>
        <div className="space-y-0.5 flex-1">
          {session.batch && session.batch !== "NULL" && session.batch !== "-" && (
            <span className="bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-700 font-medium text-[9px]">B{session.batch}</span>
          )}
          <div className="flex items-center gap-1 text-[9px] text-slate-500">
            <MapPin size={8} /><span className="truncate">{session.room || "—"}</span>
          </div>
          {session.faculty && session.faculty !== "NULL" && session.faculty !== "-" && (
            <div className="flex items-center gap-1 text-[9px] text-slate-500">
              <GraduationCap size={8} /><span className="truncate">{session.faculty.split(" ")[0]}</span>
            </div>
          )}
        </div>
      </div>
      {/* Edit/Delete overlay */}
      <motion.div
        className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/5 transition-colors rounded-xl flex items-end justify-end p-1.5 gap-1 pointer-events-none"
        onClick={(e) => e.preventDefault()}
      >
        <motion.button
          whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onEdit(session, day, slotNumber, division); }}
          className="w-6 h-6 bg-white text-indigo-700 rounded-full flex items-center justify-center shadow-lg border border-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
        >
          <Edit3 size={10} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onDelete(day, slotNumber, division, session); }}
          className="w-6 h-6 bg-white text-red-600 rounded-full flex items-center justify-center shadow-lg border border-red-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
        >
          <Trash2 size={10} />
        </motion.button>
      </motion.div>
      {isCurrent && (
        <motion.div
          className="absolute top-1 left-1 w-2 h-2 bg-green-500 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

const AdminSplitCard = ({
  sessions,
  day,
  slotNumber,
  division,
  hasClash,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging
}) => (
  <motion.div
    layout
    onDragOver={(e) => {
      e.preventDefault();
      onDragOver({ day, slotNumber, division });
    }}
    onDrop={(e) => {
      e.preventDefault();
      onDrop({ day, slotNumber, division });
    }}
    initial={{ opacity: 0, scale: 0.9, y: 10 }}
    animate={{ opacity: isDragging ? 0.4 : 1, scale: 1, y: 0 }}
    className={`relative rounded-xl overflow-hidden h-[120px] flex flex-col shadow-md
      ${hasClash ? "ring-2 ring-red-400 ring-offset-1" : ""}`}
  >
    {/* Header */}
    <div className="bg-slate-900/5 px-3 py-1.5 text-xs font-medium text-slate-600 flex justify-between items-center border-b border-white/20 shrink-0">
      <span className="flex items-center gap-1">
        <Clock size={12} />
        {TIME_SLOTS[slotNumber].start} – {TIME_SLOTS[slotNumber].end}
      </span>

      <span className="flex items-center gap-1 text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full text-[10px]">
        <Layers size={10} />
        {sessions.length} Sessions
      </span>
    </div>

    {/* Sessions */}
    <div className="grid grid-cols-2 gap-1 p-1.5 flex-1 bg-white/40">
      {sessions.map((session, idx) => {
        const style = getStyle(session.type);

        return (
          <div
            key={idx}
            draggable
            onDragStart={() =>
              onDragStart({ session, day, slotNumber, division, idx })
            }
            className={`relative p-1 rounded-lg ${style.card} flex flex-col justify-between group cursor-grab`}
          >
            {/* Subject */}
            <div className="font-bold text-[9px] text-slate-800 line-clamp-1">
              {(session.subject_code || "").toString().trim()
                ? `${session.subject_code} `
                : ""}
              {(session.subject_name ?? session.subject ?? "FREE")
                .toString()
                .substring(0, 10)}
            </div>

            {/* Room */}
            <div className="flex items-center gap-0.5 text-[8px] text-slate-500 mt-0.5">
              <MapPin size={8} />
              <span className="truncate">{session.room || "—"}</span>
            </div>

            {/* Hover Controls */}
            <div className="absolute inset-0 flex items-end justify-end p-1 gap-1 opacity-0 group-hover:opacity-100 transition-all">
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(session, day, slotNumber, division);
                }}
                className="w-6 h-6 bg-white text-indigo-700 rounded-full flex items-center justify-center shadow hover:bg-indigo-50"
              >
                <Edit3 size={14} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(day, slotNumber, division, session);
                }}
                className="w-6 h-6 bg-white text-red-600 rounded-full flex items-center justify-center shadow hover:bg-red-50"
              >
                <Trash2 size={14} />
              </button>

            </div>
          </div>
        );
      })}
    </div>
  </motion.div>
);

const AddSlotCard = ({ slotNumber, day, division, onAdd }) => (
  <motion.div
    whileHover={{ scale: 1.02, borderColor: "#6366f1" }}
    onClick={() => onAdd(day, slotNumber, division)}
    className="h-[120px] flex flex-col p-2 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-sm"
  >
    <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1 shrink-0">
      <Clock size={10} />
      {TIME_SLOTS[slotNumber].start} – {TIME_SLOTS[slotNumber].end}
    </div>
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-1 text-slate-300 hover:text-indigo-400 transition-colors">
        <Plus size={18} />
        <span className="text-[9px] font-medium">Add Lecture</span>
      </div>
    </div>
  </motion.div>
);

// ── Edit / Add Session Modal ──────────────────────────────────────────────────

const SessionModal = ({
  isOpen, session, day, slotNumber, division,
  onClose, onSave, mode,
  // DB-loaded lists
  facultyList: facultyListProp,
  roomsList: roomsListProp,
  subjectsList: subjectsListProp,
}) => {
  const facultyOptions = Array.isArray(facultyListProp) ? facultyListProp : [];
  const roomOptions = Array.isArray(roomsListProp) ? roomsListProp : [];
  const subjectOptions = Array.isArray(subjectsListProp) ? subjectsListProp : [];

  const [form, setForm] = useState({
    subject_id: "",
    subject_name: "",
    subject_code: "",
    type: "theory",
    faculty_id: "",
    faculty_name: "",
    room_id: "",
    room_name: "",
    batch: "",
  });
  const [moveTarget, setMoveTarget] = useState({ day: day || "Monday", slot: slotNumber || 1 });
  const [showMoveOptions, setShowMoveOptions] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setShowMoveOptions(false);
    setMoveTarget({ day: day || "Monday", slot: slotNumber || 1 });
    if (session) {
      setForm({
        subject_id: session.subject_id ?? "",
        subject_name: session.subject_name ?? session.subject ?? "",
        subject_code: session.subject_code ?? "",
        type:    session.type    || "theory",
        faculty_id: session.faculty_id ?? "",
        faculty_name: session.faculty_name ?? session.faculty ?? "",
        room_id: session.room_id ?? "",
        room_name: session.room_name ?? session.room ?? "",
        batch:   (session.batch === "Full Division" || session.batch === "-") ? "" : (session.batch || ""),
      });
    } else {
      setForm({
        subject_id: "",
        subject_name: "",
        subject_code: "",
        type: "theory",
        faculty_id: "",
        faculty_name: "",
        room_id: "",
        room_name: "",
        batch: "",
      });
    }
  }, [session, day, slotNumber, isOpen]);

  const handleSave = () => {
    if (!form.subject_id) return;
    const shouldMove = mode === "edit" && showMoveOptions &&
      (moveTarget.day !== day || moveTarget.slot !== slotNumber);
    onSave(form, moveTarget, shouldMove);
  };

  // Keep AnimatePresence OUTSIDE the null guard so exit animations work
  return (
    <AnimatePresence>
      {isOpen && (
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          key="modal-panel"
          initial={{ scale: 0.92, y: 24, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 24, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 340 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-white/50 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                {mode === "add" ? <Plus size={20} /> : <Edit3 size={20} />}
              </div>
              <div>
                <h3 className="text-xl font-bold">{mode === "add" ? "Add Lecture" : "Edit Lecture"}</h3>
                <p className="text-white/70 text-sm">{day} • {TIME_SLOTS[slotNumber]?.start} – {TIME_SLOTS[slotNumber]?.end} • Div {division}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Subject */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Subject</label>
              <div className="relative">
                <select
                  value={form.subject_id}
                  onChange={e => {
                    const selected = subjectOptions.find(s => String(s.id) === String(e.target.value));
                    setForm(f => ({
                      ...f,
                      subject_id: e.target.value,
                      subject_name: selected?.name ?? "",
                      subject_code: selected?.code ?? "",
                      type: (selected?.type ?? f.type) || "theory",
                    }));
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 appearance-none pr-8"
                >
                  <option value="">{subjectOptions.length ? "Select Subject" : "Loading subjects..."}</option>
                  {subjectOptions.map(s => (
                    <option key={s.id} value={s.id}>
                      {(s.code ? `${s.code} — ` : "") + (s.name ?? "").toString().substring(0, 30)}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Session Type</label>
              <div className="flex gap-2">
                {["theory", "lab", "test"].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                      form.type === t
                        ? t === "theory" ? "bg-blue-500 text-white shadow-lg"
                          : t === "lab" ? "bg-green-500 text-white shadow-lg"
                          : "bg-red-500 text-white shadow-lg"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Faculty */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Faculty</label>
                <div className="relative">
                  <select
                    value={form.faculty_id}
                    onChange={e => {
                      const selected = facultyOptions.find(f => String(f.id) === String(e.target.value));
                      setForm(f => ({
                        ...f,
                        faculty_id: e.target.value,
                        faculty_name: selected?.name ?? "",
                      }));
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 appearance-none pr-6"
                  >
                    <option value="">{facultyOptions.length ? "Select Faculty" : "Loading faculty..."}</option>
                    {facultyOptions.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Room */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Room</label>
                <div className="relative">
                  <select
                    value={form.room_id}
                    onChange={e => {
                      const selected = roomOptions.find(r => String(r.id) === String(e.target.value));
                      setForm(f => ({
                        ...f,
                        room_id: e.target.value,
                        room_name: selected?.name ?? "",
                      }));
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 appearance-none pr-6"
                  >
                    <option value="">{roomOptions.length ? "Select Room" : "Loading rooms..."}</option>
                    {roomOptions.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Batch */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Batch (optional)</label>
              <div className="flex gap-2">
                {["", "1", "2", "3"].map(b => (
                  <button
                    key={b}
                    onClick={() => setForm(f => ({ ...f, batch: b }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      form.batch === b
                        ? "bg-indigo-500 text-white shadow-lg"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {b === "" ? "Full Div" : `Batch ${b}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Move to different slot (edit only) */}
            {mode === "edit" && (
              <div>
                <button
                  onClick={() => setShowMoveOptions(p => !p)}
                  className="flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <RefreshCw size={12} />
                  Move to different slot
                  <ChevronDown size={12} className={`transition-transform ${showMoveOptions ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {showMoveOptions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2"
                    >
                      <div className="grid grid-cols-2 gap-2 p-3 bg-indigo-50 rounded-xl">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Day</label>
                          <select
                            value={moveTarget.day}
                            onChange={e => setMoveTarget(t => ({ ...t, day: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"
                          >
                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Slot</label>
                          <select
                            value={moveTarget.slot}
                            onChange={e => setMoveTarget(t => ({ ...t, slot: Number(e.target.value) }))}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"
                          >
                            {[1, 2, 3, 5, 6, 7, 8].map(s => (
                              <option key={s} value={s}>{TIME_SLOTS[s].start} – {TIME_SLOTS[s].end}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleSave}
              disabled={!form.subject}
              className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              {mode === "edit" && showMoveOptions ? "Save & Move" : mode === "add" ? "Add Lecture" : "Save Changes"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )}
    </AnimatePresence>
  );
};

// ── Single Division Timetable Grid ────────────────────────────────────────────

const DivisionGrid = ({
  division, timetable, clashes, currentTime,
  onAdd, onEdit, onDelete,
  dragSource, setDragSource, dragTarget, setDragTarget, onDropComplete,
}) => {
  const getSessionsForDay = useCallback((day) => {
    if (!timetable || !timetable[day]) return {};
    const sessions = timetable[day][division] || [];
    const grouped = {};
    sessions.forEach(session => {
      const slot = session.slot;
      if (!grouped[slot]) grouped[slot] = [];
      grouped[slot].push(session);
    });
    return grouped;
  }, [timetable, division]);

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

  const isClashSlot = useCallback((day, slotNumber) => {
    return clashes.some(c => c.day === day && c.slot === slotNumber);
  }, [clashes]);

  const stats = computeStats(timetable, division);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden">
      {/* Division header */}
      <div className={`px-6 py-4 flex items-center justify-between bg-gradient-to-r ${
        division === "A"
          ? "from-indigo-500 to-violet-600"
          : "from-emerald-500 to-teal-600"
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-xl">{division}</span>
          </div>
          <div>
            <h2 className="text-white font-black text-2xl">Division {division}</h2>
            <p className="text-white/70 text-xs">{stats.theory} Theory • {stats.lab} Labs • {stats.test} Tests</p>
          </div>
        </div>
        {clashes.filter(c => {
          // Check if clash involves this division
          return c.message.includes("Div") ? c.message.includes(`Div ${division}`) : true;
        }).length > 0 && (
          <div className="flex items-center gap-2 bg-red-500/80 text-white px-3 py-1.5 rounded-full text-xs font-bold">
            <AlertTriangle size={12} />
            {clashes.length} Clash{clashes.length > 1 ? "es" : ""}
          </div>
        )}
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-5 gap-px bg-slate-200/50">
        {DAYS.map((day, index) => {
          const sessionCount = Object.values(getSessionsForDay(day))
            .flat()
            .filter(s => s.type !== "break" && s.type !== "zero").length;
          const isToday = index === new Date().getDay() - 1;
          return (
            <div
              key={day}
              className={`bg-white/80 p-4 ${isToday ? "bg-gradient-to-br from-yellow-50 to-amber-50" : ""}`}
            >
              <div className="flex items-center gap-2">
                {isToday ? <Sun className="text-yellow-500" size={18} /> : <Moon className="text-slate-400" size={18} />}
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{day}</h3>
                  <p className="text-[10px] text-slate-500">{sessionCount} sessions</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slot rows */}
      <div className="grid grid-cols-5 gap-px bg-slate-200/50">
        {DAYS.map(day => {
          const groupedSessions = getSessionsForDay(day);
          return (
            <div key={day} className="bg-white/80 p-3 min-h-[700px]">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(slotNumber => {
                  if (slotNumber === BREAK_SLOT) return <BreakCard key={slotNumber} />;

                  const sessions = groupedSessions[slotNumber] || [];
                  const isCurrent = isCurrentSession(day, slotNumber);
                  const hasClash = isClashSlot(day, slotNumber);
                  const isDragging = dragSource?.day === day && dragSource?.slotNumber === slotNumber && dragSource?.division === division;
                  const isDropTarget = dragTarget?.day === day && dragTarget?.slotNumber === slotNumber && dragTarget?.division === division;

                  const commonProps = {
                    day, slotNumber, division, isCurrent, hasClash,
                    onEdit, onDelete,
                    onDragStart: setDragSource,
                    onDragOver: setDragTarget,
                    onDrop: onDropComplete,
                    isDragging,
                  };

                  return (
                    <div
                      key={slotNumber}
                      className={`relative ${isDropTarget && !isDragging ? "ring-2 ring-indigo-400 ring-offset-1 rounded-xl" : ""}`}
                    >
                      {sessions.length === 0 ? (
                        <AddSlotCard
                          slotNumber={slotNumber}
                          day={day}
                          division={division}
                          onAdd={onAdd}
                        />
                      ) : sessions.length > 1 ? (
                        <AdminSplitCard sessions={sessions} {...commonProps} />
                      ) : (
                        <AdminSessionCard session={sessions[0]} {...commonProps} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Main Admin Timetable Component ────────────────────────────────────────────

const AdminTimetableComponent = () => {
  const [timetable, setTimetable]             = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [loadingState, setLoadingState]       = useState("loading");
  const [saving, setSaving]                   = useState(false);
  const [saveSuccess, setSaveSuccess]         = useState(false);
  const [generating, setGenerating]           = useState(false);
  const [currentTime, setCurrentTime]         = useState(new Date());
  const [error, setError]                     = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sideAnimationIndex, setSideAnimationIndex] = useState(0);
  const [showSideAnimation, setShowSideAnimation]   = useState(true);

  // DB-loaded dropdown lists for the modal
  const [facultyList, setFacultyList]         = useState([]);
  const [roomsList, setRoomsList]             = useState([]);
  const [subjectsList, setSubjectsList]       = useState([]);

  // Modal state
  const [modalOpen, setModalOpen]             = useState(false);
  const [modalMode, setModalMode]             = useState("add"); // "add" | "edit"
  const [modalSession, setModalSession]       = useState(null);
  const [modalDay, setModalDay]               = useState(null);
  const [modalSlot, setModalSlot]             = useState(null);
  const [modalDivision, setModalDivision]     = useState(null);

  // Drag state
  const [dragSource, setDragSource]           = useState(null);
  const [dragTarget, setDragTarget]           = useState(null);

  // Clash panel
  const [showClashPanel, setShowClashPanel]   = useState(false);

  const hasInitiallyLoaded = useRef(false);

  const clashes = useMemo(() => timetable ? detectClashes(timetable) : [], [timetable]);

  // Fetch timetable
  const fetchTimetable = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { setError("Please login"); setLoadingState("error"); return; }
      const [resA, resB] = await Promise.all([
        fetch(`http://localhost:5000/api/timetable?division=A`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://localhost:5000/api/timetable?division=B`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const dataA = await resA.json();
      const dataB = await resB.json();
      if (dataA.success && dataB.success) {
        const merged = {};
        for (const day of DAYS) {
          merged[day] = { A: dataA.data[day]?.A || [], B: dataB.data[day]?.B || [] };
        }
        setTimetable(merged);
      } else {
        setError("Failed to load timetable");
      }
    } catch (err) {
      setError(err.message || "Error loading timetable");
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

      await fetchTimetable();

      // Fetch dropdown data for modal (DB-backed)
      const token2 = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token2}` };
      Promise.all([
        fetch("http://localhost:5000/api/timetable/faculty/all",   { headers }).then(r => r.json()).catch(() => null),
        fetch("http://localhost:5000/api/timetable/rooms/all",     { headers }).then(r => r.json()).catch(() => null),
        fetch("http://localhost:5000/api/timetable/subjects/all",  { headers }).then(r => r.json()).catch(() => null),
      ]).then(([facData, roomData, subData]) => {
        if (facData?.success  && Array.isArray(facData.data))  setFacultyList(facData.data);
        if (roomData?.success && Array.isArray(roomData.data)) setRoomsList(roomData.data);
        if (subData?.success  && Array.isArray(subData.data))  setSubjectsList(subData.data);
      });

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

  // Auto Generate
  const handleAutoGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/timetable/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ semester: "even", year: 2026 }),
      });
      const data = await response.json();
      if (data.success) {
        setTimetable(data.data);
        setHasUnsavedChanges(true);
      }
    } catch (err) {
      console.error("Auto-generate error:", err);
    } finally {
      setGenerating(false);
    }
  }, []);

  // Save to DB
  const handleSave = useCallback(async () => {
    if (!timetable || clashes.length > 0) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/timetable/save", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ timetable }),
      });
      const data = await response.json();
      if (data.success) {
        setSaveSuccess(true);
        setHasUnsavedChanges(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  }, [timetable, clashes]);

  // Add session
  const handleAdd = useCallback((day, slotNumber, division) => {
    setModalMode("add");
    setModalSession(null);
    setModalDay(day);
    setModalSlot(slotNumber);
    setModalDivision(division);
    setModalOpen(true);
  }, []);

  // Edit session
  const handleEdit = useCallback((session, day, slotNumber, division) => {
    setModalMode("edit");
    setModalSession(session);
    setModalDay(day);
    setModalSlot(slotNumber);
    setModalDivision(division);
    setModalOpen(true);
  }, []);

  // Delete session
  const handleDelete = useCallback((day, slotNumber, division, session) => {
    setTimetable(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const sessions = next[day][division];
      next[day][division] = sessions.filter(s =>
        !(s.slot === slotNumber && s.subject === session.subject && s.faculty === session.faculty)
      );
      return next;
    });
    setHasUnsavedChanges(true);
  }, []);

  // Save modal
  const handleModalSave = useCallback((form, moveTarget, shouldMove) => {
    setTimetable(prev => {
      const next = JSON.parse(JSON.stringify(prev));

      if (modalMode === "edit") {
        // Remove from original slot
        next[modalDay][modalDivision] = next[modalDay][modalDivision].filter(s =>
          !(String(s.id ?? "") && String(modalSession?.id ?? "") && String(s.id) === String(modalSession.id)) &&
          !(s.slot === modalSlot && (s.subject_id ?? s.subject) === (modalSession.subject_id ?? modalSession.subject))
        );
        // Add to target slot (same or moved)
        const targetDay = shouldMove ? moveTarget.day : modalDay;
        const targetSlot = shouldMove ? moveTarget.slot : modalSlot;
        if (!next[targetDay]) next[targetDay] = {};
        if (!next[targetDay][modalDivision]) next[targetDay][modalDivision] = [];
        next[targetDay][modalDivision].push({
          ...modalSession,
          ...form,
          slot: targetSlot,
          day: targetDay,
          division: modalDivision,
          subject: form.subject_name,
          faculty: form.faculty_name,
          room: form.room_name,
        });
      } else {
        // Add new
        if (!next[modalDay]) next[modalDay] = {};
        if (!next[modalDay][modalDivision]) next[modalDay][modalDivision] = [];
        next[modalDay][modalDivision].push({
          ...form,
          slot: modalSlot,
          day: modalDay,
          division: modalDivision,
          subject: form.subject_name,
          faculty: form.faculty_name,
          room: form.room_name,
        });
      }
      return next;
    });
    setHasUnsavedChanges(true);
    setModalOpen(false);
  }, [modalMode, modalDay, modalSlot, modalDivision, modalSession]);

  // Drag drop
  const handleDropComplete = useCallback((target) => {
    if (!dragSource || !target) return;
    if (dragSource.day === target.day && dragSource.slotNumber === target.slotNumber && dragSource.division === target.division) return;
    if (target.slotNumber === BREAK_SLOT) return;

    setTimetable(prev => {
      const next = JSON.parse(JSON.stringify(prev));

      const srcList = next?.[dragSource.day]?.[dragSource.division] ?? [];
      const tgtList = next?.[target.day]?.[target.division] ?? [];

      const isSameCell =
        dragSource.day === target.day &&
        dragSource.slotNumber === target.slotNumber &&
        dragSource.division === target.division;
      if (isSameCell) return prev;

      const srcAtSlot = srcList.filter(s => s.slot === dragSource.slotNumber && s.type !== "break");
      const tgtAtSlot = tgtList.filter(s => s.slot === target.slotNumber && s.type !== "break");

      const matchById = (a, b) => String(a?.id ?? "") && String(b?.id ?? "") && String(a.id) === String(b.id);
      const removeSession = (arr, sess) =>
        arr.filter(s => !matchById(s, sess) && !(s.slot === sess.slot && (s.subject_id ?? s.subject) === (sess.subject_id ?? sess.subject)));

      const srcSession = dragSource.session;

      // If target slot is empty -> move. If target has exactly 1 session and source slot has exactly 1 -> swap.
      if (tgtAtSlot.length === 0) {
        next[dragSource.day][dragSource.division] = removeSession(srcList, { ...srcSession, slot: dragSource.slotNumber });
        if (!next[target.day]) next[target.day] = {};
        if (!next[target.day][target.division]) next[target.day][target.division] = [];
        next[target.day][target.division].push({
          ...srcSession,
          slot: target.slotNumber,
          day: target.day,
          division: target.division,
        });
      } else if (tgtAtSlot.length === 1 && srcAtSlot.length === 1) {
        const tgtSession = tgtAtSlot[0];

        next[dragSource.day][dragSource.division] = removeSession(srcList, { ...srcSession, slot: dragSource.slotNumber });
        next[target.day][target.division] = removeSession(tgtList, { ...tgtSession, slot: target.slotNumber });

        // Place swapped sessions
        next[dragSource.day][dragSource.division].push({
          ...tgtSession,
          slot: dragSource.slotNumber,
          day: dragSource.day,
          division: dragSource.division,
        });
        next[target.day][target.division].push({
          ...srcSession,
          slot: target.slotNumber,
          day: target.day,
          division: target.division,
        });
      } else {
        // Complex slots (multiple sessions) are not swapped to avoid corruption
        return prev;
      }
      return next;
    });
    setHasUnsavedChanges(true);
    setDragSource(null);
    setDragTarget(null);
  }, [dragSource]);

  // ── Loading / Error ────────────────────────────────────────────────────────

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
            {loadingState === "loading" ? "Loading Admin Panel" : "Taking Too Long?"}
          </h2>
          <p className="text-slate-400 text-sm">
            {loadingState === "loading"
              ? "Fetching both divisions for admin view..."
              : "We're having trouble connecting. Please refresh."}
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="w-64 h-64">
          <Lottie animationData={errorAnimation} loop className="w-full h-full" />
        </motion.div>
        <h3 className="text-2xl font-bold text-slate-700 mt-6 mb-2">Oops! Something went wrong</h3>
        <p className="text-slate-400 text-sm">{error}</p>
      </div>
    );
  }

  // ── Main Admin View ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/30 px-6 py-6">
      <div className="w-full space-y-6">

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, type: "spring" }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <motion.div className="flex items-center gap-3" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="p-3 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-lg">
                <Shield className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Timetable
                </h1>
                <p className="text-slate-500 flex items-center gap-2 text-sm">
                  <Sparkles size={14} className="text-yellow-500" />
                  Computer Engineering • Even Semester • 2026 • Both Divisions
                </p>
              </div>
            </motion.div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Clash indicator */}
              {clashes.length > 0 && (
                <motion.button
                  onClick={() => setShowClashPanel(p => !p)}
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                >
                  <AlertTriangle size={16} />
                  {clashes.length} Clash{clashes.length > 1 ? "es" : ""}
                </motion.button>
              )}
              {clashes.length === 0 && timetable && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 text-green-600 rounded-xl font-bold text-sm">
                  <CheckCircle size={16} />
                  No Clashes
                </div>
              )}

              {/* Auto Generate */}
              <motion.button
                whileHover={{ scale: generating ? 1 : 1.03 }} whileTap={{ scale: generating ? 1 : 0.97 }}
                onClick={handleAutoGenerate}
                disabled={generating}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-shadow disabled:opacity-80"
              >
                {generating ? (
                  <><RefreshCw size={16} className="animate-spin" /> Generating...</>
                ) : (
                  <><Zap size={16} /> Auto Generate</>
                )}
              </motion.button>

              {/* Save */}
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges || clashes.length > 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all ${
                  saveSuccess
                    ? "bg-green-500 text-white"
                    : hasUnsavedChanges && clashes.length === 0
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-xl"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {saving ? (
                  <><RefreshCw size={16} className="animate-spin" /> Saving...</>
                ) : saveSuccess ? (
                  <><CheckCircle size={16} /> Saved!</>
                ) : (
                  <><Save size={16} /> Save Changes</>
                )}
              </motion.button>
            </div>
          </div>

          {/* Unsaved changes banner */}
          <AnimatePresence>
            {hasUnsavedChanges && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  clashes.length > 0
                    ? "bg-red-50 border border-red-200 text-red-600"
                    : "bg-amber-50 border border-amber-200 text-amber-700"
                }`}>
                  {clashes.length > 0 ? (
                    <><AlertTriangle size={14} /> Resolve {clashes.length} clash{clashes.length > 1 ? "es" : ""} before saving</>
                  ) : (
                    <><Edit3 size={14} /> You have unsaved changes — click Save Changes to push to database</>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Clash Panel */}
        <AnimatePresence>
          {showClashPanel && clashes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-red-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold">
                  <AlertTriangle size={18} />
                  Schedule Clashes ({clashes.length})
                </div>
                <button onClick={() => setShowClashPanel(false)} className="text-white/70 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {clashes.map((clash, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${clash.type === "room" ? "bg-orange-500" : "bg-red-500"}`} />
                    <div>
                      <p className="text-xs font-bold text-red-700 uppercase tracking-wide">{clash.type} clash</p>
                      <p className="text-sm text-slate-700 mt-0.5">{clash.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Division A & B — wrapped in relative container for generating overlay */}
        <div className="relative">
          {/* Inline generating overlay — only covers the grids, not full screen */}
          <AnimatePresence>
            {generating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-6"
              >
                <div className="flex items-center gap-8">
                  <div className="w-48 h-48">
                    <Lottie animationData={mainAnimation} loop className="w-full h-full" />
                  </div>
                  <div className="relative w-36 h-36">
                    <AnimatePresence mode="wait">
                      {showSideAnimation && (
                        <motion.div
                          key={sideAnimationIndex}
                          initial={{ opacity: 0, x: 30, scale: 0.9 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -30, scale: 0.9 }}
                          transition={{ duration: 0.35 }}
                          className="absolute inset-0"
                        >
                          <Lottie animationData={sideAnimationIndex === 0 ? sideAnimation1 : sideAnimation2} loop className="w-full h-full" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-center"
                >
                  <p className="text-xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Auto-Generating Timetable
                  </p>
                  <p className="text-sm text-slate-400 mt-1">Optimizing schedules for both divisions...</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Division A Timetable */}
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <DivisionGrid
              division="A"
              timetable={timetable}
              clashes={clashes}
              currentTime={currentTime}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              dragSource={dragSource}
              setDragSource={setDragSource}
              dragTarget={dragTarget}
              setDragTarget={setDragTarget}
              onDropComplete={handleDropComplete}
            />
          </motion.div>

          {/* Division B Timetable */}
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          >
            <DivisionGrid
              division="B"
              timetable={timetable}
              clashes={clashes}
              currentTime={currentTime}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              dragSource={dragSource}
              setDragSource={setDragSource}
              dragTarget={dragTarget}
              setDragTarget={setDragTarget}
            onDropComplete={handleDropComplete}
            />
          </motion.div>
        </div>{/* end relative wrapper */}

        {/* Legend */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/50"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              {[
                { color: "bg-blue-500",   label: "Theory" },
                { color: "bg-green-500",  label: "Lab" },
                { color: "bg-red-500",    label: "Test" },
                { color: "bg-yellow-500", label: "Break" },
                { color: "bg-indigo-500", label: "Split Session", icon: Layers },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color} shadow-lg`} />
                  <span className="text-sm text-slate-600">{item.label}</span>
                  {item.icon && <item.icon size={14} className="text-indigo-500" />}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <GripVertical size={14} className="text-slate-400" />
                Drag sessions to move them
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-white/50 px-3 py-1.5 rounded-full">
                <Clock size={16} className="text-indigo-500" />
                <span>{currentTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Session Modal */}
      <SessionModal
        isOpen={modalOpen}
        session={modalSession}
        day={modalDay}
        slotNumber={modalSlot}
        division={modalDivision}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
        facultyList={facultyList}
        roomsList={roomsList}
        subjectsList={subjectsList}
      />
    </div>
  );
};

export default AdminTimetableComponent;