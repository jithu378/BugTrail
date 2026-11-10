import { severityClass, statusClass } from '../utils/constants.js';

export function SeverityBadge({ severity }) {
  return (
    <span className={`badge ${severityClass(severity)}`}>
      <span className="badge__dot" aria-hidden="true" />
      {severity}
    </span>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={`badge ${statusClass(status)}`}>
      <span className="badge__dot" aria-hidden="true" />
      {status}
    </span>
  );
}
