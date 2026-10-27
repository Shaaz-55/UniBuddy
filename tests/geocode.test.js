import test from 'node:test';
import assert from 'node:assert/strict';
import { COLLEGES, getCollegeByName } from '../src/data/colleges.js';
import { resolveCollegeLocation } from '../src/lib/geocode.js';

test('every listed college resolves to its own campus without a geocoding request', async context => {
  const fetch = context.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Network unavailable');
  });
  const centers = new Set();

  for (const college of COLLEGES) {
    const location = await resolveCollegeLocation(college.name);
    assert.equal(location.isFallback, false, college.name);
    assert.equal(location.collegeName, college.name);
    assert.ok(location.lat >= 8 && location.lat <= 37, `${college.name}: latitude in India`);
    assert.ok(location.lng >= 68 && location.lng <= 98, `${college.name}: longitude in India`);
    centers.add(`${location.lat},${location.lng}`);
  }

  assert.equal(centers.size, COLLEGES.length, 'colleges must not share the fallback campus');
  assert.equal(fetch.mock.callCount(), 0);
});

test('profile college aliases, punctuation and spacing resolve locally', async context => {
  const fetch = context.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Network unavailable');
  });
  const profileNames = [
    ['Lovely Professional University', 'LPU'],
    ['Vedam School of Technology', 'Vedam School of Tech'],
    ['Newton School of Tech', 'Newton School of Technology'],
    ['Symbiosis Institute of Technology', 'Symbiosis Pune'],
    ['DTU', 'Delhi Technological University'],
    ['  i.i.t.   delhi  ', 'IIT Delhi'],
  ];

  for (const [enteredName, expectedCollege] of profileNames) {
    const location = await resolveCollegeLocation(enteredName);
    assert.equal(location.isFallback, false, enteredName);
    assert.equal(location.collegeName, expectedCollege);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test('Newton and Vedam use the selected Sonipat and Gurugram campuses', async () => {
  const newton = await resolveCollegeLocation('Newton School of Technology');
  const vedam = await resolveCollegeLocation('Vedam School of Technology');
  assert.ok(newton.lat > 28.97 && newton.lat < 29.00 && newton.lng > 77.08 && newton.lng < 77.10);
  assert.ok(vedam.lat > 28.42 && vedam.lat < 28.44 && vedam.lng > 77.10 && vedam.lng < 77.12);
  assert.equal(getCollegeByName('An unlisted college'), undefined);
});
