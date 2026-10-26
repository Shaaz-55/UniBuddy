export default function StudentAvatar({
  profile,
  size = 'medium'
}) {
  const initials = (profile?.name || 'UniBuddy').trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
  return <span className={`student-avatar avatar-${size}`} style={{
    background: profile?.gradient || 'var(--avatar-indigo)'
  }} aria-hidden="true">
    {initials}
  </span>;
}
