import { Link } from 'react-router-dom';
import { timeAgo, truncate } from '../utils/format.js';
import { SeverityBadge, StatusBadge } from './Badges.jsx';
import { Icon } from './Icons.jsx';

export default function BugList({ bugs, onDelete }) {
  return (
    <>
      <div className="table-wrap card">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Bug</th>
              <th scope="col">Project</th>
              <th scope="col">Severity</th>
              <th scope="col">Status</th>
              <th scope="col">Created</th>
              <th scope="col" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {bugs.map((bug) => (
              <tr key={bug._id}>
                <td className="table__bug">
                  <Link to={`/bugs/${bug._id}`} className="table__title">
                    {bug.title}
                  </Link>
                  <span className="table__sub">{truncate(bug.description, 86)}</span>
                </td>
                <td>
                  <span className="table__project">
                    <Icon name="folder" size={13} />
                    {bug.project}
                  </span>
                </td>
                <td>
                  <SeverityBadge severity={bug.severity} />
                </td>
                <td>
                  <StatusBadge status={bug.status} />
                </td>
                <td className="table__date">{timeAgo(bug.createdAt)}</td>
                <td>
                  <div className="row-actions">
                    <Link
                      to={`/bugs/${bug._id}`}
                      className="icon-btn"
                      aria-label={`View ${bug.title}`}
                      title="View"
                    >
                      <Icon name="eye" size={16} />
                    </Link>
                    <Link
                      to={`/bugs/${bug._id}/edit`}
                      className="icon-btn"
                      aria-label={`Edit ${bug.title}`}
                      title="Edit"
                    >
                      <Icon name="edit" size={16} />
                    </Link>
                    <button
                      type="button"
                      className="icon-btn icon-btn--danger"
                      onClick={() => onDelete(bug)}
                      aria-label={`Delete ${bug.title}`}
                      title="Delete"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bug-cards">
        {bugs.map((bug) => (
          <article key={bug._id} className="bug-card">
            <div className="bug-card__top">
              <Link to={`/bugs/${bug._id}`} className="bug-card__title">
                {bug.title}
              </Link>
              <SeverityBadge severity={bug.severity} />
            </div>
            <div className="bug-card__meta">
              <span className="bug-card__project">
                <Icon name="folder" size={13} />
                {bug.project}
              </span>
              <span aria-hidden="true">·</span>
              <span>{timeAgo(bug.createdAt)}</span>
              <StatusBadge status={bug.status} />
            </div>
            <div className="bug-card__actions">
              <Link to={`/bugs/${bug._id}`} className="btn btn--ghost btn--sm">
                <Icon name="eye" size={14} />
                View
              </Link>
              <Link to={`/bugs/${bug._id}/edit`} className="btn btn--ghost btn--sm">
                <Icon name="edit" size={14} />
                Edit
              </Link>
              <button
                type="button"
                className="btn btn--ghost btn--sm btn--danger-text"
                onClick={() => onDelete(bug)}
              >
                <Icon name="trash" size={14} />
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
