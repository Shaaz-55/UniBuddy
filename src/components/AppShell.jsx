import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import BottomTabBar from './BottomTabBar';
import Footer from './Footer';
import AuthModals from './AuthModals';
import './AppShell.css';

export default function AppShell({ children }) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isStories = location.pathname === '/stories';
  const isHome = location.pathname === '/';

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Set theme-dark class on wrapper or html root when on /stories
  // useEffect(() => {
  //   if (isStories) {
  //     document.documentElement.classList.add('theme-dark');
  //   } else {
  //     document.documentElement.classList.remove('theme-dark');
  //   }
  // }, [isStories]);

  return (
    <div className={`app-shell ${isStories ? "is-stories-page" : ""}`}>
      <Navbar />
      <main
        className={`app-main-content ${
          isAuthenticated ? 'has-bottom-bar' : ''
        }`}
      >
        {children}
      </main>
      {isHome && <Footer />}
      <BottomTabBar />
      <AuthModals />
    </div>
  );
}
