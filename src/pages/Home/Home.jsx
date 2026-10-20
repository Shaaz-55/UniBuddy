import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Flag,
  UserCheck,
  MapPin,
  Sparkles,
  Heart,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CampusPass from '../../components/CampusPass';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import SkillTag from '../../components/SkillTag';
import StarRating from '../../components/StarRating';
import RevealOnScroll from '../../components/RevealOnScroll';
import './Home.css';

export default function Home() {
  const { isAuthenticated, openRegisterModal, openSeniorModal } = useAuth();

  return (
    <div className="home-page">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        {/* Soft Golden Hour Glow Blobs */}
        <div className="golden-hour-glow" aria-hidden="true">
          <div className="glow-blob glow-indigo" />
          <div className="glow-blob glow-pink" />
          <div className="glow-blob glow-mango" />
        </div>

        <div className="wrap hero-grid">
          {/* Left: Content */}
          <div className="hero-content">
            <div className="hero-eyebrow-row">
              <span className="eyebrow-tag">
                <span className="eyebrow-dot" />
                Newton School of Technology &amp; beyond
              </span>
              <span className="hero-sticker-pill">
                Seedhi baat, seniors se ✌️
              </span>
            </div>

            <h1 className="hero-headline">
              Your campus didn&apos;t teach you{' '}
              <span className="gradient-text">everything.</span>
            </h1>

            <p className="hero-lede">
              Book a real conversation with a verified senior from a college that
              did, for the price of a canteen meal, not a course fee.
            </p>

            {/* CTAs */}
            <div className="hero-ctas">
              {isAuthenticated ? (
                <Link to="/mentors" className="btn-primary hero-main-btn">
                  <span>Go to mentors</span>
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-primary hero-main-btn"
                    onClick={openRegisterModal}
                  >
                    <span>Register as a Junior</span>
                    <ArrowRight size={18} />
                  </button>
                  <button
                    type="button"
                    className="btn-secondary hero-sec-btn"
                    onClick={openSeniorModal}
                  >
                    Register as a Senior
                  </button>
                </>
              )}
            </div>

            {/* Stats Scorecard */}
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">412</span>
                <span className="stat-label">sessions held</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-number">96%</span>
                <span className="stat-label">show-up rate</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-number">18</span>
                <span className="stat-label">colleges live</span>
              </div>
            </div>
          </div>

          {/* Right: Interactive Campus Pass */}
          <div className="hero-pass-col">
            <CampusPass />
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM */}
      <section id="problem" className="section-padding">
        <div className="wrap">
          <RevealOnScroll>
            <div className="section-head">
              <span className="section-pill-tag">The problem</span>
              <h2 className="section-title">Why juniors get stuck</h2>
            </div>
          </RevealOnScroll>

          <div className="problem-grid">
            <RevealOnScroll delay={100}>
              <Card className="problem-card">
                <span className="problem-card-badge tint-mint">
                  EXCUSE ON CAMPUS
                </span>
                <h3 className="problem-card-title">“Seniors se pooch lo”</h3>
                <p className="problem-card-desc">
                  Works fine until your seniors are figuring it out at the same pace
                  you are.
                </p>
              </Card>
            </RevealOnScroll>

            <RevealOnScroll delay={200}>
              <Card className="problem-card">
                <span className="problem-card-badge tint-sky">
                  EXCUSE ONLINE
                </span>
                <h3 className="problem-card-title">“YouTube pe dekh lo”</h3>
                <p className="problem-card-desc">
                  Nobody on YouTube can look at your specific resume and tell you
                  what&apos;s actually wrong with it.
                </p>
              </Card>
            </RevealOnScroll>

            <RevealOnScroll delay={300}>
              <Card className="problem-card">
                <span className="problem-card-badge tint-pink">
                  EXCUSE FROM CONSULTANTS
                </span>
                <h3 className="problem-card-title">“₹5,000 ka package le lo”</h3>
                <p className="problem-card-desc">
                  You wanted one honest 30-minute conversation, not a retainer.
                </p>
              </Card>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="section-padding section-alt">
        <div className="wrap">
          <RevealOnScroll>
            <div className="section-head">
              <span className="section-pill-tag">How it works</span>
              <h2 className="section-title">Three steps to clarity</h2>
            </div>
          </RevealOnScroll>

          <div className="steps-grid">
            <RevealOnScroll delay={100}>
              <Card className="step-card">
                <div className="step-number">01</div>
                <h3 className="step-title">
                  Sign up with your college email
                </h3>
                <p className="step-desc">
                  Create your instant campus pass in two minutes with your verified
                  student identity.
                </p>
              </Card>
            </RevealOnScroll>

            <RevealOnScroll delay={200}>
              <Card className="step-card">
                <div className="step-number">02</div>
                <h3 className="step-title">
                  Find a senior who has done what you want to do
                </h3>
                <p className="step-desc">
                  Search by specific skill, target company or college. Message
                  first for free, book for the price of a canteen meal.
                </p>
              </Card>
            </RevealOnScroll>

            <RevealOnScroll delay={300}>
              <Card className="step-card">
                <div className="step-number">03</div>
                <h3 className="step-title">
                  Explore your campus map and watch stories from your college
                </h3>
                <p className="step-desc">
                  Discover student-vetted campus spots for late-night food, study
                  rooms and stay connected with real student stories.
                </p>
              </Card>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 4. EVERYTHING IN ONE APP */}
      <section id="features" className="section-padding">
        <div className="wrap">
          <RevealOnScroll>
            <div className="section-head">
              <span className="section-pill-tag">Platform</span>
              <h2 className="section-title">Everything in one app</h2>
            </div>
          </RevealOnScroll>

          <div className="features-grid">
            {/* Panel 1: Mini Mentor Card Preview */}
            <RevealOnScroll delay={100}>
              <Card className="feature-panel">
                <div className="feature-panel-meta">
                  <span className="feature-category">MENTORSHIP</span>
                  <h3 className="feature-title">Book verified seniors</h3>
                  <p className="feature-desc">
                    Proof-of-skill profiles, verified enrollment, transparent
                    reviews and affordable 30-min call bookings.
                  </p>
                </div>
                {/* Mini Preview Component */}
                <div className="feature-preview-wrap">
                  <div className="mini-mentor-card">
                    <div className="mini-mentor-top">
                      <div className="mini-avatar">AM</div>
                      <div>
                        <div className="mini-name">Aarav Mehta</div>
                        <div className="mini-college">IIT Bombay · 3rd yr</div>
                      </div>
                      <Badge variant="verified" icon={UserCheck} className="mini-badge">
                        College verified
                      </Badge>
                    </div>
                    <div className="mini-skills">
                      <SkillTag name="DSA" index={0} />
                      <SkillTag name="Interview Prep" index={1} />
                      <SkillTag name="Java" index={2} />
                    </div>
                    <div className="mini-foot">
                      <StarRating rating={4.9} count={41} size="compact" />
                      <span className="mini-price">₹249 / call</span>
                    </div>
                  </div>
                </div>
              </Card>
            </RevealOnScroll>

            {/* Panel 2: Mini Map Preview */}
            <RevealOnScroll delay={200}>
              <Card className="feature-panel">
                <div className="feature-panel-meta">
                  <span className="feature-category">CAMPUS GUIDE</span>
                  <h3 className="feature-title">Vetted campus map</h3>
                  <p className="feature-desc">
                    Know the real spots around campus: 2am Maggi points, 24x7
                    pharmacies, quiet study rooms and cheap xerox spots.
                  </p>
                </div>
                {/* Mini Map Canvas with CSS shapes & colored pins */}
                <div className="feature-preview-wrap">
                  <div className="mini-map-preview" aria-hidden="true">
                    <div className="mini-map-grid-lines" />
                    <div className="mini-map-block block-main">MAIN BLOCK</div>
                    <div className="mini-map-block block-hostel">HOSTEL C</div>
                    <div className="mini-map-pin pin-center">
                      <div className="pin-pulse" />
                      <MapPin size={18} />
                    </div>
                    <div className="mini-map-pin pin-food" title="Blue Tokai">
                      <span className="dot-label">Blue Tokai</span>
                    </div>
                    <div className="mini-map-pin pin-study" title="Sri Xerox">
                      <span className="dot-label">Sri Xerox</span>
                    </div>
                    <div className="mini-map-pin pin-stay" title="Shanti PG">
                      <span className="dot-label">Shanti PG</span>
                    </div>
                    <div className="mini-map-pin pin-gym" title="Iron Gym">
                      <span className="dot-label">Iron Gym</span>
                    </div>
                  </div>
                </div>
              </Card>
            </RevealOnScroll>

            {/* Panel 3: Mini Stories Preview */}
            <RevealOnScroll delay={300}>
              <Card className="feature-panel">
                <div className="feature-panel-meta">
                  <span className="feature-category">CAMPUS STORIES</span>
                  <h3 className="feature-title">Real campus moments</h3>
                  <p className="feature-desc">
                    Catch uncurated campus life, hackathon wins, fest prep and
                    exam all-nighters from students at your college.
                  </p>
                </div>
                {/* Mini Stacked Story Cards */}
                <div className="feature-preview-wrap">
                  <div className="mini-stories-stack" aria-hidden="true">
                    <div className="mini-story-card card-back-2" />
                    <div className="mini-story-card card-back-1" />
                    <div className="mini-story-card card-front">
                      <div className="mini-story-header">
                        <div className="mini-story-avatar">PS</div>
                        <span className="mini-story-author">Priya Sharma</span>
                      </div>
                      <div className="mini-story-caption">
                        First hackathon win 🏆
                      </div>
                      <div className="mini-story-heart">
                        <Heart size={20} fill="#FF3D77" color="#FF3D77" />
                        <span>156 likes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 5. TRUST STRIP */}
      <section id="safety" className="section-padding section-alt">
        <div className="wrap">
          <RevealOnScroll>
            <div className="section-head text-center">
              <span className="section-pill-tag">Built in, not bolted on</span>
              <h2 className="section-title">
                Every stamp on this app means something
              </h2>
            </div>
          </RevealOnScroll>

          <div className="trust-grid">
            <RevealOnScroll delay={100}>
              <Card className="trust-card">
                <div className="trust-icon-circle tint-mint">
                  <ShieldCheck size={26} strokeWidth={2} />
                </div>
                <Badge variant="verified" className="trust-badge">
                  COLLEGE VERIFIED
                </Badge>
                <h3 className="trust-title">Real identity only.</h3>
                <p className="trust-desc">
                  No anonymous accounts, anywhere in the app, ever.
                </p>
              </Card>
            </RevealOnScroll>

            <RevealOnScroll delay={200}>
              <Card className="trust-card">
                <div className="trust-icon-circle tint-indigo">
                  <CreditCard size={26} strokeWidth={2} />
                </div>
                <Badge variant="default" className="trust-badge">
                  PAYMENT HELD
                </Badge>
                <h3 className="trust-title">
                  Money held till the call happens.
                </h3>
                <p className="trust-desc">
                  Your fee is released to the mentor only after the session is
                  confirmed complete.
                </p>
              </Card>
            </RevealOnScroll>

            <RevealOnScroll delay={300}>
              <Card className="trust-card">
                <div className="trust-icon-circle tint-pink">
                  <Flag size={26} strokeWidth={2} />
                </div>
                <Badge variant="default" className="trust-badge">
                  REPORT IN 1 TAP
                </Badge>
                <h3 className="trust-title">Reviewed within 24 hours.</h3>
                <p className="trust-desc">
                  Every profile, post and session has a report button that goes to
                  a real person.
                </p>
              </Card>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA BAND */}
      {!isAuthenticated && (
        <section className="section-padding final-cta-section">
          <div className="wrap">
            <RevealOnScroll>
              <Card className="final-cta-card">
                <div className="final-cta-header">
                  <h2 className="final-cta-title">
                    Applications open. Apna pass banao.
                  </h2>
                  <p className="final-cta-subtitle">
                    Get on the waitlist for your campus. Mentors and juniors both
                    welcome.
                  </p>
                </div>

                <div className="role-cards-grid">
                  <div className="role-card">
                    <span className="role-tag">FOR JUNIORS</span>
                    <h3 className="role-title">Junior Pass</h3>
                    <p className="role-desc">
                      Guidance chahiye? Seniors yahin hain.
                    </p>
                    <button
                      type="button"
                      className="btn-primary role-cta-btn"
                      onClick={openRegisterModal}
                    >
                      <span>Register as Junior</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className="role-card role-senior">
                    <span className="role-tag">FOR SENIORS</span>
                    <h3 className="role-title">Senior Network</h3>
                    <p className="role-desc">
                      Apna experience share karo, juniors ki help karo.
                    </p>
                    <button
                      type="button"
                      className="btn-secondary role-cta-btn"
                      onClick={openSeniorModal}
                    >
                      <span>Register as Senior</span>
                      <Sparkles size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            </RevealOnScroll>
          </div>
        </section>
      )}
    </div>
  );
}
