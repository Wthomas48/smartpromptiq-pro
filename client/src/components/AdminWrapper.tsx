import React from 'react';
import AdminNavigation from '@/components/AdminNavigation';
import { useLocation } from 'wouter';

interface AdminWrapperProps {
  children: React.ReactNode;
}

const AdminWrapper: React.FC<AdminWrapperProps> = ({ children }) => {
  const [, setLocation] = useLocation();

  // Check if current user is admin (from localStorage)
  const adminToken = localStorage.getItem('token');
  const adminUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  const isAdmin = adminToken && adminUser && adminUser.role === 'ADMIN';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLocation('/admin/login');
  };

  if (!isAdmin) {
    // If not admin, just return children without admin navigation
    return <>{children}</>;
  }

  // If admin, wrap with admin navigation
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation adminUser={adminUser} onLogout={handleLogout} />
      <div className="pt-4">
        {children}
      </div>
    </div>
  );
};

export default AdminWrapper;