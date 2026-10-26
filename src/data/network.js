import { MENTORS } from './mentors.js';
export const DEMO_JUNIOR = {
  id: 'rahul-verma',
  name: 'Rahul Verma',
  email: 'rahul@iitb.ac.in',
  college: 'IIT Bombay',
  year: '1st yr',
  interests: ['DSA', 'Web Dev'],
  role: 'junior',
  bio: 'Building my first projects and finding my way into tech.',
  gradient: 'var(--avatar-sky)'
};
export const DEMO_SENIOR = {
  ...MENTORS[0],
  email: 'aarav@iitb.ac.in',
  role: 'senior',
  interests: MENTORS[0].skills,
  bio: MENTORS[0].description,
  available: true,
  verified: true
};
export const JUNIORS = [DEMO_JUNIOR, {
  id: 'neha-gupta',
  name: 'Neha Gupta',
  college: 'Newton School of Technology',
  year: '2nd yr',
  interests: ['DSA', 'Placements'],
  bio: 'Working on DSA consistency. Would love a little direction on internships.',
  gradient: 'var(--avatar-gulabi)',
  role: 'junior'
}, {
  id: 'kabir-shah',
  name: 'Kabir Shah',
  college: 'Lovely Professional University',
  year: '1st yr',
  interests: ['Web Dev', 'React'],
  bio: 'Learning React, one side project at a time. Looking for my first roadmap.',
  gradient: 'var(--avatar-mango)',
  role: 'junior'
}, {
  id: 'sana-khan',
  name: 'Sana Khan',
  college: 'Vedam School of Technology',
  year: '2nd yr',
  interests: ['DSA', 'Interview Prep'],
  bio: 'Preparing for internships and hoping to practise interviews with a senior.',
  gradient: 'var(--avatar-matcha)',
  role: 'junior'
}, {
  id: 'isha-patel',
  name: 'Isha Patel',
  college: 'Symbiosis Institute of Technology',
  year: '1st yr',
  interests: ['UI/UX', 'Figma'],
  bio: 'Exploring product design. I would love feedback on my first case study.',
  gradient: 'var(--avatar-plum)',
  role: 'junior'
}];
export function createDemoNetwork(now = Date.now()) {
  return {
    profiles: [...MENTORS.map(mentor => ({
      ...mentor,
      role: 'senior',
      interests: mentor.skills,
      bio: mentor.description,
      available: true,
      verified: true
    })), ...JUNIORS],
    connections: [{
      id: 'demo-rahul-aarav',
      from: DEMO_JUNIOR.id,
      to: DEMO_SENIOR.id,
      status: 'accepted',
      createdAt: now - 86400000
    }, {
      id: 'demo-neha-aarav',
      from: 'neha-gupta',
      to: DEMO_SENIOR.id,
      status: 'pending',
      createdAt: now - 3600000
    }, {
      id: 'demo-kabir-aarav',
      from: 'kabir-shah',
      to: DEMO_SENIOR.id,
      status: 'pending',
      createdAt: now - 7200000
    }, {
      id: 'demo-sana-aarav',
      from: 'sana-khan',
      to: DEMO_SENIOR.id,
      status: 'pending',
      createdAt: now - 10800000
    }],
    messages: [{
      id: 'demo-message-1',
      connectionId: 'demo-rahul-aarav',
      senderId: DEMO_JUNIOR.id,
      text: 'Hey Aarav! I’m a little lost with DSA. Should I start with arrays or jump into solving problems?',
      createdAt: now - 3600000,
      readAt: now - 3500000
    }, {
      id: 'demo-message-2',
      connectionId: 'demo-rahul-aarav',
      senderId: DEMO_SENIOR.id,
      text: 'Hey Rahul! Start with arrays and strings. Pick one pattern, understand why it works, then solve 3–4 problems on it. Consistency beats rushing 🙌',
      createdAt: now - 3400000,
      readAt: now - 3300000
    }, {
      id: 'demo-message-3',
      connectionId: 'demo-rahul-aarav',
      senderId: DEMO_JUNIOR.id,
      text: 'That makes sense! Could you help me put together a plan for my first week?',
      createdAt: now - 1800000,
      readAt: null
    }]
  };
}
