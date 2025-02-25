import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Error as ErrorIcon } from '@mui/icons-material';
import { axiosInstance } from '../lib/axios';
import { getErrorMessage } from '../lib/utils';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isResetting, setIsResetting] = React.useState(false);

  React.useEffect(() => {
    if (!token) {
      navigate('/login', { state: { message: 'Password reset link is invalid or has expired. Please request a new password reset.' } });
    }
  }, [token, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setError('');
      setIsResetting(true);
      await axiosInstance.put('/auth/reset-password', {
        token,
        password: data.password,
      });
      navigate('/login', { state: { message: 'Your password has been reset successfully. You can now login with your new password.' } });
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      if (errorMsg.includes('token') || errorMsg.includes('expired')) {
        setError('The password reset link is invalid or has expired. Please request a new password reset.');
      } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(`Failed to reset password. Please try again later.`);
      }
    } finally {
      setIsResetting(false);
    }
  };

  // Custom form submit handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Manually trigger form validation and submission
    handleSubmit(onSubmit)();
  };

  if (!token) {
    return null;
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Reset Password
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2, width: '100%' }}
              icon={<ErrorIcon fontSize="inherit" />}
            >
              <AlertTitle>Password Reset Failed</AlertTitle>
              {error}
            </Alert>
          )}

          <Box 
            component="form" 
            noValidate
            onSubmit={handleFormSubmit}
            sx={{ mt: 1, width: '100%' }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...register('password')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
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
              {...register('confirmPassword')}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isResetting}
              startIcon={isResetting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isResetting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 