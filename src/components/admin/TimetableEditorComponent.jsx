import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, X, Edit3, AlertTriangle, Check, ChevronDown } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const timeSlots = ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
const timeLabels = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"];

const subjectOptions = ["Data Structures", "Operating Systems", "Networks", "Linear Algebra", "Physics", "DS Lab", "OS Lab", "Physics Lab", "Free / Break"];
const facultyOptions = ["Dr. Priya Mehta", "Prof. Suresh Nair", "Dr. Ananya Rao", "Dr. Meera Patel", "Prof. Rajesh Kumar"];
const roomOptions = ["Room 301", "Room 302", "Room 201", "Lab A", "Lab B", "Lab C"];

const colorMap = {
  "Data Structures": "bg-indigo-100 text-indigo-700 border-indigo-300",
  "Operating Systems": "bg-purple-100 text-purple-700 border-purple-300",
  "OS Lab": "bg-purple-50 text-purple-600 border-purple-200",
  "DS Lab": "bg-indigo-50 text-indigo-600 border-indigo-200",
  "Networks": "bg-violet-100 text-violet-700 border-violet-300",
  "Linear Algebra": "bg-sky-100 text-sky-700 border-sky-300",
  "Physics": "bg-emerald-100 text-emerald-700 border-emerald-300",
  "Physics Lab": "bg-emerald-50 text-emerald-600 border-emerald-200",
};

const initGrid = () => {
  const grid = {};
  days.forEach(d => {
    grid[d] = {};
    timeSlots.forEach(t => { grid[d][t] = null; });
  });
  grid["Mon"]["9:00"] = { subject: "Data Structures", faculty: "Dr. Priya Mehta", room: "Room 302" };
  grid["Mon"]["10:00"] = { subject: "Operating Systems", faculty: "Prof. Suresh Nair", room: "Room 301" };
  grid["Mon"]["14:00"] = { subject: "DS Lab", faculty: "Dr. Priya Mehta", room: "Lab A" };
  grid["Tue"]["9:00"] = { subject: "Linear Algebra", faculty: "Dr. Ananya Rao", room: "Room 201" };
  grid["Tue"]["11:00"] = { subject: "Physics", faculty: "Dr. Meera Patel", room: "Room 101" };
  grid["Wed"]["9:00"] = { subject: "Data Structures", faculty: "Dr. Priya Mehta", room: "Room 302" };
  grid["Wed"]["11:00"] = { subject: "Networks", faculty: "Prof. Suresh Nair", room: "Room 301" };
  grid["Thu"]["9:00"] = { subject: "Networks", faculty: "Prof. Suresh Nair", room: "Room 301" };
  grid["Thu"]["14:00"] = { subject: "Physics Lab", faculty: "Dr. Meera Patel", room: "Lab B" };
  grid["Fri"]["10:00"] = { subject: "Linear Algebra", faculty: "Dr. Ananya Rao", room: "Room 201" };
  return grid;
};

const TimetableEditorComponent = () => {
  const [grid, setGrid] = useState(initGrid());
  const [editCell, setEditCell] = useState(null); // { day, time }
  const [form, setForm] = useState({ subject: "", faculty: "", room: "" });
  const [saved, setSaved] = useState(false);
  const [dept, setDept] = useState("Computer Science");
  const [semester, setSemester] = useState("Sem 3");

  const openCell = (day, time) => {
    const existing = grid[day][time];
    setForm(existing ? { ...existing } : { subject: "Data Structures", faculty: facultyOptions[0], room: roomOptions[0] });
    setEditCell({ day, time });
  };

  const saveCell = () => {
    if (!editCell) return;
    setGrid(prev => ({
      ...prev,
      [editCell.day]: {
        ...prev[editCell.day],
        [editCell.time]: form.subject === "Free / Break" ? null : { ...form }
      }
    }));
    setEditCell(null);
  };

  const clearCell = (day, time) => {
    setGrid(prev => ({ ...prev, [day]: { ...prev[day], [time]: null } }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Timetable Editor</h2>
          <p className="text-sm text-slate-400 mt-0.5">Click any slot to edit or clear it</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={dept} onChange={e => setDept(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200">
            {["Computer Science", "Electronics", "Mathematics"].map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={semester} onChange={e => setSemester(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200">
            {["Sem 1","Sem 2","Sem 3","Sem 4","Sem 5","Sem 6"].map(s => <option key={s}>{s}</option>)}
          </select>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-md ${saved ? "bg-emerald-500 text-white" : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"}`}
          >
            {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3.5 font-bold text-slate-400 w-16 border-r border-slate-100">Time</th>
              {days.map(d => (
                <th key={d} className="px-3 py-3.5 font-black text-slate-600 text-center border-r border-slate-100 last:border-r-0">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, si) => (
              <tr key={slot} className={`border-b border-slate-50 ${slot === "12:00" ? "bg-amber-50/40" : ""}`}>
                <td className="px-5 py-2 text-slate-400 font-bold border-r border-slate-100 whitespace-nowrap">
                  {timeLabels[si]}
                </td>
                {days.map(d => {
                  const cell = grid[d][slot];
                  if (slot === "12:00") {
                    return <td key={d} className="px-3 py-2 text-center border-r border-slate-100 last:border-r-0">
                      <span className="text-[10px] font-bold text-amber-400">LUNCH</span>
                    </td>;
                  }
                  return (
                    <td key={d} className="px-2 py-1.5 border-r border-slate-100 last:border-r-0" style={{ minWidth: 120 }}>
                      {cell ? (
                        <div
                          onClick={() => openCell(d, slot)}
                          className={`group relative border rounded-xl px-3 py-2 cursor-pointer hover:shadow-md transition-all ${colorMap[cell.subject] || "bg-slate-100 text-slate-600 border-slate-200"}`}
                        >
                          <button
                            onClick={e => { e.stopPropagation(); clearCell(d, slot); }}
                            className="absolute top-1 right-1 w-4 h-4 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-500"
                          >
                            <X size={9} strokeWidth={3} />
                          </button>
                          <p className="font-bold text-[11px] truncate pr-4">{cell.subject}</p>
                          <p className="text-[10px] opacity-70 truncate">{cell.faculty.split(" ").slice(-1)[0]}</p>
                          <p className="text-[10px] opacity-50">{cell.room}</p>
                        </div>
                      ) : (
                        <div
                          onClick={() => openCell(d, slot)}
                          className="h-14 rounded-xl border-2 border-dashed border-slate-150 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all cursor-pointer flex items-center justify-center group"
                        >
                          <span className="text-[10px] text-slate-300 group-hover:text-indigo-400 font-bold transition-colors">+ Add</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editCell && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={(e) => e.target === e.currentTarget && setEditCell(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-black text-slate-800">Edit Slot</h3>
                  <p className="text-xs text-slate-400">{editCell.day} · {editCell.time}</p>
                </div>
                <button onClick={() => setEditCell(null)} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200"><X size={14} /></button>
              </div>

              {[
                { label: "Subject", key: "subject", options: subjectOptions },
                { label: "Faculty", key: "faculty", options: facultyOptions },
                { label: "Room", key: "room", options: roomOptions },
              ].map(f => (
                <div key={f.key} className="mb-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">{f.label}</label>
                  <select
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}

              <div className="flex gap-3 mt-5">
                <button onClick={() => setEditCell(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button onClick={saveCell} className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                  <Check size={15} /> Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimetableEditorComponent;
