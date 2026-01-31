import { useState } from "react";
import "../styles/auth.css";
import MeshGradient from "../assets/mesh.svg";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state for login
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  // Form state for signup
  const [signupData, setSignupData] = useState({
    role: "",
    id: "",
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  // Form validation errors
  const [errors, setErrors] = useState({});

  const toggleAuth = () => {
    setIsLogin(!isLogin);
    setErrors({}); // Clear errors when toggling
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!loginData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!loginData.password) {
      newErrors.password = "Password is required";
    }
    return newErrors;
  };

  const validateSignup = () => {
    const newErrors = {};
    if (!signupData.role) {
      newErrors.role = "Please select a role";
    }
    if (!signupData.id.trim()) {
      newErrors.id = "ID is required";
    }
    if (!signupData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!signupData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!signupData.password) {
      newErrors.password = "Password is required";
    } else if (signupData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    return newErrors;
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLogin();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Login data:", loginData);
      // Add your actual login logic here
      alert("Login successful!");
    } catch (error) {
      setErrors({ submit: "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateSignup();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Signup data:", signupData);
      // Add your actual signup logic here
      alert("Account created successfully!");
      // Optionally switch to login after successful signup
      // setIsLogin(true);
    } catch (error) {
      setErrors({ submit: "Signup failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <img src={MeshGradient} alt="Mesh Gradient" className="mesh-svg" />
        <div className="auth-left-content">Schedula</div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        {/* Inner sliding container */}
        <div className={`form-slider ${isLogin ? "login" : "signup"}`}>
          {/* LOGIN FORM */}
          <form className="login-form login-slide" onSubmit={handleLoginSubmit}>
            <h1 className="login-title">Welcome Back!</h1>
            <p className="login-subtitle">Login to your account</p>

            <div>
              <input 
                type="email" 
                name="email"
                placeholder="Email" 
                className={`login-input ${errors.email ? 'error' : ''}`}
                value={loginData.email}
                onChange={handleLoginChange}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div>
              <input 
                type="password" 
                name="password"
                placeholder="Password" 
                className={`login-input ${errors.password ? 'error' : ''}`}
                value={loginData.password}
                onChange={handleLoginChange}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {errors.submit && <span className="error-message submit-error">{errors.submit}</span>}

            <button 
              type="submit" 
              className={`login-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-text">Logging in...</span>
              ) : (
                'Login'
              )}
            </button>

            <p className="login-footer">
              Don't have an account?{" "}
              <span className="toggle-auth" onClick={toggleAuth}>Sign up</span>
            </p>
          </form>

          {/* SIGNUP FORM */}
          <form className="login-form signup-slide" onSubmit={handleSignupSubmit}>
            <h1 className="login-title">Create Account</h1>
            <p className="login-subtitle">Fill in your details to sign up</p>

            <div>
              <select 
                name="role"
                className={`login-input ${errors.role ? 'error' : ''}`}
                value={signupData.role}
                onChange={handleSignupChange}
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="faculty">Faculty</option>
              </select>
              {errors.role && <span className="error-message">{errors.role}</span>}
            </div>

            <div>
              <input 
                type="text" 
                name="id"
                placeholder="Faculty or Admin ID" 
                className={`login-input ${errors.id ? 'error' : ''}`}
                value={signupData.id}
                onChange={handleSignupChange}
              />
              {errors.id && <span className="error-message">{errors.id}</span>}
            </div>

            <div>
              <input 
                type="text" 
                name="fullName"
                placeholder="Full Name" 
                className={`login-input ${errors.fullName ? 'error' : ''}`}
                value={signupData.fullName}
                onChange={handleSignupChange}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            <div>
              <input 
                type="tel" 
                name="phone"
                placeholder="Phone Number" 
                className="login-input"
                value={signupData.phone}
                onChange={handleSignupChange}
              />
            </div>

            <div>
              <input 
                type="email" 
                name="email"
                placeholder="Email" 
                className={`login-input ${errors.email ? 'error' : ''}`}
                value={signupData.email}
                onChange={handleSignupChange}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div>
              <input 
                type="password" 
                name="password"
                placeholder="Password" 
                className={`login-input ${errors.password ? 'error' : ''}`}
                value={signupData.password}
                onChange={handleSignupChange}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div>
              <input 
                type="password" 
                name="confirmPassword"
                placeholder="Confirm Password" 
                className={`login-input ${errors.confirmPassword ? 'error' : ''}`}
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            {errors.submit && <span className="error-message submit-error">{errors.submit}</span>}

            <button 
              type="submit" 
              className={`login-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-text">Creating Account...</span>
              ) : (
                'Sign Up'
              )}
            </button>

            <p className="login-footer">
              Already have an account?{" "}
              <span className="toggle-auth" onClick={toggleAuth}>Login</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;