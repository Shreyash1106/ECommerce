import React, { useState } from 'react';
import { useGetProfile } from '../hooks/useProfile';
import ProfileView from '../components/profile/ProfileView';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import PhotoUploader from '../components/profile/PhotoUploader';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';
import ProfileSkeleton from '../components/profile/ProfileSkeleton';
import AddressList from '../components/profile/AddressList';
import { User, KeyRound, MapPin } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ProfilePage = () => {
  const { data: profile, isLoading, error } = useGetProfile();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'addresses'
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-rose-600 font-bold">
        Failed to load profile. Please try again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10 px-4 sm:px-8 py-8 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Account Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your profile information, addresses, and security preferences.</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Sidebar / Left Column */}
            <div className="p-6 md:border-r border-slate-100 bg-slate-50/60 flex flex-col items-center">
              <PhotoUploader 
                currentPhotoUrl={profile.avatar_url} 
                userName={profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : profile.username} 
              />
              <div className="mt-8 w-full space-y-2">
                <button
                  onClick={() => { setActiveTab('profile'); setIsEditing(false); }}
                  className={`w-full flex items-center px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                    activeTab === 'profile'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-4 h-4 mr-3" />
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                    activeTab === 'addresses'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <MapPin className="w-4 h-4 mr-3" />
                  My Addresses
                </button>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full flex items-center px-4 py-3 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
                >
                  <KeyRound className="w-4 h-4 mr-3" />
                  Security & Password
                </button>
              </div>
            </div>

            {/* Content / Right Column */}
            <div className="p-6 md:p-8 md:col-span-2">
              {activeTab === 'profile' ? (
                isEditing ? (
                  <ProfileEditForm 
                    profile={profile} 
                    onCancel={() => setIsEditing(false)} 
                  />
                ) : (
                  <ProfileView 
                    profile={profile} 
                    onEdit={() => setIsEditing(true)} 
                  />
                )
              ) : (
                <AddressList />
              )}
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
};

export default ProfilePage;
