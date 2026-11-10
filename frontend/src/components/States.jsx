import { Icon } from './Icons.jsx';

export function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="state">
      <span className="state__icon">
        <Icon name={icon} size={24} />
      </span>
      <h2 className="state__title">{title}</h2>
      {description && <p className="state__text">{description}</p>}
      {action && <div className="state__actions">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="state" role="alert">
      <span className="state__icon state__icon--error">
        <Icon name="alert" size={24} />
      </span>
      <h2 className="state__title">{title}</h2>
      <p className="state__text">{message || 'The request could not be completed. Please try again.'}</p>
      {onRetry && (
        <div className="state__actions">
          <button type="button" className="btn btn--secondary" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
