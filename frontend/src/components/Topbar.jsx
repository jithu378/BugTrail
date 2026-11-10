import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { initials } from '../utils/format.js';
import { Icon } from './Icons.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';

function getSectionTitle(pathname) {
  if (pathname === '/') return 'Dashboard';
  if (pathname === '/bugs') return 'All bugs';
  if (pathname === '/bugs/new') return 'New report';
  if (/^\/bugs\/[^/]+\/edit$/.test(pathname)) return 'Edit report';
  if (/^\/bugs\/[^/]+$/.test(pathname)) return 'Bug details';
  return 'Not found';
}

export default function Topbar({ onMenu }) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className="icon-btn topbar__menu"
          onClick={onMenu}
          aria-label="Open navigation"
          aria-controls="primary-navigation"
        >
          <Icon name="menu" size={19} />
        </button>
        <div className="topbar__crumbs">
          <span className="topbar__root">Workspace</span>
          <Icon name="chevronRight" size={13} />
          <strong>{getSectionTitle(pathname)}</strong>
        </div>
      </div>

      <div className="topbar__actions">
        <Link to="/bugs/new" className="btn btn--primary btn--sm topbar__cta">
          <Icon name="plus" size={15} />
          New bug
        </Link>
        <ThemeToggle />
        <span className="topbar__divider" aria-hidden="true" />
        <div className="topbar__user" title={user?.email}>
          <span className="avatar avatar--sm">{initials(user?.name)}</span>
          <span className="topbar__username">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
