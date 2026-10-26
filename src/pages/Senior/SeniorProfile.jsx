import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Save, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StudentAvatar from '../../components/StudentAvatar';
import SkillTag from '../../components/SkillTag';
import './SeniorProfile.css';
const SKILLS = ['DSA', 'Web Dev', 'React', 'Interview Prep', 'UI/UX', 'Figma', 'Machine Learning', 'Python', 'Placements', 'Resume Review', 'Cloud & DevOps', 'Competitive Programming'];
export default function SeniorProfile() {
  const {
    user,
    updateProfile
  } = useAuth();
  const {
    showToast
  } = useToast();
  const [form, setForm] = useState({
    name: user.name,
    college: user.college,
    year: user.year,
    branch: user.branch || '',
    bio: user.bio || '',
    interests: user.interests || [],
    available: user.available !== false
  });
  const [error, setError] = useState('');
  const setField = (field, value) => {
    setError('');
    setForm(current => ({
      ...current,
      [field]: value
    }));
  };
  const toggleSkill = skill => setField('interests', form.interests.includes(skill) ? form.interests.filter(item => item !== skill) : [...form.interests, skill]);
  const handleSave = event => {
    event.preventDefault();
    if (form.name.trim().length < 2 || !form.college.trim() || !form.interests.length) {
      setError('Add your name, college and at least one mentorship skill.');
      return;
    }
    updateProfile({
      ...form,
      name: form.name.trim(),
      college: form.college.trim(),
      bio: form.bio.trim(),
      branch: form.branch.trim()
    });
    showToast('Your mentor profile is updated ✨');
  };
  return <div className="network-page senior-profile-page wrap">
    <Link className="network-text-link profile-back-link" to="/senior"><ArrowLeft size={14} /> Back to your workspace</Link>
    <header className="network-page-header">
      <div>
        <span className="network-eyebrow"><Sparkles size={13} /> Your mentor identity</span>
        <h1>Let your experience do the talking.</h1>
        <p>Help juniors find the right person for their next step.</p>
      </div>
    </header>
    <div className="senior-profile-grid">
      <form className="network-panel mentor-profile-form" onSubmit={handleSave}>
        <div className="network-section-heading">
          <div>
            <h2>The person behind the pass</h2>
            <p>A clear profile makes it easier to connect.</p>
          </div>
        </div>
        {error && <p className="auth-error-banner" role="alert">
          {error}
        </p>}
        <div className="profile-form-row">
          <label>Full name<input className="auth-input" value={form.name} maxLength={80} onChange={event => setField('name', event.target.value)} required /></label>
          <label>College<input className="auth-input" value={form.college} maxLength={120} onChange={event => setField('college', event.target.value)} required /></label>
        </div>
        <div className="profile-form-row">
          <label>Year of study<select className="auth-input" value={form.year} onChange={event => setField('year', event.target.value)}>
              {['1st yr', '2nd yr', '3rd yr', '4th yr'].map(year => <option key={year}>
                {year}
              </option>)}
            </select></label>
          <label>Branch<input className="auth-input" value={form.branch} maxLength={80} onChange={event => setField('branch', event.target.value)} placeholder="e.g. Computer Science" /></label>
        </div>
        <label className="profile-bio-label">Your introduction<textarea className="auth-input" rows={4} value={form.bio} maxLength={400} onChange={event => setField('bio', event.target.value)} placeholder="What have you learned? What can you help a junior with?" /><span>{form.bio.length}/400 · Keep it personal and practical.</span></label>
        <fieldset className="profile-skills-fieldset">
          <legend>Skills you can mentor in</legend>
          <p>Pick the areas you feel confident helping someone with.</p>
          <div className="profile-skill-options">
            {[...new Set([...SKILLS, ...form.interests])].map(skill => <button type="button" key={skill} aria-pressed={form.interests.includes(skill)} className={form.interests.includes(skill) ? 'selected' : ''} onClick={() => toggleSkill(skill)}>
              {form.interests.includes(skill) && <Check size={12} />}
              {skill}
            </button>)}
          </div>
        </fieldset>
        <div className="profile-availability">
          <div>
            <strong>Open to new connections</strong>
            <p>Take a break whenever you need. Existing chats stay open.</p>
          </div>
          <button type="button" role="switch" aria-label="Open to new connections" aria-checked={form.available} className={`profile-switch ${form.available ? 'active' : ''}`} onClick={() => setField('available', !form.available)}>
            <span />
          </button>
        </div>
        <div className="profile-form-footer">
          <span>College email: {user.email}</span>
          <button type="submit" className="btn-primary network-btn"><Save size={15} /> Save profile</button>
        </div>
      </form>
      <aside className="profile-preview-col">
        <span className="network-eyebrow">WHAT JUNIORS WILL SEE</span>
        <article className="network-panel profile-preview">
          <StudentAvatar profile={{
            ...user,
            name: form.name,
            initials: undefined
          }} size="large" />
          <span className="student-role">Senior pass</span>
          <h2>
            {form.name || 'Your name'}
          </h2>
          <p>{form.college || 'Your college'} · {form.year}{form.branch ? ` · ${form.branch}` : ''}</p>
          <div className="network-skill-list">
            {form.interests.map((skill, index) => <SkillTag key={skill} name={skill} index={index} />)}
          </div>
          <blockquote>
            {form.bio || 'Your story belongs here. Tell juniors how you can help.'}
          </blockquote>
          <span className={`profile-preview-status ${form.available ? 'available' : ''}`}>
            <span />
            {form.available ? 'Open to new connections' : 'Taking a break from new connections'}
          </span>
        </article>
        <div className="profile-writing-tip">
          <Sparkles size={17} />
          <p>A good introduction says what you&apos;ve done, what you&apos;ve learned, and what you can help with. A real story beats a long list of achievements.</p>
        </div>
      </aside>
    </div>
  </div>;
}
