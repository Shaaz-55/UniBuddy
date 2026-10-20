import { NavLink } from 'react-router-dom';
import { Users, MapPin, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './BottomTabBar.css';

export default function BottomTabBar() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <nav className="bottom-tab-bar" aria-label="Mobile navigation">
      <div className="bottom-tab-inner">
        <NavLink
          to="/mentors"
          className={({ isActive }) =>
            `bottom-tab-item ${isActive ? 'active' : ''}`
          }
        >
          <Users size={20} strokeWidth={1.75} />
          <span>Mentors</span>
        </NavLink>

        <NavLink
          to="/map"
          className={({ isActive }) =>
            `bottom-tab-item ${isActive ? 'active' : ''}`
          }
        >
          <MapPin size={20} strokeWidth={1.75} />
          <span>Map</span>
        </NavLink>

        <NavLink
          to="/stories"
          className={({ isActive }) =>
            `bottom-tab-item ${isActive ? 'active' : ''}`
          }
        >
          <Sparkles size={20} strokeWidth={1.75} />
          <span>Stories</span>
        </NavLink>
      </div>
    </nav>
  );
}
