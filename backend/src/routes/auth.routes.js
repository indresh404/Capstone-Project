const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/auth.controller");
const verifyToken = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected route (any logged-in user)
router.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: `Hello ${req.user.role} with ID ${req.user.id}`,
  });
});

// Admin-only route
router.get(
  "/admin-dashboard",
  verifyToken,
  allowRoles(["ADMIN"]),
  (req, res) => {
    res.json({ message: `Welcome Admin ${req.user.id}` });
  }
);

module.exports = router;
