import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import LottieComponent from "lottie-react";

const Lottie = LottieComponent.default ?? LottieComponent;
import mainAnimation from "../../assets/tt_loading_main.json";
import sideAnimation1 from "../../assets/tt_loading1.json";
import sideAnimation2 from "../../assets/tt_loading2.json";
import errorAnimation from "../../assets/tt_error.json";

// ── Helpers ───────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().split("T")[0];

const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const AVATAR_GRADIENTS = [
  ["#6366f1", "#818cf8"], ["#10b981", "#34d399"], ["#f43f5e", "#fb7185"],
  ["#f59e0b", "#fbbf24"], ["#06b6d4", "#38bdf8"], ["#8b5cf6", "#a78bfa"],
  ["#ec4899", "#f472b6"], ["#14b8a6", "#2dd4bf"],
];
const getGradient = (id) => AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length];

// ── Status Configuration ─────────────────────────────────────────────────────

const STATUS = {
  present: {
    label: "Present", short: "P",
    bg: "#ecfdf5", text: "#059669", border: "#a7f3d0",
    activeBg: "#059669", activeText: "#fff", dot: "#10b981",
  },
  absent: {
    label: "Absent", short: "A",
    bg: "#fff1f2", text: "#e11d48", border: "#fecdd3",
    activeBg: "#e11d48", activeText: "#fff", dot: "#f43f5e",
  },
  leave: {
    label: "Leave", short: "L",
    bg: "#fffbeb", text: "#d97706", border: "#fde68a",
    activeBg: "#d97706", activeText: "#fff", dot: "#f59e0b",
  },
  unmarked: {
    label: "Unmarked", short: "?",
    bg: "#f8fafc", text: "#94a3b8", border: "#e2e8f0",
    activeBg: "#94a3b8", activeText: "#fff", dot: "#cbd5e1",
  },
};

const SUBJECT_STYLES = {
  theory: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" },
  lab:    { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", dot: "#22c55e" },
  test:   { bg: "#fff1f2", text: "#be123c", border: "#fecdd3", dot: "#f43f5e" },
};

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

async function api(url, opts = {}) {
  const r = await fetch(`http://localhost:5000${url}`, {
    ...opts, headers: { ...authHeaders(), ...(opts.headers ?? {}) },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.message ?? `HTTP ${r.status}`);
  return data;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const PresentIcon = ({ size = 16, color }) => (
  <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.8}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const AbsentIcon = ({ size = 16, color }) => (
  <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.8}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const LeaveIcon = ({ size = 16, color }) => (
  <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const SpinIcon = () => (
  <svg style={{ animation: "spin 0.8s linear infinite" }} width="14" height="14" viewBox="0 0 24 24">
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity={0.25} />
    <path fill="currentColor" opacity={0.75} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const STATUS_ICONS = { present: PresentIcon, absent: AbsentIcon, leave: LeaveIcon };

// ── Shared styles ─────────────────────────────────────────────────────────────

const btnPrimary = {
  padding: "10px 22px", borderRadius: 12, border: "none", cursor: "pointer",
  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
  color: "#fff", fontSize: 13, fontWeight: 600,
  boxShadow: "0 4px 14px #6366f133", transition: "opacity .15s",
};

// ── Full-screen Loading ───────────────────────────────────────────────────────

const LoadingScreen = ({ sideIdx, showSide }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 9999, background: "#fff",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  }}>
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 48 }}>
      {/* Main animation */}
      <div style={{ width: 340, height: 340 }}>
        <Lottie animationData={mainAnimation} loop style={{ width: "100%", height: "100%" }} />
      </div>
      {/* Cycling side animation */}
      <div style={{ width: 220, height: 220, position: "relative" }}>
        <div style={{
          position: "absolute", inset: 0,
          opacity: showSide ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}>
          <Lottie
            animationData={sideIdx === 0 ? sideAnimation1 : sideAnimation2}
            loop
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </div>
    <div style={{ marginTop: 32, textAlign: "center" }}>
      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#334155" }}>
        Loading Faculty Panel
      </h2>
      <p style={{ margin: "8px 0 0", fontSize: 14, color: "#94a3b8" }}>
        Fetching faculty and subject data…
      </p>
    </div>
  </div>
);

// ── Error Screen ──────────────────────────────────────────────────────────────

const ErrorScreen = ({ error, onRetry }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 9999, background: "#fff",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  }}>
    <div style={{ width: 260, height: 260 }}>
      <Lottie animationData={errorAnimation} loop style={{ width: "100%", height: "100%" }} />
    </div>
    <h2 style={{ margin: "16px 0 8px", fontSize: 24, fontWeight: 800, color: "#1e293b" }}>
      Failed to load data
    </h2>
    <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 28, textAlign: "center", maxWidth: 380 }}>{error}</p>
    <button onClick={onRetry} style={btnPrimary}>Try Again</button>
  </div>
);

// ── Memoized Sub-components ───────────────────────────────────────────────────

const SubjectBadge = memo(({ subject }) => {
  const style = SUBJECT_STYLES[subject.type?.toLowerCase()] ?? SUBJECT_STYLES.theory;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
      background: style.bg, color: style.text, border: `1px solid ${style.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: style.dot, flexShrink: 0 }} />
      {subject.code ?? subject.name}
    </span>
  );
});

const Avatar = memo(({ name, id, size = 48 }) => {
  const [from, to] = getGradient(id);
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.25,
      background: `linear-gradient(135deg, ${from}, ${to})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 700, fontSize: size * 0.33, flexShrink: 0,
      boxShadow: `0 4px 12px ${from}44`,
    }}>
      {getInitials(name)}
    </div>
  );
});

const StatsCard = memo(({ label, value, color, icon }) => {
  const palette = {
    indigo:  { bg: "#eef2ff", text: "#4338ca", accent: "#6366f1" },
    emerald: { bg: "#ecfdf5", text: "#047857", accent: "#10b981" },
    rose:    { bg: "#fff1f2", text: "#be123c", accent: "#f43f5e" },
    amber:   { bg: "#fffbeb", text: "#b45309", accent: "#f59e0b" },
    slate:   { bg: "#f1f5f9", text: "#475569", accent: "#64748b" },
  };
  const p = palette[color] ?? palette.indigo;
  return (
    <div style={{ background: p.bg, borderRadius: 16, padding: "18px 20px", border: `1.5px solid ${p.accent}22`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -12, right: -12, width: 64, height: 64, borderRadius: "50%", background: `${p.accent}18` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: p.text, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 12, color: p.text, opacity: 0.75, marginTop: 4, fontWeight: 500 }}>{label}</div>
        </div>
        <div style={{ color: p.accent, opacity: 0.7 }}>{icon}</div>
      </div>
    </div>
  );
});

const StatusToggle = memo(({ currentStatus, onStatusChange, facultyId }) => (
  <div style={{ display: "flex", gap: 5, padding: 4, background: "#f1f5f9", borderRadius: 14 }}>
    {["present", "absent", "leave"].map(status => {
      const cfg = STATUS[status];
      const active = currentStatus === status;
      const Icon = STATUS_ICONS[status];
      const iconColor = active ? "#fff" : cfg.text;
      return (
        <button
          key={status}
          title={cfg.label}
          onClick={() => onStatusChange(facultyId, status)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            padding: "6px 12px", borderRadius: 9, border: "none", cursor: "pointer",
            background: active ? cfg.activeBg : cfg.bg, color: iconColor,
            transform: active ? "scale(1.05)" : "scale(1)", transition: "all .15s",
            boxShadow: active ? `0 2px 8px ${cfg.activeBg}66` : "none",
            fontWeight: 600, fontSize: 11,
          }}
        >
          <Icon size={14} color={iconColor} />
          <span style={{ color: iconColor }}>{cfg.label}</span>
        </button>
      );
    })}
  </div>
));

// ── Subject Modal ─────────────────────────────────────────────────────────────

const SubjectModal = ({ open, faculty, subjects, onClose, onSave, saving }) => {
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (open && faculty) { setSelected(faculty.subjects?.map(s => s.id) ?? []); setFilter("all"); }
  }, [open, faculty]);

  if (!open || !faculty) return null;
  const [from, to] = getGradient(faculty.id);
  const filtered = filter === "all" ? subjects : subjects.filter(s => s.type === filter);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 440,
        overflow: "hidden", boxShadow: "0 24px 64px rgba(15,23,42,0.2)",
      }}>
        <div style={{ background: `linear-gradient(135deg, ${from}, ${to})`, padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.2)",
                border: "2px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center",
                justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18,
              }}>{getInitials(faculty.name)}</div>
              <div>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>{faculty.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{selected.length} subjects selected</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", cursor: "pointer", fontSize: 22, lineHeight: 1 }}>×</button>
          </div>
        </div>

        <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", gap: 4, background: "#f1f5f9", padding: 4, borderRadius: 10 }}>
            {["all", "theory", "lab", "test"].map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{
                flex: 1, padding: "6px 0", borderRadius: 7, border: "none", cursor: "pointer",
                fontSize: 11, fontWeight: 600, textTransform: "capitalize", transition: "all .15s",
                background: filter === t ? "#fff" : "transparent",
                color: filter === t ? "#1e293b" : "#94a3b8",
                boxShadow: filter === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: "12px 16px", maxHeight: 320, overflowY: "auto" }}>
          {filtered.map(subject => {
            const isSelected = selected.includes(subject.id);
            const style = SUBJECT_STYLES[subject.type] ?? SUBJECT_STYLES.theory;
            return (
              <button key={subject.id}
                onClick={() => setSelected(prev => isSelected ? prev.filter(id => id !== subject.id) : [...prev, subject.id])}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 12, marginBottom: 6,
                  border: isSelected ? `2px solid ${style.border}` : "2px solid transparent",
                  background: isSelected ? style.bg : "#fafafa",
                  cursor: "pointer", transition: "all .15s", textAlign: "left",
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 12, fontWeight: 700,
                  background: isSelected ? "#fff" : "#e2e8f0",
                  color: isSelected ? style.text : "#94a3b8",
                }}>
                  {isSelected ? "✓" : subject.code?.slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{subject.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{subject.code} · {subject.lectures_per_week} lec/wk</div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 11, border: "none", cursor: "pointer", background: "#f1f5f9", color: "#475569", fontWeight: 600, fontSize: 13 }}>Cancel</button>
          <button onClick={() => onSave(faculty.id, selected)} disabled={saving}
            style={{ ...btnPrimary, flex: 1, padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: saving ? 0.65 : 1 }}
          >
            {saving ? <><SpinIcon /> Saving…</> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Faculty Card ──────────────────────────────────────────────────────────────

const FacultyCard = memo(({ faculty, onEdit }) => (
  <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", padding: "18px 20px", transition: "box-shadow .2s, border-color .2s" }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.10)"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
  >
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <Avatar name={faculty.name} id={faculty.id} size={52} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{faculty.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontFamily: "monospace", background: "#f1f5f9", color: "#64748b", padding: "2px 7px", borderRadius: 5, fontWeight: 600 }}>{faculty.college_id}</span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>{faculty.email}</span>
            </div>
          </div>
          <button onClick={() => onEdit(faculty)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 11px", borderRadius: 8, border: "none", cursor: "pointer", background: "#eef2ff", color: "#4f46e5", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Assign
          </button>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, color: "#cbd5e1", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Subjects</div>
          {faculty.subjects?.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {faculty.subjects.map(s => <SubjectBadge key={s.id} subject={s} />)}
            </div>
          ) : <span style={{ fontSize: 11, color: "#cbd5e1", fontStyle: "italic" }}>No subjects assigned</span>}
        </div>
        {faculty.phone && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10, fontSize: 11, color: "#94a3b8" }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            {faculty.phone}
          </div>
        )}
      </div>
    </div>
  </div>
));

// ── Attendance Row ────────────────────────────────────────────────────────────

const AttendanceRow = memo(({ faculty, status, onStatusChange }) => {
  const cfg = STATUS[status] ?? STATUS.unmarked;
  const Icon = STATUS_ICONS[status];
  return (
    <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 14, background: "#fff" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Avatar name={faculty.name} id={faculty.id} size={44} />
        <div style={{ position: "absolute", bottom: -2, right: -2, width: 13, height: 13, borderRadius: "50%", background: cfg.dot, border: "2px solid #fff" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{faculty.name}</span>
          <span style={{ fontSize: 10, fontFamily: "monospace", background: "#f1f5f9", color: "#64748b", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>{faculty.college_id}</span>
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{faculty.email}</div>
        {faculty.subjects?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
            {faculty.subjects.slice(0, 2).map(s => <SubjectBadge key={s.id} subject={s} />)}
            {faculty.subjects.length > 2 && <span style={{ fontSize: 10, color: "#94a3b8", background: "#f1f5f9", padding: "2px 7px", borderRadius: 5, fontWeight: 600 }}>+{faculty.subjects.length - 2}</span>}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <span style={{ padding: "5px 11px", borderRadius: 8, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
          {Icon ? <Icon size={13} color={cfg.text} /> : "—"} {cfg.label}
        </span>
        <StatusToggle currentStatus={status} onStatusChange={onStatusChange} facultyId={faculty.id} />
      </div>
    </div>
  );
});

// ── Main Component ────────────────────────────────────────────────────────────

export default function FacultyComponent() {
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("faculty");

  // Loading animation state — cycling side animations like AdminTimetableComponent
  const [sideIdx, setSideIdx] = useState(0);
  const [showSide, setShowSide] = useState(true);

  // Faculty tab
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [savingSubjects, setSavingSubjects] = useState(false);
  const [toast, setToast] = useState(null);

  // Attendance tab
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [attendance, setAttendance] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [attendanceSearch, setAttendanceSearch] = useState("");

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Fetch Data with cycling animation ────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [facultyRes, subjectsRes] = await Promise.all([
        api("/api/timetable/faculty/all"),
        api("/api/timetable/subjects/all"),
      ]);
      const subjectMap = {};
      (subjectsRes.data ?? []).forEach(s => { subjectMap[s.id] = s; });
      setSubjects(subjectsRes.data ?? []);
      if (facultyRes.success) {
        setFaculty((facultyRes.data ?? []).map(f => ({
          ...f,
          subjects: (f.subject_ids ?? []).map(id => subjectMap[id]).filter(Boolean),
        })));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Start side animation cycle on mount while loading
  useEffect(() => {
    let mounted = true;
    const cycleTimer = setInterval(() => {
      if (!mounted) return;
      setShowSide(false);
      setTimeout(() => {
        if (!mounted) return;
        setSideIdx(prev => prev === 0 ? 1 : 0);
        setShowSide(true);
      }, 350);
    }, 2500);

    fetchData().finally(() => {
      if (mounted) clearInterval(cycleTimer);
    });

    return () => { mounted = false; clearInterval(cycleTimer); };
  }, []);

  // ── Fetch Attendance ──────────────────────────────────────────────────────
  const fetchAttendance = useCallback(async (date) => {
    setAttendanceLoading(true);
    try {
      const data = await api(`/api/faculty/attendance?date=${date}`);
      const map = {};
      if (data.success) data.data.forEach(r => { map[r.faculty_id] = r.status; });
      setAttendance(map);
    } catch { setAttendance({}); }
    finally { setAttendanceLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === "attendance") fetchAttendance(selectedDate);
  }, [activeTab, selectedDate, fetchAttendance]);

  // ── Save Subjects ─────────────────────────────────────────────────────────
  const handleSaveSubjects = useCallback(async (facultyId, subjectIds) => {
    setSavingSubjects(true);
    try {
      await api(`/api/faculty/${facultyId}/subjects`, { method: "PUT", body: JSON.stringify({ subject_ids: subjectIds }) });
      const subjectMap = {};
      subjects.forEach(s => { subjectMap[s.id] = s; });
      setFaculty(prev => prev.map(f =>
        f.id === facultyId ? { ...f, subject_ids: subjectIds, subjects: subjectIds.map(id => subjectMap[id]).filter(Boolean) } : f
      ));
      setSelectedFaculty(null);
      showToast("Subjects updated successfully");
    } catch (err) { showToast(err.message, "error"); }
    finally { setSavingSubjects(false); }
  }, [subjects, showToast]);

  // ── Save Attendance ───────────────────────────────────────────────────────
  const handleSaveAttendance = useCallback(async () => {
    setAttendanceSaving(true);
    try {
      const records = faculty
        .filter(f => attendance[f.id] && attendance[f.id] !== "unmarked")
        .map(f => ({ faculty_id: f.id, status: attendance[f.id] }));
      await api("/api/faculty/attendance", { method: "PUT", body: JSON.stringify({ date: selectedDate, records }) });
      showToast("Attendance saved successfully");
    } catch (err) { showToast(err.message, "error"); }
    finally { setAttendanceSaving(false); }
  }, [faculty, attendance, selectedDate, showToast]);

  const handleDateChange = useCallback((days) => {
    const date = new Date(selectedDate + "T00:00:00");
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split("T")[0]);
  }, [selectedDate]);

  const handleMarkAll = useCallback((status) => {
    const m = {};
    faculty.forEach(f => { m[f.id] = status; });
    setAttendance(m);
  }, [faculty]);

  const handleStatusChange = useCallback((facultyId, status) => {
    setAttendance(prev => ({ ...prev, [facultyId]: prev[facultyId] === status ? "unmarked" : status }));
  }, []);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredFaculty = useMemo(() => {
    let r = faculty;
    if (statusFilter === "assigned") r = r.filter(f => f.subjects?.length > 0);
    else if (statusFilter === "unassigned") r = r.filter(f => !f.subjects?.length);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter(f => f.name?.toLowerCase().includes(q) || f.college_id?.toLowerCase().includes(q) || f.email?.toLowerCase().includes(q));
    }
    return r;
  }, [faculty, searchQuery, statusFilter]);

  const filteredAttendance = useMemo(() => {
    if (!attendanceSearch) return faculty;
    const q = attendanceSearch.toLowerCase();
    return faculty.filter(f => f.name?.toLowerCase().includes(q) || f.college_id?.toLowerCase().includes(q));
  }, [faculty, attendanceSearch]);

  const attendanceStats = useMemo(() => {
    const present = Object.values(attendance).filter(s => s === "present").length;
    const absent  = Object.values(attendance).filter(s => s === "absent").length;
    const leave   = Object.values(attendance).filter(s => s === "leave").length;
    return { present, absent, leave, unmarked: faculty.length - present - absent - leave };
  }, [attendance, faculty]);

  // ── Render loading / error full-screen ────────────────────────────────────
  if (loading) return <LoadingScreen sideIdx={sideIdx} showSide={showSide} />;
  if (error)   return <ErrorScreen error={error} onRetry={fetchData} />;

  // ── Shared input style ────────────────────────────────────────────────────
  const inputStyle = {
    width: "100%", padding: "9px 12px 9px 36px", borderRadius: 11,
    border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none",
    background: "#fff", color: "#1e293b", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "24px 24px 48px", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 16, right: 16, zIndex: 100,
          padding: "12px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 8,
          background: toast.type === "success" ? "#ecfdf5" : "#fff1f2",
          color: toast.type === "success" ? "#059669" : "#e11d48",
          border: `1.5px solid ${toast.type === "success" ? "#a7f3d0" : "#fecdd3"}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.09)", animation: "slideIn .25s ease",
        }}>
          <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(-8px);} to { opacity:1; transform:none; } }`}</style>
          {toast.type === "success" ? <PresentIcon size={14} color="#059669" /> : <AbsentIcon size={14} color="#e11d48" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg, #6366f1, #4f46e5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Faculty Management
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{faculty.length} faculty members</p>
        </div>
        <button onClick={fetchData} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 11, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: 4, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, width: "fit-content", marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {[{ key: "faculty", label: "Faculty & Subjects", emoji: "👥" }, { key: "attendance", label: "Attendance", emoji: "📋" }].map(({ key, label, emoji }) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            padding: "9px 20px", borderRadius: 10, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, transition: "all .15s",
            background: activeTab === key ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "transparent",
            color: activeTab === key ? "#fff" : "#64748b",
            boxShadow: activeTab === key ? "0 4px 12px #6366f133" : "none",
          }}><span>{emoji}</span>{label}</button>
        ))}
      </div>

      {/* ── Faculty Tab ── */}
      {activeTab === "faculty" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
            <StatsCard label="Total Faculty" value={faculty.length} color="indigo" icon={<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
            <StatsCard label="Subjects Assigned" value={faculty.filter(f => f.subjects?.length > 0).length} color="emerald" icon={<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} />
            <StatsCard label="Unassigned" value={faculty.filter(f => !f.subjects?.length).length} color="amber" icon={<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
              <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name, ID, or email…" style={inputStyle} />
            </div>
            <div style={{ display: "flex", gap: 3, padding: 3, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10 }}>
              {[{ key: "all", label: "All" }, { key: "assigned", label: "Assigned" }, { key: "unassigned", label: "Unassigned" }].map(({ key, label }) => (
                <button key={key} onClick={() => setStatusFilter(key)} style={{
                  padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 600, transition: "all .15s",
                  background: statusFilter === key ? "#6366f1" : "transparent",
                  color: statusFilter === key ? "#fff" : "#64748b",
                }}>{label}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
            {filteredFaculty.length === 0 ? (
              <div style={{ gridColumn: "1/-1", padding: "64px 0", textAlign: "center", color: "#94a3b8", background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", fontSize: 13 }}>No faculty members found</div>
            ) : filteredFaculty.map(f => <FacultyCard key={f.id} faculty={f} onEdit={setSelectedFaculty} />)}
          </div>
        </div>
      )}

      {/* ── Attendance Tab ── */}
      {activeTab === "attendance" && (
        <div>
          <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 2, background: "#f1f5f9", borderRadius: 9, padding: 3 }}>
                <button onClick={() => handleDateChange(-1)} style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: "none", cursor: "pointer", color: "#64748b", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", border: "none", background: "transparent", outline: "none", padding: "0 4px" }} />
                <button onClick={() => handleDateChange(1)} style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: "none", cursor: "pointer", color: "#64748b", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
              </div>
              {selectedDate !== todayStr() && (
                <button onClick={() => setSelectedDate(todayStr())} style={{ padding: "5px 11px", borderRadius: 7, border: "none", cursor: "pointer", background: "#eef2ff", color: "#6366f1", fontSize: 11, fontWeight: 600 }}>Today</button>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Mark all:</span>
              {["present", "absent", "leave"].map(s => {
                const Icon = STATUS_ICONS[s];
                return (
                  <button key={s} onClick={() => handleMarkAll(s)} style={{ padding: "5px 11px", borderRadius: 8, border: "none", cursor: "pointer", background: STATUS[s].bg, color: STATUS[s].text, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                    <Icon size={13} color={STATUS[s].text} /> {STATUS[s].label}
                  </button>
                );
              })}
            </div>

            <div style={{ marginLeft: "auto" }}>
              <button onClick={handleSaveAttendance} disabled={attendanceSaving} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 6, opacity: attendanceSaving ? 0.65 : 1 }}>
                {attendanceSaving ? <><SpinIcon /> Saving…</> : <><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> Save Attendance</>}
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
            <StatsCard label="Present" value={attendanceStats.present} color="emerald" icon={<PresentIcon size={20} color="#047857" />} />
            <StatsCard label="Absent" value={attendanceStats.absent} color="rose" icon={<AbsentIcon size={20} color="#be123c" />} />
            <StatsCard label="On Leave" value={attendanceStats.leave} color="amber" icon={<LeaveIcon size={20} color="#b45309" />} />
            <StatsCard label="Unmarked" value={attendanceStats.unmarked} color="slate" icon={<svg width="20" height="20" fill="none" stroke="#64748b" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} />
          </div>

          <div style={{ maxWidth: 280, marginBottom: 14, position: "relative" }}>
            <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={attendanceSearch} onChange={e => setAttendanceSearch(e.target.value)} placeholder="Search faculty…" style={inputStyle} />
          </div>

          {attendanceLoading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0" }}>
              <div style={{ width: 180, height: 180 }}><Lottie animationData={sideAnimation1} loop /></div>
              <p style={{ margin: "8px 0 0", fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Loading attendance…</p>
            </div>
          ) : (
            <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
              {filteredAttendance.length === 0 ? (
                <div style={{ padding: "64px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No faculty members found</div>
              ) : filteredAttendance.map(f => (
                <AttendanceRow key={f.id} faculty={f} status={attendance[f.id] ?? "unmarked"} onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}

          <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Attendance for {fmtDate(selectedDate)}
          </p>
        </div>
      )}

      <SubjectModal open={!!selectedFaculty} faculty={selectedFaculty} subjects={subjects} onClose={() => setSelectedFaculty(null)} onSave={handleSaveSubjects} saving={savingSubjects} />
    </div>
  );
}