export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header className="page-header">
      <div className="page-header__text">
        {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
