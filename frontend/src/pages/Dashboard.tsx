import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  totalStudents: number;
  newStudentsThisMonth: number;
  activeStudents: number;
}

// Admin Dashboard Component
const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/dashboard/stats');
      return response.data;
    },
    refetchOnWindowFocus: false,
    refetchInterval: 60000, // Refetch every minute
  });

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      description: 'Total number of registered students',
    },
    {
      title: 'New Students',
      value: stats?.newStudentsThisMonth || 0,
      icon: <SchoolIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      description: 'New registrations this month',
    },
    {
      title: 'Active Students',
      value: stats?.activeStudents || 0,
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      description: 'Currently active students',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid item xs={12} md={4} key={card.title}>
            <Card elevation={2}>
              <CardHeader
                action={
                  <IconButton aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                }
                title={card.title}
              />
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {card.icon}
                  <Typography variant="h3" component="div">
                    {isLoading ? '-' : card.value}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {/* Add recent activity list here */}
            <Typography color="text.secondary">
              No recent activity to display
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            {/* Add quick action buttons here */}
            <Typography color="text.secondary">
              No quick actions available
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Student Dashboard Component
const StudentDashboard = () => {
  const { user } = useAuth();
  
  const { data: studentData, isLoading } = useQuery({
    queryKey: ['studentProfile', user?._id],
    queryFn: async () => {
      if (!user?._id) return null;
      const response = await axiosInstance.get(`/students/${user._id}`);
      return response.data;
    },
    enabled: !!user?._id,
  });

  const statCards = [
    {
      title: 'Profile',
      value: studentData?.name || 'Loading...',
      icon: <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      description: 'Your student profile information',
    },
    {
      title: 'Qualifications',
      value: studentData?.qualifications?.length || 0,
      icon: <AssignmentIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      description: 'Your qualifications',
    },
    {
      title: 'Joined',
      value: studentData ? new Date(studentData.createdAt).toLocaleDateString() : 'Loading...',
      icon: <EventIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      description: 'When you joined',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Student Dashboard
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid item xs={12} md={4} key={card.title}>
            <Card elevation={2}>
              <CardHeader
                action={
                  <IconButton aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                }
                title={card.title}
              />
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {card.icon}
                  <Typography variant="h6" component="div">
                    {isLoading ? 'Loading...' : card.value}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Information
            </Typography>
            {isLoading ? (
              <Typography>Loading your information...</Typography>
            ) : (
              <Box>
                <Typography><strong>Email:</strong> {studentData?.email}</Typography>
                <Typography><strong>Phone:</strong> {studentData?.phoneNumber}</Typography>
                <Typography><strong>Gender:</strong> {studentData?.gender}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { user } = useAuth();

  // Render the appropriate dashboard based on user role
  return user?.role === 'student' ? <StudentDashboard /> : <AdminDashboard />;
};

export default Dashboard; 