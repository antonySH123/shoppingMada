import {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  useId,
} from "react";

export interface AdminFieldProps {
  label: string;
  id?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function AdminField({
  label,
  id,
  hint,
  error,
  required,
  children,
}: AdminFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const descriptionId = `${fieldId}-description`;
  const errorId = `${fieldId}-error`;
  return (
    <div className="admin-field">
      <label htmlFor={fieldId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && (
        <span id={descriptionId} className="admin-field__hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="admin-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}
export function AdminInput({
  label,
  hint,
  error,
  id,
  required,
  className = "",
  ...props
}: AdminInputProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <AdminField
      label={label}
      id={fieldId}
      hint={hint}
      error={error}
      required={required}
    >
      <input
        {...props}
        id={fieldId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={
          error
            ? `${fieldId}-error`
            : hint
              ? `${fieldId}-description`
              : undefined
        }
        className={`admin-field__control ${className}`}
      />
    </AdminField>
  );
}

export interface AdminSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}
export function AdminSelect({
  label,
  hint,
  error,
  id,
  required,
  className = "",
  children,
  ...props
}: AdminSelectProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <AdminField
      label={label}
      id={fieldId}
      hint={hint}
      error={error}
      required={required}
    >
      <select
        {...props}
        id={fieldId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={
          error
            ? `${fieldId}-error`
            : hint
              ? `${fieldId}-description`
              : undefined
        }
        className={`admin-field__control ${className}`}
      >
        {children}
      </select>
    </AdminField>
  );
}

export interface AdminTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}
export function AdminTextarea({
  label,
  hint,
  error,
  id,
  required,
  className = "",
  ...props
}: AdminTextareaProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <AdminField
      label={label}
      id={fieldId}
      hint={hint}
      error={error}
      required={required}
    >
      <textarea
        {...props}
        id={fieldId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={
          error
            ? `${fieldId}-error`
            : hint
              ? `${fieldId}-description`
              : undefined
        }
        className={`admin-field__control ${className}`}
      />
    </AdminField>
  );
}
