import { Icon } from './Icons.jsx';

function pageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set([1, total, current - 1, current, current + 1]);
  const numbers = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  const output = [];
  let previous = 0;
  for (const page of numbers) {
    if (previous && page - previous > 1) output.push(`gap-${previous}`);
    output.push(page);
    previous = page;
  }
  return output;
}

export default function Pagination({ page, pages, total, limit, onChange }) {
  if (!total) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const items = pageWindow(page, pages);

  return (
    <nav className="pagination" aria-label="Pagination">
      <p className="pagination__info">
        Showing <strong>{start}</strong>–<strong>{end}</strong> of <strong>{total}</strong>
      </p>
      <div className="pagination__controls">
        <button
          type="button"
          className="page-btn"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <Icon name="chevronLeft" size={15} />
        </button>
        {items.map((item) =>
          typeof item === 'string' ? (
            <span key={item} className="page-gap" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`page-btn${item === page ? ' is-active' : ''}`}
              onClick={() => onChange(item)}
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          className="page-btn"
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          aria-label="Next page"
        >
          <Icon name="chevronRight" size={15} />
        </button>
      </div>
    </nav>
  );
}
