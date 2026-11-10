import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import BugForm from '../components/BugForm.jsx';
import { Icon } from '../components/Icons.jsx';
import { ListSkeleton } from '../components/Loading.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { ErrorState } from '../components/States.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function BugFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  useDocumentTitle(isEdit ? 'Edit report' : 'New report');

  const navigate = useNavigate();
  const { toast } = useToast();

  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isEdit) return undefined;

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
  }, [id, isEdit, reloadKey]);

  async function handleSubmit(values) {
    if (isEdit) {
      const payload = await api.bugs.update(id, values);
      toast('Bug report updated.');
      navigate(`/bugs/${payload.bug._id}`, { replace: true });
      return;
    }

    const payload = await api.bugs.create(values);
    toast('Bug report created.');
    navigate(`/bugs/${payload.bug._id}`, { replace: true });
  }

  return (
    <>
      <PageHeader
        eyebrow={isEdit ? 'Editing' : 'New entry'}
        title={isEdit ? 'Edit bug report' : 'Report a bug'}
        subtitle={
          isEdit
            ? 'Keep the trail accurate — update the details as your investigation evolves.'
            : 'Capture enough context that you could pick this bug up again in a month.'
        }
        actions={
          <Link to={isEdit ? `/bugs/${id}` : '/bugs'} className="btn btn--secondary">
            <Icon name="arrowLeft" size={16} />
            {isEdit ? 'Back to report' : 'All bugs'}
          </Link>
        }
      />

      {isEdit && loading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
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
      ) : (
        <BugForm
          initialValues={isEdit ? bug : undefined}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Save changes' : 'Create report'}
          cancelTo={isEdit ? `/bugs/${id}` : '/bugs'}
        />
      )}
    </>
  );
}
