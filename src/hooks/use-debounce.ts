import { useEffect, useState } from "react";

/**
 * Menunda perubahan nilai selama `delay` ms.
 * Berguna agar request search tidak dikirim setiap karakter diketik.
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
