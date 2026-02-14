import React, { useState, useEffect } from "react"; // Added useEffect
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Lock, User, Phone, Briefcase, 
  Fingerprint, Loader2, ChevronRight, AlertCircle 
} from "lucide-react";

// Robust Lottie Import
import LottieComponent from "lottie-react";
const Lottie = LottieComponent.default ?? LottieComponent;

// Assets
import animationData from "../assets/LoginLottie.json";
import bgLinesData from "../assets/gradientbg.json";
import gradientBgData from "../assets/Background 3d stroke.json";
import LogoPng from "../assets/logo.png"; // ✅ IMPORT YOUR LOGO PNG HERE

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showLogo, setShowLogo] = useState(true); // ✅ State for sequencing

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    role: "", id: "", fullName: "", phone: "", email: "", password: "", confirmPassword: ""
  });

  // ✅ Sequencing Logic: Logo shows for 2.5s then disappears
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogo(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const API_URL = "http://localhost:5000/api/auth";

  const toggleAuth = () => {
    setIsLogin(!isLogin);
    setErrors({});
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(data.user.role.toUpperCase() === "ADMIN" ? "/admin" : "/faculty");
    } catch (err) {
      setErrors({ submit: err.message });
    } finally { setIsLoading(false); }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          college_id: signupData.id,
          name: signupData.fullName,
          email: signupData.email,
          phone: signupData.phone,
          password: signupData.password,
          role: signupData.role.toUpperCase()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      alert("Account created successfully!");
      setIsLogin(true);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FAFB] p-4 font-sans overflow-hidden relative">
      
      {/* 1. WEBSITE BACKGROUND LOTTIE */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <Lottie 
          animationData={bgLinesData} 
          loop={true} 
          style={{ width: '100vw', height: '100vh' }} 
          rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
        />
      </div>

      {/* MAIN AUTH CARD */}
      <div className="relative z-10 flex w-full max-w-[1000px] min-h-[650px] bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* LEFT BRANDING PANEL */}
        <div className="hidden md:flex md:w-[58%] relative bg-indigo-600 overflow-hidden">
          
          <div className="absolute inset-0">
            <Lottie 
              animationData={gradientBgData} 
              loop={true} 
              style={{ width: '100%', height: '100%' }} 
              rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
            />
          </div>

          <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
          
          {/* ✅ ANIMATED LOGO & TEXT SECTION */}
          <div className="relative z-20 w-full h-full flex flex-col items-center justify-center p-8 text-white text-center">
            <AnimatePresence mode="wait">
              {showLogo ? (
                // 1. Logo PNG shows first
                <motion.div
                  key="logo-png"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                >
                  <img src={LogoPng} alt="Logo" className="w-32 h-32 object-contain" />
                </motion.div>
              ) : (
                // 2. Text and Tagline show second
                <motion.div
                  key="brand-text"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h1 className="text-4xl font-bold tracking-tight mb-2">Schedula</h1>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "32px" }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="h-[2px] bg-white/40 mb-4 mx-auto" 
                  />
                  <p className="text-white/80 text-[12px] font-bold uppercase tracking-[0.3em]">
                    Smart Scheduling
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-14 bg-white/60 relative py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full"
            >
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">
                {isLogin ? "Welcome Back" : "Join Schedula"}
              </h2>
              <p className="text-slate-400 text-xs mb-8">
                {isLogin ? "Sign in to your account" : "Create a new faculty account"}
              </p>

              <form className="space-y-3" onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}>
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto" }} 
                    className="space-y-3"
                  >
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16}/>
                      <select 
                        name="role"
                        value={signupData.role}
                        onChange={handleSignupChange}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white transition-all appearance-none"
                      >
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="faculty">Faculty</option>
                      </select>
                    </div>

                    <FormInput 
                      name="id" placeholder="Faculty/Admin ID" icon={<Fingerprint size={16}/>} 
                      value={signupData.id} onChange={handleSignupChange} error={errors.id} 
                    />
                    <FormInput 
                      name="fullName" placeholder="Full Name" icon={<User size={16}/>} 
                      value={signupData.fullName} onChange={handleSignupChange} error={errors.fullName} 
                    />
                    <FormInput 
                      name="phone" placeholder="Phone Number" icon={<Phone size={16}/>} 
                      value={signupData.phone} onChange={handleSignupChange} 
                    />
                  </motion.div>
                )}

                <FormInput 
                  name="email" 
                  placeholder="Email" 
                  icon={<Mail size={16}/>} 
                  value={isLogin ? loginData.email : signupData.email} 
                  onChange={isLogin ? handleLoginChange : handleSignupChange} 
                  error={errors.email} 
                />

                <FormInput 
                  name="password" 
                  placeholder="Password" 
                  type="password"
                  icon={<Lock size={16}/>} 
                  value={isLogin ? loginData.password : signupData.password} 
                  onChange={isLogin ? handleLoginChange : handleSignupChange} 
                  error={errors.password} 
                />

                {!isLogin && (
                   <FormInput 
                    name="confirmPassword" 
                    placeholder="Confirm Password" 
                    type="password"
                    icon={<Lock size={16}/>} 
                    value={signupData.confirmPassword} 
                    onChange={handleSignupChange} 
                    error={errors.confirmPassword} 
                  />
                )}

                {errors.submit && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-[11px] font-bold border border-red-100">
                    <AlertCircle size={14} /> {errors.submit}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white font-bold text-sm py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : (isLogin ? "Sign In" : "Sign Up")}
                </button>
              </form>

              <p className="mt-8 text-center text-slate-400 text-[12px]">
                <button type="button" onClick={toggleAuth} className="text-indigo-600 font-bold hover:underline">
                  {isLogin ? "Create account" : "Login here"}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 3. FOREGROUND LOTTIE */}
      <div className="fixed -bottom-10 -right-10 w-64 h-64 md:w-80 md:h-80 pointer-events-none z-50">
        {animationData && (
          <Lottie
            animationData={animationData}
            loop={true}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>
    </div>
  );
};

// Reusable Input Component
const FormInput = ({ icon, error, ...props }) => (
  <div className="w-full group">
    <div className="relative">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-400' : 'text-slate-300 group-focus-within:text-indigo-500'}`}>
        {icon}
      </div>
      <input 
        {...props}
        className={`w-full pl-11 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold outline-none transition-all ${error ? 'border-red-400' : 'border-slate-100 focus:border-indigo-400 focus:bg-white'}`}
      />
    </div>
    {error && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{error}</p>}
  </div>
);

export default Login;