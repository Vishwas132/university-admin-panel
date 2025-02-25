import React from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
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
  InputAdornment,
  IconButton,
  Alert,
  AlertTitle,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../lib/utils';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [isStudent, setIsStudent] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(
    location.state?.message || null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  React.useEffect(() => {
    // Clear the message from location state after displaying it
    if (location.state?.message) {
      const timer = setTimeout(() => {
        setSuccess(null);
        navigate(location.pathname, { replace: true, state: {} });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  // Add a new useEffect to handle error message clearing
  React.useEffect(() => {
    // Only set up the timer if there's an error message
    if (error) {
      // Clear error message after 10 seconds
      const errorTimer = setTimeout(() => {
        setError('');
      }, 10000);
      
      // Clean up the timer if component unmounts or error changes
      return () => clearTimeout(errorTimer);
    }
  }, [error]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      setIsLoggingIn(true);
      await login(data.email, data.password, isStudent);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      if (errorMsg.includes('credentials') || errorMsg.includes('password') || errorMsg.includes('email')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(`Login failed. Please try again later.`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleToggleUserType = () => {
    setIsStudent(!isStudent);
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
            {isStudent ? 'Student Login' : 'Admin Login'}
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={isStudent}
                onChange={handleToggleUserType}
                name="userType"
                color="primary"
              />
            }
            label={isStudent ? "Login as Student" : "Login as Admin"}
            sx={{ mb: 2, alignSelf: 'center' }}
          />

          {success && (
            <Alert 
              severity="success" 
              sx={{ mb: 2, width: '100%' }}
              icon={<CheckCircle fontSize="inherit" />}
            >
              <AlertTitle>Success</AlertTitle>
              {success}
            </Alert>
          )}

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2, width: '100%' }}
              icon={<ErrorIcon fontSize="inherit" />}
            >
              <AlertTitle>Login Failed</AlertTitle>
              {error}
            </Alert>
          )}

          <Box 
            component="div"
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
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(onSubmit)();
                }
              }}
              {...register('password')}
            />
            <Button
              type="button"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoggingIn}
              startIcon={isLoggingIn ? <CircularProgress size={20} color="inherit" /> : null}
              onClick={handleSubmit(onSubmit)}
            >
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </Button>
            <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
              {!isStudent && (
                <Link component={RouterLink} to="/register" variant="body2">
                  Don't have an account? Sign up
                </Link>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 