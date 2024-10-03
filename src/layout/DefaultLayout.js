import React from 'react';
import { Navigate } from 'react-router-dom';
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index';
import { auth } from 'src/backend/firebase'; // Import Firebase authentication

const DefaultLayout = () => {
  const user = auth.currentUser; // Check if the user is authenticated

  // If the user is not authenticated, redirect to the login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  );
};

export default DefaultLayout;
