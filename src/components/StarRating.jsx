import './StarRating.css';

const STAR_SVG = (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width="14"
    height="14"
    aria-hidden="true"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export default function StarRating({
  rating = 0,
  count,
  countLabel,
  showNumber = true,
  size = 'normal',
  className = '',
}) {
  const numericRating = Number(rating) || 0;
  const clamped = Math.max(0, Math.min(5, numericRating));
  const percentage = (clamped / 5) * 100;
  const formattedRating = clamped.toFixed(1);

  const ariaLabel = count !== undefined
    ? `Rated ${formattedRating} out of 5 from ${count} reviews`
    : `Rated ${formattedRating} out of 5`;

  return (
    <div
      className={`star-rating-wrap ${size} ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <div className="star-track" aria-hidden="true">
        {/* Background empty stars */}
        <div className="stars-empty">
          {STAR_SVG}
          {STAR_SVG}
          {STAR_SVG}
          {STAR_SVG}
          {STAR_SVG}
        </div>
        {/* Filled stars clipped by exact percentage */}
        <div className="stars-fill" style={{ width: `${percentage}%` }}>
          <div className="stars-fill-inner">
            {STAR_SVG}
            {STAR_SVG}
            {STAR_SVG}
            {STAR_SVG}
            {STAR_SVG}
          </div>
        </div>
      </div>

      {showNumber && (
        <span className="star-number" aria-hidden="true">
          {formattedRating}
        </span>
      )}

      {count !== undefined && (
        <span className="star-count" aria-hidden="true">
          {countLabel ? `(${count} ${countLabel})` : `(${count})`}
        </span>
      )}
    </div>
  );
}
