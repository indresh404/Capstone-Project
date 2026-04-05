const express = require("express");
const cors = require("cors");
require("dotenv").config(); // load .env variables

const authRoutes = require("./routes/auth.routes");
const timetableRoutes = require("./routes/timetable.routes");
const facultyRoutes = require("./routes/faculty.routes");
const analyticsRoutes = require('./routes/analytics.routes');
const coursesRoutes = require("./routes/courses.routes");
const attendanceRoutes = require("./routes/attendance.routes");

const app = express();

/* middlewares */
app.use(cors());            // allow frontend requests
app.use(express.json());    // read JSON body

/* routes */
app.use("/api/auth", authRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/faculty", facultyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/attendance", attendanceRoutes);

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

/* server start */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📍 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`📅 Timetable endpoint: http://localhost:${PORT}/api/timetable`);
});