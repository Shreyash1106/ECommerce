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
      toast.success(`Welcome back, ${user.name || "User"}!`);
      if (user.role === "vendor") {
        navigate("/vendor/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (role) => {
    const creds = {
      admin: { email: "admin@demo.com", password: "demo123" },
      vendor: { email: "vendor@demo.com", password: "demo123" },
    };
    setForm(creds[role]);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-3">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Sign in to CommerceOS</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your business dashboard</p>
        </div>

        {/* Demo buttons */}
        <div className="flex gap-2 mb-5">
          {["admin", "vendor"].map(role => (
            <button key={role} onClick={() => demoLogin(role)} className="flex-1 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors capitalize">
              Demo {role}
            </button>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 mb-4">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-400">Password</label>
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">Create one</Link>
        </p>
      </div>
    </div>
  );
}
