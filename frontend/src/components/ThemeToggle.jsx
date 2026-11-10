import { useTheme } from '../context/ThemeContext.jsx';
import { Icon } from './Icons.jsx';

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      className={`icon-btn ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
    </button>
  );
}
