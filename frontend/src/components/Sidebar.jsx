import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { initials } from '../utils/format.js';
import { Icon } from './Icons.jsx';

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  async function handleLogout() {
    await logout();
    toast('Signed out. See you next debug session.', 'info');
    navigate('/login', { replace: true });
  }

  const allBugsActive = ({ isActive }) =>
    `nav-link${isActive && !pathname.endsWith('/new') ? ' active' : ''}`;

  return (
    <aside className={`sidebar${open ? ' sidebar--open' : ''}`} id="primary-navigation">
      <div className="sidebar__brand">
        <span className="brand-mark">
          <Icon name="bug" size={21} strokeWidth={2} />
        </span>
        <span className="brand-name">
          BugTrail<span className="brand-name__dot">.</span>
        </span>
        <button
          type="button"
          className="icon-btn sidebar__close"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        <p className="nav-label">Workspace</p>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <Icon name="dashboard" size={18} />
          Dashboard
        </NavLink>
        <NavLink to="/bugs" className={allBugsActive}>
          <Icon name="bug" size={18} />
          All bugs
        </NavLink>

        <p className="nav-label">Journal</p>
        <NavLink
          to="/bugs/new"
          end
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <Icon name="plus" size={18} />
          Report a bug
        </NavLink>
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar-user">
          <span className="avatar">{initials(user?.name)}</span>
          <div className="sidebar-user__meta">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={handleLogout}
            aria-label="Sign out"
            title="Sign out"
          >
            <Icon name="logout" size={17} />
          </button>
        </div>
        <p className="sidebar__note">v1.0 · Debug journal</p>
      </div>
    </aside>
  );
}
