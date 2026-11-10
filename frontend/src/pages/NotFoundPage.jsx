import { Link } from 'react-router-dom';
import { Icon } from '../components/Icons.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <div className="not-found">
      <p className="not-found__code">404</p>
      <h1>You&apos;ve wandered off the trail</h1>
      <p>The page you are looking for does not exist, or it has been moved.</p>
      <div className="not-found__actions">
        <Link to="/" className="btn btn--primary">
          <Icon name="dashboard" size={16} />
          Back to dashboard
        </Link>
        <Link to="/bugs" className="btn btn--secondary">
          <Icon name="bug" size={16} />
          All bugs
        </Link>
      </div>
    </div>
  );
}
