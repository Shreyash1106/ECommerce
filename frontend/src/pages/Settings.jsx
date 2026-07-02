import React, { useState } from "react";
import { Settings2, Bell, Shield, Palette, Globe } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

const TABS = [
  { id: "profile", label: "Profile", icon: Settings2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

export default function Settings() {
  const { user } = useAuth();
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });

  return (
    <div className="page-container max-w-3xl">
      <div>
        <h1 className="text-lg font-semibold text-white">Settings</h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage your account preferences</p>
      </div>

      <div className="flex gap-1 border-b border-gray-800">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id ? "border-indigo-500 text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-300"
            }`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="section-card px-6 py-6">
          <h3 className="text-sm font-semibold text-gray-200 mb-5">Profile Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Full name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field max-w-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email address</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field max-w-sm" type="email" />
            </div>
            <button onClick={() => toast.success("Profile updated!")} className="btn-primary">Save changes</button>
          </div>
        </div>
      )}

      {tab === "notifications" && (
        <div className="section-card px-6 py-6">
          <h3 className="text-sm font-semibold text-gray-200 mb-5">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { label: "New orders", desc: "Get notified when a new order is placed" },
              { label: "Low stock alerts", desc: "When products fall below minimum stock" },
              { label: "User activity", desc: "New registrations and login events" },
              { label: "System updates", desc: "Maintenance and system notifications" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-200">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <button className="w-10 h-5 bg-indigo-600 rounded-full relative transition-colors">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "security" && (
        <div className="section-card px-6 py-6">
          <h3 className="text-sm font-semibold text-gray-200 mb-5">Security Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Current password</label>
              <input type="password" className="input-field max-w-sm" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">New password</label>
              <input type="password" className="input-field max-w-sm" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirm new password</label>
              <input type="password" className="input-field max-w-sm" placeholder="••••••••" />
            </div>
            <button onClick={() => toast.success("Password updated!")} className="btn-primary">Update password</button>
          </div>
        </div>
      )}
    </div>
  );
}
