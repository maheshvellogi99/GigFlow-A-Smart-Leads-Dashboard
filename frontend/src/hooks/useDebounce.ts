// ============================================================
// GigFlow Frontend — Generic Debounce Hook
// Delays updating a value until after a specified period of
// inactivity. Used to prevent API spamming on search inputs.
// ============================================================

import { useState, useEffect } from "react";

const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect((): (() => void) => {
    const timerId: ReturnType<typeof setTimeout> = setTimeout((): void => {
      setDebouncedValue(value);
    }, delay);

    return (): void => {
      clearTimeout(timerId);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
