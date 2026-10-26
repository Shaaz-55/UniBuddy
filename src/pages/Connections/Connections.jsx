import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, HeartHandshake, Search, UserMinus, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNetwork } from '../../context/NetworkContext';
import { useToast } from '../../context/ToastContext';
import { getPeerId } from '../../lib/network';
import StudentAvatar from '../../components/StudentAvatar';
import ConnectionAction from '../../components/ConnectionAction';
import SkillTag from '../../components/SkillTag';
import Drawer from '../../components/Drawer';
import Modal from '../../components/Modal';
import './Connections.css';
export default function Connections() {
  const {
    user
  } = useAuth();
  const {
    profiles,
    connections,
    incomingRequests,
    acceptedConnections,
    connectionWith,
    removeConnection
  } = useNetwork();
  const {
    showToast
  } = useToast();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [removing, setRemoving] = useState(null);
  const tab = ['connected', 'requests', 'sent', 'discover'].includes(params.get('tab')) ? params.get('tab') : 'connected';
  const sent = connections.filter(connection => connection.status === 'pending' && connection.from === user.id);
  const peerRole = user.role === 'senior' ? 'junior' : 'senior';
  const peerIds = items => items.map(connection => getPeerId(connection, user.id));
  const ids = tab === 'connected' ? peerIds(acceptedConnections) : tab === 'requests' ? peerIds(incomingRequests) : peerIds(sent);
  const students = profiles.filter(profile => profile.role === peerRole && (tab === 'discover' ? !connectionWith(profile.id) : ids.includes(profile.id))).filter(profile => `${profile.name} ${profile.college} ${(profile.interests || []).join(' ')}`.toLowerCase().includes(search.trim().toLowerCase()));
  const tabs = [{
    id: 'connected',
    label: 'Connected',
    count: acceptedConnections.length
  }, {
    id: 'requests',
    label: 'Requests',
    count: incomingRequests.length
  }, {
    id: 'sent',
    label: 'Sent',
    count: sent.length
  }, {
    id: 'discover',
    label: `Discover ${peerRole}s`
  }];
  const emptyText = {
    connected: ['Your circle starts with one hello', 'Connect with a student and accept the request to start exchanging ideas.'],
    requests: ['You’re all caught up', 'New connection requests will appear here. You choose who joins your circle.'],
    sent: ['No pending requests', 'Reach out to someone who shares your interests.'],
    discover: ['You’ve met everyone here', 'Check back as more students join the network.']
  };
  const handleRemove = () => {
    const result = removeConnection(connectionWith(removing.id)?.id);
    showToast(result.success ? 'Connection removed.' : result.error);
    setRemoving(null);
  };
  return <div className="network-page connections-page wrap">
    <header className="network-page-header">
      <div>
        <span className="network-eyebrow"><HeartHandshake size={13} /> Your campus circle</span>
        <h1>Good people. Better possibilities.</h1>
        <p>
          {user.role === 'senior' ? 'Meet the juniors you can help take their next step.' : 'Find seniors who’ve been where you want to go.'}
        </p>
      </div>
      <Link className="network-secondary-btn" to="/messages">Open messages <ArrowRight size={15} /></Link>
    </header>
    <div className="connection-controls">
      <div className="connection-tabs" aria-label="Connection filters">
        {tabs.map(item => <button type="button" key={item.id} className={tab === item.id ? 'active' : ''} aria-pressed={tab === item.id} onClick={() => setParams({
          tab: item.id
        })}>
          {item.label}
          {item.count > 0 && <span className="network-count">
            {item.count}
          </span>}
        </button>)}
      </div>
      <label className="network-search">
        <Search size={16} />
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, college or skill" aria-label="Search connections" />
      </label>
    </div>
    <div className="connections-explainer">
      <HeartHandshake size={17} />
      <p>A connection goes both ways. Once a request is accepted, you can message each other for free.</p>
    </div>
    {students.length ? <section className="student-grid" aria-label={`${tab} students`}>
      {students.map(profile => <article className="network-panel student-card" key={profile.id}>
        <div className="student-card-top">
          <StudentAvatar profile={profile} size="large" />
          <span className={`student-role ${profile.role === 'junior' ? 'role-junior' : ''}`}>
            {profile.role === 'junior' ? 'Junior pass' : 'Senior pass'}
          </span>
        </div>
        <button type="button" className="student-name-button" onClick={() => setSelected(profile)}>
          <h2>
            {profile.name}
          </h2>
        </button>
        <p className="student-college">{profile.college} · {profile.year}</p>
        <div className="network-skill-list">
          {(profile.interests || []).slice(0, 3).map((skill, index) => <SkillTag key={skill} name={skill} index={index} />)}
        </div>
        <p className="student-bio">
          {profile.bio || 'Here to connect, learn and grow together.'}
        </p>
        <div className="student-card-bottom">
          <ConnectionAction profile={profile} />
          {tab === 'connected' ? <button type="button" className="network-icon-btn" aria-label={`Remove connection with ${profile.name}`} title="Remove connection" onClick={() => setRemoving(profile)}>
            <UserMinus size={16} />
          </button> : <button type="button" className="network-text-link student-profile-link" onClick={() => setSelected(profile)}>Profile <ArrowRight size={13} /></button>}
        </div>
      </article>)}
    </section> : <div className="network-panel network-empty">
      <Users size={36} />
      <h3>
        {search ? 'No matches just yet' : emptyText[tab][0]}
      </h3>
      <p>
        {search ? 'Try another name, college or skill.' : emptyText[tab][1]}
      </p>
      {search ? <button className="network-secondary-btn" type="button" onClick={() => setSearch('')}>Clear search</button> : tab !== 'discover' && <button className="btn-primary network-btn" type="button" onClick={() => setParams({
        tab: 'discover'
      })}>Discover {peerRole}s <ArrowRight size={14} /></button>}
    </div>}
    <Drawer isOpen={!!selected} onClose={() => setSelected(null)} title="Student profile" width="440px">
      {selected && <div className="connection-profile">
        <StudentAvatar profile={selected} size="large" />
        <span className="network-eyebrow">{selected.role} pass</span>
        <h2>
          {selected.name}
        </h2>
        <p>{selected.college} · {selected.year}</p>
        <div className="network-skill-list">
          {(selected.interests || []).map((skill, index) => <SkillTag key={skill} name={skill} index={index} />)}
        </div>
        <h3>A little about me</h3>
        <p>
          {selected.bio || 'Here to connect, learn and grow together.'}
        </p>
        <ConnectionAction profile={selected} />
      </div>}
    </Drawer>
    <Modal isOpen={!!removing} onClose={() => setRemoving(null)} title="Remove this connection?" maxWidth="420px">
      <p className="remove-connection-copy">You and {removing?.name.split(' ')[0]} will need to connect again to message. Your shared conversation will be deleted from this browser.</p>
      <div className="remove-connection-actions">
        <button type="button" className="network-secondary-btn" onClick={() => setRemoving(null)}>Keep connection</button>
        <button type="button" className="network-danger-btn" onClick={handleRemove}>Remove connection</button>
      </div>
    </Modal>
  </div>;
}
