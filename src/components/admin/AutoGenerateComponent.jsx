import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronDown, CheckCircle, AlertTriangle, RefreshCw, Download, Loader } from "lucide-react";

const departments = ["Computer Science", "Electronics", "Mathematics", "Physics", "Mechanical"];
const semesters = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7", "Sem 8"];
const timeSlots = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const sampleTimetable = {
  "Mon": { "9:00 AM": { subject: "Data Structures", faculty: "Dr. Priya M.", room: "Lab A" }, "10:00 AM": { subject: "OS", faculty: "Prof. Suresh", room: "Room 301" }, "11:00 AM": { subject: "Networks", faculty: "Prof. Suresh", room: "Room 301" }, "2:00 PM": { subject: "DS Lab", faculty: "Dr. Priya M.", room: "Lab A" } },
  "Tue": { "9:00 AM": { subject: "Linear Algebra", faculty: "Dr. Ananya", room: "Room 201" }, "11:00 AM": { subject: "Physics", faculty: "Dr. Meera", room: "Lab B" }, "2:00 PM": { subject: "OS Lab", faculty: "Prof. Suresh", room: "Lab C" } },
  "Wed": { "9:00 AM": { subject: "Data Structures", faculty: "Dr. Priya M.", room: "Room 302" }, "10:00 AM": { subject: "Linear Algebra", faculty: "Dr. Ananya", room: "Room 201" }, "11:00 AM": { subject: "OS", faculty: "Prof. Suresh", room: "Room 301" } },
  "Thu": { "9:00 AM": { subject: "Networks", faculty: "Prof. Suresh", room: "Room 301" }, "11:00 AM": { subject: "Physics", faculty: "Dr. Meera", room: "Room 101" }, "2:00 PM": { subject: "Physics Lab", faculty: "Dr. Meera", room: "Lab B" } },
  "Fri": { "9:00 AM": { subject: "Data Structures", faculty: "Dr. Priya M.", room: "Room 302" }, "10:00 AM": { subject: "Linear Algebra", faculty: "Dr. Ananya", room: "Room 201" } },
};

const subjectColors = {
  "Data Structures": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "OS": "bg-purple-100 text-purple-700 border-purple-200",
  "OS Lab": "bg-purple-50 text-purple-600 border-purple-100",
  "DS Lab": "bg-indigo-50 text-indigo-600 border-indigo-100",
  "Networks": "bg-violet-100 text-violet-700 border-violet-200",
  "Linear Algebra": "bg-sky-100 text-sky-700 border-sky-200",
  "Physics": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Physics Lab": "bg-emerald-50 text-emerald-600 border-emerald-100",
};

const AutoGenerateComponent = () => {
  const [config, setConfig] = useState({ dept: "Computer Science", semester: "Sem 3", avoidConflicts: true, balanceLoad: true, prioritizeLabs: true });
  const [status, setStatus] = useState("idle"); // idle | generating | done
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);

  const generate = async () => {
    setStatus("generating");
    setProgress(0);
    setLogs([]);

    const steps = [
      { msg: "Loading faculty availability...", pct: 15 },
      { msg: "Mapping courses to faculty...", pct: 30 },
      { msg: "Applying constraint solver...", pct: 55 },
      { msg: "Resolving conflicts...", pct: 75 },
      { msg: "Optimizing load distribution...", pct: 90 },
      { msg: "Timetable generated successfully!", pct: 100 },
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 500 + Math.random() * 400));
      setProgress(step.pct);
      setLogs(prev => [...prev, step.msg]);
    }
    setStatus("done");
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-800">Auto-Generate Timetable</h2>
        <p className="text-sm text-slate-400 mt-0.5">Configure parameters and let the scheduler do the work</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Config Panel */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-sm font-black text-slate-700">Configuration</h3>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Department</label>
              <select value={config.dept} onChange={e => setConfig(p => ({ ...p, dept: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200">
                {departments.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Semester</label>
              <select value={config.semester} onChange={e => setConfig(p => ({ ...p, semester: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200">
                {semesters.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { key: "avoidConflicts", label: "Avoid scheduling conflicts" },
                { key: "balanceLoad", label: "Balance faculty workload" },
                { key: "prioritizeLabs", label: "Prioritize lab scheduling" },
              ].map(opt => (
                <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setConfig(p => ({ ...p, [opt.key]: !p[opt.key] }))}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${config[opt.key] ? "bg-indigo-600 border-indigo-600" : "border-slate-300 group-hover:border-indigo-400"}`}
                  >
                    {config[opt.key] && <CheckCircle size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-sm text-slate-600 font-medium">{opt.label}</span>
                </label>
              ))}
            </div>

            <button
              onClick={generate}
              disabled={status === "generating"}
              className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === "generating" ? <><Loader size={16} className="animate-spin" /> Generating...</> : <><Zap size={16} /> Generate Timetable</>}
            </button>
          </div>

          {/* Logs */}
          {logs.length > 0 && (
            <div className="bg-slate-900 rounded-2xl p-4 space-y-1.5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Log</p>
              {logs.map((log, i) => (
                <motion.p key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  className={`text-xs font-mono ${i === logs.length - 1 && status === "done" ? "text-emerald-400" : "text-slate-300"}`}>
                  {">"} {log}
                </motion.p>
              ))}
              {status === "generating" && (
                <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timetable Preview */}
        <div className="col-span-2">
          {status === "done" ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <p className="font-black text-slate-800">{config.dept} — {config.semester}</p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5"><CheckCircle size={11} className="text-emerald-500" /> Generated successfully • No conflicts found</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={generate} className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors">
                    <RefreshCw size={13} /> Regenerate
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors">
                    <Download size={13} /> Export
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-3 font-bold text-slate-400 w-20">Time</th>
                      {days.map(d => <th key={d} className="px-3 py-3 font-bold text-slate-600 text-center">{d}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(slot => {
                      const hasAny = days.some(d => sampleTimetable[d]?.[slot]);
                      if (!hasAny && slot !== "12:00 PM") return null;
                      return (
                        <tr key={slot} className={`border-t border-slate-50 ${slot === "12:00 PM" ? "bg-slate-50/50" : ""}`}>
                          <td className="px-4 py-2 text-slate-400 font-medium whitespace-nowrap">{slot}</td>
                          {days.map(d => {
                            const cell = sampleTimetable[d]?.[slot];
                            if (slot === "12:00 PM") return <td key={d} className="px-3 py-2 text-center"><span className="text-[10px] text-slate-300 font-medium">Break</span></td>;
                            return (
                              <td key={d} className="px-3 py-2">
                                {cell ? (
                                  <div className={`border rounded-lg px-2 py-1.5 ${subjectColors[cell.subject] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                    <p className="font-bold text-[11px] truncate">{cell.subject}</p>
                                    <p className="text-[10px] opacity-70 truncate">{cell.faculty}</p>
                                    <p className="text-[10px] opacity-60 truncate">{cell.room}</p>
                                  </div>
                                ) : <div className="h-8" />}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full min-h-[400px] flex flex-col items-center justify-center gap-4 text-slate-300">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <Zap size={36} className="text-indigo-400" />
              </div>
              <div className="text-center">
                <p className="font-black text-slate-400 text-base">No timetable generated yet</p>
                <p className="text-sm text-slate-300 mt-1">Configure settings and click Generate</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoGenerateComponent;
