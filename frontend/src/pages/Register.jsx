import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import client from "../api/client";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    first_name: "", 
    last_name: "", 
    username: "", 
    email: "", 
    phone: "", 
    password: "", 
    confirm: "", 
    role: "customer" 
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = (p) => {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = passwordStrength(form.password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name) { setError("First name and last name are required."); return; }
    if (!form.username || form.username.length < 3) { setError("Username must be at least 3 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!/[A-Z]/.test(form.password)) { setError("Password must contain at least one uppercase letter."); return; }
    if (!/[a-z]/.test(form.password)) { setError("Password must contain at least one lowercase letter."); return; }
    if (!/[0-9]/.test(form.password)) { setError("Password must contain at least one digit."); return; }
    if (!/[^A-Za-z0-9]/.test(form.password)) { setError("Password must contain at least one special character."); return; }
    if (!["customer", "vendor"].includes(form.role)) { setError("Invalid role selected."); return; }
    setError(""); setLoading(true);
    try {
      const email = form.email.trim().toLowerCase();
      const username = form.username.trim().toLowerCase();
      const first_name = form.first_name.trim();
      const last_name = form.last_name.trim();
      const phone = form.phone.trim() || null;
      
      await client.post("/auth/register", { 
        first_name, 
        last_name, 
        username, 
        email, 
        phone, 
        password: form.password, 
        role: form.role 
      });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left Pane: Decorative Background */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-900 items-center justify-center overflow-hidden border-r border-gray-800">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/30 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/30 blur-[100px] rounded-full mix-blend-screen" />
        
        <div className="relative z-10 w-full max-w-md p-10 bg-gray-900/40 border border-gray-700/50 rounded-3xl backdrop-blur-2xl shadow-2xl animate-fade-in">
          <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-6">
            <Zap size={28} className="text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Start your journey with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">CommerceOS</span>
          </h2>
          <p className="text-gray-400 leading-relaxed text-sm">
            Create your account today and get access to powerful tools to scale your business, manage products, and fulfill orders effortlessly.
          </p>
          <div className="mt-8 flex items-center gap-4 pt-6 border-t border-gray-800">
            <div className="flex -space-x-3">
              {[4, 5, 6].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center overflow-hidden relative z-10">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 font-medium">Over $1M in sales processed</p>
          </div>
        </div>
      </div>

      {/* Right Pane: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-gray-950 overflow-y-auto">
        <div className="w-full max-w-[400px] animate-fade-in my-auto py-8">
          
          <div className="flex flex-col mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex lg:hidden items-center justify-center mb-6 shadow-lg shadow-indigo-600/20">
              <Zap size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Create account</h1>
            <p className="text-sm text-gray-400 mt-2">Join us today. Enter your details below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 animate-fade-in">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First name</label>
                  <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" 
                    placeholder="John" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last name</label>
                  <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" 
                    placeholder="Doe" required />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" 
                  placeholder="johndoe123" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email address</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" 
                  placeholder="name@company.com" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone number (optional)</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" 
                  placeholder="+1 234 567 8900" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Account type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ value: "vendor", label: "Vendor" }, { value: "customer", label: "Customer" }].map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setForm({ ...form, role: value })}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        form.role === value
                          ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-400 shadow-inner"
                          : "bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all pr-12" 
                    placeholder="Min. 8 characters" required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-3 space-y-1.5 animate-fade-in">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${i <= strength ? strengthColors[strength] : "bg-gray-800"}`} />
                      ))}
                    </div>
                    <p className="text-xs font-medium text-gray-400">{strengthLabels[strength] || ""}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm password</label>
                <div className="relative">
                  <input type="password" value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    className={`w-full bg-gray-900/50 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all pr-12 ${
                      form.confirm && form.password !== form.confirm ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500" : "border-gray-800 focus:ring-indigo-500/50 focus:border-indigo-500"
                    }`} 
                    placeholder="Repeat password" required />
                  {form.confirm && form.password === form.confirm && (
                    <CheckCircle2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 animate-fade-in" />
                  )}
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl py-3 text-sm transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
