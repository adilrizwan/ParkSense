import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Box, Button, Typography, TextField, CircularProgress, Alert, Paper, Container, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

export default function LotRates() {
    const token = localStorage.getItem('token');

    const [lots, setLots] = useState([]);
    const [selectedLot, setSelectedLot] = useState('');
    const [loading, setLoading] = useState(false);
    const [Error, setError] = useState('');
    const [hourlyRates, setHourlyRates] = useState(Array(24).fill(''));
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        const fetchLots = async () => {
            try {
                const response = await axios.get('http://localhost:8000/lot/lots', {
                    headers: {
                        Authorization: `${token}`,
                    },
                });
                setLots(response.data.lots);
                if (response.data.lots.length > 0) {
                    setSelectedLot(response.data.lots[0].LotID);
                }
            } catch (error) {
                console.log(error);
                setError('Error fetching lots');
            }
        };
        fetchLots();
    }, [token]);

    useEffect(() => {
        const fetchRates = async () => {
            if (!selectedLot) return;
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:8000/lot/rates/${selectedLot}`, {
                    headers: {
                        Authorization: `${token}`,
                    },
                });
                const rates = response.data.lots[0];
                if (rates) {
                    setHourlyRates([
                        rates.Hour00, rates.Hour01, rates.Hour02, rates.Hour03, rates.Hour04, rates.Hour05,
                        rates.Hour06, rates.Hour07, rates.Hour08, rates.Hour09, rates.Hour10, rates.Hour11,
                        rates.Hour12, rates.Hour13, rates.Hour14, rates.Hour15, rates.Hour16, rates.Hour17,
                        rates.Hour18, rates.Hour19, rates.Hour20, rates.Hour21, rates.Hour22, rates.Hour23,
                    ]);
                } else {
                    setHourlyRates(Array(24).fill(''));
                }
            } catch (error) {
                console.log(error);
                setError('Error fetching rates');
            }
            setLoading(false);
        };
        fetchRates();
    }, [selectedLot, token]);


    const handleLotChange = (event) => {
        setSelectedLot(event.target.value);
    };

    const handleRateChange = (index, value) => {
        const newRates = [...hourlyRates];
        newRates[index] = parseFloat(value);
        setHourlyRates(newRates);
    };



    const handleSubmit = async () => {
        setLoading(true);
        try {
            const data = {
                LotID: selectedLot,
                Rates: hourlyRates
            };
            await axios.post('http://localhost:8000/lot/rates', data, {
                headers: {
                    Authorization: `${token}`,
                },
            });
            setSnackbarSeverity('success');
            setSnackbarMessage('Rates updated successfully');
            setTimeout(() => {
                setSnackbarMessage('');
            }, 5000);
        } catch (error) {
            console.log(error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Error updating rates: ' + Error);
        }
        setLoading(false);
    };

    const formatLabel = (hour) => {
        const isPM = hour >= 12;
        const formattedHour = hour % 12 || 12;
        const period = isPM ? 'PM' : 'AM';
        return `${hour}:00 (${formattedHour} ${period})`;
    };

    return (
        <Container maxWidth="md">
            <Box p={2}>
                <Typography align='center' sx={{ mt: 2, mb: 4 }} variant="h2">
                    Hourly Rates
                </Typography>
                {snackbarMessage && (
                    <Alert severity={snackbarSeverity} sx={{ width: '100%', mb: 2 }}>
                        {snackbarMessage}
                    </Alert>
                )}
                <FormControl fullWidth sx={{ mb: 4 }}>
                    <InputLabel id="lot-select-label">Select Lot</InputLabel>
                    <Select
                        labelId="lot-select-label"
                        value={selectedLot}
                        label="Select Lot"
                        onChange={handleLotChange}
                    >
                        {lots.map(lot => (
                            <MenuItem key={lot.LotID} value={lot.LotID}>
                                {lot.LotName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Grid container spacing={2}>
                            {Array.from({ length: 24 }, (_, index) => (
                                <Grid item xs={12} sm={6} md={3} key={index}>
                                    <TextField
                                        label={formatLabel(index)}
                                        type="number"
                                        value={hourlyRates[index]}
                                        onChange={(e) => handleRateChange(index, e.target.value)}
                                        fullWidth
                                    />
                                </Grid>
                            ))}
                        </Grid>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Button variant="contained" color="primary" onClick={handleSubmit}>
                                Submit
                            </Button>
                        </Box>
                    </Paper>
                )}
            </Box>
        </Container>
    );
}