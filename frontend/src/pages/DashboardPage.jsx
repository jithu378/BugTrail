import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { StatusBadge } from '../components/Badges.jsx';
import { Icon } from '../components/Icons.jsx';
import { DashboardSkeleton } from '../components/Loading.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import { EmptyState, ErrorState } from '../components/States.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { SEVERITIES } from '../utils/constants.js';
import { firstName, timeAgo } from '../utils/format.js';

const EMPTY_COUNTS = { total: 0, open: 0, inProgress: 0, resolved: 0 };

export default function DashboardPage() {
  useDocumentTitle('Dashboard');

  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError('');

    api.bugs
      .stats(controller.signal)
      .then((payload) => {
        if (active) setStats(payload);
      })
      .catch((requestError) => {
        if (active && requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey]);

  const counts = stats?.counts ?? EMPTY_COUNTS;
  const total = counts.total || 0;
  const recent = stats?.recent ?? [];
  const projectRows = stats?.projects ?? [];
  const maxSeverity = Math.max(1, ...SEVERITIES.map((severity) => stats?.bySeverity?.[severity] ?? 0));

  const openPercent = total ? Math.round((counts.open / total) * 100) : 0;
  const progressPercent = total ? Math.round((counts.inProgress / total) * 100) : 0;
  const donutStyle = total
    ? {
        background: `conic-gradient(var(--st-open) 0 ${openPercent}%, var(--st-progress) ${openPercent}% ${
          openPercent + progressPercent
        }%, var(--st-resolved) ${openPercent + progressPercent}% 100%)`,
      }
    : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${firstName(user?.name)}`}
        subtitle="Here's how your bug trail is tracking today."
        actions={
          <Link to="/bugs/new" className="btn btn--primary">
            <Icon name="plus" size={16} />
            Report a bug
          </Link>
        }
      />

      {error ? (
        <div className="card">
          <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
        </div>
      ) : loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <section className="stat-grid" aria-label="Bug counts">
            <StatCard
              label="Total bugs"
              value={counts.total}
              hint="All reports in your journal"
              icon="bug"
              tone="total"
            />
            <StatCard
              label="Open"
              value={counts.open}
              hint="Waiting to be picked up"
              icon="alert"
              tone="open"
            />
            <StatCard
              label="In progress"
              value={counts.inProgress}
              hint="Actively being debugged"
              icon="clock"
              tone="progress"
            />
            <StatCard
              label="Resolved"
              value={counts.resolved}
              hint="Fixed and documented"
              icon="check"
              tone="resolved"
            />
          </section>

          <div className="dash-grid">
            <section className="card">
              <div className="card__header">
                <div>
                  <h2 className="card__title">Recent reports</h2>
                  <p className="card__subtitle">The latest entries in your journal</p>
                </div>
                <Link to="/bugs" className="card__link">
                  View all
                  <Icon name="chevronRight" size={14} />
                </Link>
              </div>

              {recent.length > 0 ? (
                <div className="recent-list">
                  {recent.map((bug) => (
                    <Link key={bug._id} to={`/bugs/${bug._id}`} className="recent-item">
                      <span
                        className={`recent-item__dot recent-item__dot--${bug.severity.toLowerCase()}`}
                        aria-hidden="true"
                      />
                      <div className="recent-item__main">
                        <span className="recent-item__title">{bug.title}</span>
                        <span className="recent-item__meta">
                          {bug.project} · {timeAgo(bug.createdAt)}
                        </span>
                      </div>
                      <StatusBadge status={bug.status} />
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="bug"
                  title="No bugs reported yet"
                  description="Create your first report to start a debugging trail."
                  action={
                    <Link to="/bugs/new" className="btn btn--primary btn--sm">
                      <Icon name="plus" size={15} />
                      Report a bug
                    </Link>
                  }
                />
              )}
            </section>

            <div className="dash-side">
              <section className="card">
                <div className="card__header">
                  <h2 className="card__title">Status overview</h2>
                </div>
                <div className="card__body">
                  <div className="status-overview">
                    <div
                      className={`donut${total ? '' : ' donut--empty'}`}
                      style={donutStyle}
                      aria-hidden="true"
                    >
                      <div className="donut__hole">
                        <span className="donut__value">{total}</span>
                        <span className="donut__label">bugs</span>
                      </div>
                    </div>
                    <ul className="legend">
                      <li className="legend__item">
                        <span className="legend__dot legend__dot--open" aria-hidden="true" />
                        Open
                        <span className="legend__count">{counts.open}</span>
                      </li>
                      <li className="legend__item">
                        <span className="legend__dot legend__dot--progress" aria-hidden="true" />
                        In progress
                        <span className="legend__count">{counts.inProgress}</span>
                      </li>
                      <li className="legend__item">
                        <span className="legend__dot legend__dot--resolved" aria-hidden="true" />
                        Resolved
                        <span className="legend__count">{counts.resolved}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="card">
                <div className="card__header">
                  <h2 className="card__title">Severity breakdown</h2>
                </div>
                <div className="card__body">
                  <div className="bar-list">
                    {[...SEVERITIES].reverse().map((severity) => {
                      const count = stats?.bySeverity?.[severity] ?? 0;
                      const width = count ? Math.max(6, Math.round((count / maxSeverity) * 100)) : 0;
                      return (
                        <div key={severity} className="bar-row">
                          <div className="bar-row__head">
                            <span className="bar-row__label">{severity}</span>
                            <span className="bar-row__count">{count}</span>
                          </div>
                          <div className="bar">
                            <div
                              className={`bar__fill bar__fill--${severity.toLowerCase()}`}
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {projectRows.length > 0 && (
                <section className="card">
                  <div className="card__header">
                    <h2 className="card__title">Projects</h2>
                  </div>
                  <div className="card__body">
                    <div className="project-list">
                      {projectRows.map((project) => (
                        <div key={project.name} className="project-pill">
                          <span className="project-pill__name">
                            <Icon name="folder" size={14} />
                            {project.name}
                          </span>
                          <span className="project-pill__count">{project.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
