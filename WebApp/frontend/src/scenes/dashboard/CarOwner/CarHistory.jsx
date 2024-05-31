import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Paper, Typography, Box, Pagination } from '@mui/material';
import { pageSize } from '../../../constants/theme';

export default function CarHistory() {
    const token = localStorage.getItem('token');
    const [parkingHistory, setParkingHistory] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/car/history`, {
                    headers: {
                        Authorization: token,
                    },
                    params: {
                        page: currentPage,
                    },
                });
                setParkingHistory(response.data);
                const totalCount = parseInt(response.data.totalCount);
                setTotalPages(Math.ceil(totalCount / pageSize));
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, [token, currentPage]);

    return (
        <Box p={2}>
            <Typography align='left' variant="h2">
                Parking History
            </Typography>
            {parkingHistory.length > 0 ? (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {parkingHistory.map((parking, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Paper elevation={3} sx={{ p: 4 }}>
                                <Typography variant="h5" gutterBottom>
                                    {parking.LotName}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    Date: {parking.InTime.split("T")[0]}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    In Time: {parking.InTime.split("T")[1].split(":")[0]}:{parking.InTime.split("T")[1].split(":")[1]}
                                </Typography>
                                {/* <Typography variant="body1" gutterBottom>
                                    Out Time: {parking.OutTime.split("T")[1].split(":")[0]}:{parking.OutTime.split("T")[1].split(":")[1]}
                                </Typography> */}
                                <Typography variant="body1" gutterBottom>
                                    Duration: {parking.Duration}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    Rating: {parking.Rating}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    Coins Charged: {parking.Charge}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography variant="body1">
                    You don't have any parking history.
                </Typography>
            )}
            <Grid sx={{ mt: 5 }}>
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(event, value) => setCurrentPage(value)}
                    color="primary"
                    sx={{
                        marginTop: 'auto',
                        display: 'flex',
                        justifyContent: 'center',
                        '& .Mui-selected': {
                            color: 'primary.main',
                        },
                    }}
                />
            </Grid>
        </Box>
    );
}