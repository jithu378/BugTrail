import { Icon } from './Icons.jsx';

export default function StatCard({ label, value, hint, icon, tone = 'total' }) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__head">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__icon">
          <Icon name={icon} size={18} />
        </span>
      </div>
      <p className="stat-card__value">{value}</p>
      {hint && <p className="stat-card__hint">{hint}</p>}
    </article>
  );
}
