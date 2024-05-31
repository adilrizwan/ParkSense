// import React, { useState } from 'react';
// import { Grid, Box, Button, Typography, TextField, Paper, Alert, InputAdornment, IconButton } from '@mui/material';
// import CircularProgress from '@mui/material/CircularProgress';
// import AddIcon from '@mui/icons-material/Add';
// import RemoveIcon from '@mui/icons-material/Remove';
// import SearchIcon from '@mui/icons-material/Search';
// import axios from 'axios';

// export default function AdminTopUp() {
//     const token = localStorage.getItem('token');
//     const [email, setEmail] = useState('');
//     const [userData, setUserData] = useState(null);
//     const [coins, setCoins] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [submitLoading, setSubmitLoading] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState('');
//     const [snackbarSeverity, setSnackbarSeverity] = useState('');

//     const handleSearch = async () => {
//         try {
//             setLoading(true);
//             const response = await axios.post('http://localhost:8000/admin/searchUserforCredit', { email }, {
//                 headers: {
//                     Authorization: `${token}`
//                 }
//             });
//             const data = response.data;
//             setUserData(data);
//             if (data) {
//                 setSnackbarMessage('User found!');
//                 setSnackbarSeverity('success');
//             } else {
//                 setSnackbarMessage('User not found');
//                 setSnackbarSeverity('error');
//             }
//         } catch (error) {
//             setSnackbarMessage('An error occurred. Try again.');
//             setSnackbarSeverity('error');
//             setUserData(null);
//             console.log(error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSubmit = async () => {
//         try {
//             setSubmitLoading(true);
//             await axios.post('http://localhost:8000/admin/credit', { ID: userData.ID, Amount: coins }, {
//                 headers: {
//                     Authorization: `${token}`
//                 }
//             });
//             setSnackbarMessage('Coins credited successfully!');
//             setSnackbarSeverity('success');
//         } catch (error) {
//             setSnackbarMessage('Error crediting coins');
//             setSnackbarSeverity('error');
//             console.log(error);
//         } finally {
//             setSubmitLoading(false);
//         }
//     };

//     const incrementCoins = () => {
//         setCoins(prevCoins => (prevCoins ? parseInt(prevCoins) + 1 : 1).toString());
//     };

//     const decrementCoins = () => {
//         setCoins(prevCoins => (prevCoins > 0 ? parseInt(prevCoins) - 1 : 0).toString());
//     };

//     return (
//         <Grid container justifyContent="center">
//             <Grid item xs={12} md={8}>
//                 <Box p={2}>
//                     <Typography align='left' variant="h2" gutterBottom>
//                         Credit Coins
//                     </Typography>
//                     {snackbarMessage && (
//                         <Alert severity={snackbarSeverity} sx={{ width: '100%', mb: 2 }}>
//                             {snackbarMessage}
//                         </Alert>
//                     )}
//                     <Paper elevation={3} sx={{ p: 4, mb: 2 }}>
//                         <Grid container direction="column" spacing={2}>
//                             <Grid item xs={12}>
//                                 <Typography align='left' variant="h6" gutterBottom>
//                                     Enter email address
//                                 </Typography>
//                                 <TextField
//                                     name="Email"
//                                     required
//                                     fullWidth
//                                     label="Email"
//                                     variant="outlined"
//                                     value={email}
//                                     onChange={(e) => setEmail(e.target.value)}
//                                 />
//                             </Grid>
//                             <Grid item xs={12}>
//                                 <Button
//                                     variant="contained"
//                                     size="large"
//                                     fullWidth
//                                     color="primary"
//                                     onClick={handleSearch}
//                                     startIcon={<SearchIcon />}
//                                 >
//                                     {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                     </Paper>
//                     {userData && (
//                         <Paper elevation={3} sx={{ p: 4, mb: 2 }} >
//                             <Typography variant="h4" mb={2} gutterBottom align='center' >
//                                 User Information
//                             </Typography>
//                             <Typography variant="h5" gutterBottom align='center'>
//                                 Name: {userData.FirstName + " " + userData.LastName}
//                             </Typography>
//                             <Typography variant="h5" gutterBottom align='center'>
//                                 Gender: {userData.Gender}
//                             </Typography>
//                             <Typography variant="h5" gutterBottom align='center'>
//                                 Balance: {userData.Coins}
//                             </Typography>
//                             <Grid container direction="column" spacing={2} mt={2} alignItems="center">
//                                 <Grid item xs={12} md={6}>
//                                     <TextField
//                                         name="Coins"
//                                         required
//                                         fullWidth
//                                         label="Amount of Coins"
//                                         variant="outlined"
//                                         type="number"
//                                         value={coins}
//                                         onChange={(e) => setCoins(e.target.value)}
//                                         sx={{ textAlign: 'center' }}
//                                         InputProps={{
//                                             startAdornment: (
//                                                 <InputAdornment position="start">
//                                                     <IconButton color="error" onClick={decrementCoins}>
//                                                         <RemoveIcon />
//                                                     </IconButton>
//                                                 </InputAdornment>
//                                             ),
//                                             endAdornment: (
//                                                 <InputAdornment position="end">
//                                                     <IconButton color="primary" onClick={incrementCoins}>
//                                                         <AddIcon />
//                                                     </IconButton>
//                                                 </InputAdornment>
//                                             ),
//                                         }}
//                                     />
//                                 </Grid>
//                                 <Grid item xs={12}>
//                                     <Button
//                                         variant="contained"
//                                         size="large"
//                                         color="primary"
//                                         onClick={handleSubmit}
//                                         sx={{ mt: 2 }}
//                                     >
//                                         {submitLoading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}

//                                     </Button>
//                                 </Grid>
//                             </Grid>
//                         </Paper>
//                     )}
//                 </Box>
//             </Grid>
//         </Grid>
//     );
// }
