export function getConnection(state, userId, peerId) {
  return state.connections.find(connection => connection.from === userId && connection.to === peerId || connection.to === userId && connection.from === peerId);
}
export function getPeerId(connection, userId) {
  return connection.from === userId ? connection.to : connection.from;
}

// State transitions enforce the connection rules across every entry point.
export function applyNetworkAction(state, actorId, action, now = Date.now(), id = globalThis.crypto.randomUUID()) {
  const actor = state.profiles.find(profile => profile.id === actorId);
  if (!actor) return {
    error: 'Please sign in to continue.'
  };
  if (action.type === 'request') {
    const peer = state.profiles.find(profile => profile.id === action.peerId);
    if (!peer || peer.id === actorId || peer.role === actor.role) return {
      error: 'Connect with a student from the other role.'
    };
    if (peer.role === 'senior' && peer.available === false) return {
      error: 'This senior has paused new connections. Try again later.'
    };
    if (getConnection(state, actorId, peer.id)) return {
      error: 'You already have a connection or a pending request.'
    };
    return {
      state: {
        ...state,
        connections: [...state.connections, {
          id,
          from: actorId,
          to: peer.id,
          status: 'pending',
          createdAt: now
        }]
      }
    };
  }
  const connection = state.connections.find(item => item.id === action.connectionId);
  if (!connection || ![connection.from, connection.to].includes(actorId)) return {
    error: 'This connection is unavailable.'
  };
  if (action.type === 'accept') {
    if (connection.to !== actorId || connection.status !== 'pending') return {
      error: 'Only the recipient can accept a pending request.'
    };
    return {
      state: {
        ...state,
        connections: state.connections.map(item => item.id === connection.id ? {
          ...item,
          status: 'accepted',
          acceptedAt: now
        } : item)
      }
    };
  }
  if (action.type === 'remove') {
    return {
      state: {
        ...state,
        connections: state.connections.filter(item => item.id !== connection.id),
        messages: state.messages.filter(message => message.connectionId !== connection.id)
      }
    };
  }
  if (connection.status !== 'accepted') return {
    error: 'Accept the connection request to unlock messaging.'
  };
  if (action.type === 'send') {
    const message = typeof action.text === 'string' ? action.text.trim() : '';
    if (!message || message.length > 2000) return {
      error: 'Messages must contain between 1 and 2,000 characters.'
    };
    return {
      state: {
        ...state,
        messages: [...state.messages, {
          id,
          connectionId: connection.id,
          senderId: actorId,
          text: message,
          createdAt: now,
          readAt: null
        }]
      }
    };
  }
  if (action.type === 'read') {
    const hasUnread = state.messages.some(message => message.connectionId === connection.id && message.senderId !== actorId && !message.readAt);
    if (!hasUnread) return {
      state
    };
    return {
      state: {
        ...state,
        messages: state.messages.map(message => message.connectionId === connection.id && message.senderId !== actorId && !message.readAt ? {
          ...message,
          readAt: now
        } : message)
      }
    };
  }
  return {
    error: 'Unknown action.'
  };
}
export function getUnreadCount(state, userId, connectionId) {
  const acceptedIds = new Set(state.connections.filter(connection => connection.status === 'accepted' && [connection.from, connection.to].includes(userId)).map(connection => connection.id));
  return state.messages.filter(message => acceptedIds.has(message.connectionId) && (!connectionId || message.connectionId === connectionId) && message.senderId !== userId && !message.readAt).length;
}
