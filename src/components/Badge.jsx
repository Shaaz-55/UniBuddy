import './Badge.css';

export default function Badge({
  icon: Icon,
  children,
  variant = 'default', // 'verified' | 'glass' | 'coming-soon' | 'default'
  className = '',
}) {
  return (
    <span className={`badge-pill badge-${variant} ${className}`}>
      {Icon && <Icon className="badge-icon" size={13} strokeWidth={2.2} />}
      <span className="badge-text">{children}</span>
    </span>
  );
}
