import React from 'react';

import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => (
  <div className='min-h-screen bg-gray-50'>
    <Header />
    <div className='flex'>
      {showSidebar && <Sidebar />}
      <main className='flex-1 lg:ml-0 lg:pl-0'>{children}</main>
    </div>
  </div>
);

export default Layout;
