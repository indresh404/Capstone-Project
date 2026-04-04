import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, Users, Search, Filter, Coffee } from "lucide-react";

const AttendanceComponent = () => {
  const [selectedDate, setSelectedDate] = useState("Today");
  const [searchTerm, setSearchTerm] = useState("");

  const [courses, setCourses] = useState([
    { 
      subject: "Data Structures", 
      code: "CS301", 
      students: 45, 
      present: 42,
      time: "10:00 AM",
      room: "Room 401"
    },
    { 
      subject: "Algorithms", 
      code: "CS302", 
      students: 38, 
      present: 35,
      time: "11:30 AM",
      room: "Room 302"
    },
    { 
      subject: "Database Systems", 
      code: "CS401", 
      students: 42, 
      present: 40,
      time: "9:00 AM",
      room: "Lab 201"
    },
    { 
      subject: "Web Development", 
      code: "CS403", 
      students: 35, 
      present: 32,
      time: "2:00 PM",
      room: "Room 105"
    },
  ]);

  const handleMarkAll = (courseCode, type) => {
    setCourses(prev => prev.map(c => {
      if (c.code === courseCode) {
        if (type === 'present') return { ...c, present: c.students };
        if (type === 'absent') return { ...c, present: 0 };
        if (type === 'leave') return { ...c, present: Math.floor(c.students * 0.9) }; // Simulated leave logic
      }
      return c;
    }));
  };

  const attendanceStats = {
    total: courses.reduce((acc, c) => acc + c.students, 0),
    present: courses.reduce((acc, c) => acc + c.present, 0),
    absent: courses.reduce((acc, c) => acc + (c.students - c.present), 0),
    get percentage() { return Math.round((this.present / this.total) * 100) || 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-800">Mark Attendance</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-medium text-slate-700 flex items-center gap-2 hover:bg-slate-50">
            <Filter size={16} />
            Filter
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
            Take New Attendance
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="text-blue-600" size={20} />
            </div>
            <span className="text-sm font-medium text-slate-600">Total Students</span>
          </div>
          <p className="text-3xl font-black text-slate-800">{attendanceStats.total}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <span className="text-sm font-medium text-slate-600">Present</span>
          </div>
          <p className="text-3xl font-black text-green-600">{attendanceStats.present}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-red-100 rounded-xl">
              <XCircle className="text-red-600" size={20} />
            </div>
            <span className="text-sm font-medium text-slate-600">Absent</span>
          </div>
          <p className="text-3xl font-black text-red-600">{attendanceStats.absent}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Clock className="text-purple-600" size={20} />
            </div>
            <span className="text-sm font-medium text-slate-600">Attendance %</span>
          </div>
          <p className="text-3xl font-black text-purple-600">{attendanceStats.percentage}%</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-100">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="flex gap-2">
            {["Today", "This Week", "This Month"].map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedDate === date
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {courses.filter(c => c.subject.toLowerCase().includes(searchTerm.toLowerCase())).map((course, index) => (
          <motion.div
            key={course.code}
            initial={{ opacity: 1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{course.subject}</h3>
                <p className="text-sm text-slate-600">{course.code} • {course.time} • {course.room}</p>
              </div>
              <span className="text-sm font-medium text-slate-600">{course.present}/{course.students} Present</span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(course.present / course.students) * 100}%` }}
                className={`h-full rounded-full ${course.present/course.students > 0.8 ? 'bg-green-500' : 'bg-amber-500'}`}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => handleMarkAll(course.code, 'present')}
                className="px-4 py-2 bg-green-50/50 text-green-700 border border-green-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all flex items-center gap-2"
              >
                <CheckCircle size={14} /> Mark All Present
              </button>
              <button 
                onClick={() => handleMarkAll(course.code, 'leave')}
                className="px-4 py-2 bg-amber-50/50 text-amber-700 border border-amber-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all flex items-center gap-2"
              >
                <Coffee size={14} /> Apply Bulk Leave
              </button>
              <button 
                onClick={() => handleMarkAll(course.code, 'absent')}
                className="px-4 py-2 bg-red-50/50 text-red-700 border border-red-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
              >
                <XCircle size={14} /> Mark All Absent
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AttendanceComponent;