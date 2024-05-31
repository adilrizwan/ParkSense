import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Card, CardContent, MenuItem, Select, FormControl, InputLabel, CircularProgress, Alert, Paper, Grid } from '@mui/material';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

export default function AnalyticsDashboard() {
    const token = localStorage.getItem('token');

    const [lots, setLots] = useState([]);
    const [selectedLot, setSelectedLot] = useState('');
    const [analytics, setAnalytics] = useState({
        carsParked: 0,
        ongoingSessions: 0,
        avgRating: 0,
        avgHours: 0,
        peakHours: [],
        totalEarnings: 0,
        carTypeCounts: [],
        totalSessions: 0,
        avgSessionDuration: 0,
        returningCustomers: 0,
        availableSpaces: 0,
        revenueOverTime: [],
        revenueComparison: [],
        currentDayRevenue: 0,
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
        labels: analytics.peakHours?.map(item => item.hour ? `${item.hour}:00` : '0:00'),
        datasets: [
            {
                type: 'bar',
                label: 'Cars Parked',
                data: analytics.peakHours?.map(item => item.count || 0),
                backgroundColor: 'rgba(75,192,192,0.2)',
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 1,
            },
            {
                type: 'line',
                label: 'Cars Parked Line',
                data: analytics.peakHours?.map(item => item.count || 0),
                borderColor: 'rgba(153,102,255,1)',
                fill: false,
            },
        ],
    };

    const options = {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Hours',
                },
                ticks: {
                    callback: function (value, index, values) {
                        // This assumes that `values` are in the format "HH:00"
                        if (typeof value === 'string' && value.includes(':')) {
                            return value;
                        }
                        // Fallback in case values are not strings with ":"
                        return `${value}:00`;
                    }
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Cars Parked',
                },
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            datalabels: {
                formatter: (value, ctx) => {
                    let sum = 0;
                    let dataArr = ctx.chart.data.datasets[0].data;
                    dataArr.map(data => {
                        sum += data;
                    });
                    let percentage = (value * 100 / sum).toFixed(2) + "%";
                    return percentage;
                },
                color: '#fff',
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        let sum = 0;
                        let dataArr = tooltipItem.dataset.data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        let percentage = (tooltipItem.raw * 100 / sum).toFixed(2) + "%";
                        return `${tooltipItem.label}: ${tooltipItem.raw} (${percentage})`;
                    },
                },
            },
        },
    };

    const carTypeData = {
        labels: analytics.carTypeCounts?.map(item => item.type || ''),
        datasets: [
            {
                label: 'Percentage',
                data: analytics.carTypeCounts?.map(item => item.percentage || 0),
                backgroundColor: [
                    'rgba(75,192,192,0.2)',
                    'rgba(153,102,255,0.2)',
                    'rgba(255,159,64,0.2)',
                    'rgba(255,99,132,0.2)',
                    'rgba(54,162,235,0.2)',
                    'rgba(255,206,86,0.2)',
                    'rgba(75,192,192,0.2)',
                    'rgba(153,102,255,0.2)',
                    'rgba(255,159,64,0.2)',
                ],
                borderColor: [
                    'rgba(75,192,192,1)',
                    'rgba(153,102,255,1)',
                    'rgba(255,159,64,1)',
                    'rgba(255,99,132,1)',
                    'rgba(54,162,235,1)',
                    'rgba(255,206,86,1)',
                    'rgba(75,192,192,1)',
                    'rgba(153,102,255,1)',
                    'rgba(255,159,64,1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const pieOptions = {
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            datalabels: {
                formatter: (value, ctx) => {
                    let sum = 0;
                    let dataArr = ctx.chart.data.datasets[0].data;
                    dataArr.map(data => {
                        sum += data;
                    });
                    let percentage = (value * 100 / sum).toFixed(2) + "%";
                    return percentage;
                },
                color: '#fff',
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return `${tooltipItem.label}: ${tooltipItem.raw.toFixed(2)}%`;
                    },
                },
            },
        },
    };

    const revenueComparisonData = {
        labels: analytics.revenueComparison?.map(item => item.LotName || ''),
        datasets: [
            {
                label: 'Revenue',
                data: analytics.revenueComparison?.map(item => item.revenue || 0),
                backgroundColor: analytics.revenueComparison?.map(item =>
                    item.LotID === selectedLot ? 'rgba(75,192,192,1)' : 'rgba(153,102,255,1)'
                ),
                borderColor: 'rgba(255,255,255,0.8)',
                borderWidth: 1,
            },
        ],
    };

    const revenueComparisonOptions = {
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            datalabels: {
                formatter: (value, ctx) => {
                    let sum = 0;
                    let dataArr = ctx.chart.data.datasets[0].data;
                    dataArr.map(data => {
                        sum += data;
                    });
                    let percentage = (value * 100 / sum).toFixed(2) + "%";
                    return percentage;
                },
                color: '#fff',
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return `${tooltipItem.label}: $${tooltipItem.raw.toFixed(2)}`;
                    },
                },
            },
        }
    };

    const revenueOverTimeData = {
        labels: analytics.revenueOverTime?.map(item => new Date(item.date).toLocaleDateString() || ''),
        datasets: [
            {
                label: 'Revenue',
                data: analytics.revenueOverTime?.map(item => item.revenue || 0),
                backgroundColor: 'rgba(153,102,255,1)',
                borderColor: 'rgba(153,102,255,1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <Box p={2}>
            <Typography align='center' sx={{ mt: 2 }} variant="h2">
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
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ minWidth: 275 }}>
                                <CardContent>
                                    <Typography variant="h5" component="div" align="center">
                                        Today's Revenue
                                    </Typography>
                                    <Typography variant="h3" align="center">
                                        ${analytics.currentDayRevenue}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ minWidth: 275 }}>
                                <CardContent>
                                    <Typography variant="h5" component="div" align="center">
                                        Ongoing Sessions
                                    </Typography>
                                    <Typography variant="h3" align="center">
                                        {analytics.ongoingSessions}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ minWidth: 275 }}>
                                <CardContent>
                                    <Typography variant="h5" component="div" align="center">
                                        Average Rating
                                    </Typography>
                                    <Typography variant="h3" align="center">
                                        {analytics.avgRating ? analytics.avgRating.toFixed(2) : 'N/A'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ minWidth: 275 }}>
                                <CardContent>
                                    <Typography variant="h5" component="div" align="center">
                                        Average Session Duration
                                    </Typography>
                                    <Typography variant="h3" align="center">
                                        {analytics.avgHours ? analytics.avgHours.toFixed(2) : 'N/A'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ minWidth: 275 }}>
                                <CardContent>
                                    <Typography variant="h5" component="div" align="center">
                                        Available Spaces
                                    </Typography>
                                    <Typography variant="h3" align="center">
                                        {analytics.availableSpaces}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ minWidth: 275 }}>
                                <CardContent>
                                    <Typography variant="h5" component="div" align="center">
                                        Lifetime Revenue
                                    </Typography>
                                    <Typography variant="h3" align="center">
                                        ${analytics.totalEarnings}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12}>
                            <Paper elevation={3} sx={{ p: 2, minHeight: '400px' }}>
                                <Typography variant="h5" component="div" gutterBottom>
                                    Peak Hours
                                </Typography>
                                <Bar
                                    data={peakHoursData}
                                    options={{ options }}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={3} sx={{ p: 2, minHeight: '400px' }}>
                                <Typography variant="h5" component="div" gutterBottom>
                                    Cars Parked by Type
                                </Typography>
                                <Pie data={carTypeData} options={pieOptions} />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={3} sx={{ p: 2, minHeight: '400px' }}>
                                <Typography variant="h5" component="div" gutterBottom>
                                    Revenue Comparison
                                </Typography>
                                <Doughnut data={revenueComparisonData} options={revenueComparisonOptions} />
                            </Paper>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12}>
                            <Paper elevation={3} sx={{ p: 2, minHeight: '400px' }}>
                                <Typography variant="h5" component="div" gutterBottom>
                                    Revenue Over Time
                                </Typography>
                                <Line
                                    data={revenueOverTimeData}
                                    options={{
                                        scales: {
                                            x: {
                                                title: {
                                                    display: true,
                                                    text: 'Date',
                                                },
                                            },
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: 'Revenue',
                                                },
                                            },
                                        },
                                    }}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
}