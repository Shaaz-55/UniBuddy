import Logo from './Logo';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="unibuddy-footer">
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <Logo size="small" />
          <p className="footer-tagline">
            UniBuddy — campus mentorship, mapped and real.
          </p>
        </div>
        <div className="footer-meta">
          <span>Mockup for concept review · not a live product</span>
        </div>
      </div>
    </footer>
  );
}
