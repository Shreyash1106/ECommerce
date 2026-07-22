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
      onCancel();
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Failed to update profile');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 font-sans">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Edit Profile</h2>
          <p className="text-xs text-slate-500 mt-0.5">Update your personal details.</p>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary text-xs"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isDirty || isSubmitting}
            className="btn-primary text-xs"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="first_name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            First Name
          </label>
          <input
            id="first_name"
            type="text"
            {...register('first_name')}
            className="input-field"
          />
          {errors.first_name && <p className="text-xs font-bold text-rose-600 mt-1">{errors.first_name.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="last_name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Last Name
          </label>
          <input
            id="last_name"
            type="text"
            {...register('last_name')}
            className="input-field"
          />
          {errors.last_name && <p className="text-xs font-bold text-rose-600 mt-1">{errors.last_name.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="username" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            {...register('username')}
            className="input-field"
          />
          {errors.username && <p className="text-xs font-bold text-rose-600 mt-1">{errors.username.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="input-field bg-slate-100 text-slate-500 cursor-not-allowed"
            readOnly
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Phone Number (Optional)
          </label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            className="input-field"
            placeholder="+1 234 567 8900"
          />
        </div>
      </div>
    </form>
  );
};

export default ProfileEditForm;
