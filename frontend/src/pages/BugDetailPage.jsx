import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { SeverityBadge, StatusBadge } from '../components/Badges.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { Icon } from '../components/Icons.jsx';
import { DetailSkeleton } from '../components/Loading.jsx';
import { ErrorState } from '../components/States.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { formatDate, formatDateTime, timeAgo } from '../utils/format.js';

function Section({ icon, title, children }) {
  return (
    <section className="card detail-section">
      <h2>
        <Icon name={icon} size={15} />
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function BugDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useDocumentTitle(bug?.title || 'Bug details');

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError('');

    api.bugs
      .get(id, controller.signal)
      .then((payload) => {
        if (active) setBug(payload.bug);
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
  }, [id, reloadKey]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.bugs.remove(id);
      toast('Bug report deleted.');
      navigate('/bugs', { replace: true });
    } catch (deleteError) {
      toast(deleteError.message, 'error');
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  if (loading) return <DetailSkeleton />;

  if (error) {
    return (
      <div className="card">
        <ErrorState
          title="Could not load this report"
          message={error}
          onRetry={() => setReloadKey((key) => key + 1)}
        />
        <p className="state__fallback">
          <Link to="/bugs">Back to all bugs</Link>
        </p>
      </div>
    );
  }

  if (!bug) return null;

  return (
    <>
      <Link to="/bugs" className="back-link">
        <Icon name="arrowLeft" size={15} />
        All bugs
      </Link>

      <header className="detail-header">
        <div className="detail-header__text">
          <div className="detail-badges">
            <SeverityBadge severity={bug.severity} />
            <StatusBadge status={bug.status} />
            <span className="detail-project">
              <Icon name="folder" size={14} />
              {bug.project}
            </span>
          </div>
          <h1 className="detail-title">{bug.title}</h1>
          <p className="detail-meta">
            Reported {formatDateTime(bug.createdAt)} · Updated {timeAgo(bug.updatedAt)}
            {bug.resolvedAt ? ` · Resolved ${formatDate(bug.resolvedAt)}` : ''}
          </p>
        </div>

        <div className="detail-actions">
          <Link to={`/bugs/${bug._id}/edit`} className="btn btn--secondary btn--sm">
            <Icon name="edit" size={15} />
            Edit
          </Link>
          <button
            type="button"
            className="btn btn--danger btn--sm"
            onClick={() => setConfirmOpen(true)}
          >
            <Icon name="trash" size={15} />
            Delete
          </button>
        </div>
      </header>

      <div className="detail-grid">
        <div className="detail-main">
          <Section icon="activity" title="Description">
            <p className="prose">{bug.description}</p>
          </Section>

          <Section icon="bug" title="Reproduction steps">
            <p className={`prose${bug.reproductionSteps ? '' : ' is-empty'}`}>
              {bug.reproductionSteps || 'No reproduction steps documented yet.'}
            </p>
          </Section>

          <div className="detail-split">
            <Section icon="check" title="Expected result">
              <p className={`prose${bug.expectedResult ? '' : ' is-empty'}`}>
                {bug.expectedResult || 'Not documented yet.'}
              </p>
            </Section>
            <Section icon="alert" title="Actual result">
              <p className={`prose${bug.actualResult ? '' : ' is-empty'}`}>
                {bug.actualResult || 'Not documented yet.'}
              </p>
            </Section>
          </div>

          <Section icon="search" title="Debugging notes">
            <p className={`prose${bug.debuggingNotes ? '' : ' is-empty'}`}>
              {bug.debuggingNotes || 'No debugging notes yet. Add what you have tried so far.'}
            </p>
          </Section>

          <Section icon="shield" title="Solution">
            <p className={`prose${bug.solution ? '' : ' is-empty'}`}>
              {bug.solution || 'No fix recorded yet.'}
            </p>
          </Section>
        </div>

        <aside className="detail-side">
          <section className="card detail-side__card">
            <h2 className="detail-side__title">Report info</h2>
            <dl className="kv">
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusBadge status={bug.status} />
                </dd>
              </div>
              <div>
                <dt>Severity</dt>
                <dd>
                  <SeverityBadge severity={bug.severity} />
                </dd>
              </div>
              <div>
                <dt>Project</dt>
                <dd>{bug.project}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(bug.createdAt)}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{formatDate(bug.updatedAt)}</dd>
              </div>
              {bug.resolvedAt && (
                <div>
                  <dt>Resolved</dt>
                  <dd>{formatDate(bug.resolvedAt)}</dd>
                </div>
              )}
              <div>
                <dt>Record ID</dt>
                <dd className="mono">{bug._id.slice(-8)}</dd>
              </div>
            </dl>
          </section>

          <Link to="/bugs" className="btn btn--secondary btn--block side-back">
            <Icon name="arrowLeft" size={15} />
            Back to journal
          </Link>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this bug report?"
        description={`“${bug.title}” will be permanently removed from your journal. This cannot be undone.`}
        confirmLabel="Delete report"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
