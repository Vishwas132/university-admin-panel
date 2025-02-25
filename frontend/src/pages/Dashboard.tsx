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
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';

interface DashboardStats {
  totalStudents: number;
  newStudentsThisMonth: number;
  activeStudents: number;
}

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/dashboard/stats');
      return response.data;
    },
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
        Dashboard Overview
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

export default Dashboard; 