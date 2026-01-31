USE schedula_db;

-- USER TABLE
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,       -- internal ID
  college_id VARCHAR(50) UNIQUE NOT NULL,  -- unique ID given by college
  name VARCHAR(100) NOT NULL,              -- full name
  email VARCHAR(100) UNIQUE NOT NULL,      -- login email
  phone VARCHAR(15) NOT NULL,              -- contact number
  password VARCHAR(255) NOT NULL,          -- hashed password
  role ENUM('faculty','admin') NOT NULL,   -- type of user
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SELECT * FROM users;
truncate table users;


