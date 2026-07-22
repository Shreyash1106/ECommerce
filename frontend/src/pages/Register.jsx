import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Zap, AlertCircle } from "lucide-react";
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
  const strengthColors = ["", "bg-rose-500", "bg-amber-500", "bg-sky-500", "bg-emerald-500"];

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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Pane: Decorative Background */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden border-r border-slate-800">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-amber-500/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full" />
        
        <div className="relative z-10 w-full max-w-md p-10 bg-slate-900/90 border border-slate-800 rounded-3xl backdrop-blur-2xl shadow-2xl">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30">
            <Zap size={28} className="text-slate-950 font-bold" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">
            Start your journey with <br/>
            <span className="text-amber-400">CommerceOS</span>
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Create your account today and get access to powerful tools to scale your business, manage products, and fulfill orders effortlessly.
          </p>
          <div className="mt-8 flex items-center gap-4 pt-6 border-t border-slate-800">
            <div className="flex -space-x-3">
              {[4, 5, 6].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden relative z-10">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 font-semibold">Over $1M in sales processed</p>
          </div>
        </div>
      </div>

      {/* Right Pane: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-[420px] bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm my-auto py-8">
          
          <div className="flex flex-col mb-6">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex lg:hidden items-center justify-center mb-6 shadow-md shadow-amber-500/20">
              <Zap size={20} className="text-slate-950 font-bold" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create account</h1>
            <p className="text-sm text-slate-500 mt-1">Join us today. Enter your details below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
                <p className="text-sm font-semibold text-rose-600">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">First name</label>
                  <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all shadow-sm" 
                    placeholder="John" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Last name</label>
                  <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all shadow-sm" 
                    placeholder="Doe" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Username</label>
                <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all shadow-sm" 
                  placeholder="johndoe" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email address</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all shadow-sm" 
                  placeholder="john@example.com" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number (Optional)</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all shadow-sm" 
                  placeholder="+91 9876543210" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Account Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all shadow-sm">
                  <option value="customer">Customer (Shop & Buy)</option>
                  <option value="vendor">Vendor (Sell Products)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all pr-10 shadow-sm" 
                    placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-slate-200">
                      {[1, 2, 3, 4].map(step => (
                        <div key={step} className={`flex-1 transition-all ${step <= strength ? strengthColors[strength] : ""}`} />
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500">Strength: {strengthLabels[strength]}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Confirm Password</label>
                <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all shadow-sm" 
                  placeholder="••••••••" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold rounded-xl py-3.5 text-sm transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-amber-700 hover:text-amber-800 font-bold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
