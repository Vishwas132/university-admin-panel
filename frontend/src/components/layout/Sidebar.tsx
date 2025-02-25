import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 240;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Students', icon: <PeopleIcon />, path: '/dashboard/students' },
  { text: 'Profile', icon: <PersonIcon />, path: '/dashboard/profile' },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const drawerContent = (
    <List>
      <ListItem disablePadding sx={{ display: 'block' }}>
        <ListItemButton component={Link} to="/dashboard">
          <ListItemIcon>{menuItems[0].icon}</ListItemIcon>
          <ListItemText primary={menuItems[0].text} />
        </ListItemButton>
      </ListItem>
      
      {user?.role === 'admin' && (
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton component={Link} to="/students">
            <ListItemIcon>{menuItems[1].icon}</ListItemIcon>
            <ListItemText primary={menuItems[1].text} />
          </ListItemButton>
        </ListItem>
      )}
      
      <ListItem disablePadding>
        <ListItemButton
          selected={location.pathname === menuItems[2].path}
          onClick={() => {
            navigate(menuItems[2].path);
            if (isMobile) onClose();
          }}
        >
          <ListItemIcon>{menuItems[2].icon}</ListItemIcon>
          <ListItemText primary={menuItems[2].text} />
        </ListItemButton>
      </ListItem>
    </List>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : theme.spacing(7),
          boxSizing: 'border-box',
          border: 'none',
          whiteSpace: 'nowrap',
          overflowX: 'hidden',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          ...(isMobile ? {} : {
            position: 'relative',
            height: '100%',
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
