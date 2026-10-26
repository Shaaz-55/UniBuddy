import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { createDemoNetwork } from '../data/network';
import { applyNetworkAction, getConnection, getUnreadCount } from '../lib/network';
import { readStorage, writeStorage } from '../lib/storage';
const STORAGE_KEY = 'unibuddy_network_v1';
const NetworkContext = createContext(null);
function readNetwork(fallback) {
  const stored = readStorage(STORAGE_KEY, fallback);
  return Array.isArray(stored?.profiles) && Array.isArray(stored?.connections) && Array.isArray(stored?.messages) ? stored : fallback;
}
export function NetworkProvider({
  children
}) {
  const {
    user
  } = useAuth();
  const [network, setNetwork] = useState(() => readNetwork(createDemoNetwork()));
  const networkRef = useRef(network);
  const [storageError, setStorageError] = useState(false);
  const commit = useCallback(next => {
    networkRef.current = next;
    setStorageError(!writeStorage(STORAGE_KEY, next));
    setNetwork(next);
  }, []);
  useEffect(() => {
    if (!user) return;
    const latest = readNetwork(networkRef.current);
    const old = latest.profiles.find(profile => profile.id === user.id);
    const profile = {
      ...old,
      ...user,
      skills: user.interests || old?.skills || [],
      bio: user.bio ?? old?.bio ?? ''
    };
    commit({
      ...latest,
      profiles: [...latest.profiles.filter(item => item.id !== user.id), profile]
    });
  }, [user, commit]);
  useEffect(() => {
    const sync = event => {
      if (event.key === STORAGE_KEY || event.key === null) {
        const latest = readNetwork(networkRef.current);
        networkRef.current = latest;
        setNetwork(latest);
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  // Read the latest shared state before writing so tabs can exchange messages.
  const act = useCallback(action => {
    const latest = readNetwork(networkRef.current);
    const result = applyNetworkAction(latest, user?.id, action);
    if (result.error) return {
      success: false,
      error: result.error
    };
    if (result.state !== latest) commit(result.state);
    return {
      success: true
    };
  }, [user?.id, commit]);
  const markRead = useCallback(connectionId => act({
    type: 'read',
    connectionId
  }), [act]);
  const connections = network.connections.filter(connection => [connection.from, connection.to].includes(user?.id));
  const incomingRequests = connections.filter(connection => connection.status === 'pending' && connection.to === user?.id);
  const acceptedConnections = connections.filter(connection => connection.status === 'accepted');
  return <NetworkContext.Provider value={{
    ...network,
    connections,
    allConnections: network.connections,
    incomingRequests,
    acceptedConnections,
    storageError,
    markRead,
    unreadCount: getUnreadCount(network, user?.id),
    connectionWith: peerId => getConnection(network, user?.id, peerId),
    unreadFor: connectionId => getUnreadCount(network, user?.id, connectionId),
    requestConnection: peerId => act({
      type: 'request',
      peerId
    }),
    acceptConnection: connectionId => act({
      type: 'accept',
      connectionId
    }),
    removeConnection: connectionId => act({
      type: 'remove',
      connectionId
    }),
    sendMessage: (connectionId, message) => act({
      type: 'send',
      connectionId,
      text: message
    })
  }}>
    {children}
  </NetworkContext.Provider>;
}
export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) throw new Error('useNetwork must be used within a NetworkProvider');
  return context;
}
