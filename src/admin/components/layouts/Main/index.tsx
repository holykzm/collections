import { Box, Container, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../../elements/Header/index.js';
import { Nav } from '../../elements/Nav/index.js';
import { Props } from './types.js';

export const MainLayout: React.FC<Props> = ({ group }) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const lgDown = useMediaQuery(theme.breakpoints.down('lg'));

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Header open={open} toggleDrawer={toggleDrawer} />
      <Nav open={open} toggleDrawer={toggleDrawer} />
      <Box component="main" sx={{ width: 'calc(100% - 260px)', flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        {lgDown && <Toolbar sx={{ mt: 'inherit' }} />}
        <Container
          maxWidth={false}
          sx={{
            position: 'relative',
            minHeight: 'calc(100vh - 110px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};
