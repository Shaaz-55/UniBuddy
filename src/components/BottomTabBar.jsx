import { NavLink } from 'react-router-dom';
import { Users, MapPin, Sparkles, LayoutDashboard, MessageCircle, UserRound, HeartHandshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import './BottomTabBar.css';

export default function BottomTabBar() {
  const { user, isAuthenticated } = useAuth();
  const { unreadCount, incomingRequests } = useNetwork();

  if (!isAuthenticated) return null;

  const tabs = user.role === 'senior'
    ? [{ to: '/senior', label: 'Home', icon: LayoutDashboard, end: true }, { to: '/stories', label: 'Stories', icon: Sparkles }, { to: '/messages', label: 'Messages', icon: MessageCircle, count: unreadCount }, { to: '/senior/profile', label: 'Profile', icon: UserRound }]
    : [{ to: '/mentors', label: 'Mentors', icon: Users }, { to: '/connections', label: 'Circle', icon: HeartHandshake, count: incomingRequests.length }, { to: '/messages', label: 'Messages', icon: MessageCircle, count: unreadCount }, { to: '/map', label: 'Map', icon: MapPin }, { to: '/stories', label: 'Stories', icon: Sparkles }];

  return (
    <nav className="bottom-tab-bar" aria-label="Mobile navigation">
      <div className="bottom-tab-inner">
        {tabs.map(({ to, label, icon: Icon, count, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `bottom-tab-item ${isActive ? 'active' : ''}`}><span className="bottom-tab-icon"><Icon size={20} strokeWidth={1.75} />{count > 0 && <span className="bottom-tab-count">{count}</span>}</span><span>{label}</span></NavLink>)}
      </div>
    </nav>
  );
}
