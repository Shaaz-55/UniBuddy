import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCheck, ChevronRight, HeartHandshake, Info, LockKeyhole, MessageCircle, PenSquare, Search, Send, Smile, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNetwork } from '../../context/NetworkContext';
import { useToast } from '../../context/ToastContext';
import { getPeerId } from '../../lib/network';
import StudentAvatar from '../../components/StudentAvatar';
import ConnectionAction from '../../components/ConnectionAction';
import SkillTag from '../../components/SkillTag';
import Modal from '../../components/Modal';
import Drawer from '../../components/Drawer';
import './Messages.css';
const EMOJIS = ['👋', '🙌', '😊', '✨', '🚀', '❤️', '👍', '🎯'];
const timeLabel = date => new Intl.DateTimeFormat('en-IN', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'Asia/Kolkata'
}).format(date);
const dayLabel = date => new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata'
}).format(date);
export default function Messages() {
  const {
    user
  } = useAuth();
  const {
    profiles,
    messages,
    acceptedConnections,
    incomingRequests,
    connectionWith,
    unreadFor,
    markRead,
    sendMessage,
    storageError
  } = useNetwork();
  const {
    showToast
  } = useToast();
  const {
    peerId
  } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sidebarTab, setSidebarTab] = useState('chats');
  const [drafts, setDrafts] = useState({});
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const composerRef = useRef(null);
  const threadRef = useRef(null);
  const emojiRef = useRef(null);
  const peer = profiles.find(profile => profile.id === peerId && profile.id !== user.id && profile.role !== user.role);
  const connection = peer ? connectionWith(peer.id) : null;
  const canChat = connection?.status === 'accepted';
  const thread = canChat ? messages.filter(message => message.connectionId === connection.id) : [];
  const draft = drafts[peerId] || '';
  const unread = connection ? unreadFor(connection.id) : 0;
  const conversations = acceptedConnections.map(item => ({
    connection: item,
    profile: profiles.find(profile => profile.id === getPeerId(item, user.id)),
    last: messages.filter(message => message.connectionId === item.id).at(-1)
  })).filter(item => item.profile).sort((a, b) => (b.last?.createdAt || b.connection.createdAt) - (a.last?.createdAt || a.connection.createdAt));
  const visibleConversations = conversations.filter(item => `${item.profile.name} ${item.profile.college}`.toLowerCase().includes(search.toLowerCase()));
  const visibleRequests = incomingRequests.map(item => profiles.find(profile => profile.id === item.from)).filter(profile => profile && `${profile.name} ${profile.college}`.toLowerCase().includes(search.toLowerCase()));
  useEffect(() => {
    setEmojiOpen(false);
    setProfileOpen(false);
  }, [peerId]);
  useEffect(() => {
    if (!canChat || !unread) return;
    const readVisibleThread = () => {
      if (document.visibilityState === 'visible') markRead(connection.id);
    };
    readVisibleThread();
    document.addEventListener('visibilitychange', readVisibleThread);
    window.addEventListener('focus', readVisibleThread);
    return () => {
      document.removeEventListener('visibilitychange', readVisibleThread);
      window.removeEventListener('focus', readVisibleThread);
    };
  }, [canChat, connection?.id, unread, markRead]);
  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [peerId, thread.length]);
  useEffect(() => {
    if (!composerRef.current) return;
    composerRef.current.style.height = 'auto';
    composerRef.current.style.height = `${Math.min(composerRef.current.scrollHeight, 120)}px`;
  }, [draft, peerId]);
  useEffect(() => {
    if (!emojiOpen) return;
    const close = event => {
      if (event.key === 'Escape' || event.type === 'mousedown' && !emojiRef.current?.contains(event.target)) setEmojiOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [emojiOpen]);
  const updateDraft = value => setDrafts(current => ({
    ...current,
    [peerId]: value
  }));
  const handleSend = event => {
    event.preventDefault();
    const result = sendMessage(connection?.id, draft);
    if (!result.success) {
      showToast(result.error);
      return;
    }
    updateDraft('');
    setEmojiOpen(false);
    composerRef.current?.focus();
  };
  const openThread = id => {
    setNewMessageOpen(false);
    setSidebarTab('chats');
    navigate(`/messages/${encodeURIComponent(id)}`);
  };
  return <div className={`messages-page wrap ${peerId ? 'has-open-thread' : ''}`}>
    <header className="messages-page-heading">
      <span className="network-eyebrow"><MessageCircle size={13} /> A little closer, one message at a time</span>
      <h1>Messages</h1>
    </header>
    {storageError && <p className="message-storage-error" role="status">Your browser couldn&apos;t save this conversation. Messages will stay here until you refresh.</p>}
    <div className="messenger">
      <aside className="inbox-sidebar" aria-label="Your inbox">
        <div className="inbox-heading">
          <div>
            <h2>Your inbox <span className="network-count">
                {acceptedConnections.length}
              </span></h2>
            <p>Seedhi baat, right here.</p>
          </div>
          <button type="button" className="network-icon-btn" aria-label="New message" title="New message" onClick={() => setNewMessageOpen(true)}>
            <PenSquare size={17} />
          </button>
        </div>
        <label className="network-search inbox-search">
          <Search size={16} />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search conversations" aria-label="Search conversations" />
          {search && <button type="button" className="inbox-clear-search" aria-label="Clear conversation search" onClick={() => setSearch('')}>
            <X size={14} />
          </button>}
        </label>
        <div className="inbox-tabs">
          <button type="button" className={sidebarTab === 'chats' ? 'active' : ''} aria-pressed={sidebarTab === 'chats'} onClick={() => setSidebarTab('chats')}>Chats</button>
          <button type="button" className={sidebarTab === 'requests' ? 'active' : ''} aria-pressed={sidebarTab === 'requests'} onClick={() => setSidebarTab('requests')}>Requests {incomingRequests.length > 0 && <span className="network-count">
              {incomingRequests.length}
            </span>}</button>
        </div>
        <div className="inbox-conversations">
          {sidebarTab === 'chats' ? visibleConversations.length ? visibleConversations.map(({
            connection: item,
            profile,
            last
          }) => <button type="button" className={`inbox-conversation ${peerId === profile.id ? 'active' : ''} ${unreadFor(item.id) ? 'is-unread' : ''}`} key={item.id} onClick={() => openThread(profile.id)}>
            <StudentAvatar profile={profile} />
            <div className="inbox-conversation-copy">
              <div>
                <h3>
                  {profile.name}
                </h3>
                <span>
                  {last ? timeLabel(last.createdAt) : ''}
                </span>
              </div>
              <p>
                {last ? `${last.senderId === user.id ? 'You: ' : ''}${last.text}` : 'You’re connected. Say hello 👋'}
              </p>
              <span className="inbox-college">
                {profile.college}
              </span>
            </div>
            {unreadFor(item.id) > 0 && <span className="chat-unread-count">
              {unreadFor(item.id)}
            </span>}
          </button>) : <div className="network-empty inbox-empty">
            <MessageCircle size={28} />
            <h3>
              {search ? 'No conversations found' : 'Your next hello is waiting'}
            </h3>
            <p>
              {search ? 'Try another name or college.' : 'Connect with a student to start a conversation.'}
            </p>
            <Link className="network-text-link" to="/connections">Find your circle <ArrowRight size={14} /></Link>
          </div> : visibleRequests.length ? visibleRequests.map(profile => <div className="inbox-request" key={profile.id}>
            <div>
              <StudentAvatar profile={profile} />
              <div>
                <h3>
                  {profile.name}
                </h3>
                <p>
                  {profile.college}
                </p>
              </div>
            </div>
            <ConnectionAction profile={profile} />
          </div>) : <div className="network-empty inbox-empty">
            <HeartHandshake size={28} />
            <h3>
              {search ? 'No requests found' : 'All caught up'}
            </h3>
            <p>New connection requests will appear here.</p>
          </div>}
        </div>
        <div className="inbox-footer">
          <LockKeyhole size={13} />
          <span>Only your connections can message you.</span>
        </div>
      </aside>
      <section className="chat-pane" aria-label={peer ? `Conversation with ${peer.name}` : 'Conversation'}>
        {peerId && peer ? <>
          <header className="chat-header">
            <Link className="network-icon-btn chat-back" to="/messages" aria-label="Back to inbox">
              <ArrowLeft size={19} />
            </Link>
            <StudentAvatar profile={peer} />
            <button type="button" className="chat-person" onClick={() => setProfileOpen(true)}>
              <h2>
                {peer.name}
              </h2>
              <span>{peer.college} · {peer.year}</span>
            </button>
            {canChat && <span className="chat-connected"><HeartHandshake size={13} /> Connected</span>}
            <button type="button" className="network-icon-btn" aria-label={`About ${peer.name}`} title="View profile" onClick={() => setProfileOpen(true)}>
              <Info size={18} />
            </button>
          </header>
          {canChat ? <>
            <div className="chat-thread" ref={threadRef} role="log" aria-label="Messages" aria-live="polite" aria-relevant="additions">
              <div className="chat-introduction">
                <StudentAvatar profile={peer} size="large" />
                <h3>
                  {peer.name}
                </h3>
                <p>
                  {peer.college}
                </p>
                <span><HeartHandshake size={12} /> You&apos;re connected on UniBuddy</span>
              </div>
              {thread.length === 0 && <div className="chat-first-message">
                <p>A good conversation starts with a simple hello.</p>
                <button type="button" onClick={() => {
                  updateDraft(`Hey ${peer.name.split(' ')[0]}! 👋 Great to connect with you.`);
                  composerRef.current?.focus();
                }}>Say hello 👋</button>
              </div>}
              {thread.map((message, index) => {
                const own = message.senderId === user.id;
                const showDay = index === 0 || dayLabel(thread[index - 1].createdAt) !== dayLabel(message.createdAt);
                return <div key={message.id}>
                {showDay && <div className="chat-date">
                  <span>
                    {dayLabel(message.createdAt)}
                  </span>
                </div>}
                <div className={`chat-message-row ${own ? 'is-own' : ''}`}>
                  {!own && <StudentAvatar profile={peer} size="tiny" />}
                  <div className="chat-message-content">
                    <div className="chat-bubble">
                      {message.text}
                    </div>
                    <div className="chat-message-meta">
                      <time dateTime={new Date(message.createdAt).toISOString()}>
                        {timeLabel(message.createdAt)}
                      </time>
                      {own && <span className={message.readAt ? 'message-seen' : ''}>
                        {message.readAt ? <CheckCheck size={13} /> : <Check size={13} />}
                        {message.readAt ? 'Seen' : 'Sent'}
                      </span>}
                    </div>
                  </div>
                </div>
              </div>;
              })}
            </div>
            <form className="chat-composer-area" onSubmit={handleSend}>
              <div className="chat-composer">
                <div className="chat-emoji" ref={emojiRef}>
                  <button type="button" className="composer-emoji-btn" aria-label="Add emoji" aria-expanded={emojiOpen} onClick={() => setEmojiOpen(current => !current)}>
                    <Smile size={21} />
                  </button>
                  {emojiOpen && <div className="emoji-picker" aria-label="Choose an emoji">
                    {EMOJIS.map(emoji => <button type="button" key={emoji} aria-label={`Insert ${emoji}`} onClick={() => {
                      updateDraft((draft + emoji).slice(0, 2000));
                      setEmojiOpen(false);
                      composerRef.current?.focus();
                    }}>
                      {emoji}
                    </button>)}
                  </div>}
                </div>
                <textarea ref={composerRef} rows={1} value={draft} maxLength={2000} onChange={event => updateDraft(event.target.value)} onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    if (draft.trim()) handleSend(event);
                  }
                }} placeholder={`Message ${peer.name.split(' ')[0]}...`} aria-label={`Message ${peer.name}`} />
                <button type="submit" className="chat-send-btn" disabled={!draft.trim()} aria-label="Send message">
                  <Send size={18} />
                </button>
              </div>
              <div className="composer-help">
                <span>Enter to send · Shift + Enter for a new line</span>
                <span>
                  {draft.length > 1800 ? `${draft.length}/2000` : 'A little kindness goes a long way ✨'}
                </span>
              </div>
            </form>
          </> : <div className="chat-placeholder">
            <span className="chat-placeholder-icon">
              <LockKeyhole size={32} />
            </span>
            <h2>Connect first. Chat next.</h2>
            <p>
              {connection?.to === user.id ? `${peer.name.split(' ')[0]} wants to connect with you. Accept their request to start chatting.` : connection ? 'Your request is on its way. Messaging opens when it’s accepted.' : 'A shared connection makes room for better conversations. Send a request to get started.'}
            </p>
            <ConnectionAction profile={peer} />
          </div>}
        </> : <div className="chat-placeholder">
          {peerId && <Link className="network-text-link chat-back-empty" to="/messages"><ArrowLeft size={15} />Back to inbox</Link>}
          <span className="chat-placeholder-icon">
            <MessageCircle size={36} />
          </span>
          <span className="network-eyebrow">YOUR CONNECTIONS, YOUR CONVERSATIONS</span>
          <h2>
            {peerId ? 'This conversation is unavailable' : 'Big ideas start with a small hello.'}
          </h2>
          <p>
            {peerId ? 'Choose a student from your inbox, or find someone new to connect with.' : 'Ask a question. Share a breakthrough. Keep learning together, one conversation at a time.'}
          </p>
          <button type="button" className="btn-primary network-btn" onClick={() => setNewMessageOpen(true)}>Start a conversation <ArrowRight size={15} /></button>
          <span className="chat-placeholder-note"><HeartHandshake size={14} /> Chat freely with your accepted connections.</span>
        </div>}
      </section>
    </div>
    <Modal isOpen={newMessageOpen} onClose={() => setNewMessageOpen(false)} title="Start a conversation" subtitle="Pick someone from your campus circle." maxWidth="440px">
      <div className="new-message-list">
        {conversations.length ? conversations.map(({
          profile
        }) => <button type="button" key={profile.id} onClick={() => openThread(profile.id)}>
          <StudentAvatar profile={profile} />
          <span>
            <strong>
              {profile.name}
            </strong>
            <small>
              {profile.college}
            </small>
          </span>
          <ChevronRight size={16} />
        </button>) : <div className="network-empty">
          <HeartHandshake size={30} />
          <h3>Make your first connection</h3>
          <p>Once a request is accepted, you&apos;ll find your connection here.</p>
          <Link className="btn-primary network-btn" to="/connections" onClick={() => setNewMessageOpen(false)}>Find your circle <ArrowRight size={14} /></Link>
        </div>}
      </div>
    </Modal>
    <Drawer isOpen={profileOpen && !!peer} onClose={() => setProfileOpen(false)} title="About your connection" width="400px">
      {peer && <div className="chat-profile-detail">
        <StudentAvatar profile={peer} size="large" />
        <span className="network-eyebrow">{peer.role} pass</span>
        <h2>
          {peer.name}
        </h2>
        <p>{peer.college} · {peer.year}</p>
        <div className="network-skill-list">
          {(peer.interests || []).map((skill, index) => <SkillTag key={skill} name={skill} index={index} />)}
        </div>
        <h3>A little about me</h3>
        <p>
          {peer.bio || 'Here to connect, learn and grow together.'}
        </p>
        <Link className="network-secondary-btn" to="/connections" onClick={() => setProfileOpen(false)}>Manage connections <ArrowRight size={14} /></Link>
      </div>}
    </Drawer>
  </div>;
}
