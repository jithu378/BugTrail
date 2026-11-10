import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { Icon } from '../components/Icons.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function LoginPage() {
  useDocumentTitle('Sign in');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    if (!form.password) nextErrors.password = 'Password is required.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await login({ email: form.email.trim(), password: form.password });
      const from = typeof location.state?.from === 'string' ? location.state.from : '/';
      navigate(from, { replace: true });
    } catch (error) {
      if (error.errors) setErrors(error.errors);
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where your debugging left off."
      footer={
        <p className="auth-switch">
          New to BugTrail? <Link to="/register">Create an account</Link>
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
            autoFocus
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
            invalid={Boolean(errors.password)}
          />
          {errors.password && <p className="field__error">{errors.password}</p>}
        </div>

        <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? <Spinner /> : <Icon name="logout" size={16} />}
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}
