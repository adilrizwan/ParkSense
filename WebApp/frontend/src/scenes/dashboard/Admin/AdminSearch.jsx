// import React, { useState } from 'react';
// import { Grid, Paper, Button, Typography, TextField, List, ListItem, ListItemText, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
// import carFieldNames from '../../constants/selectMenus';
// import lotFieldNames from '../../constants/selectMenus';

// export default function AdminSearch() {
//     const [data, setData] = useState([]);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [inputs, setInputs] = useState([]);
//     const [selectedRole, setSelectedRole] = useState("CAROWNER");
//     const [availableId, setavailableId] = React.useState([1, 3, 5, 7]);
//     const [fieldNames, setFieldNames] = useState(carFieldNames);
//     const [openView, setOpenView] = useState(false);
//     const [dialogContent, setDialogContent] = useState(null);
//     const token = localStorage.getItem('token');

//     const handleInputChange = (index, event) => {
//         const newInputs = [...inputs];
//         newInputs[index].value = event.target.value;
//         setInputs(newInputs);
//     };

//     const handleViewClick = (application) => {
//         setOpenView(true);
//         setDialogContent(
//             <Typography>
//                 Details of the selected application:
//                 <br />
//                 {JSON.stringify(application)}
//             </Typography>
//         );
//     };

//     const handleCloseView = () => {
//         setOpenView(false);
//     };

//     const onSubmit = async (event, page) => {
//         event.preventDefault();
//         try {
//             // Simulating data fetching
//             const response = await fetch(`/search?page=${page}&role=${selectedRole}`);
//             const data = await response.json();
//             setData(data);
//             setCurrentPage(page);
//         } catch (error) {
//             console.error('Error fetching data:', error);
//         }
//     };

//     const handleSearch = async (event, value) => {
//         await onSubmit(event, value);
//     };

//     const handleRoleSelection = (event, role) => {
//         if (selectedRole !== role) {
//             setSelectedRole(role);
//             setFieldNames(role === "CAROWNER" ? carFieldNames : lotFieldNames);
//             setInputs([]);
//             setCurrentPage(1)
//             setavailableId([1, 3, 5, 7]);
//         }
//     };

//     const handleFieldClick = (field) => {
//         const newInputs = [...inputs, { value: field }];
//         setInputs(newInputs);
//     };

//     return (
//         <Grid item xs={12}>
//             <Paper
//                 sx={{
//                     mt: 3,
//                     mb: 3,
//                     p: 2,
//                     display: 'flex',
//                     flexDirection: 'column',
//                 }}
//             >
//                 <Typography variant="h6" fontSize={18} align='center'>
//                     Search Users
//                 </Typography>
//                 <Grid align='center'>
//                     <Button
//                         sx={{ margin: "15px 15px" }}
//                         size="large"
//                         onClick={(event) => handleRoleSelection(event, 'carowner')}
//                         color='primary'
//                         variant={selectedRole === 'carowner' ? 'contained' : 'outlined'}
//                     >
//                         Car Owner
//                     </Button>

//                     <Button
//                         sx={{ margin: "15px 15px" }}
//                         size="large"
//                         onClick={(event) => handleRoleSelection(event, 'lotowner')}
//                         color='primary'
//                         variant={selectedRole === 'lotowner' ? 'contained' : 'outlined'}
//                     >
//                         Lot Owner
//                     </Button>
//                 </Grid>
//                 <Grid align='center'>
//                     <Typography sx={{ mb: 1, mt: 1 }} variant="caption" fontSize={14} align="left">
//                         {fieldNames.map((fieldName, index) => (
//                             <Button
//                                 key={index}
//                                 onClick={() => handleFieldClick(fieldName)}
//                                 sx={{ mr: 1, mb: 2 }}
//                             >
//                                 {fieldName}
//                             </Button>
//                         ))}
//                     </Typography>
//                 </Grid>
//                 <Grid container spacing={2} justifyContent="center">
//                     {inputs.length > 0 && inputs.map((input, index) => (
//                         <Grid item key={index}>
//                             <TextField
//                                 type="text"
//                                 value={input.value}
//                                 variant="standard"
//                                 onChange={(event) => handleInputChange(index, event)}
//                             />
//                         </Grid>
//                     ))}
//                 </Grid>
//                 <Grid align='center'>
//                     <Button
//                         variant="contained"
//                         size='large'
//                         onClick={onSubmit}
//                         endIcon={<SearchIcon />}
//                         color="primary">
//                         Search
//                     </Button>
//                 </Grid>
//                 <Typography variant="h6" fontSize={18} align='center'>
//                     Search Results
//                 </Typography>
//                 {data && data.length > 0 ? (
//                     <List>
//                         {data.map((result, index) => (
//                             <ListItem key={index}>
//                                 <ListItemText primary={result.name} secondary={result.email} />
//                                 <Box>
//                                     <Button
//                                         style={{ margin: '10px' }}
//                                         variant="contained"
//                                         size="small"
//                                         color="secondary"
//                                         onClick={() => handleViewClick(result)}
//                                     >
//                                         View
//                                     </Button>
//                                 </Box>
//                             </ListItem>
//                         ))}
//                     </List>
//                 ) : (
//                     <Typography align='center'>No results found.</Typography>
//                 )}
//                 {/* Pagination component */}
//             </Paper>
//             <Dialog open={openView} onClose={handleCloseView} maxWidth="md" fullWidth>
//                 <DialogTitle align='center'>Application Details</DialogTitle>
//                 <DialogContent>{dialogContent}</DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleCloseView}>Close</Button>
//                 </DialogActions>
//             </Dialog>
//         </Grid>
//     );
// }
