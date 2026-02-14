import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, BookOpen, Download, ChevronRight } from "lucide-react";

const TimetableComponent = () => {
  const timetableData = {
    monday: [
      { time: "10:00 - 11:30", subject: "Data Structures", code: "CS301", room: "401", type: "Lecture" },
      { time: "14:00 - 15:30", subject: "Web Development", code: "CS403", room: "Lab 201", type: "Lab" },
    ],
    tuesday: [
      { time: "11:30 - 13:00", subject: "Algorithms", code: "CS302", room: "302", type: "Lecture" },
    ],
    wednesday: [
      { time: "09:00 - 10:30", subject: "Database Systems", code: "CS401", room: "Lab 201", type: "Lab" },
      { time: "15:00 - 16:30", subject: "Research Meeting", code: "—", room: "Cabin 12", type: "Meeting" },
    ],
    thursday: [
      { time: "14:00 - 15:30", subject: "Web Development", code: "CS403", room: "105", type: "Lecture" },
    ],
    friday: [
      { time: "13:00 - 14:30", subject: "AI Fundamentals", code: "CS501", room: "403", type: "Seminar" },
    ],
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Timetable</h2>
          <p className="text-slate-500 mt-1">Spring Semester 2024 • Even Semester</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
          <Download size={16} />
          Download PDF
        </button>
      </div>

      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black mb-2">Interactive Timetable Coming Soon! 🚀</h3>
            <p className="text-white/80">We're building a drag-and-drop timetable with real-time updates.</p>
            <p className="text-sm text-white/60 mt-2">Expected release: Next Semester</p>
          </div>
          <Calendar size={48} className="text-white/30" />
        </div>
      </div>

      {/* Weekly Timetable */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div className="grid grid-cols-5 gap-4">
          {days.map((day, dayIndex) => (
            <div key={day} className="space-y-3">
              {/* Day Header */}
              <div className="text-center p-3 bg-indigo-50 rounded-xl">
                <h3 className="font-bold text-indigo-700">{day}</h3>
                <p className="text-xs text-indigo-500 mt-1">
                  {timetableData[day.toLowerCase()]?.length || 0} classes
                </p>
              </div>

              {/* Classes */}
              <div className="space-y-2">
                {timetableData[day.toLowerCase()]?.map((class_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: dayIndex * 0.1 + index * 0.1 }}
                    className="p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-8 bg-indigo-500 rounded-full" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{class_.time}</p>
                        <p className="text-sm font-bold text-slate-800 mt-1">{class_.subject}</p>
                        <p className="text-xs text-slate-600 mt-1">{class_.code}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                          <MapPin size={10} />
                          <span>Room {class_.room}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full mt-2 inline-block ${
                          class_.type === 'Lecture' ? 'bg-blue-100 text-blue-700' :
                          class_.type === 'Lab' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {class_.type}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )) || (
                  <div className="p-3 bg-slate-50 rounded-xl text-center text-slate-400 text-sm">
                    No classes
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <Clock className="text-indigo-600" size={20} />
            <div>
              <p className="text-sm text-slate-600">Total Hours/Week</p>
              <p className="text-xl font-black text-slate-800">14 hours</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <BookOpen className="text-indigo-600" size={20} />
            <div>
              <p className="text-sm text-slate-600">Courses</p>
              <p className="text-xl font-black text-slate-800">5 courses</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <Calendar className="text-indigo-600" size={20} />
            <div>
              <p className="text-sm text-slate-600">Free Periods</p>
              <p className="text-xl font-black text-slate-800">8 slots</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TimetableComponent;