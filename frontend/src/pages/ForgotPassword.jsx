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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-3">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Reset your password</h1>
          <p className="text-sm text-gray-500 mt-1">We'll send you a reset link</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          {sent ? (
            <div className="flex flex-col items-center py-4 text-center">
              <CheckCircle2 size={40} className="text-green-400 mb-3" />
              <p className="text-sm font-medium text-white mb-1">Check your email</p>
              <p className="text-xs text-gray-400">We sent a reset link to <span className="text-gray-200">{email}</span></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-9" placeholder="you@company.com" required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <Link to="/login" className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-500 hover:text-gray-300 transition-colors">
          <ArrowLeft size={13} /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
