const db = require("../db/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const { college_id, name, email, phone, password, role } = req.body;

    // Validate required fields
    if (!college_id || !name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate role
    const validRoles = ['admin', 'faculty', 'student'];
    if (!validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    // Check if email already exists
    const emailCheck = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Check if college_id already exists
    const idCheck = await db.query(
      "SELECT id FROM users WHERE college_id = $1",
      [college_id]
    );
    if (idCheck.rows.length > 0) {
      return res.status(409).json({ message: "College ID already exists" });
    }

    // Check if phone number already exists
    const phoneCheck = await db.query(
      "SELECT id FROM users WHERE phone = $1",
      [phone]
    );
    if (phoneCheck.rows.length > 0) {
      return res.status(409).json({ message: "Phone number already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const sql = `
      INSERT INTO users (college_id, name, email, phone, password, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, college_id, name, email, role
    `;

    const result = await db.query(sql, [
      college_id,
      name,
      email,
      phone,
      hashedPassword,
      role.toLowerCase(),
    ]);

    res.status(201).json({ 
      message: "User registered successfully",
      user: result.rows[0]
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email/ID and password required" });
    }

    // Check if identifier is email or college_id
    const isEmail = identifier.includes('@');
    
    let sql;
    let values;
    
    if (isEmail) {
      sql = "SELECT * FROM users WHERE email = $1";
      values = [identifier];
    } else {
      sql = "SELECT * FROM users WHERE college_id = $1";
      values = [identifier];
    }

    const result = await db.query(sql, values);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        college_id: user.college_id,
        role: user.role.toUpperCase() 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: "1d" }
    );

    // Remove password from response
    delete user.password;

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        college_id: user.college_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID (optional endpoint)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = "SELECT id, college_id, name, email, phone, role FROM users WHERE id = $1";
    const result = await db.query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: error.message });
  }
};