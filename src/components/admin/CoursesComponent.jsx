import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronDown, Clock, User, X, Check, BookOpen, Trash2 } from "lucide-react";

const facultyList = [
  "Dr. Priya Mehta", "Prof. Rajesh Kumar", "Dr. Ananya Rao",
  "Prof. Suresh Nair", "Dr. Meera Patel", "Prof. Kiran Desai",
];

const initialCourses = [
  { id: 1, code: "CS301", name: "Data Structures", dept: "Computer Science", credits: 4, lectureHrs: 3, labHrs: 2, tutorialHrs: 1, faculty: "Dr. Priya Mehta", semester: "Sem 3" },
  { id: 2, code: "CS302", name: "Operating Systems", dept: "Computer Science", credits: 3, lectureHrs: 3, labHrs: 2, tutorialHrs: 0, faculty: "Prof. Suresh Nair", semester: "Sem 5" },
  { id: 3, code: "EC201", name: "Digital Circuits", dept: "Electronics", credits: 4, lectureHrs: 3, labHrs: 3, tutorialHrs: 1, faculty: "Prof. Rajesh Kumar", semester: "Sem 3" },
  { id: 4, code: "MA101", name: "Linear Algebra", dept: "Mathematics", credits: 3, lectureHrs: 3, labHrs: 0, tutorialHrs: 2, faculty: "Dr. Ananya Rao", semester: "Sem 1" },
  { id: 5, code: "PH101", name: "Engineering Physics", dept: "Physics", credits: 3, lectureHrs: 2, labHrs: 2, tutorialHrs: 1, faculty: "Dr. Meera Patel", semester: "Sem 1" },
];

const depts = ["All", "Computer Science", "Electronics", "Mathematics", "Physics"];
const semesters = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7", "Sem 8"];

const emptyForm = { code: "", name: "", dept: "Computer Science", credits: 3, lectureHrs: 3, labHrs: 0, tutorialHrs: 0, faculty: facultyList[0], semester: "Sem 1" };

const CoursesComponent = () => {
  const [courses, setCourses] = useState(initialCourses);
  const [filterDept, setFilterDept] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = courses.filter(c => filterDept === "All" || c.dept === filterDept);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c) => { setEditId(c.id); setForm({ ...c }); setShowModal(true); };

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim()) return;
    if (editId) {
      setCourses(p => p.map(c => c.id === editId ? { ...c, ...form } : c));
    } else {
      setCourses(p => [...p, { id: Date.now(), ...form }]);
    }
    setShowModal(false);
  };

  const totalHrs = (c) => Number(c.lectureHrs) + Number(c.labHrs) + Number(c.tutorialHrs);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Courses & Mapping</h2>
          <p className="text-sm text-slate-400 mt-0.5">Assign faculty to subjects and configure weekly hours</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-95 transition-all"
        >
          <Plus size={18} /> Add Course
        </button>
      </div>

      {/* Dept Filter */}
      <div className="flex gap-2 flex-wrap">
        {depts.map(d => (
          <button
            key={d}
            onClick={() => setFilterDept(d)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterDept === d ? "bg-indigo-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-500 hover:border-indigo-300"}`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Course Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-0 text-xs font-bold text-slate-400 uppercase tracking-wider px-6 py-3 bg-slate-50 border-b border-slate-100">
          <span className="w-20">Code</span>
          <span>Course Name</span>
          <span className="w-28 text-center">Dept</span>
          <span className="w-20 text-center">Credits</span>
          <span className="w-24 text-center">Hours/Week</span>
          <span className="w-36 text-center">Faculty</span>
          <span className="w-20 text-center">Actions</span>
        </div>

        <div className="divide-y divide-slate-50">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-0 items-center px-6 py-4 hover:bg-slate-50/60 transition-colors"
            >
              <span className="w-20 text-xs font-black text-indigo-600 font-mono">{c.code}</span>
              <div>
                <p className="text-sm font-bold text-slate-800">{c.name}</p>
                <p className="text-xs text-slate-400">{c.semester}</p>
              </div>
              <span className="w-28 text-center">
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{c.dept.split(" ")[0]}</span>
              </span>
              <span className="w-20 text-center text-sm font-bold text-slate-700">{c.credits}</span>
              <div className="w-24 flex flex-col items-center gap-0.5">
                <span className="text-sm font-black text-slate-800">{totalHrs(c)} hrs</span>
                <span className="text-[10px] text-slate-400">L{c.lectureHrs} T{c.tutorialHrs} P{c.labHrs}</span>
              </div>
              <div className="w-36 flex items-center justify-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                  {c.faculty.charAt(0)}
                </div>
                <span className="text-xs text-slate-600 font-medium truncate max-w-[90px]">{c.faculty.split(" ").slice(-1)[0]}</span>
              </div>
              <div className="w-20 flex items-center justify-center gap-1">
                <button onClick={() => openEdit(c)} className="w-7 h-7 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg flex items-center justify-center transition-colors text-slate-500 text-xs">
                  ✏
                </button>
                <button onClick={() => setCourses(p => p.filter(x => x.id !== c.id))} className="w-7 h-7 bg-slate-100 hover:bg-rose-100 hover:text-rose-500 rounded-lg flex items-center justify-center transition-colors text-slate-500">
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Weekly Hours", value: filtered.reduce((acc, c) => acc + totalHrs(c), 0), icon: <Clock size={16} />, color: "text-indigo-600 bg-indigo-50" },
          { label: "Subjects Mapped", value: `${filtered.filter(c => c.faculty).length}/${filtered.length}`, icon: <User size={16} />, color: "text-purple-600 bg-purple-50" },
          { label: "Total Credits", value: filtered.reduce((acc, c) => acc + Number(c.credits), 0), icon: <BookOpen size={16} />, color: "text-violet-600 bg-violet-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-black text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-800">{editId ? "Edit Course" : "Add Course"}</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200"><X size={16} /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Course Code", key: "code", type: "text", full: false },
                  { label: "Course Name", key: "name", type: "text", full: false },
                ].map(f => (
                  <div key={f.key} className={f.full ? "col-span-2" : ""}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>
                ))}

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Department</label>
                  <select value={form.dept} onChange={e => setForm(p => ({ ...p, dept: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200">
                    {depts.filter(d => d !== "All").map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Semester</label>
                  <select value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200">
                    {semesters.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Assign Faculty</label>
                  <select value={form.faculty} onChange={e => setForm(p => ({ ...p, faculty: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200">
                    {facultyList.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Credits</label>
                  <input type="number" min={1} max={6} value={form.credits} onChange={e => setForm(p => ({ ...p, credits: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>

                {[
                  { label: "Lecture Hrs/Week", key: "lectureHrs" },
                  { label: "Lab Hrs/Week", key: "labHrs" },
                  { label: "Tutorial Hrs/Week", key: "tutorialHrs" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">{f.label}</label>
                    <input type="number" min={0} max={10} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>
                ))}
              </div>

              <button onClick={handleSave}
                className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                <Check size={16} /> {editId ? "Save Changes" : "Add Course"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoursesComponent;
