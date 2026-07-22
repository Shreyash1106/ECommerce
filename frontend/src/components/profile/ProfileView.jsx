import React from 'react';
import { Mail, Edit2, Package, Calendar, Bell, Phone, User } from 'lucide-react';

const ProfileView = ({ profile, onEdit }) => {
  const fullName = profile.first_name && profile.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : profile.username || 'N/A';

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Personal Information</h2>
          <p className="text-xs text-slate-500 mt-0.5">Your current account details.</p>
        </div>
        <button
          onClick={onEdit}
          className="btn-primary text-xs flex items-center gap-1.5"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
          <p className="text-sm font-bold text-slate-900">{fullName}</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Username</p>
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2 text-blue-600" />
            <p className="text-sm font-bold text-slate-900">{profile.username || 'N/A'}</p>
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-blue-600" />
            <p className="text-sm font-bold text-slate-900">{profile.email}</p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2 text-blue-600" />
            <p className="text-sm font-bold text-slate-900">{profile.phone || 'Not provided'}</p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account Role</p>
          <p className="text-sm font-extrabold text-blue-600 capitalize">{profile.role || 'Customer'}</p>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Joined Date</p>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
            <p className="text-sm font-bold text-slate-900">
              {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
