import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, Users, Search, Filter } from "lucide-react";

const AttendanceComponent = () => {
  const [selectedDate, setSelectedDate] = useState("Today");
  const [searchTerm, setSearchTerm] = useState("");

  const courses = [
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
  ];

  const attendanceStats = {
    total: 160,
    present: 149,
    absent: 11,
    percentage: 93
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
        {courses.map((course, index) => (
          <motion.div
            key={course.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${(course.present / course.students) * 100}%` }}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
                <CheckCircle size={16} />
                Mark All Present
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                Take Attendance
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AttendanceComponent;