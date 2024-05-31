import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Paper, Typography, Box, Button, Alert, Pagination, useMediaQuery, Modal, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import CarIcon from '@mui/icons-material/DriveEta';
import AddIcon from '@mui/icons-material/Add';
import { pageSize } from '../../../constants/theme';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../../constants/firebaseConfig';
import { years, colors, types, makes } from '../../../constants/Menus';
import { countries } from '../../../constants/countries';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app, "gs://parksense-82db2.appspot.com");

export default function CarView() {
    const token = localStorage.getItem('token');
    const [cars, setCars] = useState([]);
    const [carUrls, setCarUrls] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [snackbarSeverity, setSnackbarSeverity] = useState('');
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [fieldsSnackbarSeverity, setfieldsSnackbarSeverity] = useState('');
    const [fieldsSnackbarMessage, setfieldsSnackbarMessage] = useState('');
    const [selectedCar, setSelectedCar] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
    const [carToDelete, setCarToDelete] = useState(null);
    const [isAddCarOpen, setIsAddCarOpen] = useState(false);
    const [newCar, setNewCar] = useState({
        RegNo: '',
        Make: '',
        Model: '',
        RegYear: '',
        Color: '',
        Type: '',
        RegisteredCountry: '',
        RegisteredCity: ''
    });
    const isSmallScreen = useMediaQuery('(max-width:1000px)');
    const isExtraSmallScreen = useMediaQuery('(max-width:550px)');
    const isExtraExtraSmallScreen = useMediaQuery('(max-width:400px)');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/car/', {
                    headers: {
                        Authorization: token,
                    },
                    params: {
                        page: currentPage,
                    },
                });
                setCars(response.data.MyVehicles);
                const totalCount = parseInt(response.data.Results.split(' ')[3]);
                setTotalPages(Math.ceil(totalCount / pageSize));

                const urls = await Promise.all(response.data.MyVehicles.map(async (car) => {
                    const path = `cars/${car.Color.toLowerCase()}.png`;
                    const imageRef = ref(storage, path);
                    try {
                        const url = await getDownloadURL(imageRef);
                        return url;
                    } catch (error) {
                        console.error("Error getting download URL:", error);
                        return null;
                    }
                }));
                setCarUrls(urls);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, [token, currentPage]);

    const handleDeleteConfirmationOpen = (car) => {
        setCarToDelete(car);
        setIsDeleteConfirmationOpen(true);
    };

    const handleDeleteConfirmationClose = () => {
        setCarToDelete(null);
        setIsDeleteConfirmationOpen(false);
    };

    const handleDelete = async (RegNo) => {
        try {
            const encodedRegNo = encodeURIComponent(RegNo);
            await axios.delete(`http://localhost:8000/car/${encodedRegNo}`, {
                headers: {
                    Authorization: token,
                },
            }).then((response) => {
                if (response.status === 200) {
                    setSnackbarSeverity('success');
                    setSnackbarMessage('Car deleted successfully');
                    setCurrentPage(1);
                    setIsDeleteConfirmationOpen(false);
                } else if (response.status === 204) {
                    setSnackbarSeverity('error');
                    setSnackbarMessage('Car not found.');
                    setIsDeleteConfirmationOpen(false);
                }
            }).catch((error) => {
                if (error.response) {
                    if (error.response.status === 404) {
                        setSnackbarSeverity('error');
                        setSnackbarMessage('Car not found.');
                    } else {
                        setSnackbarSeverity('error');
                        setSnackbarMessage('An unexpected error occurred.');
                    }
                } else {
                    setSnackbarSeverity('error');
                    setSnackbarMessage('Network error: ' + error.message);
                }
            });
        } catch (error) {
            console.error('Error deleting car:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Error deleting car');
        }
    };


    const handleView = (car) => {
        setSelectedCar(car);
        setIsModalOpen(true);
    };

    const handleAddCarPopUp = () => {
        setIsAddCarOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleCloseAddCar = () => {
        setIsAddCarOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewCar((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddCar = async () => {
        try {
            await axios.post('http://localhost:8000/car/', newCar, {
                headers: {
                    Authorization: token,
                },
            }).then((response) => {
                if (response.status === 200) {
                    setSnackbarSeverity('success');
                    setSnackbarMessage('Car added successfully');
                    setIsAddCarOpen(false);
                    setCurrentPage(1);
                }
            }).catch((error) => {
                if (error.response) {
                    if (error.response.status === 400) {
                        setfieldsSnackbarSeverity('error');
                        setfieldsSnackbarMessage('Enter all required fields.');
                    } else if (error.response.status === 401) {
                        setSnackbarSeverity('error');
                        setSnackbarMessage('Unauthorized');
                        setIsAddCarOpen(false);
                        setCurrentPage(1);
                    } else if (error.response.status === 409) {
                        setSnackbarSeverity('error');
                        setSnackbarMessage('This car is already registered to an account. If you believe this is an error, please contact support for assistance.');
                        setIsAddCarOpen(false);
                        setCurrentPage(1);
                    } else {
                        setSnackbarSeverity('error');
                        setSnackbarMessage('An unexpected error occurred.');
                        setIsAddCarOpen(false);
                        setCurrentPage(1);
                    }
                } else {
                    setSnackbarSeverity('error');
                    setSnackbarMessage('Network error: ' + error.message);
                    setIsAddCarOpen(false);
                    setCurrentPage(1);
                }
            });
        } catch (error) {
            console.error('Error adding car:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('Error adding car');
        }
    };
    return (
        <Box p={2}>
            <Typography align='left' sx={{ mt: 0, mb: 1 }} variant="h2">
                My Vehicles
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={handleAddCarPopUp}
                startIcon={<AddIcon />}
                sx={{ mt: 2, mb: 2 }}
            >
                Add Vehicle
            </Button>
            {snackbarMessage && (
                <Alert severity={snackbarSeverity} sx={{ width: '100%', mb: 2 }}>
                    {snackbarMessage}
                </Alert>
            )}

            <Modal
                open={isAddCarOpen}
                onClose={handleCloseAddCar}
                aria-labelledby="add-car-modal"
                aria-describedby="add-car"
            >
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, maxWidth: '80vw', maxHeight: '80vh', overflow: 'auto' }}>
                    <Button onClick={handleCloseAddCar} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                        <CloseIcon />
                    </Button>
                    <Box sx={{ textAlign: 'left', mt: 4 }}>
                        <Typography variant="h4" gutterBottom>
                            Add New Car
                        </Typography>
                        <TextField
                            name="RegNo"
                            label="Registration Number"
                            value={newCar.RegNo}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal" required>
                                    <InputLabel id="regYear-label">Registration Year</InputLabel>
                                    <Select
                                        labelId="regYear-label"
                                        id="regYear"
                                        value={newCar.RegYear}
                                        onChange={handleChange}
                                        name="RegYear"
                                        required
                                    >
                                        {years.map((year, index) => (
                                            <MenuItem key={index} value={year}>
                                                {year}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal" required>
                                    <InputLabel id="make-label">Make</InputLabel>
                                    <Select
                                        labelId="make-label"
                                        id="make"
                                        value={newCar.Make}
                                        onChange={handleChange}
                                        name="Make"
                                        required
                                    >
                                        {makes.map((make, index) => (
                                            <MenuItem key={index} value={make}>
                                                {make}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="Model"
                                    label="Model"
                                    value={newCar.Model}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal" required>
                                    <InputLabel id="color-label">Color</InputLabel>
                                    <Select
                                        labelId="color-label"
                                        id="color"
                                        value={newCar.Color}
                                        onChange={handleChange}
                                        name="Color"
                                        required
                                    >
                                        {colors.map((color, index) => (
                                            <MenuItem key={index} value={color}>
                                                {color}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal" required>
                                    <InputLabel id="type-label">Type</InputLabel>
                                    <Select
                                        labelId="type-label"
                                        id="type"
                                        value={newCar.Type}
                                        onChange={handleChange}
                                        name="Type"
                                        required
                                    >
                                        {types.map((type, index) => (
                                            <MenuItem key={index} value={type}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="RegisteredCity"
                                    label="Registered City"
                                    value={newCar.RegisteredCity}
                                    onChange={handleChange}
                                    fullWidth
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Registered Country</InputLabel>
                                    <Select
                                        required
                                        value={newCar.RegisteredCountry}
                                        onChange={(e) => {
                                            setNewCar({ ...newCar, RegisteredCountry: e.target.value });
                                        }} variant="outlined"
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
                        </Grid>

                        <Box mb={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleAddCar}
                                fullWidth
                                size="large"
                                sx={{ mt: 4 }}
                            >
                                Add Car
                            </Button>
                        </Box>
                    </Box>
                    {fieldsSnackbarMessage && (
                        <Alert severity={fieldsSnackbarSeverity} sx={{ width: '100%', mb: 2 }}>
                            {fieldsSnackbarMessage}
                        </Alert>
                    )}
                </Box>
            </Modal>


            {cars.length > 0 ? (
                isSmallScreen ? (
                    <Box>
                        {cars.map((car, index) => (
                            <Paper key={index} elevation={3} sx={{ p: 4, mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    {isExtraSmallScreen ? null : (
                                        carUrls[index] ? (
                                            <img src={carUrls[index]} alt="car" style={{ width: '100px', marginRight: '20px' }} />
                                        ) : (
                                            <CarIcon style={{ width: '100px', marginRight: '20px' }} />
                                        )
                                    )}
                                    <Box>
                                        <Typography variant="h3" gutterBottom>
                                            {car.RegistrationNumber}
                                        </Typography>
                                        <Typography variant="h5" gutterBottom>
                                            {car.Make + " " + car.Model}
                                        </Typography>
                                        {/* <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                                            <Badge
                                                variant="dot"
                                                color={car.Status === 'ACTIVE' ? 'green' : 'yellow'}
                                                sx={{
                                                    height: 5,
                                                }}
                                            />
                                            <Typography variant="subtitle" gutterBottom sx={{ ml: 1 }}>
                                                {car.Status}
                                            </Typography>
                                        </Box> */}
                                    </Box>
                                    {isExtraExtraSmallScreen ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 'fit-content' }}>
                                            <Button variant="contained" color="primary" onClick={() => handleView(car)}>
                                                <VisibilityIcon sx={{ marginRight: '4px' }} />
                                            </Button>
                                            <Button variant="contained" color="error" onClick={() => handleDeleteConfirmationOpen(car)}>
                                                <DeleteIcon sx={{ marginRight: '4px' }} />
                                            </Button>
                                        </Box>

                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 'fit-content' }}>
                                            <Button variant="contained" color="primary" startIcon={<VisibilityIcon />} onClick={() => handleView(car)}>View</Button>
                                            <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteConfirmationOpen(car)}>Delete</Button>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {cars.map((car, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                                <Paper elevation={3} sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {carUrls[index] ? (
                                            <img src={carUrls[index]} alt="car" style={{ width: '100px', marginRight: '20px' }} />
                                        ) : (
                                            <CarIcon style={{ width: '100px', marginRight: '20px' }} />
                                        )}
                                        <Box>
                                            <Typography variant="h3" gutterBottom>
                                                {car.RegistrationNumber}
                                            </Typography>
                                            <Typography variant="h5" gutterBottom>
                                                {car.Make + " " + car.Model}
                                            </Typography>
                                            {/* <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                                                <Badge
                                                    variant="dot"
                                                    color={car.Status === 'ACTIVE' ? 'success' : car.Status === 'INACTIVE' ? 'error' : 'warning'}
                                                    sx={{
                                                        height: 5,
                                                        width: 5,
                                                        borderRadius: '50%',
                                                        backgroundColor: car.Status === 'ACTIVE' ? 'success.main' : car.Status === 'INACTIVE' ? 'error.main' : 'warning.main',
                                                    }}
                                                />

                                                <Typography variant="subtitle" gutterBottom sx={{ ml: 1 }}>
                                                    {car.Status}
                                                </Typography>
                                            </Box> */}
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 'fit-content' }}>
                                        <Button variant="contained" color="primary" startIcon={<VisibilityIcon />} onClick={() => handleView(car)}>View</Button>
                                        <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteConfirmationOpen(car)}>Delete</Button>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )
            ) : (
                <Typography variant="body1">
                    You don't have any cars added.
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
            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                aria-labelledby="car-details-modal"
                aria-describedby="car-details"
            >
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, maxWidth: '80vw', maxHeight: '80vh', overflow: 'auto' }}>
                    <Button onClick={handleCloseModal} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                        <CloseIcon />
                    </Button>
                    <Typography variant="h4" gutterBottom>
                        {selectedCar && selectedCar.RegistrationNumber}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Make:</strong> {selectedCar && selectedCar.Make}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Model:</strong> {selectedCar && selectedCar.Model}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Registration Year:</strong> {selectedCar && selectedCar.RegYear}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Color:</strong> {selectedCar && selectedCar.Color}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Type:</strong> {selectedCar && selectedCar.Type}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Registered:</strong> {selectedCar && selectedCar.RegisteredCity + ", " + selectedCar.RegisteredCountry}
                    </Typography>
                    {/* <Typography variant="body1" gutterBottom>
                        <strong>Status:</strong> {selectedCar && selectedCar.Status}
                    </Typography> */}
                </Box>
            </Modal>
            <Modal
                open={isDeleteConfirmationOpen}
                aria-labelledby="delete-confirmation-modal"
                aria-describedby="delete-confirmation"
            >
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                    <Button onClick={handleDeleteConfirmationClose} style={{ position: 'absolute', top: '5px', right: '5px' }} >
                        <CloseIcon />
                    </Button>
                    <Box sx={{ margin: 1 }}></Box>
                    <Typography variant="body1" gutterBottom>
                        <strong>{`Are you sure you want to delete car: ${carToDelete ? carToDelete.RegistrationNumber : ''}?`}</strong>
                    </Typography>
                    <Box sx={{ margin: 4 }}></Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(carToDelete.RegistrationNumber)}>
                            Confirm
                        </Button>
                        <Button variant="outlined" color="primary" startIcon={<CloseIcon />} onClick={handleDeleteConfirmationClose}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}
