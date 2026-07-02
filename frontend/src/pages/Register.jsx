import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import client from "../api/client";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "customer" });
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
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setLoading(true);
    try {
      const email = form.email.trim().toLowerCase();
      const name = form.name.trim();
      await client.post("/auth/register", { name, email, password: form.password, role: form.role });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-3">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Join CommerceOS today</p>
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
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Full name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email address</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field" placeholder="you@company.com" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Account type</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ value: "vendor", label: "Vendor" }, { value: "customer", label: "Customer" }].map(({ value, label }) => (
                  <button key={value} type="button" onClick={() => setForm({ ...form, role: value })}
                    className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                      form.role === value
                        ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-400"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-10" placeholder="Min. 8 characters" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : "bg-gray-700"}`} />
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500">{strengthLabels[strength] || ""}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirm password</label>
              <div className="relative">
                <input type="password" value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="input-field pr-10" placeholder="Repeat password" required />
                {form.confirm && form.password === form.confirm && (
                  <CheckCircle2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400" />
                )}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
