import React, { useState, useEffect } from "react";
import { Settings2, Bell, Shield, Palette, Globe, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import client from "../api/client";

const TABS = [
  { id: "profile", label: "Profile", icon: Settings2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [saving, setSaving] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    notify_new_orders: user?.notify_new_orders ?? true,
    notify_low_stock_alerts: user?.notify_low_stock_alerts ?? true,
    notify_user_activity: user?.notify_user_activity ?? true,
    notify_system_updates: user?.notify_system_updates ?? true,
  });
  const [notificationsSaving, setNotificationsSaving] = useState(false);
  const [securityForm, setSecurityForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityErrors, setSecurityErrors] = useState({});
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  const validateSecurityForm = () => {
    const errors = {};

    if (!securityForm.current_password) {
      errors.current_password = "Current password is required.";
    }

    if (!securityForm.new_password) {
      errors.new_password = "New password is required.";
    } else if (securityForm.new_password.length < 8) {
      errors.new_password = "New password must be at least 8 characters.";
    } else if (!PASSWORD_STRENGTH_REGEX.test(securityForm.new_password)) {
      errors.new_password = "New password must include uppercase, lowercase, number, and special character.";
    }

    if (!securityForm.confirm_password) {
      errors.confirm_password = "Please confirm your new password.";
    } else if (securityForm.new_password !== securityForm.confirm_password) {
      errors.confirm_password = "Passwords do not match.";
    }

    if (securityForm.current_password && securityForm.new_password && securityForm.current_password === securityForm.new_password) {
      errors.new_password = "New password must be different from current password.";
    }

    return errors;
  };

  useEffect(() => {
    setForm({ name: user?.name || "", email: user?.email || "" });
    setNotificationForm({
      notify_new_orders: user?.notify_new_orders ?? true,
      notify_low_stock_alerts: user?.notify_low_stock_alerts ?? true,
      notify_user_activity: user?.notify_user_activity ?? true,
      notify_system_updates: user?.notify_system_updates ?? true,
    });
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await client.put("/auth/profile", { name: form.name.trim(), email: form.email.trim() });
      updateUser(data);
      toast.success("Profile updated successfully.");
    } catch (error) {
      const message = error?.response?.data?.detail || "Unable to save profile.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    const errors = validateSecurityForm();
    if (Object.keys(errors).length > 0) {
      setSecurityErrors(errors);
      toast.error("Please fix the highlighted password fields.");
      return;
    }

    try {
      setSecuritySaving(true);
      await client.put("/auth/password", {
        current_password: securityForm.current_password,
        new_password: securityForm.new_password,
        confirm_password: securityForm.confirm_password,
      });
      setSecurityForm({ current_password: "", new_password: "", confirm_password: "" });
      setSecurityErrors({});
      toast.success("Password updated successfully.");
    } catch (error) {
      const message = error?.response?.data?.detail || "Unable to update password.";
      toast.error(message);
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleNotificationSave = async () => {
    try {
      setNotificationsSaving(true);
      const { data } = await client.put("/auth/profile", {
        notify_new_orders: notificationForm.notify_new_orders,
        notify_low_stock_alerts: notificationForm.notify_low_stock_alerts,
        notify_user_activity: notificationForm.notify_user_activity,
        notify_system_updates: notificationForm.notify_system_updates,
      });
      updateUser(data);
      toast.success("Notification preferences saved.");
    } catch (error) {
      const message = error?.response?.data?.detail || "Unable to save notification preferences.";
      toast.error(message);
    } finally {
      setNotificationsSaving(false);
    }
  };

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
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      )}

      {tab === "notifications" && (
        <div className="section-card px-6 py-6">
          <h3 className="text-sm font-semibold text-gray-200 mb-5">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { key: "notify_new_orders", label: "New orders", desc: "Get notified when a new order is placed" },
              { key: "notify_low_stock_alerts", label: "Low stock alerts", desc: "When products fall below minimum stock" },
              { key: "notify_user_activity", label: "User activity", desc: "New registrations and login events" },
              { key: "notify_system_updates", label: "System updates", desc: "Maintenance and system notifications" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-200">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationForm[item.key]}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors ${notificationForm[item.key] ? "bg-indigo-600" : "bg-gray-700"}`} />
                  <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${notificationForm[item.key] ? "translate-x-6" : "translate-x-0"}`} />
                </label>
              </div>
            ))}
            <button
              onClick={handleNotificationSave}
              disabled={notificationsSaving}
              className="btn-primary"
            >
              {notificationsSaving ? "Saving..." : "Save preferences"}
            </button>
          </div>
        </div>
      )}

      {tab === "security" && (
        <div className="section-card px-6 py-6">
          <h3 className="text-sm font-semibold text-gray-200 mb-5">Security Settings</h3>
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Current password</label>
              <input
                type={showPassword.current ? "text" : "password"}
                value={securityForm.current_password}
                onChange={(e) => { setSecurityForm({ ...securityForm, current_password: e.target.value }); setSecurityErrors({}); }}
                className="input-field w-full pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-[2.05rem] text-gray-400 hover:text-gray-200"
              >
                {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {securityErrors.current_password && <p className="text-xs text-rose-400 mt-1">{securityErrors.current_password}</p>}
            </div>

            <div className="relative max-w-sm">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">New password</label>
              <input
                type={showPassword.new ? "text" : "password"}
                value={securityForm.new_password}
                onChange={(e) => { setSecurityForm({ ...securityForm, new_password: e.target.value }); setSecurityErrors({}); }}
                className="input-field w-full pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-[2.05rem] text-gray-400 hover:text-gray-200"
              >
                {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 characters, with uppercase, lowercase, number, and special symbol.
              </p>
              {securityErrors.new_password && <p className="text-xs text-rose-400 mt-1">{securityErrors.new_password}</p>}
            </div>

            <div className="relative max-w-sm">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirm new password</label>
              <input
                type={showPassword.confirm ? "text" : "password"}
                value={securityForm.confirm_password}
                onChange={(e) => { setSecurityForm({ ...securityForm, confirm_password: e.target.value }); setSecurityErrors({}); }}
                className="input-field w-full pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-[2.05rem] text-gray-400 hover:text-gray-200"
              >
                {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {securityErrors.confirm_password && <p className="text-xs text-rose-400 mt-1">{securityErrors.confirm_password}</p>}
            </div>

            <button
              onClick={handlePasswordUpdate}
              disabled={securitySaving}
              className="btn-primary"
            >
              {securitySaving ? "Updating..." : "Update password"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
