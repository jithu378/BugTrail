import { SEVERITIES, STATUSES } from '../utils/constants.js';
import { Icon } from './Icons.jsx';

export default function BugFilters({
  search,
  onSearchChange,
  severity,
  status,
  project,
  projects,
  onFilterChange,
  onClear,
  hasFilters,
}) {
  return (
    <div className="filters" role="search" aria-label="Filter bug reports">
      <div className="select-field filters__search">
        <label htmlFor="bug-search">Search</label>
        <div className="input-with-icon">
          <Icon name="search" size={16} />
          <input
            id="bug-search"
            type="search"
            className="input"
            placeholder="Search by bug title…"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="select-field">
        <label htmlFor="filter-severity">Severity</label>
        <select
          id="filter-severity"
          className="select"
          value={severity}
          onChange={(event) => onFilterChange({ severity: event.target.value })}
        >
          <option value="">All severities</option>
          {SEVERITIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="select-field">
        <label htmlFor="filter-status">Status</label>
        <select
          id="filter-status"
          className="select"
          value={status}
          onChange={(event) => onFilterChange({ status: event.target.value })}
        >
          <option value="">All statuses</option>
          {STATUSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="select-field">
        <label htmlFor="filter-project">Project</label>
        <select
          id="filter-project"
          className="select"
          value={project}
          onChange={(event) => onFilterChange({ project: event.target.value })}
        >
          <option value="">All projects</option>
          {projects.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button type="button" className="btn btn--ghost btn--sm filters__clear" onClick={onClear}>
          <Icon name="close" size={14} />
          Clear
        </button>
      )}
    </div>
  );
}
