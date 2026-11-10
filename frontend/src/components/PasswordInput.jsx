import { useState } from 'react';
import { Icon } from './Icons.jsx';

export default function PasswordInput({
  id,
  name = 'password',
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  invalid = false,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-wrap">
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        className={`input${invalid ? ' input--error' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
      >
        <Icon name={visible ? 'eyeOff' : 'eye'} size={16} />
      </button>
    </div>
  );
}
