import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axios';
import { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Invalid phone number'),
  gender: z.enum(['male', 'female', 'other']),
  qualifications: z.array(z.string()).min(1, 'At least one qualification is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentDialogProps {
  open: boolean;
  onClose: () => void;
  student: any | null;
  onSuccess: () => void;
}

export default function StudentDialog({ open, onClose, student, onSuccess }: StudentDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: student?.name || '',
      email: student?.email || '',
      phoneNumber: student?.phoneNumber || '',
      gender: student?.gender || 'male',
      qualifications: student?.qualifications || [],
      password: student ? '********' : '', // Placeholder for existing students
    },
  });

  const createStudent = useMutation({
    mutationFn: (data: StudentFormData) => 
      axiosInstance.post('/students', data),
  });

  const updateStudent = useMutation({
    mutationFn: (data: StudentFormData) => {
      // If password is the placeholder, remove it from the update data
      if (data.password === '********') {
        const { password, ...restData } = data;
        return axiosInstance.put(`/students/${student?._id}`, restData);
      }
      return axiosInstance.put(`/students/${student?._id}`, data);
    },
  });

  const onSubmit = async (data: StudentFormData) => {
    try {
      if (student) {
        await updateStudent.mutateAsync(data);
      } else {
        await createStudent.mutateAsync(data);
      }
      onSuccess();
      reset();
    } catch (error) {
      console.error('Failed to save student:', error);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{student ? 'Edit Student' : 'Add New Student'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Full Name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone Number"
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.gender}>
                    <InputLabel>Gender</InputLabel>
                    <Select {...field} label="Gender">
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    label={student ? 'Password (leave unchanged to keep current)' : 'Password'}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="qualifications"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.qualifications}>
                    <InputLabel>Qualifications</InputLabel>
                    <Select
                      {...field}
                      multiple
                      label="Qualifications"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {['High School', 'Bachelor', 'Master', 'PhD'].map((qual) => (
                        <MenuItem key={qual} value={qual}>
                          {qual}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 