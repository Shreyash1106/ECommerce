import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import client from "../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await client.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Could not send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center mb-3 shadow-md shadow-amber-500/20">
            <Zap size={22} className="text-slate-950 font-bold" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Reset your password</h1>
          <p className="text-xs text-slate-500 mt-1">We'll send you a password reset link</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          {sent ? (
            <div className="flex flex-col items-center py-4 text-center space-y-2">
              <CheckCircle2 size={40} className="text-emerald-500" />
              <p className="text-sm font-extrabold text-slate-900">Check your inbox</p>
              <p className="text-xs text-slate-500">We sent a reset link to <span className="font-bold text-slate-900">{email}</span></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{error}</p>}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-9" placeholder="you@company.com" required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-amber w-full justify-center py-3 text-xs font-bold">
                {loading ? <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" /> : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>

        <Link to="/login" className="flex items-center justify-center gap-1.5 mt-4 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={13} /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
