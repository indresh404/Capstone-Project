const express = require("express");
const cors = require("cors");

require("dotenv").config(); // load .env variables

const authRoutes = require("./routes/auth.routes");

const app = express();

/* middlewares */
app.use(cors());            // allow frontend requests
app.use(express.json());    // read JSON body

/* routes */
app.use("/api/auth", authRoutes);

/* server start */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
