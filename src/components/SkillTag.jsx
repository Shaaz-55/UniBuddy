import './SkillTag.css';

const TINT_TYPES = ['indigo', 'pink', 'mango', 'mint', 'sky'];

export default function SkillTag({ name, index = 0, className = '' }) {
  // Deterministic tint selection based on index or string hash
  let tintIndex = index;
  if (typeof index !== 'number' || index === 0) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash + name.charCodeAt(i)) % TINT_TYPES.length;
    }
    tintIndex = hash;
  }
  const tint = TINT_TYPES[Math.abs(tintIndex) % TINT_TYPES.length];

  return (
    <span className={`skill-tag skill-tag-${tint} ${className}`}>
      {name}
    </span>
  );
}
