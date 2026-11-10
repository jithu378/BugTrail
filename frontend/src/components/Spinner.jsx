export function Spinner({ size = 'md', label = 'Loading' }) {
  return (
    <span
      className={`spinner${size === 'lg' ? ' spinner--lg' : ''}`}
      role="status"
      aria-label={label}
    />
  );
}
