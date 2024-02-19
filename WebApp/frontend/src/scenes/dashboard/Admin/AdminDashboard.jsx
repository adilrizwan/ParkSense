import * as React from 'react';
import { useTheme, Box, ThemeProvider, Container, Grid } from '@mui/material';
import SideBar from './AdminDrawer';

export default function AdminDashboard() {
  const theme = useTheme();
  // const [currentComponent, setCurrentComponent] = React.useState(<JobsApplied />);

  // const handleProfileClick = () => {
  //   setCurrentComponent(<ProfileApplicant />);
  // };
  // const handleDashboardClick = () => {
  //   setCurrentComponent(<JobsApplied />);
  // };
  // const handleSearchClick = () => {
  //   setCurrentComponent(<FindJobs />);
  // };
  // const handleCVClick = () => {
  //   setCurrentComponent(<DownloadCV />);
  // };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <Grid>
          <SideBar
          // onDashboardClick={handleDashboardClick}
          // onUpdateProfileClick={handleProfileClick}
          // onSearchClick={handleSearchClick}
          // onCVClick={handleCVClick}
          />
        </Grid>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            overflow: 'auto',
          }}
        >
          <Container sx={{ mt: 3 }}>

            <Grid>
              {/* {currentComponent} */}
            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}