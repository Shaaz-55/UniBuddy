import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Send,
  Copy,
  ExternalLink,
  Flag,
  UserX,
  RotateCcw,
  Sparkles,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { STORIES } from '../../data/stories';
import { loadPostedStories } from '../../lib/stories';
import BottomSheet from '../../components/BottomSheet';
import StoryComposer from './StoryComposer';
import './Stories.css';

// Individual Swipeable Card
function StoryCard({
  story,
  isTop,
  index,
  collegeName,
  isMuted,
  onToggleMute,
  onDismiss,
  onLike,
  isLiked,
  likesCount,
  onOpenComments,
  onOpenShare,
  onOpenMore,
  onDoubleTap,
  showHeartPop,
}) {
  const [videoProgress, setVideoProgress] = useState(0);
  const [mediaError, setMediaError] = useState(false);
  const videoRef = useRef(null);

  // Drag Motion Values for swipe gesture
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-14, 14]);
  const skipOpacity = useTransform(x, [-120, -20], [1, 0]);
  const nextOpacity = useTransform(x, [20, 120], [0, 1]);

  // Video playback management: only top card plays
  useEffect(() => {
    if (story.type === 'video' && videoRef.current) {
      if (isTop) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          // Autoplay policy fallback
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isTop, story.type]);

  // Video time update for progress bar
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(prog);
    }
  };

  const handleDragEnd = (_, info) => {
    const swipeThreshold = 120;
    const velocityThreshold = 500;

    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      onDismiss('right');
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      onDismiss('left');
    }
  };

  // Stack positioning (scale down 4% and shift down 12px per depth index)
  const stackScale = 1 - index * 0.04;
  const stackTranslateY = index * 14;

  // Double tap detection
  const lastTapRef = useRef(0);
  const handleCardClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      onDoubleTap();
    }
    lastTapRef.current = now;
  };

  return (
    <motion.div
      className={`story-card-wrapper depth-${index} ${isTop ? 'is-top' : ''}`}
      style={{
        zIndex: 10 - index,
        scale: isTop ? undefined : stackScale,
        y: isTop ? undefined : stackTranslateY,
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={isTop ? handleDragEnd : undefined}
      onClick={handleCardClick}
    >
      <div className="story-card-inner">
        {/* Media Background */}
        <div className="story-media-layer">
          {story.type === 'image' || mediaError ? (
            <img
              src={mediaError ? undefined : story.src}
              alt={story.caption || `Story by ${story.authorName}`}
              className="story-media-content"
              draggable={false}
              loading="lazy"
              onError={() => setMediaError(true)}
              style={mediaError ? { background: story.poster } : undefined}
            />
          ) : (
            <video
              ref={videoRef}
              src={story.src}
              className="story-media-content"
              draggable={false}
              loop
              muted={isMuted}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onError={() => setMediaError(true)}
              poster={story.poster}
            />
          )}

          {/* Frosted Swipe Pills */}
          {isTop && (
            <>
              <motion.div
                className="swipe-indicator-pill skip-pill"
                style={{ opacity: skipOpacity }}
                aria-hidden="true"
              >
                SKIP
              </motion.div>
              <motion.div
                className="swipe-indicator-pill next-pill"
                style={{ opacity: nextOpacity }}
                aria-hidden="true"
              >
                NEXT
              </motion.div>
            </>
          )}

          {/* Double Tap Heart Pop Burst */}
          <AnimatePresence>
            {showHeartPop && (
              <motion.div
                className="heart-pop-burst"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                aria-hidden="true"
              >
                <Heart size={84} fill="var(--like)" color="var(--like)" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Top Progress Bar */}
        <div className="story-progress-bar-wrap">
          {story.type === 'video' ? (
            <div className="story-progress-track">
              <div
                className="story-progress-fill"
                style={{ width: `${videoProgress}%` }}
              />
            </div>
          ) : (
            <div className="story-progress-segments">
              <span className="segment filled" />
              <span className="segment filled" />
              <span className="segment active" />
            </div>
          )}
        </div>

        {/* Top Controls Row */}
        <div className="story-top-row">
          <span className="story-type-tag">
            {story.type === 'video' ? 'Video' : 'Photo'}
          </span>

          {story.type === 'video' && isTop && (
            <button
              type="button"
              className="story-mute-btn"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMute();
              }}
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          )}
        </div>

        {/* Bottom Content Scrim & Identity */}
        <div className="story-bottom-scrim">
          <div className="story-author-cluster">
            <div
              className="story-author-avatar"
              style={{ background: story.poster }}
              aria-hidden="true"
            >
              {story.authorInitials}
            </div>
            <div className="story-author-meta">
              <h3 className="story-author-name">{story.authorName}</h3>
              <span className="story-college-year">
                {collegeName} · {story.authorYear}
              </span>
            </div>
          </div>

          <p className="story-caption-text">{story.caption}</p>
        </div>

        {/* Action Rail (Overlaid on card right on mobile) */}
        <div
          className="story-action-rail"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Like Button */}
          <button
            type="button"
            className={`action-rail-btn ${isLiked ? 'liked' : ''}`}
            onClick={onLike}
            aria-label={isLiked ? 'Unlike story' : 'Like story'}
          >
            <Heart
              size={22}
              fill={isLiked ? 'var(--like)' : 'none'}
              color={isLiked ? 'var(--like)' : '#FFFFFF'}
              className="heart-icon"
            />
            <span className="action-count">{likesCount}</span>
          </button>

          {/* Comment Button */}
          <button
            type="button"
            className="action-rail-btn"
            onClick={onOpenComments}
            aria-label={`View comments (${story.comments.length})`}
          >
            <MessageCircle size={22} color="#FFFFFF" />
            <span className="action-count">{story.comments.length}</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            className="action-rail-btn"
            onClick={onOpenShare}
            aria-label="Share story"
          >
            <Share2 size={22} color="#FFFFFF" />
            <span className="action-count">Share</span>
          </button>

          {/* More Options Button */}
          <button
            type="button"
            className="action-rail-btn"
            onClick={onOpenMore}
            aria-label="More options"
          >
            <MoreVertical size={20} color="#FFFFFF" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Stories() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const collegeName = user?.college || 'IIT Bombay';

  // Posted stories appear before the existing campus story stack.
  const [storiesList, setStoriesList] = useState(STORIES);
  const [topIndex, setTopIndex] = useState(0);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const postedMediaUrls = useRef(new Set());

  useEffect(() => {
    let cancelled = false;
    const urls = postedMediaUrls.current;
    setIsLoadingPosts(true);
    setStoriesList(STORIES);
    setTopIndex(0);
    loadPostedStories(collegeName).then(stories => {
      if (cancelled) return;
      const posted = stories.map(story => {
        const src = URL.createObjectURL(story.media);
        urls.add(src);
        return { ...story, src };
      });
      setStoriesList([...posted, ...STORIES]);
    }).catch(() => {
      if (!cancelled) showToast('Saved stories could not be loaded from this browser.');
    }).finally(() => {
      if (!cancelled) setIsLoadingPosts(false);
    });
    return () => {
      cancelled = true;
      urls.forEach(url => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, [collegeName, showToast]);

  const closeComposer = useCallback(() => setIsComposerOpen(false), []);
  const handleStoryPosted = story => {
    const src = URL.createObjectURL(story.media);
    postedMediaUrls.current.add(src);
    setStoriesList(current => [{ ...story, src }, ...current]);
    setTopIndex(0);
    showToast('Your story has been shared!');
  };

  // Per-story likes state & comments state
  const [storyLikes, setStoryLikes] = useState(() => {
    const initial = {};
    STORIES.forEach((s) => {
      initial[s.id] = { liked: false, count: s.likes };
    });
    return initial;
  });

  const [storyComments, setStoryComments] = useState(() => {
    const initial = {};
    STORIES.forEach((s) => {
      initial[s.id] = [...s.comments];
    });
    return initial;
  });

  // Global sound toggle for top video
  const [isMuted, setIsMuted] = useState(true);

  // Transient Heart pop animation on double-tap
  const [showHeartPop, setShowHeartPop] = useState(false);

  // Active BottomSheets: Comments, Share, More
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  // The active story is storiesList[topIndex]
  const currentStory = storiesList[topIndex] || null;

  // Dismiss card left or right
  const handleDismiss = useCallback(() => {
    setTopIndex((prev) => prev + 1);
  }, []);

  // Restore full stack
  const handleResetStack = () => {
    setTopIndex(0);
  };

  // Like Toggle Handler
  const handleLikeToggle = useCallback(() => {
    if (!currentStory) return;
    const storyId = currentStory.id;
    setStoryLikes((prev) => {
      const item = prev[storyId] || { liked: false, count: currentStory.likes };
      const nextLiked = !item.liked;
      const nextCount = nextLiked ? item.count + 1 : item.count - 1;
      return {
        ...prev,
        [storyId]: { liked: nextLiked, count: nextCount },
      };
    });
  }, [currentStory]);

  // Double Tap Handler (only likes, never un-likes)
  const handleDoubleTap = useCallback(() => {
    if (!currentStory) return;
    const storyId = currentStory.id;
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 550);

    setStoryLikes((prev) => {
      const item = prev[storyId] || { liked: false, count: currentStory.likes };
      if (!item.liked) {
        return {
          ...prev,
          [storyId]: { liked: true, count: item.count + 1 },
        };
      }
      return prev;
    });
  }, [currentStory]);

  // Keyboard navigation: Left/Right arrows, 'L' for like
  useEffect(() => {
    if (isComposerOpen) return;
    const handleKeyDown = (e) => {
      // Don't intercept if an input is active
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleDismiss('right');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleDismiss('left');
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleLikeToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDismiss, handleLikeToggle, isComposerOpen]);

  // Add Comment Handler
  const handleSendComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentStory) return;

    const newComment = {
      id: `c-${Date.now()}`,
      name: user?.name || 'Rahul Verma',
      text: newCommentText.trim(),
    };

    setStoryComments((prev) => ({
      ...prev,
      [currentStory.id]: [newComment, ...(prev[currentStory.id] || [])],
    }));

    setNewCommentText('');
  };

  // Share handlers
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      // Fallback
    }
    showToast('Link copy ho gaya ✅');
    setIsShareOpen(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share && currentStory) {
      try {
        await navigator.share({
          title: `UniBuddy Stories — ${currentStory.caption}`,
          text: `Check out this story from ${collegeName} on UniBuddy!`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    }
  };

  const handleReport = () => {
    setIsMoreOpen(false);
    showToast('Reported. A person will review it within 24 hours.');
  };

  const handleMuteAuthor = () => {
    setIsMoreOpen(false);
    showToast(`Author ${currentStory?.authorName || ''} muted.`);
  };

  // Visible stories: up to 3 cards (top card plus up to 2 behind it)
  const visibleCards = storiesList.slice(topIndex, topIndex + 3);

  return (
    <div className="stories-page">
      {/* Accessible aria-live screen-reader announcement */}
      <div className="stories-announcement" aria-live="polite" aria-atomic="true">
        {currentStory
          ? `Now viewing story by ${currentStory.authorName}: ${currentStory.caption}`
          : 'All stories viewed.'}
      </div>

      {/* Ambient Radial Glow */}
      <div className="stories-ambient-glow" aria-hidden="true">
        <div className="glow-circle glow-stories-indigo" />
        <div className="glow-circle glow-stories-pink" />
      </div>

      <div className="stories-viewport wrap">
        {visibleCards.length === 0 ? (
          // Empty State
          <div className="stories-empty-state">
            <div className="stories-empty-icon-circle">
              <Sparkles size={36} color="var(--primary)" />
            </div>
            <h2 className="stories-empty-title">Sab dekh liya! 🎉</h2>
            <p className="stories-empty-text">
              You&apos;ve seen every story from your college.
            </p>
            <button
              type="button"
              className="btn-primary stories-phir-btn"
              onClick={handleResetStack}
            >
              <RotateCcw size={16} />
              <span>Phir se dekho</span>
            </button>
          </div>
        ) : (
          <div className="stories-deck-container">
            {/* The Stack */}
            <div className="stories-cards-stack">
              {visibleCards.map((story, i) => {
                const isTop = i === 0;
                const likesInfo = storyLikes[story.id] || {
                  liked: false,
                  count: story.likes,
                };
                const comments = storyComments[story.id] || story.comments;

                return (
                  <StoryCard
                    key={story.id}
                    story={{ ...story, comments }}
                    isTop={isTop}
                    index={i}
                    collegeName={collegeName}
                    isMuted={isMuted}
                    onToggleMute={() => setIsMuted((m) => !m)}
                    onDismiss={handleDismiss}
                    onLike={handleLikeToggle}
                    isLiked={likesInfo.liked}
                    likesCount={likesInfo.count}
                    onOpenComments={() => setIsCommentsOpen(true)}
                    onOpenShare={() => setIsShareOpen(true)}
                    onOpenMore={() => setIsMoreOpen(true)}
                    onDoubleTap={handleDoubleTap}
                    showHeartPop={isTop && showHeartPop}
                  />
                );
              })}
            </div>

          </div>
        )}

        {/* Keep the create button centered below the media, including the empty state. */}
        <div className="stories-bottom-controls">
          <div className="stories-nav-arrows">
            {currentStory && (
              <button
                type="button"
                className="nav-arrow-btn"
                onClick={() => handleDismiss('left')}
                title="Previous / Skip (Left Arrow)"
                aria-label="Skip to previous story"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <button
              type="button"
              className="story-create-btn"
              onClick={() => setIsComposerOpen(true)}
              aria-label="Post a story"
              aria-haspopup="dialog"
              title="Post a story"
              disabled={isLoadingPosts}
            >
              <Plus size={28} strokeWidth={2.25} />
            </button>

            {currentStory && (
              <button
                type="button"
                className="nav-arrow-btn"
                onClick={() => handleDismiss('right')}
                title="Next (Right Arrow)"
                aria-label="Next story"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {currentStory && (
            <p className="stories-hint-deck">
              Swipe karo · Double-tap se like ❤️
            </p>
          )}
        </div>
      </div>

      {isComposerOpen && <StoryComposer user={user} onClose={closeComposer} onPost={handleStoryPosted} />}

      {/* 1. COMMENTS BOTTOM SHEET */}
      <BottomSheet
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        title={`Comments (${currentStory ? (storyComments[currentStory.id] || []).length : 0})`}
        maxHeight="75vh"
      >
        <div className="comments-sheet-body">
          {/* Comments List */}
          <div className="comments-list">
            {(currentStory ? storyComments[currentStory.id] || [] : []).map(
              (c) => (
                <div key={c.id} className="comment-item">
                  <div className="comment-avatar">
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="comment-content">
                    <span className="comment-author">{c.name}</span>
                    <p className="comment-text">{c.text}</p>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Add Comment Input Bar */}
          <form onSubmit={handleSendComment} className="comment-input-form">
            <input
              type="text"
              placeholder="Kuch toh bolo…"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="comment-input"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="comment-send-btn"
              aria-label="Send comment"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </BottomSheet>

      {/* 2. SHARE BOTTOM SHEET */}
      <BottomSheet
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Share Story"
      >
        <div className="share-sheet-body">
          <button
            type="button"
            className="share-action-row"
            onClick={handleCopyLink}
          >
            <div className="share-icon-circle">
              <Copy size={20} />
            </div>
            <div className="share-text-meta">
              <span className="share-title">Copy Link</span>
              <span className="share-sub">Copy story link to clipboard</span>
            </div>
          </button>

          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              type="button"
              className="share-action-row"
              onClick={handleNativeShare}
            >
              <div className="share-icon-circle">
                <ExternalLink size={20} />
              </div>
              <div className="share-text-meta">
                <span className="share-title">Share via…</span>
                <span className="share-sub">Use device share sheet</span>
              </div>
            </button>
          )}

          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Check out this story from ${collegeName} on UniBuddy! ${window.location.href}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-action-row"
            onClick={() => setIsShareOpen(false)}
          >
            <div className="share-icon-circle" style={{ background: '#25D366', color: '#fff' }}>
              <span>WA</span>
            </div>
            <div className="share-text-meta">
              <span className="share-title">WhatsApp</span>
              <span className="share-sub">Send to friends or college group</span>
            </div>
          </a>

          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this story on UniBuddy!`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-action-row"
            onClick={() => setIsShareOpen(false)}
          >
            <div className="share-icon-circle" style={{ background: '#0088cc', color: '#fff' }}>
              <span>TG</span>
            </div>
            <div className="share-text-meta">
              <span className="share-title">Telegram</span>
              <span className="share-sub">Share on student channels</span>
            </div>
          </a>

          <a
            href={`mailto:?subject=${encodeURIComponent(`Campus story on UniBuddy`)}&body=${encodeURIComponent(`Check this out: ${window.location.href}`)}`}
            className="share-action-row"
            onClick={() => setIsShareOpen(false)}
          >
            <div className="share-icon-circle">
              <span>@</span>
            </div>
            <div className="share-text-meta">
              <span className="share-title">Email</span>
              <span className="share-sub">Send story via email</span>
            </div>
          </a>
        </div>
      </BottomSheet>

      {/* 3. MORE SHEET */}
      <BottomSheet
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        title="More Options"
      >
        <div className="more-sheet-body">
          <button
            type="button"
            className="more-action-item report-action"
            onClick={handleReport}
          >
            <Flag size={18} />
            <span>Report Story</span>
          </button>
          <button
            type="button"
            className="more-action-item"
            onClick={handleMuteAuthor}
          >
            <UserX size={18} />
            <span>Mute this author</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
