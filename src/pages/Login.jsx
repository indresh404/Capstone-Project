import React, { useState, useEffect } from "react";
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
import animationData from "../assets/loginScreen.json";
import gradientBgData from "../assets/Background 3d stroke.json";
import LogoPng from "../assets/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showLogo, setShowLogo] = useState(true);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    role: "", id: "", fullName: "", phone: "", email: "", password: "", confirmPassword: ""
  });

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
      
      {/* MAIN AUTH CARD */}
      <div className="relative z-10 flex w-full max-w-[1200px] min-h-[650px] bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* LEFT BRANDING PANEL */}
        <div className="hidden md:flex md:w-[60%] relative bg-indigo-600 overflow-hidden">
          <div className="absolute inset-0">
            <Lottie 
              animationData={gradientBgData} 
              loop={true} 
              style={{ width: '100%', height: '100%' }} 
              rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
            />
          </div>
          <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
          
          <div className="relative z-20 w-full h-full flex flex-col items-center justify-center p-8 text-white text-center">
            <AnimatePresence mode="wait">
              {showLogo ? (
                <motion.div
                  key="logo-png"
                  initial={{ opacity: 0, scale: 0.4, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 0.8, filter: "blur(0px)" }}
                  exit={{ 
                    opacity: 0, 
                    scale: 1.1, 
                    filter: "blur(15px)",
                    transition: { duration: 0.4 } 
                  }}
                  transition={{ type: "spring", stiffness: 100, damping: 18 }}
                >
                  <img src={LogoPng} alt="Logo" className="w-32 h-32 object-contain" />
                </motion.div>
              ) : (
                <motion.div
                  key="brand-text"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
                    }
                  }}
                >
                  <motion.h1 
                    variants={{
                      hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
                      visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                    }}
                    transition={{ type: "spring", stiffness: 80 }}
                    className="text-5xl font-bold tracking-tight mb-2"
                  >
                    Schedula
                  </motion.h1>

                  <motion.div 
                    variants={{
                      hidden: { width: 0, opacity: 0 },
                      visible: { width: "40px", opacity: 1 }
                    }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="h-[2px] bg-white/40 mb-4 mx-auto" 
                  />

                  <motion.p 
                    variants={{
                      hidden: { opacity: 0, letterSpacing: "0.1em" },
                      visible: { opacity: 1, letterSpacing: "0.3em" }
                    }}
                    transition={{ duration: 1 }}
                    className="text-white/80 text-[11px] font-bold uppercase"
                  >
                    Smart Scheduling
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-14 bg-white/60 relative py-10 overflow-hidden ">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full relative z-10"
            >
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">
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

              <p className="mt-8 text-center text-slate-400 text-[12px] -translate-y-5">
                <button type="button" onClick={toggleAuth} className="text-indigo-600 font-bold hover:underline">
                  {isLogin ? "Create account" : "Login here"}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>

          {/* INTERNAL LOTTIE - Only shows when isLogin is true */}
          <AnimatePresence>
            {isLogin && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 50 }}
                className="absolute bottom-[-135px] right-0 w-45 h-45 pointer-events-none z-0 opacity-40 md:opacity-100"
              >
                <Lottie
                  animationData={animationData}
                  loop={true}
                  style={{ width: '99%', height: '99%' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

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