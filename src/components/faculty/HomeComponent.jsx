import React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, BookOpen, Users, Calendar, TrendingUp } from "lucide-react";

const HomeComponent = () => {
  const stats = [
    { 
      icon: <Clock className="text-indigo-600" size={24} />,
      label: "Total Classes",
      value: "156",
      subtext: "This semester",
      change: "+12%",
      color: "from-blue-50 to-indigo-50",
      iconColor: "text-indigo-600"
    },
    { 
      icon: <CheckCircle className="text-emerald-600" size={24} />,
      label: "Attendance Rate",
      value: "92%",
      subtext: "Average",
      change: "+5%",
      color: "from-green-50 to-emerald-50",
      iconColor: "text-emerald-600"
    },
    { 
      icon: <BookOpen className="text-purple-600" size={24} />,
      label: "Active Courses",
      value: "4",
      subtext: "This semester",
      change: "0",
      color: "from-purple-50 to-pink-50",
      iconColor: "text-purple-600"
    },
    { 
      icon: <Users className="text-amber-600" size={24} />,
      label: "Total Students",
      value: "128",
      subtext: "Across courses",
      change: "+8",
      color: "from-amber-50 to-orange-50",
      iconColor: "text-amber-600"
    },
  ];

  const upcomingClasses = [
    { time: "10:00 AM", subject: "Data Structures", room: "Room 401", students: 45 },
    { time: "2:00 PM", subject: "Web Development", room: "Lab 201", students: 35 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2rem] p-8 text-white">
        <h2 className="text-3xl font-black mb-2">Welcome back, Dr. Indresh Suresh! 👋</h2>
        <p className="text-white/80 mb-4">Here's what's happening with your classes today.</p>
        <div className="flex gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
            <Calendar size={16} className="inline mr-2" />
            <span className="text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 bg-white rounded-xl shadow-sm`}>
                {stat.icon}
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
            <p className="text-sm font-medium text-slate-600">{stat.label}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.subtext}</p>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Upcoming Classes */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-800">Upcoming Classes</h3>
            <TrendingUp size={20} className="text-indigo-600" />
          </div>
          <div className="space-y-4">
            {upcomingClasses.map((cls, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="w-1 h-12 bg-indigo-500 rounded-full" />
                <div>
                  <p className="font-bold text-slate-800">{cls.time}</p>
                  <p className="text-sm text-slate-600">{cls.subject}</p>
                  <p className="text-xs text-slate-500">{cls.room} • {cls.students} students</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {['Mark Attendance', 'Upload Grades', 'Schedule Class', 'View Reports'].map((action, index) => (
              <button
                key={index}
                className="p-4 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-sm font-medium text-slate-700 text-center"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HomeComponent;