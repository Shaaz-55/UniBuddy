import { DEFAULT_COLLEGE, getCollegeByName } from '../data/colleges.js';

export const MAX_STORY_MEDIA_SIZE = 20 * 1024 * 1024;

function collegeKey(name) {
  return (getCollegeByName(name)?.name || name || DEFAULT_COLLEGE.name).trim().toLowerCase();
}

// Keep uploaded media as blobs so photos and videos survive a page reload.
function withStoryStore(mode, operation) {
  return new Promise((resolve, reject) => {
    const opening = indexedDB.open('unibuddy_stories_v1', 1);

    opening.onupgradeneeded = () => {
      const store = opening.result.createObjectStore('stories', { keyPath: 'id' });
      store.createIndex('collegeKey', 'collegeKey');
    };
    opening.onerror = () => reject(opening.error);
    opening.onsuccess = () => {
      const database = opening.result;
      try {
        const transaction = database.transaction('stories', mode);
        const request = operation(transaction.objectStore('stories'));
        transaction.oncomplete = () => {
          database.close();
          resolve(request.result);
        };
        transaction.onabort = () => {
          database.close();
          reject(transaction.error || request.error || new Error('Story storage failed.'));
        };
      } catch (error) {
        database.close();
        reject(error);
      }
    };
  });
}

export async function loadPostedStories(collegeName) {
  const stories = await withStoryStore('readonly', store => store.index('collegeKey').getAll(collegeKey(collegeName)));
  return stories.sort((a, b) => b.createdAt - a.createdAt);
}

export async function savePostedStory({ media, caption, user }) {
  const story = {
    id: `story-${crypto.randomUUID()}`,
    type: media.type.startsWith('video/') ? 'video' : 'image',
    media,
    caption: caption.trim(),
    authorId: user.id,
    authorName: user.name,
    authorInitials: user.name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase(),
    authorYear: user.year,
    collegeName: user.college || DEFAULT_COLLEGE.name,
    collegeKey: collegeKey(user.college),
    poster: user.gradient || 'linear-gradient(135deg, #5B4CFF, #FF3D77)',
    createdAt: Date.now(),
    likes: 0,
    comments: [],
  };
  await withStoryStore('readwrite', store => store.add(story));
  return story;
}
