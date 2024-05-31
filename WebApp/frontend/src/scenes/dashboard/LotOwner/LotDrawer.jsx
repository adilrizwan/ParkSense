import * as React from 'react';
import { useState, useEffect } from 'react';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import PaidIcon from '@mui/icons-material/Paid';
import AddHomeIcon from '@mui/icons-material/AddHome';
import { List, ListItemButton, Box, Typography, IconButton, useTheme, ListItemIcon, ListItemText, Divider, Toolbar, styled, ThemeProvider, useMediaQuery } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MuiDrawer from '@mui/material/Drawer';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../../constants/firebaseConfig'
import LotView from './LotView';
import LotSupport from './LotSupport';
import LotProfile from './LotProfile';
import LotAdd from './LotAdd';
import LotAnalytics from './LotAnalytics';
import LotRates from './LotRates';

const drawerWidth = 240;
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            position: 'static',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

const app = initializeApp(firebaseConfig);
const storage = getStorage(app, "gs://parksense-82db2.appspot.com");

export default function SideBar({ onTabClick }) {
    const theme = useTheme();
    const jwtToken = localStorage.getItem('token');
    const isScreenSmall = useMediaQuery(theme.breakpoints.down(700));
    const [open, setOpen] = React.useState(true);
    const toggleDrawer = () => {
        setOpen(!open);
    };
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [payload] = jwtToken.split('.').slice(1, 2);

    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const filePath = 'avatars/' + decodedPayload.avatar + '.jpg'

    useEffect(() => {
        const imageRef = ref(storage, filePath);
        getDownloadURL(imageRef)
            .then((url) => setAvatarUrl(url))
            .catch((error) => console.error("Error getting download URL:", error));
    }, [filePath]);
    return (
        <ThemeProvider theme={theme}>
            <Drawer variant="permanent" open={!isScreenSmall && open}>
                <Toolbar
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        px: [1],
                    }}
                >
                    <IconButton onClick={toggleDrawer}>
                        {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </Toolbar>
                <Divider />
                {open && !isScreenSmall && (
                    <Box m="20px">
                        <Box display="flex" justifyContent="center" alignItems="center">
                            {avatarUrl ? (
                                <img
                                    alt="profile-user"
                                    width="100px"
                                    height="100px"
                                    src={avatarUrl}
                                    style={{ cursor: "pointer", borderRadius: "50%" }}
                                />
                            ) : (
                                <PersonOutlinedIcon
                                    style={{ fontSize: "100px", color: theme.palette.text.primary }}
                                />
                            )}
                        </Box>
                        <Box textAlign="center">
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{ m: "10px 0 0 0" }}
                            >
                                {decodedPayload.name}
                            </Typography>
                        </Box>
                        <Box textAlign="center">
                            <Typography
                                variant="subtitle"
                            >
                                Dashboard
                            </Typography>
                        </Box>
                    </Box>
                )}
                <List>
                    <LotDrawerList onTabClick={onTabClick} />
                </List>
            </Drawer>
        </ThemeProvider>
    )
}

const LotDrawerList = ({ onTabClick }) => (
    <React.Fragment>
        {/* <Divider /> */}
        <ListItemButton onClick={() => onTabClick(<LotView />)}>
            <ListItemIcon>
                <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="My Lots" />
        </ListItemButton>
        <Divider sx={{ mx: 2 }} />

        <ListItemButton onClick={() => onTabClick(<LotAdd />)}>
            <ListItemIcon>
                <AddHomeIcon />
            </ListItemIcon>
            <ListItemText primary="Add Lot" />
        </ListItemButton>
        <Divider sx={{ mx: 2 }} />


        <ListItemButton onClick={() => onTabClick(<LotRates />)}>
            <ListItemIcon>
                <PaidIcon />
            </ListItemIcon>
            <ListItemText primary="Hourly Rates" />
        </ListItemButton>
        <Divider sx={{ mx: 2 }} />

        {/* <Divider /> */}
        <ListItemButton onClick={() => onTabClick(<LotAnalytics />)}>
            <ListItemIcon>
                <BarChartIcon />
            </ListItemIcon>
            <ListItemText primary="Analytics" />
        </ListItemButton>
        <Divider sx={{ mx: 2 }} />

        {/* <Divider /> */}
        <ListItemButton onClick={() => onTabClick(<LotProfile />)}>
            <ListItemIcon>
                <PersonOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
        </ListItemButton>
        <Divider sx={{ mx: 2 }} />

        {/* <Divider /> */}
        <ListItemButton onClick={() => onTabClick(<LotSupport />)}>
            <ListItemIcon>
                <HelpOutlineOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Support" />
        </ListItemButton>
        <Divider sx={{ mx: 2 }} />

    </React.Fragment>
);

export { LotDrawerList };