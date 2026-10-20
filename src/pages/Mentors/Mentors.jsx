import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  Star,
  UserCheck,
  Calendar,
  MessageSquare,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MENTORS } from '../../data/mentors';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import SkillTag from '../../components/SkillTag';
import StarRating from '../../components/StarRating';
import Drawer from '../../components/Drawer';
import './Mentors.css';

const QUICK_SKILLS = [
  'All',
  'DSA',
  'Web Dev',
  'UI/UX',
  'Machine Learning',
  'Placements',
  'Competitive Programming',
  'Cloud',
];

const ALL_SKILLS = [
  'All Skills',
  'DSA',
  'Interview Prep',
  'Java',
  'UI/UX',
  'Figma',
  'Portfolio Review',
  'React',
  'Full-Stack',
  'Resume Review',
  'Machine Learning',
  'Python',
  'Research',
  'Competitive Programming',
  'C++',
  'Codeforces',
  'Placements',
  'Aptitude',
  'HR Rounds',
  'Android',
  'Kotlin',
  'Data Analytics',
  'SQL',
  'Cloud',
  'AWS',
  'Cybersecurity',
  'Game Dev',
  'Product Management',
];

const ALL_COLLEGES = [
  'All Colleges',
  'IIT Bombay',
  'IIT Madras',
  'IIIT Hyderabad',
  'IIIT Delhi',
  'NIT Trichy',
  'BITS Pilani',
  'NIT Calicut',
  'VIT Vellore',
  'COEP Pune',
  'Delhi Technological University',
  'Jadavpur University',
  'NIT Surathkal',
];

export default function Mentors() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedCollege, setSelectedCollege] = useState('All Colleges');
  const [selectedYear, setSelectedYear] = useState('All');
  const [minRating4, setMinRating4] = useState(false);
  const [sortBy, setSortBy] = useState('top-rated');

  // Loading skeleton state
  const [isLoading, setIsLoading] = useState(true);

  // Active Profile Drawer state
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Debounce search query ~200ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Shimmer skeleton on first load ~400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Filter & Sort logic
  const filteredMentors = useMemo(() => {
    return MENTORS.filter((m) => {
      // Search query (name, skill, college)
      if (debouncedQuery.trim()) {
        const q = debouncedQuery.toLowerCase();
        const nameMatch = m.name.toLowerCase().includes(q);
        const collegeMatch = m.college.toLowerCase().includes(q);
        const skillMatch = m.skills.some((s) => s.toLowerCase().includes(q));
        if (!nameMatch && !collegeMatch && !skillMatch) return false;
      }

      // Quick skill or dropdown skill
      if (selectedSkill !== 'All' && selectedSkill !== 'All Skills') {
        const hasSkill = m.skills.some((s) =>
          s.toLowerCase().includes(selectedSkill.toLowerCase())
        );
        if (!hasSkill) return false;
      }

      // College filter
      if (selectedCollege !== 'All Colleges') {
        if (m.college !== selectedCollege) return false;
      }

      // Year filter
      if (selectedYear !== 'All') {
        if (m.year !== selectedYear) return false;
      }

      // Rating 4+ filter
      if (minRating4 && m.rating < 4.0) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'top-rated') return b.rating - a.rating;
      if (sortBy === 'most-reviewed') return b.reviewCount - a.reviewCount;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });
  }, [
    debouncedQuery,
    selectedSkill,
    selectedCollege,
    selectedYear,
    minRating4,
    sortBy,
  ]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSelectedSkill('All');
    setSelectedCollege('All Colleges');
    setSelectedYear('All');
    setMinRating4(false);
    setSortBy('top-rated');
  };

  const handleCardClick = (mentor) => {
    setSelectedMentor(mentor);
    setIsDrawerOpen(true);
  };

  const handleBookClick = (e) => {
    e.stopPropagation();
    showToast('Booking jaldi khulegi 🚀');
  };

  const handleMessageClick = (e) => {
    e.stopPropagation();
    showToast('Messaging jaldi khulegi 💬');
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Junior';

  return (
    <div className="mentors-page wrap">
      {/* 1. WELCOME STRIP */}
      <section className="mentors-welcome-strip">
        <h1 className="mentors-welcome-title">
          Hey {firstName}, find your senior
        </h1>
        <p className="mentors-welcome-sub">
          Kaunsa senior chahiye? Skill, college ya naam se dhundo.
        </p>

        {/* Large live search bar */}
        <div className="mentors-search-box">
          <Search size={20} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            className="mentors-search-input"
            placeholder="Search by name, skill or college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search mentors by name, skill, or college"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </section>

      {/* 2. FILTER CONTROLS */}
      <section className="mentors-controls-section" aria-label="Mentor filters">
        {/* Dropdown Filters & Rating Toggle */}
        <div className="filters-row">
          {/* Skill Select */}
          <div className="filter-select-wrap">
            <select
              value={selectedSkill === 'All' ? 'All Skills' : selectedSkill}
              onChange={(e) =>
                setSelectedSkill(
                  e.target.value === 'All Skills' ? 'All' : e.target.value
                )
              }
              className="filter-select"
              aria-label="Filter by skill"
            >
              {ALL_SKILLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* College Select */}
          <div className="filter-select-wrap">
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="filter-select"
              aria-label="Filter by college"
            >
              {ALL_COLLEGES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Year Select */}
          <div className="filter-select-wrap">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="filter-select"
              aria-label="Filter by year of study"
            >
              <option value="All">All Years</option>
              <option value="1st yr">1st yr</option>
              <option value="2nd yr">2nd yr</option>
              <option value="3rd yr">3rd yr</option>
              <option value="4th yr">4th yr</option>
            </select>
          </div>

          {/* Rating 4+ Toggle */}
          <button
            type="button"
            className={`filter-rating-toggle ${minRating4 ? 'active' : ''}`}
            onClick={() => setMinRating4((prev) => !prev)}
            aria-pressed={minRating4}
          >
            <Star
              size={15}
              fill={minRating4 ? 'var(--star-gold)' : 'none'}
              color="var(--star-gold)"
            />
            <span>Rating 4+</span>
          </button>

          {/* Sort Dropdown */}
          <div className="filter-select-wrap sort-select-wrap">
            <span className="sort-label">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select sort-select"
              aria-label="Sort mentors"
            >
              <option value="top-rated">Top rated</option>
              <option value="most-reviewed">Most reviewed</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Quick Skill Chips */}
        <div
          className="quick-skills-row"
          role="region"
          aria-label="Quick skill filter chips"
        >
          {QUICK_SKILLS.map((skill) => {
            const isSelected = selectedSkill === skill;
            return (
              <button
                type="button"
                key={skill}
                className={`quick-skill-chip ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedSkill(skill)}
              >
                {skill}
              </button>
            );
          })}
        </div>

        {/* Active Filter Chips & Results Count */}
        <div className="results-status-row">
          <span className="results-count-text">
            Showing {filteredMentors.length} mentor
            {filteredMentors.length === 1 ? '' : 's'}
          </span>

          {(selectedSkill !== 'All' ||
            selectedCollege !== 'All Colleges' ||
            selectedYear !== 'All' ||
            minRating4 ||
            debouncedQuery) && (
            <div className="active-filter-chips">
              {debouncedQuery && (
                <span className="active-chip">
                  &ldquo;{debouncedQuery}&rdquo;
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Remove search filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedSkill !== 'All' && selectedSkill !== 'All Skills' && (
                <span className="active-chip">
                  Skill: {selectedSkill}
                  <button
                    type="button"
                    onClick={() => setSelectedSkill('All')}
                    aria-label="Remove skill filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedCollege !== 'All Colleges' && (
                <span className="active-chip">
                  {selectedCollege}
                  <button
                    type="button"
                    onClick={() => setSelectedCollege('All Colleges')}
                    aria-label="Remove college filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedYear !== 'All' && (
                <span className="active-chip">
                  Year: {selectedYear}
                  <button
                    type="button"
                    onClick={() => setSelectedYear('All')}
                    aria-label="Remove year filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {minRating4 && (
                <span className="active-chip">
                  ★ 4.0+
                  <button
                    type="button"
                    onClick={() => setMinRating4(false)}
                    aria-label="Remove rating filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                type="button"
                className="clear-all-link"
                onClick={handleClearFilters}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. MENTORS GRID / SHIMMER / EMPTY STATE */}
      <section className="mentors-grid-section">
        {isLoading ? (
          // Shimmer Skeleton for ~400ms on first load
          <div className="mentors-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="mentor-card-skeleton">
                <div className="skeleton-avatar" />
                <div className="skeleton-lines">
                  <div className="skeleton-line title" />
                  <div className="skeleton-line sub" />
                </div>
                <div className="skeleton-line tag" />
                <div className="skeleton-line desc" />
                <div className="skeleton-line foot" />
              </div>
            ))}
          </div>
        ) : filteredMentors.length === 0 ? (
          // Empty State
          <div className="mentors-empty-state">
            <div className="empty-icon-circle">
              <Users size={32} />
            </div>
            <h3 className="empty-title">Koi senior nahi mila</h3>
            <p className="empty-text">Filters thode kam karke dekho.</p>
            <button
              type="button"
              className="btn-primary empty-action-btn"
              onClick={handleClearFilters}
            >
              Clear filters
            </button>
          </div>
        ) : (
          // Mentors Grid
          <div className="mentors-grid">
            {filteredMentors.map((mentor) => (
              <Card
                key={mentor.id}
                className="mentor-feed-card"
                onClick={() => handleCardClick(mentor)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(mentor);
                  }
                }}
                role="button"
                aria-label={`View profile of ${mentor.name}, ${mentor.college}`}
              >
                <div>
                  {/* Top Header: Avatar + College & Badge */}
                  <div className="mentor-card-top">
                    <div
                      className="mentor-squircle-avatar"
                      style={{ background: mentor.gradient }}
                      aria-hidden="true"
                    >
                      {mentor.initials}
                    </div>
                    <div className="mentor-meta-cluster">
                      <Badge variant="verified" icon={UserCheck}>
                        College verified
                      </Badge>
                      <span className="mentor-college-year">
                        {mentor.college} · {mentor.year}
                      </span>
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="mentor-card-name">{mentor.name}</h3>

                  {/* Skills */}
                  <div className="mentor-card-skills">
                    {mentor.skills.map((skill, idx) => (
                      <SkillTag key={skill} name={skill} index={idx} />
                    ))}
                  </div>

                  {/* Description */}
                  <p className="mentor-card-desc">{mentor.description}</p>

                  {/* Star Rating */}
                  <div className="mentor-card-rating">
                    <StarRating
                      rating={mentor.rating}
                      count={mentor.reviewCount}
                      countLabel="reviews"
                    />
                  </div>
                </div>

                {/* Footer Hairline + Price & Book CTA */}
                <div className="mentor-card-foot">
                  <div className="mentor-price-cluster">
                    <span className="price-val">₹{mentor.price}</span>
                    <span className="price-sub">per 30-min call</span>
                  </div>
                  <button
                    type="button"
                    className="btn-primary mentor-book-btn"
                    onClick={(e) => handleBookClick(e, mentor)}
                  >
                    Book
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* 4. MENTOR PROFILE DRAWER */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Mentor Profile"
        width="480px"
      >
        {selectedMentor && (
          <div className="mentor-drawer-detail">
            {/* Identity Header */}
            <div className="drawer-identity-row">
              <div
                className="drawer-large-avatar"
                style={{ background: selectedMentor.gradient }}
                aria-hidden="true"
              >
                {selectedMentor.initials}
              </div>
              <div>
                <h3 className="drawer-mentor-name">{selectedMentor.name}</h3>
                <p className="drawer-mentor-sub">
                  {selectedMentor.college} · {selectedMentor.branch} ·{' '}
                  {selectedMentor.year}
                </p>
                <div className="drawer-verified-sessions">
                  <Badge variant="verified" icon={UserCheck}>
                    College verified
                  </Badge>
                  <span className="sessions-count">
                    · {selectedMentor.sessionsCompleted} sessions completed
                  </span>
                </div>
              </div>
            </div>

            {/* Quote Block */}
            <blockquote className="drawer-quote-block">
              &ldquo;{selectedMentor.quote}&rdquo;
            </blockquote>

            {/* 3x2 Proof Highlights Grid */}
            <div className="drawer-proof-section">
              <h4 className="drawer-section-title">Proof of Skill</h4>
              <div className="drawer-proof-grid">
                <div className="proof-tile tile-1">
                  <span>DSA &amp; Algos</span>
                </div>
                <div className="proof-tile tile-2">
                  <span>Tier-1 Intern</span>
                </div>
                <div className="proof-tile tile-3">
                  <span>Resume Reviews</span>
                </div>
                <div className="proof-tile tile-4">
                  <span>Mock Calls</span>
                </div>
                <div className="proof-tile tile-5">
                  <span>System Design</span>
                </div>
                <div className="proof-tile tile-6">
                  <span>Alumni Network</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="drawer-skills-section">
              <h4 className="drawer-section-title">Core Mentorship Topics</h4>
              <div className="drawer-skills-list">
                {selectedMentor.skills.map((s, idx) => (
                  <SkillTag key={s} name={s} index={idx} />
                ))}
              </div>
            </div>

            {/* Recent Reviews with StarRating */}
            <div className="drawer-reviews-section">
              <div className="reviews-header-row">
                <h4 className="drawer-section-title">Recent reviews</h4>
                <StarRating
                  rating={selectedMentor.rating}
                  count={selectedMentor.reviewCount}
                  size="compact"
                />
              </div>

              <div className="drawer-reviews-list">
                {selectedMentor.reviews.map((rev, i) => (
                  <div key={i} className="drawer-review-card">
                    <div className="review-card-top">
                      <span className="reviewer-name">
                        {rev.reviewer}, {rev.college}
                      </span>
                      <StarRating
                        rating={rev.rating}
                        showNumber={false}
                        size="compact"
                      />
                    </div>
                    <p className="review-text">&ldquo;{rev.text}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fixed Action Buttons */}
            <div className="drawer-sticky-foot">
              <button
                type="button"
                className="btn-primary drawer-book-cta"
                onClick={(e) => handleBookClick(e, selectedMentor)}
              >
                <Calendar size={18} />
                <span>Book — ₹{selectedMentor.price}</span>
              </button>
              <button
                type="button"
                className="drawer-message-cta"
                onClick={handleMessageClick}
              >
                <MessageSquare size={18} />
                <span>Message first, free</span>
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
