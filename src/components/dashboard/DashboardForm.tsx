import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

export function DashboardFormCard({
  title,
  description,
  children,
  className = '',
  footer,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}) {
  return (
    <section className={`dashboard-form-card ${className}`}>
      {(title || description) && (
        <header className="dashboard-form-header">
          {title && <h2 className="dashboard-form-title">{title}</h2>}
          {description && <p className="dashboard-form-desc">{description}</p>}
        </header>
      )}
      <div className="dashboard-form-body">{children}</div>
      {footer && <footer className="dashboard-form-footer">{footer}</footer>}
    </section>
  );
}

export function DashboardField({
  label,
  hint,
  htmlFor,
  children,
}: {
  label?: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="dashboard-field">
      {label && (
        <label htmlFor={htmlFor} className="dashboard-label">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="dashboard-field-hint">{hint}</p>}
    </div>
  );
}

export function DashboardReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="dashboard-field">
      <p className="dashboard-label">{label}</p>
      <p className="dashboard-readonly">{value}</p>
    </div>
  );
}

export function DashboardFormGrid({ children }: { children: ReactNode }) {
  return <div className="dashboard-form-grid">{children}</div>;
}

export const DashboardInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function DashboardInput({ className = '', ...props }, ref) {
  return <input ref={ref} className={`dashboard-input ${className}`} {...props} />;
});

export const DashboardSelect = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function DashboardSelect({ className = '', ...props }, ref) {
  return <select ref={ref} className={`dashboard-input dashboard-select ${className}`} {...props} />;
});

export const DashboardTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function DashboardTextarea({ className = '', ...props }, ref) {
  return <textarea ref={ref} className={`dashboard-input dashboard-textarea ${className}`} {...props} />;
});

export function DashboardCheckbox({
  checked,
  onChange,
  children,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  id?: string;
}) {
  const inputId = id || 'dashboard-checkbox';
  return (
    <label htmlFor={inputId} className="dashboard-checkbox">
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="dashboard-checkbox-input"
      />
      <span className="dashboard-checkbox-box" aria-hidden />
      <span className="dashboard-checkbox-label">{children}</span>
    </label>
  );
}

export function DashboardFormActions({ children }: { children: ReactNode }) {
  return <div className="dashboard-form-actions">{children}</div>;
}

export function DashboardButton({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const variantClass =
    variant === 'secondary'
      ? 'dashboard-btn-secondary'
      : variant === 'danger'
        ? 'dashboard-btn-danger'
        : 'dashboard-btn-primary';

  return (
    <button className={`${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
