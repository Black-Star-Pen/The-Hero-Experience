import { useState, type FormEvent } from "react";
import { z } from "zod";
import { ApiError, type FieldErrors } from "./api.ts";

/** The text values of a form, keyed by field name. */
export const formValues = (form: HTMLFormElement): Record<string, string> =>
  Object.fromEntries(
    [...new FormData(form).entries()].map(([key, value]) => [
      key,
      typeof value === "string" ? value : value.name,
    ]),
  );

/** Focuses the first invalid control (or the first radio of an invalid group). */
const focusFirstError = (form: HTMLFormElement) => {
  requestAnimationFrame(() => {
    form
      .querySelector<HTMLElement>(
        '[aria-invalid="true"]:is(input, select, textarea), [aria-invalid="true"] input',
      )
      ?.focus();
  });
};

/**
 * Validates a form with the same Zod schema as the API, then submits it.
 * Field errors (from Zod or from the API) and the general error of the last
 * submission are exposed for display.
 */
export function useZodForm<S extends z.ZodType>(
  schema: S,
  onValid: (data: z.output<S>) => Promise<unknown>,
) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (
    form: HTMLFormElement,
    toInput: (values: Record<string, string>) => unknown,
  ) => {
    const result = schema.safeParse(toInput(formValues(form)));
    if (!result.success) {
      setFieldErrors(z.flattenError(result.error).fieldErrors);
      setFormError(null);
      focusFirstError(form);
      return;
    }
    setFieldErrors({});
    setFormError(null);
    try {
      await onValid(result.data);
    } catch (error) {
      if (
        error instanceof ApiError &&
        Object.keys(error.fieldErrors).length > 0
      ) {
        setFieldErrors(error.fieldErrors);
        focusFirstError(form);
      } else {
        setFormError(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    }
  };

  /** `toInput` turns the raw text values into the input of the schema. */
  const handleSubmit =
    (
      toInput: (values: Record<string, string>) => unknown = (values) => values,
    ) =>
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void submit(event.currentTarget, toInput);
    };

  return { fieldErrors, formError, handleSubmit };
}
