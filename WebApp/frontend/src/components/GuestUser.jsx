import * as React from 'react';
import { Box, useTheme, IconButton } from "@mui/material"
import { useContext } from "react"
import { ColorModeContext } from "../constants/theme"
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { Link, useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../constants/firebaseConfig';

function GuestUser() {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate("/login");
    };

    const handleRegisterClick = () => {
        navigate("/register");
    };

    const theme = useTheme();

    const colorMode = useContext(ColorModeContext);
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app, "gs://parksense-82db2.appspot.com");
    const [logoUrl, setLogoUrl] = React.useState(null);
    const logoRef = ref(storage, 'Logo/parksense_logo.png');
    React.useEffect(() => {
        getDownloadURL(logoRef)
            .then((url) => {
                setLogoUrl(url);
            })
            .catch((error) => {
                console.error('Error fetching logo URL:', error);
            });
    }, [logoRef]);

    return (
        <AppBar color='inherit' position="sticky" style={{ marginBottom: '5px', backgroundColor: theme.palette.background.default }}>
            <Container maxWidth="xl">
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <img src={logoUrl} alt="logo" style={{ width: '140px' }} />
                            </Box>
                        </Link>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={colorMode.toggleColorMode}>
                            {theme.palette.mode === "dark" ? (
                                <DarkModeOutlinedIcon sx={{ color: theme.palette.white.main }} />
                            ) : (
                                <LightModeOutlinedIcon sx={{ color: theme.palette.black.main }} />
                            )}
                        </IconButton>

                        <Button
                            sx={{ margin: "10px" }}
                            variant="contained"
                            size='medium'
                            onClick={handleLoginClick}
                            style={{ backgroundColor: theme.palette.primary.main }}>
                            Login
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleRegisterClick}
                            size='medium'
                            style={{ backgroundColor: theme.palette.primary.main }}>
                            Register
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default GuestUser;
