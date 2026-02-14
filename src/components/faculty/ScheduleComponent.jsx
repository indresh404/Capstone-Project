import React from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Users, Calendar, ChevronRight } from "lucide-react";

const ScheduleComponent = () => {
  const scheduleData = [
    { 
      id: 1, 
      time: "10:00 AM - 11:30 AM", 
      subject: "Data Structures", 
      code: "CS301",
      room: "Room 401", 
      type: "Lecture", 
      color: "blue",
      students: 45,
      building: "Engineering Block A"
    },
    { 
      id: 2, 
      time: "2:00 PM - 3:30 PM", 
      subject: "Web Development Lab", 
      code: "CS403",
      room: "Lab 201", 
      type: "Lab", 
      color: "green",
      students: 35,
      building: "Computer Science Building"
    },
    { 
      id: 3, 
      time: "4:00 PM - 5:00 PM", 
      subject: "Office Hours", 
      code: "—",
      room: "Cabin 12", 
      type: "Meeting", 
      color: "purple",
      students: "—",
      building: "Faculty Block"
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-500 border-blue-200 text-blue-700",
      green: "bg-green-500 border-green-200 text-green-700",
      purple: "bg-purple-500 border-purple-200 text-purple-700"
    };
    return colors[color] || colors.blue;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header with Date */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-800">Today's Schedule</h2>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
          <Calendar size={18} className="text-indigo-600" />
          <span className="font-medium text-slate-700">Monday, March 15, 2024</span>
        </div>
      </div>

      {/* Schedule Timeline */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div className="space-y-4">
          {scheduleData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all cursor-pointer">
                {/* Time indicator */}
                <div className="flex flex-col items-center min-w-[100px]">
                  <span className="text-sm font-bold text-slate-700">{item.time.split(' - ')[0]}</span>
                  <span className="text-xs text-slate-500">to</span>
                  <span className="text-sm font-bold text-slate-700">{item.time.split(' - ')[1]}</span>
                </div>

                {/* Color bar */}
                <div className={`w-1 h-16 rounded-full ${getColorClasses(item.color).split(' ')[0]}`} />

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-800">{item.subject}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getColorClasses(item.color)} bg-opacity-20`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{item.code}</p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={12} />
                      <span>{item.room} • {item.building}</span>
                    </div>
                    {item.students !== "—" && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Users size={12} />
                        <span>{item.students} students</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action button */}
                <button className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-800">Weekly Overview</h3>
          <button className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View Full Week <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
            <div key={day} className="text-center">
              <div className={`p-3 rounded-xl ${index === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600'} font-medium mb-2`}>
                {day}
              </div>
              <div className="space-y-1">
                <div className={`text-xs p-1 rounded ${index === 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-50'}`}>
                  {index === 0 ? '3 classes' : '—'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ScheduleComponent;
