import { Spinner } from './Spinner.jsx';

export function Skeleton({ width = '100%', height = 12, radius = 8, className = '' }) {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export function FullPageLoader({ message = 'Loading your workspace…' }) {
  return (
    <div className="full-loader">
      <div className="full-loader__inner">
        <Spinner size="lg" />
        <span>{message}</span>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="skeleton-stack" aria-hidden="true">
      <div className="stat-grid">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="card skeleton-card skeleton-card--stat">
            <Skeleton width="45%" height={10} />
            <Skeleton width="30%" height={30} />
            <Skeleton width="65%" height={9} />
          </div>
        ))}
      </div>
      <div className="dash-grid">
        <div className="card skeleton-card skeleton-card--tall">
          <Skeleton width="35%" height={14} />
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="skeleton-row">
              <Skeleton width="55%" height={12} />
              <Skeleton width="18%" height={20} radius={99} />
            </div>
          ))}
        </div>
        <div className="dash-side">
          <div className="card skeleton-card">
            <Skeleton width="40%" height={14} />
            <Skeleton width={120} height={120} radius={999} />
          </div>
          <div className="card skeleton-card">
            <Skeleton width="45%" height={14} />
            <Skeleton width="100%" height={8} />
            <Skeleton width="80%" height={8} />
            <Skeleton width="65%" height={8} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 6 }) {
  return (
    <div className="card skeleton-card" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="skeleton-row skeleton-row--list">
          <div className="skeleton-row__main">
            <Skeleton width="48%" height={13} />
            <Skeleton width="28%" height={9} />
          </div>
          <Skeleton width={70} height={20} radius={99} />
          <Skeleton width={90} height={20} radius={99} />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} aria-hidden="true">
      <div className="detail-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem', flex: 1 }}>
          <Skeleton width={180} height={20} radius={99} />
          <Skeleton width="60%" height={26} />
          <Skeleton width="40%" height={10} />
        </div>
        <Skeleton width={140} height={36} radius={10} />
      </div>
      <div className="detail-grid">
        <div className="detail-main">
          {[0, 1, 2].map((item) => (
            <div key={item} className="card skeleton-card">
              <Skeleton width="25%" height={10} />
              <Skeleton width="100%" height={11} />
              <Skeleton width="92%" height={11} />
              <Skeleton width="70%" height={11} />
            </div>
          ))}
        </div>
        <div className="card skeleton-card">
          <Skeleton width="50%" height={12} />
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="skeleton-row">
              <Skeleton width="35%" height={9} />
              <Skeleton width="45%" height={9} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuthFormSkeleton() {
  return (
    <div className="skeleton-stack" aria-hidden="true">
      <Skeleton width="100%" height={42} radius={10} />
      <Skeleton width="100%" height={42} radius={10} />
      <Skeleton width="100%" height={42} radius={10} />
    </div>
  );
}
