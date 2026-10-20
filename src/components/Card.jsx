import './Card.css';

export default function Card({
  children,
  className = '',
  onClick,
  hoverable = true,
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      className={`golden-card ${hoverable ? 'hoverable' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
}
