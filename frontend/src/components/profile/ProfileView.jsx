import React from 'react';
import { Mail, Edit2, Package, Calendar, Bell, Phone, User } from 'lucide-react';

const ProfileView = ({ profile, onEdit }) => {
  const fullName = profile.first_name && profile.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : profile.username || 'N/A';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Personal Information</h2>
          <p className="text-sm text-gray-400 mt-1">Your current profile details.</p>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:-translate-y-0.5"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors shadow-inner">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Name</p>
          <p className="text-lg font-bold text-gray-200">{fullName}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors shadow-inner">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Username</p>
          <div className="flex items-center">
            <User className="w-5 h-5 mr-3 text-indigo-400" />
            <p className="text-lg font-bold text-gray-200">{profile.username || 'N/A'}</p>
          </div>
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors shadow-inner">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address</p>
          <div className="flex items-center">
            <Mail className="w-5 h-5 mr-3 text-indigo-400" />
            <p className="text-lg font-bold text-gray-200">{profile.email}</p>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors shadow-inner">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone Number</p>
          <div className="flex items-center">
            <Phone className="w-5 h-5 mr-3 text-indigo-400" />
            <p className="text-lg font-bold text-gray-200">{profile.phone || 'Not provided'}</p>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors shadow-inner">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Role</p>
          <p className="text-lg font-bold text-indigo-400 capitalize">{profile.role || 'Customer'}</p>
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors shadow-inner">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Joined Date</p>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-3 text-indigo-400" />
            <p className="text-lg font-bold text-gray-200">
              {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-bold text-white mb-6 tracking-tight">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-gray-900/30 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors rounded-2xl">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-500/10 rounded-xl mr-5 border border-indigo-500/20">
                <Package className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="font-bold text-gray-200 text-base mb-0.5">Order Updates</p>
                <p className="text-sm text-gray-500">Receive notifications about your order status</p>
              </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${profile.notify_new_orders ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-800 text-gray-400 border border-white/5'}`}>
              {profile.notify_new_orders ? 'Enabled' : 'Disabled'}
            </div>
          </div>

          <div className="flex items-center justify-between p-5 bg-gray-900/30 backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors rounded-2xl">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500/10 rounded-xl mr-5 border border-purple-500/20">
                <Bell className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="font-bold text-gray-200 text-base mb-0.5">Low Stock Alerts</p>
                <p className="text-sm text-gray-500">Get notified when wishlisted items are running out</p>
              </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${profile.notify_low_stock_alerts ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-800 text-gray-400 border border-white/5'}`}>
              {profile.notify_low_stock_alerts ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
