import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { axiosInstance } from '../lib/axios';
import { getErrorMessage } from '../lib/utils';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError('');
      setSuccess('');
      setIsSubmitting(true);
      await axiosInstance.post('/auth/forgot-password', {
        email: data.email,
      });
      setSuccess('Password reset instructions have been sent to your email. Please check your inbox and follow the instructions to reset your password. The link will expire in 1 hour.');
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      if (errorMsg.includes('not found') || errorMsg.includes('no user')) {
        setError('No account found with this email address. Please check the email or register for a new account.');
      } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(`Failed to send reset instructions. Please try again later.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom form submit handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Manually trigger form validation and submission
    handleSubmit(onSubmit)();
  };

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
            Forgot Password
          </Typography>

          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
            Enter your email address and we'll send you instructions to reset your password.
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2, width: '100%' }}
              icon={<ErrorIcon fontSize="inherit" />}
            >
              <AlertTitle>Request Failed</AlertTitle>
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              sx={{ mb: 2, width: '100%' }}
              icon={<CheckCircle fontSize="inherit" />}
            >
              <AlertTitle>Email Sent</AlertTitle>
              {success}
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
              id="email"
              label="Email Address"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email')}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Back to Sign In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 