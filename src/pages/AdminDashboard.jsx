import React from "react";
import "../styles/admin.css";

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="admin-wrapper">
      <div className="admin-card">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.name}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
