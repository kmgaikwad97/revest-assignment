'use client';

import {
  AppBar, Box, Drawer, IconButton,
  List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import InventoryIcon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/',         label: 'Signup',   icon: <PersonAddIcon /> },
  { href: '/products', label: 'Products', icon: <InventoryIcon /> },
  { href: '/orders',   label: 'Orders',   icon: <ShoppingCartIcon /> },
];

export default function NavBar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Revest App
          </Typography>

          {/* Desktop links */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
            {links.map(({ href, label }) => (
              <Box
                key={href}
                component={Link}
                href={href}
                sx={{
                  color: '#fff',
                  textDecoration: 'none',
                  px: 2, py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.9rem',
                  backgroundColor: pathname === href ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              >
                {label}
              </Box>
            ))}
          </Box>

          {/* Mobile hamburger */}
          <IconButton
            color="inherit"
            sx={{ display: { xs: 'flex', sm: 'none' } }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 220, pt: 2 }}>
          <List>
            {links.map(({ href, label, icon }) => (
              <ListItemButton
                key={href}
                component={Link}
                href={href}
                selected={pathname === href}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
