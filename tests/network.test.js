import test from 'node:test';
import assert from 'node:assert/strict';
import { applyNetworkAction, getConnection, getUnreadCount } from '../src/lib/network.js';
import { createDemoNetwork, DEMO_JUNIOR, DEMO_SENIOR } from '../src/data/network.js';

const junior = DEMO_JUNIOR.id;
const senior = DEMO_SENIOR.id;
const acceptedId = 'demo-rahul-aarav';

test('a request requires two different students with different roles', () => {
  const state = createDemoNetwork(100000000);
  assert.match(applyNetworkAction(state, junior, { type: 'request', peerId: junior }).error, /other role/);
  assert.match(applyNetworkAction(state, junior, { type: 'request', peerId: 'neha-gupta' }).error, /other role/);
  assert.match(applyNetworkAction(state, junior, { type: 'request', peerId: 'missing' }).error, /other role/);
  assert.match(applyNetworkAction(state, 'unknown-user', { type: 'request', peerId: senior }).error, /sign in/);
});

test('a request stays pending and cannot be duplicated in either direction', () => {
  const state = createDemoNetwork(100000000);
  const result = applyNetworkAction(state, junior, { type: 'request', peerId: 'priya-sharma' }, 100000001, 'request-priya');
  assert.equal(getConnection(result.state, junior, 'priya-sharma').status, 'pending');
  assert.equal(state.connections.length + 1, result.state.connections.length);
  assert.match(applyNetworkAction(result.state, 'priya-sharma', { type: 'request', peerId: junior }).error, /already/);
  assert.match(applyNetworkAction(result.state, junior, { type: 'request', peerId: 'priya-sharma' }).error, /already/);
});

test('only the recipient can accept; messaging is blocked until acceptance', () => {
  const state = createDemoNetwork(100000000);
  const id = 'demo-neha-aarav';
  assert.match(applyNetworkAction(state, 'neha-gupta', { type: 'accept', connectionId: id }).error, /recipient/);
  assert.match(applyNetworkAction(state, senior, { type: 'send', connectionId: id, text: 'Hello' }).error, /Accept/);
  const accepted = applyNetworkAction(state, senior, { type: 'accept', connectionId: id }, 100000001).state;
  assert.equal(accepted.connections.find((connection) => connection.id === id).status, 'accepted');
  assert.ok(applyNetworkAction(accepted, 'neha-gupta', { type: 'send', connectionId: id, text: 'Hello' }).state);
});

test('unrelated students cannot message, read, accept or remove a connection', () => {
  const state = createDemoNetwork(100000000);
  for (const type of ['send', 'read', 'accept', 'remove']) {
    assert.match(applyNetworkAction(state, 'isha-patel', { type, connectionId: acceptedId, text: 'Hello' }).error, /unavailable/);
  }
  assert.equal(getUnreadCount(state, 'isha-patel'), 0);
});

test('both connected students can send, and only the recipient can mark a message read', () => {
  const state = createDemoNetwork(100000000);
  const sent = applyNetworkAction(state, senior, { type: 'send', connectionId: acceptedId, text: '  Let’s make a plan 🙌  ' }, 100000001, 'new-message').state;
  assert.equal(sent.messages.at(-1).text, 'Let’s make a plan 🙌');
  assert.equal(getUnreadCount(sent, junior, acceptedId), 1);
  const senderRead = applyNetworkAction(sent, senior, { type: 'read', connectionId: acceptedId }, 100000002).state;
  assert.equal(senderRead.messages.at(-1).readAt, null);
  const recipientRead = applyNetworkAction(senderRead, junior, { type: 'read', connectionId: acceptedId }, 100000003).state;
  assert.equal(recipientRead.messages.at(-1).readAt, 100000003);
  assert.equal(getUnreadCount(recipientRead, junior), 0);
  assert.equal(applyNetworkAction(recipientRead, junior, { type: 'read', connectionId: acceptedId }).state, recipientRead);
});

test('empty and oversized messages are rejected without changing state', () => {
  const state = createDemoNetwork(100000000);
  for (const text of ['', '  \n ', 'a'.repeat(2001), null]) {
    assert.match(applyNetworkAction(state, junior, { type: 'send', connectionId: acceptedId, text }).error, /2,000/);
  }
  assert.ok(applyNetworkAction(state, junior, { type: 'send', connectionId: acceptedId, text: 'a'.repeat(2000) }).state);
});

test('removing a connection deletes its thread and immediately revokes messaging', () => {
  const state = createDemoNetwork(100000000);
  const removed = applyNetworkAction(state, junior, { type: 'remove', connectionId: acceptedId }).state;
  assert.equal(getConnection(removed, junior, senior), undefined);
  assert.equal(removed.messages.filter((message) => message.connectionId === acceptedId).length, 0);
  assert.match(applyNetworkAction(removed, senior, { type: 'send', connectionId: acceptedId, text: 'Hello' }).error, /unavailable/);
  const next = applyNetworkAction(removed, junior, { type: 'request', peerId: senior }).state;
  assert.equal(getConnection(next, junior, senior).status, 'pending');
});

test('pausing new connections keeps existing conversations usable', () => {
  const state = createDemoNetwork(100000000);
  state.profiles = state.profiles.map((profile) => profile.id === senior ? { ...profile, available: false } : profile);
  assert.match(applyNetworkAction(state, 'isha-patel', { type: 'request', peerId: senior }).error, /paused/);
  assert.ok(applyNetworkAction(state, junior, { type: 'send', connectionId: acceptedId, text: 'Our chat still works.' }).state);
});
