import Header from '@admin/components/elements/Header/Main';
import Nav from '@admin/components/elements/Nav';
import { Box, Toolbar } from '@mui/material';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Props } from './types';

const MainLayout: React.FC<Props> = ({ groups }) => {
  const [open, setOpen] = useState(true);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Header toggleDrawer={toggleDrawer} />
      <Nav open={open} groups={groups} toggleDrawer={toggleDrawer} />
      <Box component="main" sx={{ width: '100%', flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
