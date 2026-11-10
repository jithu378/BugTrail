export const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
export const STATUSES = ['Open', 'In Progress', 'Resolved'];

export const STATUS_SLUGS = {
  Open: 'open',
  'In Progress': 'in-progress',
  Resolved: 'resolved',
};

export function severityClass(severity) {
  return `badge--sev-${String(severity).toLowerCase()}`;
}

export function statusClass(status) {
  return `badge--status-${STATUS_SLUGS[status] || 'open'}`;
}
