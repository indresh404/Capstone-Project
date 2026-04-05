import React, {
  useState, useEffect, useCallback, useMemo, memo, useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, MapPin, GraduationCap, Coffee, Layers, Sun, Moon,
  Plus, Save, Zap, AlertTriangle, CheckCircle, Edit3, Trash2,
  ChevronDown, GripVertical, RefreshCw, Shield, X, Sparkles,
} from "lucide-react";

import LottieComponent from "lottie-react";
const Lottie = LottieComponent.default ?? LottieComponent;

import mainAnimation from "../../assets/tt_loading_main.json";
import sideAnimation1 from "../../assets/tt_loading1.json";
import sideAnimation2 from "../../assets/tt_loading2.json";
import errorAnimation from "../../assets/tt_error.json";

// ─────────────────────────── Constants ───────────────────────────────────────

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const TIME_SLOTS = {
  1: { start: "09:15", end: "10:15", name: "Slot 1" },
  2: { start: "10:15", end: "11:15", name: "Slot 2" },
  3: { start: "11:15", end: "12:15", name: "Slot 3" },
  4: { start: "12:15", end: "12:45", name: "Break",  isBreak: true },
  5: { start: "12:45", end: "13:45", name: "Slot 5" },
  6: { start: "13:45", end: "14:45", name: "Slot 6" },
  7: { start: "14:45", end: "15:45", name: "Slot 7" },
  8: { start: "15:45", end: "16:45", name: "Slot 8" },
};

const ALL_SLOTS     = [1, 2, 3, 4, 5, 6, 7, 8];
const SESSION_SLOTS = [1, 2, 3, 5, 6, 7, 8];
const BREAK_SLOT    = 4;

// ── Slot dimensions ──────────────────────────────────────────────────────────
const SLOT_H  = 148;  // px — session card height (increased from 96)
const BREAK_H = 125;   // px — break card height

// ─────────────────────────── Type Styles ─────────────────────────────────────

const TYPE_CFG = {
  theory: { border: "#3b82f6", bg: "linear-gradient(135deg,#eff6ff 0%,#e0e7ff 100%)", text: "#1d4ed8", badge: "#dbeafe", badgeText: "#1e40af" },
  lab:    { border: "#22c55e", bg: "linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)", text: "#15803d", badge: "#dcfce7", badgeText: "#166534" },
  test:   { border: "#ef4444", bg: "linear-gradient(135deg,#fef2f2 0%,#fee2e2 100%)", text: "#dc2626", badge: "#fee2e2", badgeText: "#991b1b" },
  break:  { border: "#f59e0b", bg: "linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%)", text: "#b45309", badge: "#fef3c7", badgeText: "#92400e" },
  _:      { border: "#94a3b8", bg: "linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)", text: "#475569", badge: "#f1f5f9", badgeText: "#334155" },
};

const tc = (type) => TYPE_CFG[type?.toLowerCase()] ?? TYPE_CFG["_"];

// ─────────────────────────── Auth ────────────────────────────────────────────

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

// ─────────────────────────── Clash Detection ─────────────────────────────────

function detectClashes(tt) {
  const clashes = [];
  for (const day of DAYS) {
    for (let slot = 1; slot <= 8; slot++) {
      if (slot === BREAK_SLOT) continue;
      const all = [
        ...(tt[day]?.A ?? []).filter(s => s.slot === slot),
        ...(tt[day]?.B ?? []).filter(s => s.slot === slot),
      ];
      const rooms = all.map(s => s.room).filter(Boolean);
      rooms.forEach((r, i) => {
        if (rooms.indexOf(r) !== i) {
          const k = `room-${day}-${slot}-${r}`;
          if (!clashes.find(c => c.key === k))
            clashes.push({ key: k, day, slot, type: "room", message: `Room ${r} double-booked · ${day} Slot ${slot}` });
        }
      });
      const facs = all.map(s => s.faculty).filter(f => f && f !== "NULL" && f !== "-");
      facs.forEach((f, i) => {
        if (facs.indexOf(f) !== i) {
          const k = `fac-${day}-${slot}-${f}`;
          if (!clashes.find(c => c.key === k))
            clashes.push({ key: k, day, slot, type: "faculty", message: `${f} double-booked · ${day} Slot ${slot}` });
        }
      });
    }
  }
  return clashes;
}

function roomConflict(tt, room, day, slot, excludeId) {
  if (!room || !tt) return null;
  for (const div of ["A", "B"])
    for (const s of (tt[day]?.[div] ?? []).filter(x => x.slot === slot)) {
      if (excludeId && String(s.id) === String(excludeId)) continue;
      if (s.room === room) return `Room "${room}" already booked (Div ${div}: ${s.subject_name ?? s.subject})`;
    }
  return null;
}

function facConflict(tt, fac, day, slot, excludeId) {
  if (!fac || fac === "-" || !tt) return null;
  for (const div of ["A", "B"])
    for (const s of (tt[day]?.[div] ?? []).filter(x => x.slot === slot)) {
      if (excludeId && String(s.id) === String(excludeId)) continue;
      if (s.faculty === fac) return `${fac} already assigned (Div ${div}: ${s.subject_name ?? s.subject})`;
    }
  return null;
}

// ─────────────────────────── Stats ───────────────────────────────────────────

function computeStats(tt, division) {
  let theory = 0, lab = 0, test = 0;
  for (const day of DAYS)
    for (const s of (tt?.[day]?.[division] ?? []))
      s.type === "theory" ? theory++ : s.type === "lab" ? lab++ : s.type === "test" ? test++ : null;
  return { theory, lab, test, total: theory + lab + test };
}

// ─────────────────────────── Toast ───────────────────────────────────────────

const Toast = memo(({ toasts, onRemove }) => (
  <div className="fixed top-4 right-4 z-[200] space-y-2 pointer-events-none">
    <AnimatePresence>
      {toasts.map(t => (
        <motion.div key={t.id}
          initial={{ opacity: 0, x: 60, scale: 0.9 }}
          animate={{ opacity: 1, x: 0,  scale: 1   }}
          exit  ={{ opacity: 0, x: 60, scale: 0.9 }}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-sm font-semibold pointer-events-auto max-w-sm ${
            t.type === "error"   ? "bg-red-50   border-red-200   text-red-700"   :
            t.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-700" :
                                   "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}
        >
          {t.type === "error" || t.type === "warning"
            ? <AlertTriangle size={15} className="shrink-0" />
            : <CheckCircle size={15} className="shrink-0" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="hover:opacity-60 ml-1"><X size={13} /></button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
));

// ─────────────────────────── Break Card ──────────────────────────────────────

const BreakCard = () => (
  <div
    style={{ height: BREAK_H }}
    className="
      rounded-2xl overflow-hidden
      bg-white border border-yellow-200
      shadow-sm hover:shadow-md
      transition-all duration-200 ease-out
      flex flex-col shrink-0
      w-full
    "
  >
    {/* HEADER */}
    <div className="
      flex items-center justify-between
      px-3 py-1.5
      text-xs font-semibold text-slate-500
      bg-yellow-50 border-b
    ">
      <span className="flex items-center gap-1">
        <Clock size={12} className="text-slate-400" />
        {TIME_SLOTS[BREAK_SLOT].start} – {TIME_SLOTS[BREAK_SLOT].end}
      </span>

      <span className="
        flex items-center gap-1
        text-[10px] font-bold
        text-yellow-700 bg-yellow-100
        px-2 py-0.5 rounded-full
      ">
        <Coffee size={10} /> BREAK
      </span>
    </div>

    {/* BODY */}
    <div className="
      flex-1 flex items-center justify-center
      bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50
      relative group
    ">
      {/* subtle hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-200 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="relative flex flex-col items-center gap-1.5">
        <div className="
          p-2 rounded-xl
          bg-yellow-100
          group-hover:bg-yellow-200
          transition
        ">
          <Coffee size={18} className="text-yellow-600" />
        </div>

        <span className="text-sm font-semibold text-yellow-700 tracking-wide">
          Lunch Break
        </span>

        <span className="text-[10px] text-yellow-500 font-medium">
          30 min
        </span>
      </div>
    </div>
  </div>
);
// ─────────────────────────── Session Card ────────────────────────────────────

const SessionCard = memo(({
  session, day, slotNumber, division, isCurrent, hasClash,
  onEdit, onDelete, onDragStart, onDragOver, onDrop, isDragging, dragTarget,
  absentFaculty = [], // ADD default value to prevent undefined
}) => {
  const cfg = tc(session.type);
  const isDropTarget = dragTarget?.day === day && dragTarget?.slotNumber === slotNumber && dragTarget?.division === division;

  return (
    <div
      draggable
      onDragStart={e => {
        if (e.target.closest("button")) { e.preventDefault(); return; }
        e.dataTransfer.effectAllowed = "move";
        onDragStart({ session, day, slotNumber, division });
      }}
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; onDragOver({ day, slotNumber, division }); }}
      onDrop={e => { e.preventDefault(); onDrop({ day, slotNumber, division }); }}
      style={{
        height: SLOT_H,
        borderLeft: `4px solid ${cfg.border}`,
        background: isDropTarget ? "#eef2ff" : cfg.bg,
        opacity: isDragging ? 0.35 : 1,
        outline: isDropTarget
          ? "2.5px solid #818cf8"
          : isCurrent
            ? "2.5px solid #6366f1"
            : hasClash
              ? "2.5px solid #f87171"
              : "none",
        outlineOffset: 2,
        boxShadow: isCurrent
          ? "0 0 0 3px rgba(99,102,241,0.15), 0 4px 16px rgba(0,0,0,0.10)"
          : "0 2px 8px rgba(0,0,0,0.06)",
      }}
      className="relative rounded-xl overflow-hidden cursor-grab active:cursor-grabbing shrink-0 select-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* ── Header strip ── */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical size={13} className="text-slate-300 shrink-0" />
          <span className="text-xs font-semibold text-slate-400 tabular-nums">
            {TIME_SLOTS[slotNumber].start} – {TIME_SLOTS[slotNumber].end}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasClash && (
            <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={9} />CLASH
            </span>
          )}
          <span
            style={{ background: cfg.badge, color: cfg.badgeText }}
            className="text-[11px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide"
          >
            {session.type}
          </span>
        </div>
      </div>

      {/* ── Subject ── */}
      <div className="px-3 pb-1.5">
        {session.subject_code?.toString().trim() && (
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-0.5">
            {session.subject_code}
          </div>
        )}
        <div style={{ color: cfg.text }} className="text-sm font-bold leading-snug line-clamp-2">
          {session.subject_name ?? session.subject ?? "FREE"}
        </div>
      </div>

      {/* ── Details ── */}
      <div className="absolute bottom-2.5 left-3 right-11 flex flex-col gap-1.5">
        {session.batch && session.batch !== "NULL" && session.batch !== "-" && (
          <span className="w-max text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-600">
            Batch {session.batch}
          </span>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {session.faculty && session.faculty !== "NULL" && session.faculty !== "-" && (
            <div className={`flex items-center gap-1 text-xs font-semibold bg-white/80 px-2 py-0.5 rounded-lg shadow-sm border border-white/60 ${
              absentFaculty?.includes(session.faculty_id) ? "bg-red-100 text-red-700 border-red-200" : "text-slate-600"
            }`}>
              <GraduationCap size={12} className="text-indigo-400 shrink-0" />
              <span className="truncate max-w-[80px]">{session.faculty}</span>
            </div>
          )}
          {session.room && (
            <div className="flex items-center gap-1 text-xs text-slate-600 font-semibold bg-white/80 px-2 py-0.5 rounded-lg shadow-sm border border-white/60">
              <MapPin size={12} className="text-rose-400 shrink-0" />
              <span className="truncate max-w-[52px]">{session.room}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="absolute top-8 right-2 flex flex-col gap-1.5 z-[9999]">
        {/* EDIT */}
        <button
          onClick={e => {
            e.stopPropagation();
            onEdit(session, day, slotNumber, division);
          }}
          className="relative z-[9999] w-9 h-9 rounded-xl bg-white !opacity-100 border border-slate-300 flex items-center justify-center shadow-xl hover:bg-indigo-50 hover:border-indigo-300 hover:scale-110 active:scale-95 transition-all duration-150"
          title="Edit"
        >
          <span className="flex items-center justify-center">
            <Edit3 size={16} color="#475569" />
          </span>
        </button>

        {/* DELETE */}
        <button
          onClick={e => {
            e.stopPropagation();
            onDelete(day, slotNumber, division, session);
          }}
          className="relative z-[9999] w-9 h-9 rounded-xl bg-white !opacity-100 border border-slate-300 flex items-center justify-center shadow-xl hover:bg-red-50 hover:border-red-300 hover:scale-110 active:scale-95 transition-all duration-150"
          title="Delete"
        >
          <span className="flex items-center justify-center">
            <Trash2 size={16} color="#e11d48" />
          </span>
        </button>
      </div>

      {/* ── Live dot ── */}
      {isCurrent && (
        <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-md border-2 border-white" />
      )}

      {/* ── Drop overlay ── */}
      {isDropTarget && (
        <div className="absolute inset-0 flex items-center justify-center bg-indigo-100/80 rounded-xl z-10 backdrop-blur-[2px]">
          <span className="text-sm font-bold text-indigo-700 bg-white px-3 py-1.5 rounded-full shadow-lg">Swap here</span>
        </div>
      )}
    </div>
  );
}, (p, n) =>
  p.session   === n.session   &&
  p.isCurrent === n.isCurrent &&
  p.hasClash  === n.hasClash  &&
  p.isDragging=== n.isDragging &&
  p.dragTarget=== n.dragTarget &&
  p.absentFaculty === n.absentFaculty
);

// ─────────────────────────── Split Card ──────────────────────────────────────

const SplitCard = memo(({
  sessions, day, slotNumber, division, hasClash,
  onEdit, onDelete, onDragStart, onDragOver, onDrop, dragTarget,absentFaculty = [],
}) => {

  const isDropTarget =
    dragTarget?.day === day &&
    dragTarget?.slotNumber === slotNumber &&
    dragTarget?.division === division;

  return (
    <div
      style={{
        height: SLOT_H,
        outline: hasClash
          ? "2.5px solid #f87171"
          : isDropTarget
          ? "2.5px solid #818cf8"
          : "none",
        outlineOffset: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      onDragOver={e => {
        e.preventDefault();
        onDragOver({ day, slotNumber, division });
      }}
      onDrop={e => {
        e.preventDefault();
        onDrop({ day, slotNumber, division });
      }}
      className="relative isolate rounded-xl overflow-visible bg-white border border-slate-200 shrink-0"
    >

      {/* HEADER */}
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1 border-b border-slate-100 shrink-0">
        <Clock size={12} className="text-slate-400" />
        <span className="text-xs font-semibold text-slate-400 tabular-nums">
          {TIME_SLOTS[slotNumber].start} – {TIME_SLOTS[slotNumber].end}
        </span>

        <span className="ml-auto flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">
          <Layers size={10} /> {sessions.length} Split
        </span>
      </div>

      {/* SPLIT ITEMS */}
      <div className="grid grid-cols-2 gap-0.5 p-2" style={{ height: SLOT_H - 32 }}>
        {sessions.map((s, i) => {
          const cfg = tc(s.type);

          return (
            <div
              key={s.id ?? i}
              draggable
              onDragStart={e => {
                if (e.target.closest("button")) {
                  e.preventDefault();
                  return;
                }
                e.dataTransfer.effectAllowed = "move";
                onDragStart({ session: s, day, slotNumber, division, idx: i });
              }}
              style={{
                borderLeft: `3px solid ${cfg.border}`,
                background: cfg.bg,
              }}
              className="relative isolate rounded-lg p-1 flex flex-col cursor-grab overflow-visible"
            >

              {/* SUBJECT */}
              {s.subject_code?.toString().trim() && (
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-0.5">
                  {s.subject_code}
                </div>
              )}

              <div
                style={{ color: cfg.text }}
                className="text-xs font-bold leading-tight line-clamp-2"
              >
                {s.subject_name ?? s.subject}
              </div>

              {/* DETAILS */}
              <div className="relative items-center gap-1 mt-auto flex-wrap pt-1">
                {s.room && (
                  <div className="flex items-center gap-0.5 text-[10px] text-slate-500 font-medium">
                    <MapPin size={9} className="text-rose-400" />
                    {s.room}
                  </div>
                )}

                {s.faculty && s.faculty !== "NULL" && s.faculty !== "-" && (
                  <div className={`flex items-center gap-0.5 text-[10px] font-medium ${
                    absentFaculty.includes(s.faculty_id) ? "text-red-600 font-bold" : "text-slate-500"
                  }`}>
                    <GraduationCap size={9} className="text-rose-400" />
                    <span className="truncate max-w-[60px]">{s.faculty}</span>
                  </div>
                )}

                {s.batch && s.batch !== "NULL" && (
                  <span className="text-[9px] font-black text-indigo-500">
                    {s.batch} Batch
                  </span>
                )}
              </div>

              {/* 🔥 ACTION BUTTONS (FINAL FIX) */}
              <div className="absolute top-12 right-1 flex flex-col gap-0.5 z-[9999] pointer-events-auto">

                {/* EDIT */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onEdit(s, day, slotNumber, division);
                  }}
                  className=" 
                    relative z-[9999]
                    w-6 h-6 rounded-xl
                    bg-white !opacity-100
                    border border-slate-300
                    flex items-center justify-center
                    shadow-xl
                    hover:bg-red-50 hover:border-red-300
                    hover:scale-110 active:scale-95
                    transition-all duration-150
                  "
                >
                  <span className="flex items-center justify-center">
                    <Edit3 size={10} color="#475569" />
                  </span>
                </button>

                {/* DELETE */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onDelete(day, slotNumber, division, s);
                  }}
                  className="
                    relative z-[9999]
                    w-6 h-6 rounded-xl
                    bg-white !opacity-100
                    border border-slate-300
                    flex items-center justify-center
                    shadow-xl
                    hover:bg-red-50 hover:border-red-300
                    hover:scale-110 active:scale-95
                    transition-all duration-150
                  "
                >
                  <span className="flex items-center justify-center">
                    <Trash2 size={12} color="#e11d48" />
                  </span>
                </button>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}, (p, n) =>
  p.sessions === n.sessions &&
  p.hasClash === n.hasClash &&
  p.dragTarget === n.dragTarget
);
// ─────────────────────────── Empty Slot Card ─────────────────────────────────

const EmptyCard = memo(({ day, slotNumber, division, onAdd, onDragOver, onDrop, dragTarget }) => {
  const isDropTarget = dragTarget?.day === day && dragTarget?.slotNumber === slotNumber && dragTarget?.division === division;
  return (
    <div
      style={{ height: SLOT_H }}
      onDragOver={e => { e.preventDefault(); onDragOver({ day, slotNumber, division }); }}
      onDrop={e => { e.preventDefault(); onDrop({ day, slotNumber, division }); }}
      onClick={() => onAdd(day, slotNumber, division)}
      className={`group rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer shrink-0 transition-all duration-200 ${
        isDropTarget
          ? "border-indigo-400 bg-indigo-50 scale-[1.01] shadow-md"
          : "border-slate-200 bg-slate-50/60 hover:border-indigo-300 hover:bg-indigo-50/40 hover:scale-[1.01]"
      }`}
    >
      {isDropTarget ? (
        <span className="text-sm font-bold text-indigo-600 bg-white px-3 py-1.5 rounded-full shadow-md">Drop here</span>
      ) : (
        <>
          <div className="w-9 h-9 rounded-full bg-slate-200 group-hover:bg-indigo-100 flex items-center justify-center mb-1.5 transition-colors">
            <Plus size={17} className="text-slate-400 group-hover:text-indigo-500" />
          </div>
          <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">Add Lecture</span>
        </>
      )}
    </div>
  );
}, (p, n) => p.dragTarget === n.dragTarget);

// ─────────────────────────── Session Modal ───────────────────────────────────

const SessionModal = memo(({
  isOpen, session, day, slotNumber, division, mode,
  onClose, onSave,
  facultyList, roomsList, subjectsList, timetable,
}) => {
  const [form, setForm] = useState({
    subject_id: "", subject_name: "", subject_code: "", type: "theory",
    faculty_id: "", faculty_name: "", room_id: "", room_name: "", batch: "",
  });
  const [moveTarget, setMoveTarget] = useState({ day: "Monday", slot: 1 });
  const [showMove, setShowMove]     = useState(false);
  const [warn, setWarn]             = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setShowMove(false); setWarn(null);
    setMoveTarget({ day: day ?? "Monday", slot: slotNumber ?? 1 });
    if (session) {
      setForm({
        subject_id:   session.subject_id   ?? "",
        subject_name: session.subject_name ?? session.subject ?? "",
        subject_code: session.subject_code ?? "",
        type:         session.type ?? "theory",
        faculty_id:   session.faculty_id   ?? "",
        faculty_name: session.faculty_name ?? session.faculty ?? "",
        room_id:      session.room_id      ?? "",
        room_name:    session.room_name    ?? session.room    ?? "",
        batch: (session.batch === "Full Division" || session.batch === "-") ? "" : (session.batch ?? ""),
      });
    } else {
      setForm({ subject_id: "", subject_name: "", subject_code: "", type: "theory", faculty_id: "", faculty_name: "", room_id: "", room_name: "", batch: "" });
    }
  }, [isOpen, session, day, slotNumber]);

  useEffect(() => {
    if (!isOpen || !timetable) return;
    const td  = showMove ? moveTarget.day  : day;
    const ts  = showMove ? moveTarget.slot : slotNumber;
    const eid = mode === "edit" ? (session?.id ?? null) : null;
    setWarn(
      roomConflict(timetable, form.room_name, td, ts, eid) ||
      facConflict (timetable, form.faculty_name, td, ts, eid) ||
      null
    );
  }, [form.room_name, form.faculty_name, moveTarget, showMove, isOpen, timetable, day, slotNumber, mode, session]);

  const canSave    = !!form.subject_id;
  const shouldMove = mode === "edit" && showMove && (moveTarget.day !== day || moveTarget.slot !== slotNumber);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100000] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            key="panel"
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1,    y: 0,  opacity: 1 }}
            exit  ={{ scale: 0.92, y: 24, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="relative z-[100001] bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/50"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5 text-white relative">
              <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                <X size={16} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-xl">
                  {mode === "add" ? <Plus size={20} /> : <Edit3 size={20} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{mode === "add" ? "Add Lecture" : "Edit Lecture"}</h3>
                  <p className="text-white/70 text-sm mt-0.5">
                    {day} · {TIME_SLOTS[slotNumber]?.start} – {TIME_SLOTS[slotNumber]?.end} · Div {division}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[62vh] overflow-y-auto">
              <AnimatePresence>
                {warn && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 text-xs font-medium">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-500" />{warn}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Subject */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Subject *</label>
                <div className="relative">
                  <select
                    value={form.subject_id}
                    onChange={e => {
                      const s = (subjectsList ?? []).find(x => String(x.id) === e.target.value);
                      setForm(f => ({ ...f, subject_id: e.target.value, subject_name: s?.name ?? "", subject_code: s?.code ?? "", type: s?.type ?? f.type }));
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 appearance-none pr-8"
                  >
                    <option value="">{(subjectsList?.length ?? 0) ? "Select Subject" : "Loading…"}</option>
                    {(subjectsList ?? []).map(s => (
                      <option key={s.id} value={s.id}>{s.code ? `${s.code} — ` : ""}{(s.name ?? "").slice(0, 42)}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Session Type</label>
                <div className="flex gap-2">
                  {["theory", "lab", "test"].map(t => (
                    <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                        form.type === t
                          ? t === "theory" ? "bg-blue-500 text-white shadow-lg"
                            : t === "lab"  ? "bg-green-500 text-white shadow-lg"
                            :                "bg-red-500   text-white shadow-lg"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >{t}</button>
                  ))}
                </div>
              </div>

              {/* Faculty + Room */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Faculty", key: "faculty_id", nameKey: "faculty_name", list: facultyList },
                  { label: "Room",    key: "room_id",    nameKey: "room_name",    list: roomsList   },
                ].map(({ label, key, nameKey, list }) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">{label}</label>
                    <div className="relative">
                      <select
                        value={form[key]}
                        onChange={e => {
                          const found = (list ?? []).find(x => String(x.id) === e.target.value);
                          setForm(f => ({ ...f, [key]: e.target.value, [nameKey]: found?.name ?? "" }));
                        }}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 appearance-none pr-6"
                      >
                        <option value="">{(list?.length ?? 0) ? "None / TBD" : "Loading…"}</option>
                        {(list ?? []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Batch */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Batch (optional)</label>
                <div className="flex gap-2">
                  {["", "1", "2", "3"].map(b => (
                    <button key={b} type="button" onClick={() => setForm(f => ({ ...f, batch: b }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                        form.batch === b ? "bg-indigo-500 text-white shadow-lg" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >{b === "" ? "Full Div" : `Batch ${b}`}</button>
                  ))}
                </div>
              </div>

              {/* Move (edit only) */}
              {mode === "edit" && (
                <div>
                  <button onClick={() => setShowMove(p => !p)} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                    <RefreshCw size={13} />
                    Move to different slot
                    <ChevronDown size={13} className={`transition-transform ${showMove ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {showMove && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-2"
                      >
                        <div className="grid grid-cols-2 gap-2 p-3 bg-indigo-50 rounded-xl">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Day</label>
                            <select value={moveTarget.day} onChange={e => setMoveTarget(t => ({ ...t, day: e.target.value }))}
                              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none">
                              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Slot</label>
                            <select value={moveTarget.slot} onChange={e => setMoveTarget(t => ({ ...t, slot: Number(e.target.value) }))}
                              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none">
                              {SESSION_SLOTS.map(s => (
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

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => canSave && onSave(form, moveTarget, shouldMove, warn)}
                disabled={!canSave}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  canSave
                    ? warn
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:opacity-90"
                      : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg hover:opacity-90"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <CheckCircle size={16} />
                {warn ? "Save Anyway" : shouldMove ? "Save & Move" : mode === "add" ? "Add Lecture" : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// ─────────────────────────── Division Grid ───────────────────────────────────

const DivisionGrid = memo(({
  division, timetable, clashes, currentTime,
  onAdd, onEdit, onDelete,
  dragSourceRef, dragTarget, setDragTarget, onDropComplete, onDragStart,absentFaculty,
}) => {
  const todayIdx = currentTime.getDay() - 1; // 0 = Monday

  const isCurrentSlot = useCallback((day, slot) => {
    if (DAYS.indexOf(day) !== todayIdx) return false;
    const s = TIME_SLOTS[slot];
    if (!s) return false;
    const [sh, sm] = s.start.split(":").map(Number);
    const [eh, em] = s.end.split(":").map(Number);
    const cur = currentTime.getHours() * 60 + currentTime.getMinutes();
    return cur >= sh * 60 + sm && cur < eh * 60 + em;
  }, [todayIdx, currentTime]);

  const clashSet = useMemo(() => {
    const set = new Set();
    clashes.forEach(c => set.add(`${c.day}-${c.slot}`));
    return set;
  }, [clashes]);

  const grouped = useMemo(() => {
    const out = {};
    for (const day of DAYS) {
      out[day] = {};
      for (const slot of SESSION_SLOTS) out[day][slot] = [];
      for (const s of (timetable?.[day]?.[division] ?? []))
        if (out[day][s.slot]) out[day][s.slot].push(s);
    }
    return out;
  }, [timetable, division]);

  const stats = useMemo(() => computeStats(timetable, division), [timetable, division]);

  const handleDragOver = useCallback(target => {
    setDragTarget(prev =>
      prev?.day === target.day && prev?.slotNumber === target.slotNumber && prev?.division === target.division
        ? prev : { ...target }
    );
  }, [setDragTarget]);

  const divGradient = division === "A"
    ? "from-indigo-500 via-violet-500 to-purple-600"
    : "from-emerald-500 via-teal-500 to-cyan-600";

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">

      {/* Division header */}
      <div className={`px-5 py-4 flex items-center gap-4 bg-gradient-to-r ${divGradient}`}>
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
          <span className="text-white font-black text-2xl leading-none">{division}</span>
        </div>
        <div>
          <h2 className="text-white font-black text-2xl leading-none">Division {division}</h2>
          <p className="text-white/70 text-sm mt-0.5">
            {stats.theory} Theory · {stats.lab} Labs · {stats.test} Tests · {stats.total} total
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {clashes.length > 0 ? (
            <div className="flex items-center gap-1.5 bg-red-500/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-black shadow">
              <AlertTriangle size={13} />{clashes.length} Clash{clashes.length > 1 ? "es" : ""}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-bold">
              <CheckCircle size={13} />No Clashes
            </div>
          )}
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50/80">
        {DAYS.map((day, di) => {
          const isToday = di === todayIdx;
          const sessionCount = Object.values(grouped[day] ?? {}).flat().length;
          return (
            <div key={day} className={`flex items-center justify-center gap-2 py-3 px-2 border-r border-slate-200 last:border-r-0 ${isToday ? "bg-amber-50" : ""}`}>
              {isToday ? <Sun size={15} className="text-amber-500 shrink-0" /> : <Moon size={15} className="text-slate-300 shrink-0" />}
              <div className="text-center min-w-0">
                <div className={`text-sm font-black ${isToday ? "text-amber-700" : "text-slate-700"}`}>{day}</div>
                <div className="text-[10px] text-slate-400 font-medium">{sessionCount} session{sessionCount !== 1 ? "s" : ""}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slot rows */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: 900 }}>
          {ALL_SLOTS.map(slot => (
            <div
  key={slot}
  className="grid grid-cols-5 border-b border-slate-100 last:border-b-0"
  style={{ height: (slot === BREAK_SLOT ? BREAK_H : SLOT_H) + 14 }}
>
              {DAYS.map(day => {
                if (slot === BREAK_SLOT) {
  return (
    <div key={day} className="border-r border-slate-100 last:border-r-0 px-2 py-1.5 h-full">
      <BreakCard />
    </div>
  );
}

                const sessions   = grouped[day]?.[slot] ?? [];
                const src        = dragSourceRef.current;
                const isDragging = src?.day === day && src?.slotNumber === slot && src?.division === division;
                const hasClash   = clashSet.has(`${day}-${slot}`);
                const isCurrent  = isCurrentSlot(day, slot);

                const commonProps = {
                  day, slotNumber: slot, division, isCurrent, hasClash,
                  onEdit, onDelete, onDragStart,
                  onDragOver: handleDragOver,
                  onDrop: onDropComplete,
                  isDragging, dragTarget,
                  absentFaculty,
                };

                return (
                  <div key={day} className="border-r border-slate-100 last:border-r-0 px-2 py-1.5">
                    {sessions.length === 0
                      ? <EmptyCard day={day} slotNumber={slot} division={division} onAdd={onAdd} onDragOver={handleDragOver} onDrop={onDropComplete} dragTarget={dragTarget} />
                      : sessions.length > 1
                        ? <SplitCard sessions={sessions} {...commonProps} absentFaculty={absentFaculty} />
                        : <SessionCard session={sessions[0]} {...commonProps} absentFaculty={absentFaculty} />
                    }
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}, (p, n) =>
  p.timetable   === n.timetable  &&
  p.clashes     === n.clashes    &&
  p.dragTarget  === n.dragTarget &&
  p.currentTime === n.currentTime
);

// ─────────────────────────── Main Component ──────────────────────────────────

const AdminTimetableComponent = () => {
  const [timetable,    setTimetable]    = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [loadingState, setLoadingState] = useState("loading");
  const [saving,       setSaving]       = useState(false);
  const [saveSuccess,  setSaveSuccess]  = useState(false);
  const [generating,   setGenerating]   = useState(false);
  const [currentTime,  setCurrentTime]  = useState(new Date());
  const [error,        setError]        = useState(null);
  const [unsaved,      setUnsaved]      = useState(false);
  const [showClashes,  setShowClashes]  = useState(false);
  const [sideAnimIdx,  setSideAnimIdx]  = useState(0);
  const [showSideAnim, setShowSideAnim] = useState(true);
  const [absentFaculty, setAbsentFaculty] = useState([]); // ADD THIS LINE
  const [facultyList,  setFacultyList]  = useState([]);
  const [roomsList,    setRoomsList]    = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  const [modal, setModal] = useState({ open: false, mode: "add", session: null, day: null, slot: null, div: null });

  const dragSourceRef = useRef(null);
  const [dragTarget, setDragTarget] = useState(null);
  const [toasts,     setToasts]     = useState([]);

  const clashes = useMemo(() => (timetable ? detectClashes(timetable) : []), [timetable]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500);
  }, []);

  const fetchTimetable = useCallback(async () => {
    try {
      const [rA, rB] = await Promise.all([
        fetch("http://localhost:5000/api/timetable?division=A", { headers: authHeaders() }),
        fetch("http://localhost:5000/api/timetable?division=B", { headers: authHeaders() }),
      ]);
      const [dA, dB] = await Promise.all([rA.json(), rB.json()]);
      if (dA.success && dB.success) {
        const merged = {};
        for (const day of DAYS) merged[day] = { A: dA.data[day]?.A ?? [], B: dB.data[day]?.B ?? [] };
        setTimetable(merged);
      } else setError("Failed to load timetable");
    } catch (e) { setError(e.message); }
  }, []);

  // ADD THIS NEW FUNCTION
const fetchAbsentFaculty = useCallback(async () => {
  try {
    const token = localStorage.getItem("token");
    const today = new Date().toISOString().split('T')[0];
    
    const response = await fetch(
      `http://localhost:5000/api/attendance/absent?date=${today}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    const data = await response.json();
    if (data.success) {
      setAbsentFaculty(data.data.map(f => f.faculty_id));
    }
  } catch (error) {
    console.error("Error fetching absent faculty:", error);
  }
  }, []);

  useEffect(() => {
    let mounted = true;
    let maxTimer, minTimer, animCycle;
    let attendanceInterval;

    const init = async () => {
      setLoadingState("loading");
      setLoading(true);

      animCycle = setInterval(() => {
        if (!mounted) return;
        setShowSideAnim(false);
        setTimeout(() => {
          if (!mounted) return;
          setSideAnimIdx(p => p === 0 ? 1 : 0);
          setShowSideAnim(true);
        }, 400);
      }, 2500);

      maxTimer = setTimeout(() => {
        if (mounted) { setLoadingState("error"); clearInterval(animCycle); }
      }, 10000);

      await fetchTimetable();
      await fetchAbsentFaculty();

      Promise.all([
        fetch("http://localhost:5000/api/timetable/faculty/all",  { headers: authHeaders() }).then(r => r.json()).catch(() => null),
        fetch("http://localhost:5000/api/timetable/rooms/all",    { headers: authHeaders() }).then(r => r.json()).catch(() => null),
        fetch("http://localhost:5000/api/timetable/subjects/all", { headers: authHeaders() }).then(r => r.json()).catch(() => null),
      ]).then(([f, r, s]) => {
        if (f?.success) setFacultyList(f.data);
        if (r?.success) setRoomsList(r.data);
        if (s?.success) setSubjectsList(s.data);
      });

      minTimer = setTimeout(() => {
        if (mounted) { clearTimeout(maxTimer); clearInterval(animCycle); setLoading(false); }
      }, 3000);
    };

    init();
    const tick = setInterval(() => { if (mounted) setCurrentTime(new Date()); }, 60000);

     attendanceInterval = setInterval(() => {  // REMOVE 'const' from here
    if (mounted && timetable) {
      fetchAbsentFaculty();
    }
    }, 5 * 60 * 1000);


    return () => {
      mounted = false;
      clearTimeout(maxTimer); clearTimeout(minTimer);
      clearInterval(animCycle); clearInterval(tick);
      clearInterval(attendanceInterval);
      if (attendanceInterval) clearInterval(attendanceInterval);
    };
  }, []);

  const handleSave = useCallback(async () => {
    if (!timetable || clashes.length > 0) return;
    setSaving(true);
    try {
      const r = await fetch("http://localhost:5000/api/timetable/save", {
        method: "PUT", headers: authHeaders(), body: JSON.stringify({ timetable }),
      });
      const d = await r.json();
      if (d.success) {
        setSaveSuccess(true); setUnsaved(false);
        addToast("Timetable saved to database!", "success");
        setTimeout(() => setSaveSuccess(false), 2500);
      } else addToast(d.message ?? "Save failed", "error");
    } catch (e) { addToast(e.message, "error"); } finally { setSaving(false); }
  }, [timetable, clashes, addToast]);

  const handleAutoGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const r = await fetch("http://localhost:5000/api/timetable/generate", {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ semester: "even", year: 2026 }),
      });
      const d = await r.json();
      if (d.success) { setTimetable(d.data); setUnsaved(true); addToast("Timetable generated successfully!", "success"); }
      else addToast(d.message ?? "Auto-generate failed", "error");
    } catch (e) { addToast(e.message, "error"); } finally { setGenerating(false); }
  }, [addToast]);

  const handleAdd    = useCallback((day, slot, div) => setModal({ open: true, mode: "add",  session: null,    day, slot, div }), []);
  const handleEdit   = useCallback((session, day, slot, div) => setModal({ open: true, mode: "edit", session, day, slot, div }), []);

  const handleDelete = useCallback((day, slot, div, session) => {
    setTimetable(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[day][div] = next[day][div].filter(s =>
        !(s.slot === slot && (s.id
          ? String(s.id) === String(session.id)
          : s.subject === session.subject && s.faculty === session.faculty))
      );
      return next;
    });
    setUnsaved(true);
    addToast("Lecture removed", "warning");
  }, [addToast]);

  const handleModalSave = useCallback((form, moveTarget, shouldMove, warn) => {
    if (warn) addToast(warn, "warning");
    const { day, slot, div, mode, session } = modal;
    setTimetable(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const entry = {
        ...form,
        slot: shouldMove ? moveTarget.slot : slot,
        day:  shouldMove ? moveTarget.day  : day,
        division: div, subject: form.subject_name, faculty: form.faculty_name, room: form.room_name,
      };
      if (mode === "edit") {
        next[day][div] = next[day][div].filter(s =>
          session?.id
            ? String(s.id) !== String(session.id)
            : !(s.slot === slot && (s.subject_id ?? s.subject) === (session?.subject_id ?? session?.subject))
        );
        const td = shouldMove ? moveTarget.day : day;
        if (!next[td])      next[td]      = {};
        if (!next[td][div]) next[td][div] = [];
        next[td][div].push(entry);
      } else {
        if (!next[day])      next[day]      = {};
        if (!next[day][div]) next[day][div] = [];
        next[day][div].push(entry);
      }
      return next;
    });
    setUnsaved(true);
    setModal(m => ({ ...m, open: false }));
    addToast(mode === "add" ? "Lecture added!" : "Lecture updated!", "success");
  }, [modal, addToast]);

  const handleDragStart    = useCallback(source => { dragSourceRef.current = source; }, []);

  const handleDropComplete = useCallback(target => {
    const src = dragSourceRef.current;
    if (!src || !target) return;
    if (src.day === target.day && src.slotNumber === target.slotNumber && src.division === target.division) {
      dragSourceRef.current = null; setDragTarget(null); return;
    }
    if (target.slotNumber === BREAK_SLOT) {
      addToast("Cannot drop onto the break slot", "error");
      dragSourceRef.current = null; setDragTarget(null); return;
    }
    setTimetable(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const srcList   = next?.[src.day]?.[src.division] ?? [];
      const tgtList   = next?.[target.day]?.[target.division] ?? [];
      const srcAtSlot = srcList.filter(s => s.slot === src.slotNumber    && s.type !== "break");
      const tgtAtSlot = tgtList.filter(s => s.slot === target.slotNumber && s.type !== "break");

      const strip = (arr, sess) => arr.filter(s =>
        !((sess.id && String(s.id) === String(sess.id)) ||
          (!sess.id && s.slot === sess.slot && (s.subject_id ?? s.subject) === (sess.subject_id ?? sess.subject)))
      );

      if (tgtAtSlot.length === 0) {
        next[src.day][src.division] = strip(srcList, { ...src.session, slot: src.slotNumber });
        if (!next[target.day]) next[target.day] = {};
        if (!next[target.day][target.division]) next[target.day][target.division] = [];
        next[target.day][target.division].push({ ...src.session, slot: target.slotNumber, day: target.day, division: target.division });
        addToast(`Moved to ${target.day} Slot ${target.slotNumber}`, "success");
      } else if (tgtAtSlot.length === 1 && srcAtSlot.length === 1) {
        const tgt = tgtAtSlot[0];
        next[src.day][src.division]       = strip(srcList, { ...src.session, slot: src.slotNumber });
        next[target.day][target.division] = strip(tgtList, { ...tgt, slot: target.slotNumber });
        next[src.day][src.division].push({ ...tgt, slot: src.slotNumber, day: src.day, division: src.division });
        next[target.day][target.division].push({ ...src.session, slot: target.slotNumber, day: target.day, division: target.division });
        addToast("Sessions swapped!", "success");
      } else {
        addToast("Cannot swap split sessions — edit them individually", "warning");
        dragSourceRef.current = null; setDragTarget(null); return prev;
      }
      return next;
    });
    setUnsaved(true); dragSourceRef.current = null; setDragTarget(null);
  }, [addToast]);

  // ── Loading / Error screens ───────────────────────────────────────────────

  if (loading || loadingState === "error") {
    return (
      <div className="w-full bg-white rounded-2xl flex flex-col items-center justify-center overflow-hidden px-4 py-16 min-h-[500px]">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          <motion.div
            initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}
            className="w-72 h-72"
          >
            <AnimatePresence mode="wait">
              {loadingState === "loading" ? (
                <motion.div key="main-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                  <Lottie animationData={mainAnimation} loop className="w-full h-full" />
                </motion.div>
              ) : (
                <motion.div key="main-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                  <Lottie animationData={errorAnimation} loop className="w-full h-full" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {loadingState === "loading" && (
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="relative w-56 h-56">
              <AnimatePresence mode="wait">
                {showSideAnim && (
                  <motion.div
                    key={sideAnimIdx}
                    initial={{ opacity: 0, x: 40, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0,  scale: 1   }}
                    exit  ={{ opacity: 0, x: -40, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                  >
                    <Lottie animationData={sideAnimIdx === 0 ? sideAnimation1 : sideAnimation2} loop className="w-full h-full" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-slate-700 mb-2">
            {loadingState === "loading" ? "Loading Timetable Editor" : "Taking Too Long?"}
          </h2>
          <p className="text-slate-400 text-sm">
            {loadingState === "loading" ? "Fetching both divisions for admin view…" : "We're having trouble connecting. Please refresh."}
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-2xl flex flex-col items-center justify-center px-4 py-16 min-h-[400px]">
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="w-56 h-56">
          <Lottie animationData={errorAnimation} loop className="w-full h-full" />
        </motion.div>
        <h3 className="text-xl font-bold text-slate-700 mt-6 mb-2">Oops! Something went wrong</h3>
        <p className="text-slate-400 text-sm mb-6">{error}</p>
        <button onClick={fetchTimetable} className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg">
          Retry
        </button>
      </div>
    );
  }

  const gridProps = {
    timetable, clashes, currentTime,
    onAdd: handleAdd, onEdit: handleEdit, onDelete: handleDelete,
    dragSourceRef, dragTarget, setDragTarget,
    onDropComplete: handleDropComplete, onDragStart: handleDragStart,
    absentFaculty,
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-violet-50/20 to-indigo-50/20 px-5 py-5 space-y-5">
      <Toast toasts={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />

      {/* ── Header ── */}
      <motion.div
        initial={{ y: -20, opacity: 1 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, type: "spring" }}
        className="bg-white/90 backdrop-blur-xl rounded-2xl px-6 py-5 shadow-xl border border-white/60"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl shadow-lg">
              <Shield className="text-white" size={26} />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent leading-none">
                Admin Timetable
              </h1>
              <p className="text-slate-500 flex items-center gap-1.5 text-sm mt-1">
                <Sparkles size={13} className="text-amber-500" />
                Computer Engineering · Even Semester 2026 · Both Divisions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {clashes.length > 0 ? (
              <motion.button
                onClick={() => setShowClashes(p => !p)}
                animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors shadow-sm"
              >
                <AlertTriangle size={15} />{clashes.length} Clash{clashes.length > 1 ? "es" : ""}
              </motion.button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl font-bold text-sm shadow-sm">
                <CheckCircle size={15} />No Clashes
              </div>
            )}

            <motion.button
              whileHover={{ scale: generating ? 1 : 1.03 }} whileTap={{ scale: generating ? 1 : 0.97 }}
              onClick={handleAutoGenerate} disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-shadow disabled:opacity-75"
            >
              {generating ? <><RefreshCw size={15} className="animate-spin" />Generating…</> : <><Zap size={15} />Auto Generate</>}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleSave} disabled={saving || !unsaved || clashes.length > 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all ${
                saveSuccess                           ? "bg-emerald-500 text-white"
                : unsaved && clashes.length === 0    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-xl"
                :                                      "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {saving
                ? <><RefreshCw size={15} className="animate-spin" />Saving…</>
                : saveSuccess
                  ? <><CheckCircle size={15} />Saved!</>
                  : <><Save size={15} />Save Changes</>}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {unsaved && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-3"
            >
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
                clashes.length > 0
                  ? "bg-red-50 border border-red-200 text-red-600"
                  : "bg-amber-50 border border-amber-200 text-amber-700"
              }`}>
                {clashes.length > 0
                  ? <><AlertTriangle size={14} />Resolve {clashes.length} clash{clashes.length > 1 ? "es" : ""} before saving</>
                  : <><Edit3 size={14} />You have unsaved changes — click Save Changes to push to database</>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Clashes panel ── */}
      <AnimatePresence>
        {showClashes && clashes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-red-200 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <AlertTriangle size={16} />Schedule Clashes ({clashes.length})
              </div>
              <button onClick={() => setShowClashes(false)} className="text-white/70 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {clashes.map((c, i) => (
                <div key={c.key ?? i} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${c.type === "room" ? "bg-orange-500" : "bg-red-500"}`} />
                  <div>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-wide">{c.type} clash</p>
                    <p className="text-sm text-slate-700 mt-0.5">{c.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Grids ── */}
      <div className="relative space-y-5">
        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-white/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-6"
            >
              <div className="flex items-center gap-8">
                <div className="w-40 h-40">
                  <Lottie animationData={mainAnimation} loop className="w-full h-full" />
                </div>
                <div className="relative w-32 h-32">
                  <AnimatePresence mode="wait">
                    {showSideAnim && (
                      <motion.div
                        key={sideAnimIdx}
                        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                        className="absolute inset-0"
                      >
                        <Lottie animationData={sideAnimIdx === 0 ? sideAnimation1 : sideAnimation2} loop className="w-full h-full" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} className="text-center">
                <p className="text-xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Auto-Generating Timetable
                </p>
                <p className="text-sm text-slate-400 mt-1">Optimising schedules for both divisions…</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <DivisionGrid division="A" {...gridProps} />
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <DivisionGrid division="B" {...gridProps} />
        </motion.div>
      </div>

      {/* ── Legend ── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
        className="bg-white/90 backdrop-blur-xl rounded-xl px-5 py-3.5 shadow-lg border border-white/60"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-5 flex-wrap">
            {[
              { color: "#3b82f6", label: "Theory" },
              { color: "#22c55e", label: "Lab"    },
              { color: "#ef4444", label: "Test"   },
              { color: "#f59e0b", label: "Break"  },
            ].map(x => (
              <div key={x.label} className="flex items-center gap-2">
                <div style={{ background: x.color }} className="w-3 h-3 rounded-full" />
                <span className="text-sm text-slate-600 font-medium">{x.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-indigo-500" />
              <span className="text-sm text-slate-600 font-medium">Split Session</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
            <GripVertical size={14} className="text-slate-300" />
            Drag to move · Drop on empty to place · Drop on session to swap
          </div>
        </div>
      </motion.div>

      {/* ── Modal ── */}
      <SessionModal
        isOpen={modal.open}
        session={modal.session}
        day={modal.day}
        slotNumber={modal.slot}
        division={modal.div}
        mode={modal.mode}
        onClose={() => setModal(m => ({ ...m, open: false }))}
        onSave={handleModalSave}
        facultyList={facultyList}
        roomsList={roomsList}
        subjectsList={subjectsList}
        timetable={timetable}
      />
    </div>
  );
};

export default AdminTimetableComponent;