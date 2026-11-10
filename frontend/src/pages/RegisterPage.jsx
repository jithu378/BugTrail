import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { Icon } from '../components/Icons.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(form) {
  const errors = {};

  if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
  if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address.';

  if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  } else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
    errors.password = 'Include at least one letter and one number.';
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

export default function RegisterPage() {
  useDocumentTitle('Create account');

  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hasLength = form.password.length >= 8;
  const hasMix = /[A-Za-z]/.test(form.password) && /\d/.test(form.password);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast('Account created. Welcome to BugTrail.');
      navigate('/', { replace: true });
    } catch (error) {
      if (error.errors) setErrors(error.errors);
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start a journal for every bug you chase down."
      footer={
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="alert alert--error" role="alert">
            <Icon name="alert" size={16} />
            <span>{formError}</span>
          </div>
        )}

        <div className="field">
          <label className="field__label" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className={`input${errors.name ? ' input--error' : ''}`}
            value={form.name}
            onChange={handleChange}
            placeholder="Ada Lovelace"
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            autoFocus
          />
          {errors.name && <p className="field__error">{errors.name}</p>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={`input${errors.email ? ' input--error' : ''}`}
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
          />
          {errors.email && <p className="field__error">{errors.email}</p>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="password">
            Password
          </label>
          <PasswordInput
            id="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            invalid={Boolean(errors.password)}
          />
          <ul className="password-hints">
            <li className={hasLength ? 'is-ok' : ''}>
              <Icon name="check" size={12} />
              At least 8 characters
            </li>
            <li className={hasMix ? 'is-ok' : ''}>
              <Icon name="check" size={12} />
              Letters and numbers
            </li>
          </ul>
          {errors.password && <p className="field__error">{errors.password}</p>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="confirmPassword">
            Confirm password
          </label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            invalid={Boolean(errors.confirmPassword)}
          />
          {errors.confirmPassword && <p className="field__error">{errors.confirmPassword}</p>}
        </div>

        <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? <Spinner /> : <Icon name="user" size={16} />}
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}
