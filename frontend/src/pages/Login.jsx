import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Zap, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setError(""); setLoading(true);
    try {
      const email = form.email.trim().toLowerCase();
      const user = await login(email, form.password);
      const displayName = user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.username || "User";
      toast.success(`Welcome back, ${displayName}!`);
      if (user.role === "vendor") {
        navigate("/vendor/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left Pane: Decorative Background */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-900 items-center justify-center overflow-hidden border-r border-gray-800">
        {/* Mesh gradient backgrounds */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/30 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/30 blur-[100px] rounded-full mix-blend-screen" />
        
        {/* Glassmorphic card */}
        <div className="relative z-10 w-full max-w-md p-10 bg-gray-900/40 border border-gray-700/50 rounded-3xl backdrop-blur-2xl shadow-2xl animate-fade-in">
          <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-6">
            <Zap size={28} className="text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Manage your commerce <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">empire seamlessly</span>
          </h2>
          <p className="text-gray-400 leading-relaxed text-sm">
            Everything you need to scale your business, manage products, and fulfill orders faster than ever. Built for modern merchants.
          </p>
          <div className="mt-8 flex items-center gap-4 pt-6 border-t border-gray-800">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center overflow-hidden relative z-10">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 font-medium">Joined by 10,000+ businesses</p>
          </div>
        </div>
      </div>

      {/* Right Pane: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-gray-950">
        <div className="w-full max-w-[380px] animate-fade-in">
          
          <div className="flex flex-col mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex lg:hidden items-center justify-center mb-6 shadow-lg shadow-indigo-600/20">
              <Zap size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back</h1>
            <p className="text-sm text-gray-400 mt-2">Enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 animate-fade-in">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="name@company.com"
                  required
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <Link to="/forgot-password" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl py-3 text-sm transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : "Sign in to account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Create one now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
