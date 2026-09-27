import type { ButtonHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router";
import styles from "./Button.module.css";
import { Spinner } from "./Spinner.tsx";

interface ButtonStyle {
  /** `light` is the quiet variant for dark backgrounds. */
  variant?: "primary" | "secondary" | "ghost" | "light" | "danger";
  size?: "sm" | "md" | "lg";
  /** Takes the full width of its container. */
  block?: boolean;
}

const buttonClass = (
  { variant = "primary", size = "md", block = false }: ButtonStyle,
  className?: string,
) =>
  [
    styles.button,
    styles[variant],
    styles[size],
    block && styles.block,
    className,
  ]
    .filter(Boolean)
    .join(" ");

interface ButtonProps
  extends ButtonStyle, ButtonHTMLAttributes<HTMLButtonElement> {
  /** Shows a spinner and disables the button while an action runs. */
  loading?: boolean;
}

export function Button({
  variant,
  size,
  block,
  loading = false,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, block }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

/** A navigation link that looks like a button. */
export function ButtonLink({
  variant,
  size,
  block,
  className,
  ...props
}: ButtonStyle & LinkProps) {
  return (
    <Link
      className={buttonClass({ variant, size, block }, className)}
      {...props}
    />
  );
}
