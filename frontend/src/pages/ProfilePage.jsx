import React, { useState } from 'react';
import { useGetProfile } from '../hooks/useProfile';
import ProfileView from '../components/profile/ProfileView';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import PhotoUploader from '../components/profile/PhotoUploader';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';
import ProfileSkeleton from '../components/profile/ProfileSkeleton';
import { User, KeyRound, Shield, Activity } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ProfilePage = () => {
  const { data: profile, isLoading, error } = useGetProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Failed to load profile. Please try again.
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-10 px-4 sm:px-8 py-8 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">Account Settings</h1>
          <p className="text-gray-400 mt-2">Manage your profile information and security preferences.</p>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Sidebar / Left Column */}
            <div className="p-6 md:border-r border-white/5 bg-gray-800/30 flex flex-col items-center">
              <PhotoUploader 
                currentPhotoUrl={profile.avatar_url} 
                userName={profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : profile.username} 
              />
              <div className="mt-8 w-full space-y-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${!isEditing ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.15)]' : 'text-gray-400 border border-transparent hover:text-white hover:bg-white/5 hover:border-white/10'}`}
                >
                  <User className="w-4 h-4 mr-3" />
                  Personal Info
                </button>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl text-gray-400 border border-transparent hover:text-white hover:bg-white/5 hover:border-white/10 transition-all duration-200"
                >
                  <KeyRound className="w-4 h-4 mr-3" />
                  Security
                </button>
              </div>
            </div>

            {/* Main Content / Right Column */}
            <div className="p-8 md:col-span-2">
              {!isEditing ? (
                <ProfileView profile={profile} onEdit={() => setIsEditing(true)} />
              ) : (
                <ProfileEditForm profile={profile} onCancel={() => setIsEditing(false)} />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {isPasswordModalOpen && (
        <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />
      )}
    </div>
  );
};

export default ProfilePage;
