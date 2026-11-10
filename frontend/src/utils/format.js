const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const TIME_UNITS = [
  ['year', 31_536_000_000],
  ['month', 2_592_000_000],
  ['week', 604_800_000],
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
];

export function timeAgo(value) {
  if (!value) return '';
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return '';

  const difference = timestamp - Date.now();
  const absolute = Math.abs(difference);

  for (const [unit, milliseconds] of TIME_UNITS) {
    if (absolute >= milliseconds) {
      return relativeFormatter.format(Math.round(difference / milliseconds), unit);
    }
  }

  return 'just now';
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function firstName(name = '') {
  return String(name).trim().split(/\s+/)[0] || 'there';
}

export function truncate(text = '', max = 90) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}
