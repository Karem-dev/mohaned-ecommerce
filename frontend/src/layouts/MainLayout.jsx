import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import useAuthStore from '../store/authStore';
import { getMe } from '../services/authService';
import VerificationModal from '../components/ui/VerificationModal';

const MainLayout = () => {
    const { user, token, setUser, showVerificationModal, setShowVerificationModal } = useAuthStore();
    const location = useLocation();

    useEffect(() => {
        const syncIdentity = async () => {
            if (token && (!user || !user.email_verified_at)) {
                try {
                    const data = await getMe();
                    // setUser in authStore now handles unwrapping automatically
                    setUser(data);
                } catch (e) {
                    // Silent fail for background sync
                }
            }
        };
        syncIdentity();
    }, [token, user?.email_verified_at, setUser]);
  const isTransparentNavbar = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col font-body bg-white selection:bg-slate-900 selection:text-white">
      {/* Dynamic Navbar */}
      <Navbar />
      
      {/* Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />

      <VerificationModal 
        isOpen={showVerificationModal} 
        onClose={() => setShowVerificationModal(false)}
        email={user?.email}
      />
    </div>
  );
};

export default MainLayout;
