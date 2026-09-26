import { useEffect, useRef, useState } from "react";

/**
 * Calls `onSettled` once `value` has stopped changing for `delay` ms
 * (typing in a search field…). The latest callback is always used.
 */
export function useSettledValue<T>(
  value: T,
  delay: number,
  onSettled: (value: T) => void,
) {
  const onSettledRef = useRef(onSettled);
  useEffect(() => {
    onSettledRef.current = onSettled;
  });

  useEffect(() => {
    const timeout = setTimeout(() => onSettledRef.current(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
}

/**
 * A text input whose value lives in the URL: the typed value is committed
 * after a pause, and outside changes of the URL (back button, reset…)
 * replace the typed value without fighting the navigation.
 */
export function useUrlBackedInput(
  urlValue: string,
  delay: number,
  /** Writes the value to the URL and returns it as the URL will hold it (trimmed…). */
  commit: (value: string) => string,
) {
  const [value, setValue] = useState(urlValue);
  const [synced, setSynced] = useState(urlValue);

  // The URL changed without us: adopt its value (React "derived state" pattern)
  if (urlValue !== synced) {
    setSynced(urlValue);
    setValue(urlValue);
  }

  useSettledValue(value, delay, (typed) => {
    setSynced(commit(typed));
  });

  return [value, setValue] as const;
}
