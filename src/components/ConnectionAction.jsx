import { Link } from 'react-router-dom';
import { Check, Clock3, MessageCircle, UserPlus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { useToast } from '../context/ToastContext';
export default function ConnectionAction({
  profile
}) {
  const {
    user
  } = useAuth();
  const {
    connectionWith,
    requestConnection,
    acceptConnection,
    removeConnection
  } = useNetwork();
  const {
    showToast
  } = useToast();
  const connection = connectionWith(profile.id);
  const handleAction = (callback, message) => {
    const result = callback();
    showToast(result.success ? message : result.error);
  };
  if (connection?.status === 'accepted') {
    return <Link className="btn-primary network-btn" to={`/messages/${encodeURIComponent(profile.id)}`}><MessageCircle size={16} />Message</Link>;
  }
  if (connection?.to === user.id) {
    return <div className="connection-actions">
    <button type="button" className="btn-primary network-btn" onClick={() => handleAction(() => acceptConnection(connection.id), `Connected with ${profile.name.split(' ')[0]}! Say hello 👋`)}><Check size={16} />Accept</button>
    <button type="button" className="network-icon-btn" aria-label={`Decline ${profile.name}'s request`} title="Decline request" onClick={() => handleAction(() => removeConnection(connection.id), 'Request declined.')}>
      <X size={17} />
    </button>
  </div>;
  }
  if (connection) {
    return <button type="button" className="network-secondary-btn" title="Cancel connection request" onClick={() => handleAction(() => removeConnection(connection.id), 'Connection request cancelled.')}><Clock3 size={16} />Requested <X size={13} /></button>;
  }
  return <button type="button" className="btn-primary network-btn" disabled={profile.role === 'senior' && profile.available === false} onClick={() => handleAction(() => requestConnection(profile.id), `Request sent to ${profile.name.split(' ')[0]}. Messaging opens when they accept.`)}>
    <UserPlus size={16} />
    {profile.role === 'senior' && profile.available === false ? 'Unavailable' : 'Connect'}
  </button>;
}
