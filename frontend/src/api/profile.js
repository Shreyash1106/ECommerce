import client from './client';

export const profileApi = {
  getProfile: async () => {
    const { data } = await client.get('/auth/profile');
    return data;
  },

  updateProfile: async (profileData) => {
    const { data } = await client.put('/auth/profile', profileData);
    return data;
  },

  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await client.post('/auth/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  removePhoto: async () => {
    const { data } = await client.delete('/auth/profile/photo');
    return data;
  },

  changePassword: async (passwordData) => {
    const { data } = await client.put('/auth/password', passwordData);
    return data;
  }
};
