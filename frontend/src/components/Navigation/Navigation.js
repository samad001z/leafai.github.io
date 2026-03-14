import React from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import './Navigation.css';

function Navigation() {
  return (
    <>
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Navigation (Hamburger + Bottom Nav) */}
      <MobileNav />
    </>
  );
}

export default Navigation;
