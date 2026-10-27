import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, LoaderCircle } from 'lucide-react';
import Modal from '../../components/Modal';
import { MAX_STORY_MEDIA_SIZE, savePostedStory } from '../../lib/stories';

export default function StoryComposer({ user, onClose, onPost }) {
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isMediaReady, setIsMediaReady] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!media) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(media);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [media]);

  const handleClose = useCallback(() => {
    if (!isPosting) onClose();
  }, [isPosting, onClose]);

  const handleChooseMedia = event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setIsMediaReady(false);
    setError('');

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setMedia(null);
      setError('Choose a photo or video for your story.');
      return;
    }
    if (file.size > MAX_STORY_MEDIA_SIZE) {
      setMedia(null);
      setError('Choose a photo or video smaller than 20 MB.');
      return;
    }
    setMedia(file);
  };

  const handleMediaError = () => {
    setIsMediaReady(false);
    setError('This file could not be opened. Try another photo or video.');
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (!media || !isMediaReady || isPosting) return;
    setIsPosting(true);
    setError('');
    try {
      const story = await savePostedStory({ media, caption, user });
      onPost(story);
      onClose();
    } catch {
      setError('Your story could not be saved. Check that browser storage is available and try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Modal isOpen onClose={handleClose} title="Create a story" subtitle={`Share a moment from ${user.college}.`} maxWidth="460px">
      <form className="story-composer" onSubmit={handleSubmit} aria-busy={isPosting}>
        {previewUrl && media && (
          <div className="story-composer-preview">
            {media.type.startsWith('video/') ? (
              <video key={previewUrl} src={previewUrl} controls playsInline muted preload="auto" onLoadedData={() => setIsMediaReady(true)} onError={handleMediaError} aria-label="Story video preview" />
            ) : (
              <img key={previewUrl} src={previewUrl} alt="Your story preview" onLoad={() => setIsMediaReady(true)} onError={handleMediaError} />
            )}
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleChooseMedia} hidden aria-label="Choose story photo or video" disabled={isPosting} />
        <button type="button" className="story-media-picker" onClick={() => fileInputRef.current?.click()} disabled={isPosting}>
          <ImagePlus size={24} />
          <span>{media ? 'Change photo or video' : 'Choose a photo or video'}</span>
          <small>Up to 20 MB</small>
        </button>
        <label className="story-caption-label" htmlFor="story-caption">Caption <span>(optional)</span></label>
        <textarea id="story-caption" className="story-caption-input" value={caption} onChange={event => setCaption(event.target.value)} placeholder="Add a caption…" maxLength={280} rows={3} disabled={isPosting} />
        {error && <p className="story-composer-error" role="alert">{error}</p>}
        <div className="story-composer-actions">
          <button type="submit" className="btn-primary story-post-btn" disabled={!media || !isMediaReady || isPosting}>
            {isPosting && <LoaderCircle size={16} className="story-post-spinner" />}
            {isPosting ? 'Sharing…' : 'Share story'}
          </button>
          <button type="button" className="story-cancel-btn" onClick={handleClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
