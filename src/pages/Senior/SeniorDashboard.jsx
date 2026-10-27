import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, HeartHandshake, MessageCircle, Sparkles, UserPlus, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNetwork } from '../../context/NetworkContext';
import { getPeerId } from '../../lib/network';
import StudentAvatar from '../../components/StudentAvatar';
import ConnectionAction from '../../components/ConnectionAction';
import SkillTag from '../../components/SkillTag';
import './Senior.css';
export default function SeniorDashboard() {
  const {
    user,
    updateProfile
  } = useAuth();
  const {
    profiles,
    incomingRequests,
    acceptedConnections,
    messages,
    unreadCount,
    unreadFor
  } = useNetwork();
  const firstName = user.name.split(' ')[0];
  const available = user.available !== false;
  const getProfile = id => profiles.find(profile => profile.id === id);
  const conversations = acceptedConnections.map(connection => ({
    connection,
    peer: getProfile(getPeerId(connection, user.id)),
    last: messages.filter(message => message.connectionId === connection.id).at(-1)
  })).filter(item => item.peer).sort((a, b) => (b.last?.createdAt || 0) - (a.last?.createdAt || 0));
  const stats = [{
    label: 'Your connections',
    value: acceptedConnections.length,
    icon: Users,
    tint: 'indigo',
    to: '/messages'
  }, {
    label: 'Connection requests',
    value: incomingRequests.length,
    icon: UserPlus,
    tint: 'pink',
    to: '/messages?tab=requests'
  }, {
    label: 'Unread messages',
    value: unreadCount,
    icon: MessageCircle,
    tint: 'mint',
    to: '/messages'
  }];
  return <div className="network-page senior-page wrap">
    <header className="network-page-header">
      <div>
        <span className="network-eyebrow"><Sparkles size={13} /> Your senior workspace</span>
        <h1>Hey {firstName}, someone needs your spark.</h1>
        <p>A little direction from you can change someone&apos;s entire college journey.</p>
      </div>
      <button type="button" className={`availability-toggle ${available ? 'is-available' : ''}`} role="switch" aria-checked={available} onClick={() => updateProfile({
        available: !available
      })}>
        <span className="availability-dot" />
        {available ? 'Open to mentor' : 'Taking a break'}
        <span className="availability-track">
          <span />
        </span>
      </button>
    </header>
    <section className="senior-hero" aria-label="Your mentoring space">
      <div className="senior-hero-copy">
        <span className="senior-hero-tag"><HeartHandshake size={14} /> PASS IT FORWARD</span>
        <h2>You figured it out.<br />Now, <span className="gradient-text">be their shortcut.</span></h2>
        <p>From the first line of code to the first internship.<br className="hide-mobile" /> Be the senior you wish you had.</p>
        <Link className="btn-primary" to="/messages">Open messages <ArrowRight size={16} /></Link>
        <div className="senior-hero-foot">
          <span className="hero-avatar-stack">
            {profiles.filter(profile => profile.role === 'junior').slice(1, 4).map(profile => <StudentAvatar key={profile.id} profile={profile} size="small" />)}
          </span>
          <span>Different campuses. Shared ambitions.</span>
        </div>
      </div>
      <div className="senior-hero-art" aria-hidden="true">
        <div className="mentor-orbit orbit-outer" />
        <div className="mentor-orbit orbit-inner" />
        <div className="orbit-line line-one" />
        <div className="orbit-line line-two" />
        <div className="orbit-line line-three" />
        <div className="orbit-center">
          <StudentAvatar profile={user} size="large" />
          <span>Your experience</span>
        </div>
        <div className="orbit-student orbit-student-one">
          <StudentAvatar profile={getProfile('neha-gupta')} />
          <span>First internship ✨</span>
        </div>
        <div className="orbit-student orbit-student-two">
          <StudentAvatar profile={getProfile('kabir-shah')} />
          <span>First project 🚀</span>
        </div>
        <div className="orbit-student orbit-student-three">
          <StudentAvatar profile={getProfile('sana-khan')} />
          <span>A little clarity 💡</span>
        </div>
        <div className="orbit-sticker"><HeartHandshake size={15} /> Small chats. Big steps.</div>
      </div>
    </section>
    <section className="senior-stats" aria-label="Your network at a glance">
      {stats.map(({
        label,
        value,
        icon: Icon,
        tint,
        to
      }) => <Link to={to} className="senior-stat-card" key={label}>
        <span className={`senior-stat-icon tint-${tint}`}>
          <Icon size={20} />
        </span>
        <div>
          <strong>
            {value.toString().padStart(2, '0')}
          </strong>
          <span>
            {label}
          </span>
        </div>
        <ArrowUpRight size={16} className="stat-arrow" />
      </Link>)}
    </section>
    <div className="senior-dashboard-grid">
      <section className="network-panel senior-requests">
        <div className="network-section-heading">
          <div>
            <h2>They&apos;re reaching out <span className="network-count">
                {incomingRequests.length}
              </span></h2>
            <p>A hello today. A head start tomorrow.</p>
          </div>
          <Link className="network-text-link" to="/messages?tab=requests">View all <ArrowRight size={14} /></Link>
        </div>
        {incomingRequests.length ? <div className="senior-request-list">
          {incomingRequests.slice(0, 3).map(connection => {
            const profile = getProfile(connection.from);
            return profile && <div className="senior-request-row" key={connection.id}>
            <StudentAvatar profile={profile} />
            <div className="request-student-info">
              <h3>
                {profile.name}
              </h3>
              <p>{profile.college} · {profile.year}</p>
              <span>
                {profile.interests.slice(0, 2).join(' · ')}
              </span>
            </div>
            <ConnectionAction profile={profile} />
          </div>;
          })}
        </div> : <div className="network-empty">
          <UserPlus size={28} />
          <h3>You&apos;re all caught up</h3>
          <p>Keep your profile open for new requests from juniors.</p>
          <Link className="network-text-link" to="/messages?tab=requests">View requests <ArrowRight size={14} /></Link>
        </div>}
      </section>
      <aside className="network-panel senior-profile-nudge">
        <span className="profile-nudge-icon">
          <Sparkles size={20} />
        </span>
        <h2>Good guidance starts<br />with your story.</h2>
        <p>Let juniors know what you&apos;ve learned and where you can help.</p>
        <div className="network-skill-list">
          {(user.interests || []).slice(0, 3).map((skill, index) => <SkillTag key={skill} name={skill} index={index} />)}
        </div>
        <div className="profile-check">
          <Check size={15} />
          <span>
            {user.bio ? 'Your introduction is ready' : 'Add a short introduction'}
          </span>
        </div>
        <Link className="network-secondary-btn" to="/senior/profile">{user.bio ? 'Edit your mentor profile' : 'Complete your profile'} <ArrowUpRight size={14} /></Link>
      </aside>
      <section className="network-panel senior-conversations">
        <div className="network-section-heading">
          <div>
            <h2>Keep the conversation going</h2>
            <p>Some of the best learning happens between sessions.</p>
          </div>
          <Link className="network-text-link" to="/messages">Open inbox <ArrowRight size={14} /></Link>
        </div>
        {conversations.length ? <div className="dashboard-conversation-list">
          {conversations.slice(0, 3).map(({
            connection,
            peer,
            last
          }) => <Link className="dashboard-conversation" to={`/messages/${encodeURIComponent(peer.id)}`} key={connection.id}>
            <StudentAvatar profile={peer} />
            <div>
              <h3>{peer.name} {unreadFor(connection.id) > 0 && <span className="unread-dot" />}</h3>
              <p>
                {last ? `${last.senderId === user.id ? 'You: ' : ''}${last.text}` : 'You’re connected. Say your first hello 👋'}
              </p>
            </div>
            <ArrowUpRight size={17} />
          </Link>)}
        </div> : <div className="network-empty">
          <MessageCircle size={28} />
          <h3>Your next conversation starts here</h3>
          <p>Accept a connection request to start chatting with a junior.</p>
        </div>}
      </section>
      <aside className="senior-tip">
        <span className="network-eyebrow">A little mentor wisdom</span>
        <h3>Listen first.<br />Roadmap second.</h3>
        <p>Ask what they&apos;ve tried, what&apos;s confusing, and what they want to do next. You don&apos;t need all the answers to make a difference.</p>
        <span>Seedhi baat. Real guidance. ✌️</span>
      </aside>
    </div>
  </div>;
}
