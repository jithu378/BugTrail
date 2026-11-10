import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEVERITIES, STATUSES } from '../utils/constants.js';
import { Icon } from './Icons.jsx';
import { Spinner } from './Spinner.jsx';

export const EMPTY_BUG = {
  title: '',
  description: '',
  project: '',
  severity: 'Medium',
  status: 'Open',
  reproductionSteps: '',
  expectedResult: '',
  actualResult: '',
  debuggingNotes: '',
  solution: '',
};

const LIMITS = {
  title: 140,
  description: 5000,
  project: 80,
  reproductionSteps: 5000,
  expectedResult: 2000,
  actualResult: 2000,
  debuggingNotes: 5000,
  solution: 5000,
};

function normalize(values) {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    project: values.project.trim(),
    severity: values.severity,
    status: values.status,
    reproductionSteps: values.reproductionSteps.trim(),
    expectedResult: values.expectedResult.trim(),
    actualResult: values.actualResult.trim(),
    debuggingNotes: values.debuggingNotes.trim(),
    solution: values.solution.trim(),
  };
}

function validate(values) {
  const errors = {};
  const data = normalize(values);

  if (data.title.length < 3) errors.title = 'Title must be at least 3 characters.';
  else if (data.title.length > LIMITS.title) errors.title = `Title cannot exceed ${LIMITS.title} characters.`;

  if (data.description.length < 10) errors.description = 'Description must be at least 10 characters.';
  else if (data.description.length > LIMITS.description) {
    errors.description = `Description cannot exceed ${LIMITS.description} characters.`;
  }

  if (data.project.length < 2) errors.project = 'Project name must be at least 2 characters.';
  else if (data.project.length > LIMITS.project) {
    errors.project = `Project name cannot exceed ${LIMITS.project} characters.`;
  }

  if (!SEVERITIES.includes(data.severity)) errors.severity = 'Choose a valid severity.';
  if (!STATUSES.includes(data.status)) errors.status = 'Choose a valid status.';

  for (const field of ['reproductionSteps', 'expectedResult', 'actualResult', 'debuggingNotes', 'solution']) {
    if (data[field].length > LIMITS[field]) {
      errors[field] = `This field cannot exceed ${LIMITS[field]} characters.`;
    }
  }

  return errors;
}

function Field({ id, label, required = false, error, hint, className = '', children }) {
  return (
    <div className={`field ${className}`.trim()}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required && (
          <span className="field__req" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field__hint">{hint}</p>
      ) : null}
    </div>
  );
}

export default function BugForm({
  initialValues,
  onSubmit,
  submitLabel = 'Save report',
  cancelTo = '/bugs',
}) {
  const [values, setValues] = useState(() => ({ ...EMPTY_BUG, ...initialValues }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function focusFirstError(nextErrors) {
    const firstField = Object.keys(nextErrors)[0];
    if (firstField) document.getElementById(firstField)?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormError('Please fix the highlighted fields before saving.');
      focusFirstError(nextErrors);
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await onSubmit(normalize(values));
    } catch (error) {
      if (error.errors && Object.keys(error.errors).length > 0) {
        setErrors(error.errors);
        focusFirstError(error.errors);
      }
      setFormError(error.message || 'Could not save this report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="bug-form" onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className="alert alert--error" role="alert">
          <Icon name="alert" size={16} />
          <span>{formError}</span>
        </div>
      )}

      <section className="card form-section">
        <div className="form-section__head">
          <h2>Overview</h2>
          <p>The essentials — what broke, and where.</p>
        </div>
        <div className="form-section__body">
          <div className="form-grid">
            <Field
              id="title"
              label="Bug title"
              required
              error={errors.title}
              hint={`${values.title.length}/${LIMITS.title} characters`}
              className="field--full"
            >
              <input
                id="title"
                name="title"
                type="text"
                className={`input${errors.title ? ' input--error' : ''}`}
                value={values.title}
                onChange={handleChange}
                maxLength={LIMITS.title}
                placeholder="e.g. Checkout button unresponsive on Safari"
                aria-invalid={errors.title ? true : undefined}
                aria-describedby={errors.title ? 'title-error' : undefined}
                autoFocus
              />
            </Field>

            <Field
              id="description"
              label="Description"
              required
              error={errors.description}
              hint="What is happening, and who is affected?"
              className="field--full"
            >
              <textarea
                id="description"
                name="description"
                className={`textarea${errors.description ? ' input--error' : ''}`}
                rows={5}
                maxLength={LIMITS.description}
                value={values.description}
                onChange={handleChange}
                placeholder="Summarize the problem and its impact…"
                aria-invalid={errors.description ? true : undefined}
                aria-describedby={errors.description ? 'description-error' : undefined}
              />
            </Field>

            <Field id="project" label="Project" required error={errors.project}>
              <input
                id="project"
                name="project"
                type="text"
                className={`input${errors.project ? ' input--error' : ''}`}
                value={values.project}
                onChange={handleChange}
                maxLength={LIMITS.project}
                placeholder="e.g. Storefront"
                aria-invalid={errors.project ? true : undefined}
                aria-describedby={errors.project ? 'project-error' : undefined}
              />
            </Field>

            <Field id="severity" label="Severity" required error={errors.severity}>
              <select
                id="severity"
                name="severity"
                className="select"
                value={values.severity}
                onChange={handleChange}
              >
                {SEVERITIES.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="status" label="Status" required error={errors.status}>
              <select
                id="status"
                name="status"
                className="select"
                value={values.status}
                onChange={handleChange}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </section>

      <section className="card form-section">
        <div className="form-section__head">
          <h2>Reproduction</h2>
          <p>Help your future self (and teammates) reproduce the problem.</p>
        </div>
        <div className="form-section__body">
          <div className="form-grid">
            <Field
              id="reproductionSteps"
              label="Reproduction steps"
              error={errors.reproductionSteps}
              hint="Number each step so it can be followed exactly."
              className="field--full"
            >
              <textarea
                id="reproductionSteps"
                name="reproductionSteps"
                className="textarea"
                rows={5}
                maxLength={LIMITS.reproductionSteps}
                value={values.reproductionSteps}
                onChange={handleChange}
                placeholder={'1. Open the app\n2. Navigate to…\n3. Click…'}
              />
            </Field>
          </div>

          <div className="form-grid form-grid--2 form-grid--spaced">
            <Field id="expectedResult" label="Expected result" error={errors.expectedResult}>
              <textarea
                id="expectedResult"
                name="expectedResult"
                className="textarea"
                rows={4}
                maxLength={LIMITS.expectedResult}
                value={values.expectedResult}
                onChange={handleChange}
                placeholder="What should happen?"
              />
            </Field>
            <Field id="actualResult" label="Actual result" error={errors.actualResult}>
              <textarea
                id="actualResult"
                name="actualResult"
                className="textarea"
                rows={4}
                maxLength={LIMITS.actualResult}
                value={values.actualResult}
                onChange={handleChange}
                placeholder="What actually happens?"
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="card form-section">
        <div className="form-section__head">
          <h2>Debugging journal</h2>
          <p>Record your investigation and the fix — the trail matters.</p>
        </div>
        <div className="form-section__body">
          <div className="form-grid">
            <Field
              id="debuggingNotes"
              label="Debugging notes"
              error={errors.debuggingNotes}
              hint="Logs, hypotheses, dead ends, root cause…"
              className="field--full"
            >
              <textarea
                id="debuggingNotes"
                name="debuggingNotes"
                className="textarea"
                rows={6}
                maxLength={LIMITS.debuggingNotes}
                value={values.debuggingNotes}
                onChange={handleChange}
                placeholder="What did you try? What did the logs reveal?"
              />
            </Field>

            <Field
              id="solution"
              label="Solution"
              error={errors.solution}
              hint="The final fix, or the next concrete step."
              className="field--full"
            >
              <textarea
                id="solution"
                name="solution"
                className="textarea"
                rows={5}
                maxLength={LIMITS.solution}
                value={values.solution}
                onChange={handleChange}
                placeholder="Describe the fix or workaround…"
              />
            </Field>
          </div>
        </div>
      </section>

      <div className="form-actions">
        <Link to={cancelTo} className="btn btn--secondary">
          Cancel
        </Link>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? <Spinner /> : <Icon name="check" size={16} />}
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
