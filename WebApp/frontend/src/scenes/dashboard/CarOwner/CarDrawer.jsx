import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import HistoryIcon from '@mui/icons-material/History';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import { List, ListItemButton, Box, Typography, IconButton, useTheme, ListItemIcon, ListItemText, Divider, Toolbar, styled, ThemeProvider, useMediaQuery } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../../constants/firebaseConfig'
import CarSupport from './CarSupport';
import CarProfile from './CarProfile';
import CarView from './CarView';
import CarHistory from './CarHistory';

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
    const [coins, setCoins] = useState([]);
    const toggleDrawer = () => {
        setOpen(!open);
    };
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [payload] = jwtToken.split('.').slice(1, 2);

    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const filePath = 'avatars/' + decodedPayload.avatar + '.jpg'
    const coinImg = "https://firebasestorage.googleapis.com/v0/b/parksense-82db2.appspot.com/o/Homepage%2Fcoin.png?alt=media&token=6781ab83-23fd-42d0-9b8d-6943a892a636"

    useEffect(() => {
        const imageRef = ref(storage, filePath);
        getDownloadURL(imageRef)
            .then((url) => setAvatarUrl(url))
            .catch((error) => console.error("Error getting download URL:", error));
    }, [filePath]);
    useEffect(() => {
        const fetchCoins = async () => {
            try {
                const response = await axios.get('http://localhost:8000/car/coins', {
                    headers: {
                        Authorization: jwtToken,
                    },
                });
                setCoins(response.data.coins);
                console.log(coins)
            } catch (error) {
                console.error('Error fetching coins:', error);
            }
        };
        fetchCoins();
    }, [jwtToken, coins]);
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
                    <CarDrawerList onTabClick={onTabClick} />
                </List>
                {open && !isScreenSmall && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <img src={coinImg} alt="coins" style={{ width: '24px', height: '24px', marginRight: '8px' }} />
                            <Typography variant="subtitle">{coins}</Typography>
                        </Box>
                    </Box>
                )}
            </Drawer>
        </ThemeProvider>
    )
}

const CarDrawerList = ({ onTabClick }) => (
    <React.Fragment>
        <ListItemButton onClick={() => onTabClick(<CarView />)}>
            <ListItemIcon>
                <DirectionsCarIcon />
            </ListItemIcon>
            <ListItemText primary="Vehicles" />
        </ListItemButton>
        <Divider sx={{ mx: 2 }} />
        <ListItemButton onClick={() => onTabClick(<CarHistory />)}>
            <ListItemIcon>
                <HistoryIcon />
            </ListItemIcon>
            <ListItemText primary="History" />
        </ListItemButton>
        <Divider sx={{ mx: 2 }} />
        <ListItemButton onClick={() => onTabClick(<CarProfile />)}>
            <ListItemIcon>
                <PersonOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
        </ListItemButton>
        <Divider sx={{ mx: 2 }} />
        <ListItemButton onClick={() => onTabClick(<CarSupport />)}>
            <ListItemIcon>
                <HelpOutlineOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Support" />
        </ListItemButton>
        <Divider sx={{ mx: 2 }} />
    </React.Fragment>
);
