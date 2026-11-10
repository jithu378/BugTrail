import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import BugFilters from '../components/BugFilters.jsx';
import BugList from '../components/BugList.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { Icon } from '../components/Icons.jsx';
import { ListSkeleton } from '../components/Loading.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Pagination from '../components/Pagination.jsx';
import { EmptyState, ErrorState } from '../components/States.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const PAGE_SIZE = 10;

export default function BugsPage() {
  useDocumentTitle('All bugs');

  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const queryString = searchParams.toString();
  const filters = useMemo(() => {
    const params = new URLSearchParams(queryString);
    return {
      search: params.get('search')?.trim() ?? '',
      severity: params.get('severity') ?? '',
      status: params.get('status') ?? '',
      project: params.get('project') ?? '',
      page: Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1),
    };
  }, [queryString]);

  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const [data, setData] = useState({ bugs: [], pagination: null });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const hasFilters = Boolean(filters.search || filters.severity || filters.status || filters.project);

  // React Router's setSearchParams closes over the search params from the last render,
  // so two updates in the same tick can clobber each other. Merge from a ref instead.
  const paramsRef = useRef(searchParams);

  useEffect(() => {
    paramsRef.current = searchParams;
  }, [searchParams]);

  const updateParams = useCallback(
    (changes) => {
      const next = new URLSearchParams(paramsRef.current);
      for (const [key, value] of Object.entries(changes)) {
        if (value === '' || value === undefined || value === null) next.delete(key);
        else next.set(key, String(value));
      }
      paramsRef.current = next;
      setSearchParams(next);
    },
    [setSearchParams],
  );

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (trimmed === filters.search) return;
    updateParams({ search: trimmed, page: 1 });
  }, [debouncedSearch, filters.search, updateParams]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError('');

    api.bugs
      .list(
        {
          search: filters.search,
          severity: filters.severity,
          status: filters.status,
          project: filters.project,
          page: filters.page,
          limit: PAGE_SIZE,
        },
        controller.signal,
      )
      .then((payload) => {
        if (active) setData(payload);
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
  }, [queryString, reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    api.bugs
      .projects(controller.signal)
      .then((payload) => setProjects(payload.projects))
      .catch(() => {});
    return () => controller.abort();
  }, [reloadKey]);

  function handleFilterChange(changes) {
    updateParams({ ...changes, page: 1 });
  }

  function handleClearFilters() {
    setSearchInput('');
    paramsRef.current = new URLSearchParams();
    setSearchParams(paramsRef.current);
  }

  function handlePageChange(nextPage) {
    updateParams({ page: nextPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    try {
      await api.bugs.remove(pendingDelete._id);
      toast('Bug report deleted.');
      setPendingDelete(null);

      if (data.bugs.length === 1 && filters.page > 1) {
        updateParams({ page: filters.page - 1 });
      } else {
        setReloadKey((key) => key + 1);
      }
    } catch (deleteError) {
      toast(deleteError.message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  const total = data.pagination?.total ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="Journal"
        title="All bugs"
        subtitle={
          loading
            ? 'Loading your bug reports…'
            : error
              ? 'Could not load your bug reports.'
              : `${total} report${total === 1 ? '' : 's'} ${
                  hasFilters ? 'matching your filters' : 'in your journal'
                }`
        }
        actions={
          <Link to="/bugs/new" className="btn btn--primary">
            <Icon name="plus" size={16} />
            New bug
          </Link>
        }
      />

      <BugFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        severity={filters.severity}
        status={filters.status}
        project={filters.project}
        projects={projects}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
        hasFilters={hasFilters}
      />

      {loading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <div className="card">
          <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
        </div>
      ) : data.bugs.length === 0 ? (
        <div className="card">
          {hasFilters ? (
            <EmptyState
              icon="filter"
              title="No bugs match your filters"
              description="Try a different search term, or reset the filters to see every report."
              action={
                <button type="button" className="btn btn--secondary" onClick={handleClearFilters}>
                  Clear filters
                </button>
              }
            />
          ) : (
            <EmptyState
              icon="bug"
              title="Your journal is empty"
              description="Report your first bug to start capturing the trail from symptom to fix."
              action={
                <Link to="/bugs/new" className="btn btn--primary">
                  <Icon name="plus" size={16} />
                  Report a bug
                </Link>
              }
            />
          )}
        </div>
      ) : (
        <>
          <BugList bugs={data.bugs} onDelete={setPendingDelete} />
          {data.pagination && (
            <Pagination
              page={data.pagination.page}
              pages={data.pagination.pages}
              total={data.pagination.total}
              limit={data.pagination.limit}
              onChange={handlePageChange}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this bug report?"
        description={
          pendingDelete
            ? `“${pendingDelete.title}” will be permanently removed from your journal. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete report"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
