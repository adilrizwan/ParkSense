import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Card, CardContent, MenuItem, Select, FormControl, InputLabel, CircularProgress, Alert, Paper } from '@mui/material';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function AnalyticsDashboard() {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);

    const [lots, setLots] = useState([]);
    const [selectedLot, setSelectedLot] = useState('');
    const [analytics, setAnalytics] = useState({
        carsParked: 0,
        avgRating: 0,
        avgHours: 0,
        peakHours: [],
        totalEarnings: 0,
        zoneWise: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        const fetchAnalytics = async () => {
            if (!selectedLot) return;
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`http://localhost:8000/lot/analytics/${selectedLot}`, {
                    headers: {
                        Authorization: `${token}`,
                    },
                });
                setAnalytics(response.data.analytics);
            } catch (error) {
                console.log(error);
                setError('Error fetching analytics data');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [selectedLot, token]);

    const handleLotChange = (event) => {
        setSelectedLot(event.target.value);
    };

    const peakHoursData = {
        labels: analytics.peakHours.map(item => item.hour),
        datasets: [
            {
                label: 'Count',
                data: analytics.peakHours.map(item => item.count),
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.2)',
                borderColor: 'rgba(75,192,192,1)',
            },
        ],
    };

    const zoneWiseData = {
        labels: analytics.zoneWise.map(item => item.zone),
        datasets: [
            {
                label: 'Count',
                data: analytics.zoneWise.map(item => item.count),
                backgroundColor: 'rgba(75,192,192,0.2)',
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <Box p={2}>
            <Typography align='left' sx={{ mt: 2 }} variant="h2">
                Analytics Dashboard
            </Typography>
            {error && (
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                    {error}
                </Alert>
            )}
            <FormControl fullWidth sx={{ mt: 2 }}>
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
                <>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                        <Card sx={{ minWidth: 275 }}>
                            <CardContent>
                                <Typography variant="h5" component="div">
                                    Cars Parked
                                </Typography>
                                <Typography variant="h4">
                                    {analytics.carsParked}
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{ minWidth: 275 }}>
                            <CardContent>
                                <Typography variant="h5" component="div">
                                    Avg Rating
                                </Typography>
                                <Typography variant="h4">
                                    {analytics.avgRating}
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{ minWidth: 275 }}>
                            <CardContent>
                                <Typography variant="h5" component="div">
                                    Avg Hours
                                </Typography>
                                <Typography variant="h4">
                                    {analytics.avgHours}
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{ minWidth: 275 }}>
                            <CardContent>
                                <Typography variant="h5" component="div">
                                    Total Earnings
                                </Typography>
                                <Typography variant="h4">
                                    ${analytics.totalEarnings}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                    <Paper elevation={3} sx={{ p: 2, minHeight: '400px', mt: 2 }}>
                        <Typography variant="h5" component="div" gutterBottom>
                            Peak Hours
                        </Typography>
                        <Line data={peakHoursData} />
                    </Paper>
                    <Paper elevation={3} sx={{ p: 2, minHeight: '400px', mt: 2 }}>
                        <Typography variant="h5" component="div" gutterBottom>
                            Zone Wise Statistics
                        </Typography>
                        <Bar data={zoneWiseData} />
                    </Paper>
                </>
            )}
        </Box>
    );
}
