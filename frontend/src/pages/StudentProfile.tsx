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
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Tooltip,
  AlertTitle,
} from '@mui/material';
import { Visibility, VisibilityOff, Edit, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import { getErrorMessage } from '../lib/utils';
import { useState } from 'react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
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

export default function StudentProfile() {
  const queryClient = useQueryClient();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordFormData | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [imageUploadSuccess, setImageUploadSuccess] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showImageEditHint, setShowImageEditHint] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: async () => {
      const response = await axiosInstance.get('/students/profile');
      return response.data;
    },
    refetchOnWindowFocus: false,
    refetchInterval: 60000, // Refetch every minute
  });

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || '',
      phoneNumber: profile?.phoneNumber || '',
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
      axiosInstance.put('/students/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      setProfileSuccess('Your profile information has been successfully updated. The changes are now visible across the system.');
      setTimeout(() => setProfileSuccess(null), 5000);
    },
    onError: () => {
      setProfileError(`Failed to update profile. Please check your information and try again.`);
      setTimeout(() => setProfileError(null), 5000);
    }
  });

  const updatePassword = useMutation({
    mutationFn: (data: PasswordFormData) =>
      axiosInstance.put('/students/profile/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      resetPassword();
      setUpdateSuccess('Password successfully changed. Please use your new password for your next login.');
      setTimeout(() => setUpdateSuccess(null), 5000);
    },
    onError: (error) => {
      const errorMsg = getErrorMessage(error);
      if (errorMsg.includes('current password')) {
        setUpdateError('The current password you entered is incorrect. Please try again with the correct password.');
      } else {
        setUpdateError(`Failed to update password. Please try again later.`);
      }
      setTimeout(() => setUpdateError(null), 5000);
    }
  });

  const handleProfileUpdate = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync(data);
    } catch (error) {
      // Error is handled by the mutation's onError
    }
  };

  const handlePasswordUpdate = async (data: PasswordFormData) => {
    setPasswordData(data);
    setOpenConfirmDialog(true);
  };

  // Custom form submit handlers
  const handleProfileFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleProfileSubmit(handleProfileUpdate)();
  };

  const handlePasswordFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handlePasswordSubmit(handlePasswordUpdate)();
  };

  const confirmPasswordUpdate = async () => {
    if (!passwordData) return;
    
    try {
      setOpenConfirmDialog(false);
      await updatePassword.mutateAsync(passwordData);
    } catch (error) {
      // Error is handled by the mutation's onError
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('The image file is too large. Please select an image smaller than 5MB.');
      setTimeout(() => setImageUploadError(null), 5000);
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setImageUploadError('Invalid file format. Please select a valid image file (JPG, PNG, GIF, etc.).');
      setTimeout(() => setImageUploadError(null), 5000);
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      setIsUploading(true);
      await axiosInstance.put('/students/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      setImageUploadSuccess('Your profile picture has been successfully updated and is now visible across the system.');
      setTimeout(() => setImageUploadSuccess(null), 5000);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      if (errorMsg.includes('size')) {
        setImageUploadError('The image file is too large. Please select a smaller image.');
      } else if (errorMsg.includes('format') || errorMsg.includes('type')) {
        setImageUploadError('Invalid image format. Please select a valid image file.');
      } else {
        setImageUploadError(`Failed to upload profile picture. Please try again later.`);
      }
      setTimeout(() => setImageUploadError(null), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  // Show image edit hint when user hovers over avatar for the first time
  const handleAvatarMouseEnter = () => {
    if (!showImageEditHint) {
      setShowImageEditHint(true);
      setTimeout(() => setShowImageEditHint(false), 5000);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Student Profile Settings
      </Typography>

      {imageUploadSuccess && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          icon={<CheckCircle fontSize="inherit" />}
        >
          <AlertTitle>Profile Picture Updated</AlertTitle>
          {imageUploadSuccess}
        </Alert>
      )}
      {imageUploadError && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          icon={<ErrorIcon fontSize="inherit" />}
        >
          <AlertTitle>Image Upload Failed</AlertTitle>
          {imageUploadError}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box 
              sx={{ position: 'relative', display: 'inline-block' }}
              onMouseEnter={handleAvatarMouseEnter}
            >
              <Tooltip title="Click to change profile picture" arrow placement="top">
                <Avatar
                  src={`/api/students/profile/picture?${new Date().getTime()}`}
                  alt={profile?.name}
                  sx={{ width: 120, height: 120, mb: 2, mx: 'auto' }}
                />
              </Tooltip>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                  '&:hover': {
                    opacity: 1,
                  },
                }}
              >
                {isUploading ? (
                  <CircularProgress size={40} sx={{ color: 'white' }} />
                ) : (
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="label"
                    sx={{
                      color: 'white',
                    }}
                  >
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={handleImageUpload}
                    />
                    <Edit fontSize="large" />
                  </IconButton>
                )}
              </Box>
            </Box>
            <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 2 }}>
              Click on the image to change your profile picture
            </Typography>
            <Typography variant="h6">{profile?.name}</Typography>
            <Typography color="textSecondary">{profile?.email}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Student ID: {profile?._id}
            </Typography>
            {profile?.qualifications && (
              <Box mt={2}>
                <Typography variant="subtitle2">Qualifications:</Typography>
                <Typography variant="body2">
                  {profile.qualifications.join(', ')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            {updateSuccess && (
              <Alert 
                severity="success" 
                sx={{ mb: 2 }}
                icon={<CheckCircle fontSize="inherit" />}
              >
                <AlertTitle>Password Updated</AlertTitle>
                {updateSuccess}
              </Alert>
            )}
            {updateError && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                icon={<ErrorIcon fontSize="inherit" />}
              >
                <AlertTitle>Password Update Failed</AlertTitle>
                {updateError}
              </Alert>
            )}
            {profileSuccess && (
              <Alert 
                severity="success" 
                sx={{ mb: 2 }}
                icon={<CheckCircle fontSize="inherit" />}
              >
                <AlertTitle>Profile Updated</AlertTitle>
                {profileSuccess}
              </Alert>
            )}
            {profileError && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                icon={<ErrorIcon fontSize="inherit" />}
              >
                <AlertTitle>Profile Update Failed</AlertTitle>
                {profileError}
              </Alert>
            )}
            
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Box 
              component="form" 
              noValidate
              onSubmit={handleProfileFormSubmit}
            >
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
                  <TextField
                    fullWidth
                    label="Phone Number"
                    {...registerProfile('phoneNumber')}
                    error={!!profileErrors.phoneNumber}
                    helperText={profileErrors.phoneNumber?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updateProfile.isPending}
                    startIcon={updateProfile.isPending ? <CircularProgress size={20} color="inherit" /> : null}
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
            <Box 
              component="form" 
              noValidate
              onSubmit={handlePasswordFormSubmit}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type={showCurrentPassword ? 'text' : 'password'}
                    label="Current Password"
                    {...registerPassword('currentPassword')}
                    error={!!passwordErrors.currentPassword}
                    helperText={passwordErrors.currentPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type={showNewPassword ? 'text' : 'password'}
                    label="New Password"
                    {...registerPassword('newPassword')}
                    error={!!passwordErrors.newPassword}
                    helperText={passwordErrors.newPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm New Password"
                    {...registerPassword('confirmPassword')}
                    error={!!passwordErrors.confirmPassword}
                    helperText={passwordErrors.confirmPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updatePassword.isPending}
                    startIcon={updatePassword.isPending ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {updatePassword.isPending ? 'Updating...' : 'Update Password'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>Confirm Password Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change your password? You will need to use the new password for your next login. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
          <Button onClick={confirmPasswordUpdate} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
