import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useChangePassword } from '../../hooks/useProfile';
import toast from 'react-hot-toast';
import { KeyRound, X, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const passwordSchema = z.object({
  current_password: z.string().min(8, 'Current password must be at least 8 characters'),
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

const ChangePasswordModal = ({ onClose }) => {
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  
  const changePasswordMutation = useChangePassword();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const onSubmit = async (data) => {
    try {
      await changePasswordMutation.mutateAsync({
        current_password: data.current_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password
      });
      toast.success('Password changed successfully');
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Failed to change password');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center text-gray-900 dark:text-white">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg mr-3">
              <KeyRound className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold">Change Password</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                {...register('current_password')}
                className={`block w-full rounded-lg border ${errors.current_password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'} bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition-shadow focus:border-blue-500 focus:ring-2`}
                placeholder="Enter current password"
              />
              <button 
                type="button" 
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.current_password && <p className="text-sm text-red-500 mt-1">{errors.current_password.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                {...register('new_password')}
                className={`block w-full rounded-lg border ${errors.new_password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'} bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition-shadow focus:border-blue-500 focus:ring-2`}
                placeholder="Enter new password"
              />
              <button 
                type="button" 
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.new_password && <p className="text-sm text-red-500 mt-1">{errors.new_password.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                {...register('confirm_password')}
                className={`block w-full rounded-lg border ${errors.confirm_password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'} bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition-shadow focus:border-blue-500 focus:ring-2`}
                placeholder="Confirm new password"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirm_password && <p className="text-sm text-red-500 mt-1">{errors.confirm_password.message}</p>}
          </div>

          {/* Password Requirements info box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start mt-4">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <p className="font-medium text-sm mb-1">Password Requirements:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>At least 8 characters long</li>
                <li>One uppercase & one lowercase letter</li>
                <li>One number & one special character</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 dark:focus:ring-offset-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 flex justify-center items-center"
            >
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
