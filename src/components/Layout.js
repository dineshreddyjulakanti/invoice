import React from 'react';
import {
  AppBar, Toolbar, Typography, Drawer,
  List, ListItemButton, ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

export default function Layout({ children }) {
  const nav = useNavigate();

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6">AltiusHub Invoice App</Typography>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent"
              sx={{ width: drawerWidth,
                    '& .MuiDrawer-paper': { width: drawerWidth } }}>
        <Toolbar />
        <List>
          <ListItemButton onClick={() => nav('/invoices')}>
            <ListItemText primary="Invoices" />
          </ListItemButton>
        </List>
      </Drawer>

      <main style={{ marginLeft: drawerWidth, marginTop: 64, padding: 24 }}>
        {children}
      </main>
    </>
  );
}
