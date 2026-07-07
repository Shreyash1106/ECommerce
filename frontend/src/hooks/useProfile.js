import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profile';

export const useGetProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
    },
  });
};

export const useUploadPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.uploadPhoto,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
    },
  });
};

export const useRemovePhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.removePhoto,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: profileApi.changePassword,
  });
};
