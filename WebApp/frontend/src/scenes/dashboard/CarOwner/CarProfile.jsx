import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Box, Button, Typography, TextField, CircularProgress, Alert, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { margins } from '../../../constants/theme';
import { genderArr } from '../../../constants/Menus';
import { TextMaskCustomReg } from '../../../constants/phoneNumber';
import { countries } from '../../../constants/countries';
import ImageSlider from '../../../components/ImageSlider';

export default function CarProfile() {
    const token = localStorage.getItem('token');
    const [data, setData] = useState({
        FirstName: '',
        LastName: '',
        Gender: '',
        DOB: '',
        City: '',
        Country: '',
        PhoneNo: '',
        AvatarID: 0
    });
    const [loading, setLoading] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/car/profile', {
                    headers: {
                        Authorization: `${token}`,
                    },
                });

                const formattedDate = response.data.DOB.split('T')[0];
                setData({ ...response.data, DOB: formattedDate });
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, [token]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setData((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleImageSelect = (fileNameWithoutExtension) => {
        const avatarID = parseInt(fileNameWithoutExtension);
        setData((prevState) => ({ ...prevState, AvatarID: avatarID }));
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            await axios.put('http://localhost:8000/car/profile', data, {
                headers: {
                    Authorization: `${token}`,
                },
            });
            setSnackbarSeverity('success');
            setSnackbarMessage('Your information has been updated!');
            setTimeout(() => {
                setSnackbarMessage('');
            }, 5000);
        } catch (error) {
            if (error.request && error.request.response && error.request.response.status === 403) {
                setSnackbarSeverity('info');
                setSnackbarMessage('Update failed. Please try again.');
            } else {
                setSnackbarSeverity('error');
                setSnackbarMessage((error.response?.data?.message || 'Unknown error'));
                console.log(error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid container justifyContent="center">
            <Grid item xs={12} md={8}>
                <Box p={2}>
                    <Typography align='left' variant="h2" gutterBottom>
                        Update Profile
                    </Typography>
                    {snackbarMessage && (
                        <Alert severity={snackbarSeverity} sx={{ width: '100%', mb: 2 }}>
                            {snackbarMessage}
                        </Alert>
                    )}
                    <Paper elevation={3} sx={{ p: 4, ...margins }}>
                        <Typography align='left' variant="h4" gutterBottom>
                            Update Avatar
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }} gutterBottom>
                            Changes to your avatar will be applied the next time you log in.
                        </Typography>

                        <Box p={2}>
                            <ImageSlider avatarCount={8} onImageSelect={handleImageSelect} />
                        </Box>
                        <Typography align='left' variant="h4" sx={{ mb: 4 }} gutterBottom>
                            Update Details
                        </Typography>
                        <form onSubmit={onSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="FirstName"
                                        value={data.FirstName}
                                        onChange={handleChange}
                                        label="First Name"
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="LastName"
                                        required
                                        value={data.LastName}
                                        onChange={handleChange}
                                        label="Last Name"
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>Gender</InputLabel>
                                        <Select
                                            required
                                            value={data.Gender}
                                            onChange={(e) => setData({ ...data, Gender: e.target.value })}
                                            label="Gender"
                                            variant="outlined"
                                        >
                                            {genderArr.map((s, i) => (
                                                <MenuItem key={i} value={s}>{s}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="DOB"
                                        required
                                        label="Date of Birth"
                                        value={data.DOB}
                                        onChange={handleChange}
                                        type="date"
                                        variant="outlined"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="PhoneNo"
                                        value={data.PhoneNo}
                                        onChange={handleChange}
                                        label="Phone Number"
                                        variant="outlined"
                                        InputProps={{
                                            inputComponent: TextMaskCustomReg,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name='City'
                                        value={data.City}
                                        onChange={handleChange}
                                        label="City"
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>Country</InputLabel>
                                        <Select
                                            required
                                            value={data.Country}
                                            onChange={(e) => setData({ ...data, Country: e.target.value })}
                                            variant="outlined"
                                        >
                                            {countries.map((country, index) => (
                                                <MenuItem key={index} value={country.label}>
                                                    <Box
                                                        component="img"
                                                        src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                                                        sx={{ mr: 1 }}
                                                    />
                                                    {country.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        disabled={loading}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Update'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Box>
            </Grid>
        </Grid>
    );
}
