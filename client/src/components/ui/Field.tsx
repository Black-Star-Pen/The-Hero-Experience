import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import styles from "./Field.module.css";

interface FieldProps {
  label: ReactNode;
  /** Error message(s); only the first one is shown. */
  error?: string | string[] | undefined;
  hint?: ReactNode;
}

/** Wires the label, the hint and the error to the control (ARIA ids). */
function useFieldIds(error: FieldProps["error"], hint: ReactNode) {
  const id = useId();
  const message = Array.isArray(error) ? error[0] : error;
  const describedBy =
    [hint ? `${id}-hint` : null, message ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;
  return { id, message, describedBy };
}

function FieldShell({
  id,
  label,
  hint,
  message,
  required,
  children,
}: {
  id: string;
  label: ReactNode;
  hint: ReactNode;
  message: string | undefined;
  required: boolean | undefined;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {hint !== undefined && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {children}
      {message && (
        <p id={`${id}-error`} className={styles.error}>
          {message}
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  error,
  hint,
  className,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const { id, message, describedBy } = useFieldIds(error, hint);
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      message={message}
      required={props.required}
    >
      <input
        id={id}
        className={[styles.control, className].filter(Boolean).join(" ")}
        aria-invalid={message ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
    </FieldShell>
  );
}

export function TextareaField({
  label,
  error,
  hint,
  className,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { id, message, describedBy } = useFieldIds(error, hint);
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      message={message}
      required={props.required}
    >
      <textarea
        id={id}
        className={[styles.control, styles.textarea, className]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={message ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  error,
  hint,
  className,
  children,
  ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const { id, message, describedBy } = useFieldIds(error, hint);
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      message={message}
      required={props.required}
    >
      <select
        id={id}
        className={[styles.control, styles.select, className]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={message ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}
