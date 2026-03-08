import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit2, Trash2, X, Mail, Phone, BookOpen, Check } from "lucide-react";

const initialFaculty = [
  { id: 1, name: "Dr. Priya Mehta", dept: "Computer Science", email: "priya.mehta@schedula.edu", phone: "+91 98765 43210", subjects: ["Data Structures", "Algorithms"], maxHours: 18, assignedHours: 14 },
  { id: 2, name: "Prof. Rajesh Kumar", dept: "Electronics", email: "rajesh.k@schedula.edu", phone: "+91 91234 56789", subjects: ["Digital Circuits", "VLSI"], maxHours: 16, assignedHours: 16 },
  { id: 3, name: "Dr. Ananya Rao", dept: "Mathematics", email: "ananya.r@schedula.edu", phone: "+91 87654 32109", subjects: ["Linear Algebra", "Calculus"], maxHours: 20, assignedHours: 10 },
  { id: 4, name: "Prof. Suresh Nair", dept: "Computer Science", email: "suresh.n@schedula.edu", phone: "+91 99887 76655", subjects: ["Operating Systems", "Networks"], maxHours: 18, assignedHours: 18 },
  { id: 5, name: "Dr. Meera Patel", dept: "Physics", email: "meera.p@schedula.edu", phone: "+91 88776 65544", subjects: ["Engineering Physics"], maxHours: 14, assignedHours: 8 },
];

const depts = ["All", "Computer Science", "Electronics", "Mathematics", "Physics", "Mechanical"];

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" } })
};

const FacultyComponent = () => {
  const [faculty, setFaculty] = useState(initialFaculty);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: "", dept: "Computer Science", email: "", phone: "", maxHours: 18 });

  const filtered = faculty.filter(f =>
    (selectedDept === "All" || f.dept === selectedDept) &&
    (f.name.toLowerCase().includes(search.toLowerCase()) || f.dept.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => {
    setEditTarget(null);
    setForm({ name: "", dept: "Computer Science", email: "", phone: "", maxHours: 18 });
    setShowModal(true);
  };

  const openEdit = (f) => {
    setEditTarget(f.id);
    setForm({ name: f.name, dept: f.dept, email: f.email, phone: f.phone, maxHours: f.maxHours });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editTarget) {
      setFaculty(prev => prev.map(f => f.id === editTarget ? { ...f, ...form } : f));
    } else {
      setFaculty(prev => [...prev, { id: Date.now(), ...form, subjects: [], assignedHours: 0 }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => setFaculty(prev => prev.filter(f => f.id !== id));

  return (
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Faculty Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">{faculty.length} faculty members across departments</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-95 transition-all"
        >
          <Plus size={18} /> Add Faculty
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search faculty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {depts.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDept(d)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedDept === d ? "bg-indigo-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-500 hover:border-indigo-300"}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Faculty Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((f, i) => {
          const pct = Math.round((f.assignedHours / f.maxHours) * 100);
          const overloaded = pct >= 100;
          return (
            <motion.div
              key={f.id}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black text-lg shrink-0">
                  {f.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-slate-800 text-base">{f.name}</h3>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">{f.dept}</span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => openEdit(f)} className="w-8 h-8 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl flex items-center justify-center transition-colors text-slate-500">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(f.id)} className="w-8 h-8 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-xl flex items-center justify-center transition-colors text-slate-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 mt-3 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500"><Mail size={12} />{f.email}</span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500"><Phone size={12} />{f.phone}</span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500"><BookOpen size={12} />{f.subjects.join(", ") || "No subjects"}</span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${overloaded ? "bg-rose-500" : pct > 70 ? "bg-amber-400" : "bg-emerald-400"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${overloaded ? "text-rose-500" : "text-slate-500"}`}>
                      {f.assignedHours}/{f.maxHours} hrs {overloaded ? "⚠ Overloaded" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
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
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-800">{editTarget ? "Edit Faculty" : "Add Faculty"}</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Full Name", key: "name", type: "text" },
                  { label: "Email", key: "email", type: "email" },
                  { label: "Phone", key: "phone", type: "text" },
                  { label: "Max Hours/Week", key: "maxHours", type: "number" },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      value={form[field.key]}
                      onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Department</label>
                  <select
                    value={form.dept}
                    onChange={e => setForm(p => ({ ...p, dept: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    {depts.filter(d => d !== "All").map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <button
                onClick={handleSave}
                className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                <Check size={16} /> {editTarget ? "Save Changes" : "Add Faculty"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacultyComponent;
