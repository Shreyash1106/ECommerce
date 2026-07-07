import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUpdateProfile } from '../../hooks/useProfile';
import toast from 'react-hot-toast';
import { Save, X, Loader2 } from 'lucide-react';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100, 'First name must be less than 100 characters'),
  last_name: z.string().min(1, 'Last name is required').max(100, 'Last name must be less than 100 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  notify_new_orders: z.boolean(),
  notify_low_stock_alerts: z.boolean(),
});

const ProfileEditForm = ({ profile, onCancel }) => {
  const updateProfileMutation = useUpdateProfile();
  
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      username: profile.username || '',
      email: profile.email || '',
      phone: profile.phone || '',
      notify_new_orders: Boolean(profile.notify_new_orders),
      notify_low_stock_alerts: Boolean(profile.notify_low_stock_alerts),
    }
  });

  const onSubmit = async (data) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      toast.success('Profile updated successfully');
      onCancel(); // Go back to view mode
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Failed to update profile');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Edit Profile</h2>
          <p className="text-sm text-gray-400 mt-1">Update your personal details.</p>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center px-4 py-2 bg-gray-900/50 backdrop-blur-md border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white text-sm font-semibold rounded-xl transition-all"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isDirty || isSubmitting}
            className="flex items-center px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] disabled:shadow-none"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="first_name" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            First Name
          </label>
          <input
            id="first_name"
            type="text"
            {...register('first_name')}
            className={`block w-full rounded-xl border ${errors.first_name ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : 'border-white/10 focus:ring-indigo-500/50 focus:border-indigo-500/50'} bg-gray-900/50 backdrop-blur-md px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:ring-1 shadow-inner`}
          />
          {errors.first_name && <p className="text-xs font-medium text-red-400 mt-1">{errors.first_name.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="last_name" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Last Name
          </label>
          <input
            id="last_name"
            type="text"
            {...register('last_name')}
            className={`block w-full rounded-xl border ${errors.last_name ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : 'border-white/10 focus:ring-indigo-500/50 focus:border-indigo-500/50'} bg-gray-900/50 backdrop-blur-md px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:ring-1 shadow-inner`}
          />
          {errors.last_name && <p className="text-xs font-medium text-red-400 mt-1">{errors.last_name.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="username" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            {...register('username')}
            className={`block w-full rounded-xl border ${errors.username ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : 'border-white/10 focus:ring-indigo-500/50 focus:border-indigo-500/50'} bg-gray-900/50 backdrop-blur-md px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:ring-1 shadow-inner`}
          />
          {errors.username && <p className="text-xs font-medium text-red-400 mt-1">{errors.username.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={`block w-full rounded-xl border ${errors.email ? 'border-red-500/50' : 'border-white/5'} bg-gray-900/30 px-4 py-3 text-sm text-gray-500 outline-none cursor-not-allowed`}
            readOnly
            title="Email cannot be changed directly"
          />
          {errors.email && <p className="text-xs font-medium text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="phone" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Phone Number (Optional)
          </label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            className={`block w-full rounded-xl border ${errors.phone ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : 'border-white/10 focus:ring-indigo-500/50 focus:border-indigo-500/50'} bg-gray-900/50 backdrop-blur-md px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:ring-1 shadow-inner`}
            placeholder="+1 234 567 8900"
          />
          {errors.phone && <p className="text-xs font-medium text-red-400 mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="mt-10 border-t border-white/10 pt-8">
        <h3 className="text-xl font-bold text-white mb-6 tracking-tight">Notification Preferences</h3>
        
        <div className="space-y-4">
          <label className="flex items-center p-4 bg-gray-900/30 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer group transition-all">
            <div className="flex items-center h-5 mr-4">
              <input
                type="checkbox"
                {...register('notify_new_orders')}
                className="w-5 h-5 text-indigo-500 bg-gray-800 border-gray-700 rounded focus:ring-indigo-500/50 focus:ring-2 transition-colors cursor-pointer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-gray-200 group-hover:text-indigo-400 transition-colors">Order Updates</span>
              <span className="text-sm text-gray-500 mt-0.5">Receive notifications about your order status</span>
            </div>
          </label>

          <label className="flex items-center p-4 bg-gray-900/30 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer group transition-all">
            <div className="flex items-center h-5 mr-4">
              <input
                type="checkbox"
                {...register('notify_low_stock_alerts')}
                className="w-5 h-5 text-indigo-500 bg-gray-800 border-gray-700 rounded focus:ring-indigo-500/50 focus:ring-2 transition-colors cursor-pointer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-gray-200 group-hover:text-indigo-400 transition-colors">Low Stock Alerts</span>
              <span className="text-sm text-gray-500 mt-0.5">Get notified when wishlisted items are running out</span>
            </div>
          </label>
        </div>
      </div>
    </form>
  );
};

export default ProfileEditForm;
