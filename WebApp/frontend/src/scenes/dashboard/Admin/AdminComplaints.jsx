// import React, { useState, useEffect } from 'react';
// import { Grid, Typography, Button, Card, CardContent, Modal, Box } from '@mui/material';
// import firebaseConfig from '../../../constants/firebaseConfig'
// import axios from 'axios';
// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection, getDocs } from 'firebase/firestore';

// export default function UserComplaints() {
//     const [complaints, setComplaints] = useState([]);
//     const [selectedComplaint, setSelectedComplaint] = useState(null);
//     const [openModal, setOpenModal] = useState(false);
//     const app = initializeApp(firebaseConfig);

//     // Reference the Firestore database
//     const db = getFirestore(app);

//     useEffect(() => {
//         // Fetch complaints from Firebase or your database
//         fetchComplaints();
//     }, []);

//     const fetchComplaints = async () => {
//         try {
//             // Assuming you have an API endpoint to fetch complaints
//             const response = await axios.get('');
//             setComplaints(response.data);
//         } catch (error) {
//             console.error('Error fetching complaints:', error);
//         }
//     };

//     const handleViewComplaint = (complaint) => {
//         setSelectedComplaint(complaint);
//         setOpenModal(true);
//     };

//     const handleCloseModal = () => {
//         setOpenModal(false);
//         setSelectedComplaint(null);
//     };

//     return (
//         <Grid container spacing={2}>
//             <Typography variant='h2'>Complaints</Typography>
//             {complaints.map((complaint, index) => (
//                 <Grid item xs={12} sm={6} md={4} key={index}>
//                     <Card>
//                         <CardContent>
//                             <Typography variant="h5" component="div">
//                                 {complaint.title}
//                             </Typography>
//                             <Button onClick={() => handleViewComplaint(complaint)}>View</Button>
//                         </CardContent>
//                     </Card>
//                 </Grid>
//             ))}
//             <Modal
//                 open={openModal}
//                 onClose={handleCloseModal}
//                 aria-labelledby="modal-modal-title"
//                 aria-describedby="modal-modal-description"
//             >
//                 <Box sx={{
//                     position: 'absolute',
//                     width: 400,
//                     bgcolor: 'background.paper',
//                     border: '2px solid #000',
//                     boxShadow: 24,
//                     p: 4,
//                     top: '50%',
//                     left: '50%',
//                     transform: 'translate(-50%, -50%)',
//                 }}>
//                     <Typography variant="h6" component="h2" gutterBottom>
//                         {selectedComplaint && selectedComplaint.title}
//                     </Typography>
//                     <Typography variant="body1" id="modal-modal-description" sx={{ mt: 2 }}>
//                         {selectedComplaint && selectedComplaint.body}
//                     </Typography>
//                 </Box>
//             </Modal>
//         </Grid>
//     );
// }
