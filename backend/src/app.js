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
const corsOptions = {
  origin: process.env.FRONTEND_URL || "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());    // read JSON body

/* routes */
app.use("/api/auth", authRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/faculty", facultyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/attendance", attendanceRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
  res.json({ message: "Backend is working!" });
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

/* server start */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Schedula Server ACTIVE`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔋 Environment: ${process.env.NODE_ENV || 'development'}`);
});