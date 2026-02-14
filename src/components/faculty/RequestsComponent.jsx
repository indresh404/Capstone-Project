import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  AlertCircle, CheckCircle, XCircle, Clock, 
  User, Calendar, MessageSquare, Filter, Search 
} from "lucide-react";

const RequestsComponent = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const requests = [
    { 
      id: 1, 
      type: "Leave Application", 
      student: "John Doe",
      rollNo: "CS2101",
      date: "2024-03-15",
      days: "3 days",
      status: "pending",
      reason: "Medical leave due to fever",
      submitted: "2 days ago"
    },
    { 
      id: 2, 
      type: "Grade Revision", 
      student: "Jane Smith",
      rollNo: "CS2102",
      date: "2024-03-14",
      subject: "Data Structures",
      status: "pending",
      reason: "Request for mid-term exam re-evaluation",
      submitted: "3 days ago"
    },
    { 
      id: 3, 
      type: "Extension Request", 
      student: "Mike Johnson",
      rollNo: "CS2103",
      date: "2024-03-13",
      days: "2 days",
      status: "approved",
      reason: "Project deadline extension for better implementation",
      submitted: "5 days ago"
    },
    { 
      id: 4, 
      type: "Special Request", 
      student: "Sarah Williams",
      rollNo: "CS2104",
      date: "2024-03-12",
      status: "rejected",
      reason: "Request for additional resources",
      submitted: "1 week ago"
    },
  ];

  const filteredRequests = requests.filter(req => {
    if (filter !== "all" && req.status !== filter) return false;
    if (searchTerm && !req.student.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock size={16} className="text-yellow-600" />;
      case 'approved': return <CheckCircle size={16} className="text-green-600" />;
      case 'rejected': return <XCircle size={16} className="text-red-600" />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
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
        <h2 className="text-3xl font-black text-slate-800">Requests</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200 border border-slate-200"
            />
          </div>
          <button className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-medium text-slate-700 flex items-center gap-2 border border-slate-200 hover:bg-slate-50">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              filter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {status} {status === 'all' ? `(${requests.length})` : `(${requests.filter(r => r.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  request.type === 'Leave Application' ? 'bg-blue-100' :
                  request.type === 'Grade Revision' ? 'bg-purple-100' :
                  'bg-amber-100'
                }`}>
                  <AlertCircle className={
                    request.type === 'Leave Application' ? 'text-blue-600' :
                    request.type === 'Grade Revision' ? 'text-purple-600' :
                    'text-amber-600'
                  } size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-slate-800">{request.type}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{request.reason}</p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <User size={12} />
                      <span>{request.student} • {request.rollNo}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar size={12} />
                      <span>Submitted {request.submitted}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {request.status === 'pending' && (
                  <>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1">
                      <CheckCircle size={14} />
                      Approve
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-1">
                      <XCircle size={14} />
                      Reject
                    </button>
                  </>
                )}
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1">
                  <MessageSquare size={14} />
                  Message
                </button>
              </div>
            </div>

            {/* Additional Details */}
            {request.type === 'Leave Application' && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl text-sm">
                <span className="font-medium text-slate-700">Leave Period: </span>
                <span className="text-slate-600">{request.days} (Starting from {request.date})</span>
              </div>
            )}
            {request.type === 'Grade Revision' && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl text-sm">
                <span className="font-medium text-slate-700">Subject: </span>
                <span className="text-slate-600">{request.subject}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-slate-100">
          <AlertCircle size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No requests found</h3>
          <p className="text-slate-500">There are no {filter !== 'all' ? filter : ''} requests at the moment.</p>
        </div>
      )}
    </motion.div>
  );
};

export default RequestsComponent;