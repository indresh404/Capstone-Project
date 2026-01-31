import React from "react";
import "../styles/faculty.css";

const FacultyDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="faculty-wrapper">
      <div className="faculty-card">
        <h1>Faculty Dashboard</h1>
        <p>Welcome, {user?.name}</p>
      </div>
    </div>
  );
};

export default FacultyDashboard;
