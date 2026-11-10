import { Icon } from './Icons.jsx';

const POINTS = [
  {
    icon: 'activity',
    title: 'Stay on top of reports',
    text: 'Live counts for open, in-progress and resolved bugs.',
  },
  {
    icon: 'bug',
    title: 'Capture the whole story',
    text: 'Steps, expected vs actual, debugging notes and the fix.',
  },
  {
    icon: 'shield',
    title: 'Private by default',
    text: 'Your journal is scoped to your account and secured with JWT.',
  },
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <div className="auth-brand">
          <span className="brand-mark brand-mark--light">
            <Icon name="bug" size={20} strokeWidth={2} />
          </span>
          <span>BugTrail</span>
        </div>

        <div className="auth-aside__body">
          <p className="auth-eyebrow">Developer debugging journal</p>
          <h1>Every bug leaves a trail. Keep it.</h1>
          <p className="auth-lede">
            Turn scattered debugging sessions into a searchable record of what broke, how you found
            it, and what finally fixed it.
          </p>

          <ul className="auth-points">
            {POINTS.map((point) => (
              <li key={point.title}>
                <span>
                  <Icon name={point.icon} size={17} />
                </span>
                <div>
                  <strong>{point.title}</strong>
                  <p>{point.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-aside__foot">Because “it works now” is not documentation.</p>
      </aside>

      <main className="auth-main">
        <div className="auth-mobile-brand">
          <span className="brand-mark">
            <Icon name="bug" size={19} />
          </span>
          BugTrail
        </div>

        <div className="auth-card">
          <div className="auth-card__head">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {children}
          {footer}
        </div>

        <p className="auth-main__meta">JWT sessions · Passwords hashed with bcrypt</p>
      </main>
    </div>
  );
}
