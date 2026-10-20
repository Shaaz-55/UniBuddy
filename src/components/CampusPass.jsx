import { useState, useRef, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
import Badge from './Badge';
import { ShieldCheck } from 'lucide-react';
import './CampusPass.css';

export default function CampusPass({ className = '' }) {
  const cardRef = useRef(null);
  const [canTilt, setCanTilt] = useState(false);

  // Framer-motion smooth spring values for cursor tilt
  const springConfig = { stiffness: 300, damping: 25 };
  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);

  useEffect(() => {
    // Only enable interactive tilt for fine pointers (mouse) and when prefers-reduced-motion is false
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setCanTilt(finePointer && !reducedMotion);
  }, []);

  const handleMouseMove = (e) => {
    if (!canTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normalizedX = (x / rect.width - 0.5) * 2; // -1 to 1
    const normalizedY = (y / rect.height - 0.5) * 2; // -1 to 1

    // Max 6 degrees tilt
    rotateX.set(-normalizedY * 6);
    rotateY.set(normalizedX * 6);
  };

  const handleMouseLeave = () => {
    if (!canTilt) return;
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div
      className={`campus-pass-wrapper ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={cardRef}
        className="campus-pass-card"
        style={{
          rotateX: canTilt ? rotateX : 0,
          rotateY: canTilt ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Subtle glass highlight reflection & mango glow */}
        <div className="campus-pass-glass-sheen" aria-hidden="true" />
        <div className="campus-pass-mango-glow" aria-hidden="true" />

        {/* Top Header Row */}
        <div className="campus-pass-top">
          <div className="campus-pass-brand-label">
            <span className="brand-dot" />
            <span>UNIBUDDY CAMPUS PASS</span>
          </div>
          <Badge variant="glass" icon={ShieldCheck} className="campus-pass-badge">
            Verified senior
          </Badge>
        </div>

        {/* Holder Name */}
        <div className="campus-pass-holder-section">
          <span className="campus-pass-label">Holder</span>
          <h2 className="campus-pass-holder-name">Aarav Mehta</h2>
        </div>

        <div className="campus-pass-divider" />

        {/* 2x2 Field Grid */}
        <div className="campus-pass-grid">
          <div className="grid-cell">
            <span className="cell-label">College</span>
            <span className="cell-value">IIT Bombay</span>
          </div>
          <div className="grid-cell">
            <span className="cell-label">Subject</span>
            <span className="cell-value">DSA Interview Prep</span>
          </div>
          <div className="grid-cell">
            <span className="cell-label">Session fee</span>
            <span className="cell-value">₹249 / 30 min</span>
          </div>
          <div className="grid-cell">
            <span className="cell-label">Valid</span>
            <span className="cell-value">Book anytime this week</span>
          </div>
        </div>

        {/* Floating Sticker Pill overlapping bottom edge */}
        <div className="campus-pass-floating-pill" aria-label="Rating 4.9 from 41 sessions">
          <span className="star-icon">⭐</span>
          <span className="pill-text">4.9 · 41 sessions</span>
        </div>
      </motion.div>
    </div>
  );
}
