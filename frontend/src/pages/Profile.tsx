import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/profile');
      return response.data;
    },
  });

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfile = useMutation({
    mutationFn: (data: ProfileFormData) => 
      axiosInstance.put('/admin/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProfile'] });
    },
  });

  const updatePassword = useMutation({
    mutationFn: (data: PasswordFormData) =>
      axiosInstance.put('/admin/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      resetPassword();
    },
  });

  const handleProfileUpdate = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync(data);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handlePasswordUpdate = async (data: PasswordFormData) => {
    try {
      await updatePassword.mutateAsync(data);
    } catch (error) {
      console.error('Failed to update password:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      await axiosInstance.put('/admin/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      queryClient.invalidateQueries({ queryKey: ['adminProfile'] });
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Profile Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={profile?.profilePicture}
                alt={profile?.name}
                sx={{ width: 120, height: 120, mb: 2, mx: 'auto' }}
              />
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'background.paper',
                }}
              >
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleImageUpload}
                />
                <PhotoCamera />
              </IconButton>
            </Box>
            <Typography variant="h6">{profile?.name}</Typography>
            <Typography color="textSecondary">{profile?.email}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Last login: {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Never'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Box component="form" onSubmit={handleProfileSubmit(handleProfileUpdate)}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    {...registerProfile('name')}
                    error={!!profileErrors.name}
                    helperText={profileErrors.name?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    {...registerProfile('email')}
                    error={!!profileErrors.email}
                    helperText={profileErrors.email?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Box component="form" onSubmit={handlePasswordSubmit(handlePasswordUpdate)}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current Password"
                    {...registerPassword('currentPassword')}
                    error={!!passwordErrors.currentPassword}
                    helperText={passwordErrors.currentPassword?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    {...registerPassword('newPassword')}
                    error={!!passwordErrors.newPassword}
                    helperText={passwordErrors.newPassword?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    {...registerPassword('confirmPassword')}
                    error={!!passwordErrors.confirmPassword}
                    helperText={passwordErrors.confirmPassword?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updatePassword.isPending}
                  >
                    {updatePassword.isPending ? 'Updating...' : 'Update Password'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 