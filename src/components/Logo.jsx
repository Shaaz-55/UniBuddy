import './Logo.css';

export default function Logo({ size = 'medium', className = '' }) {
  return (
    <div className={`unibuddy-logo ${size} ${className}`}>
      <span className="logo-mark" aria-hidden="true" />
      <span className="logo-wordmark">UniBuddy</span>
    </div>
  );
}
