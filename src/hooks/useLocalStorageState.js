import { useState, useEffect } from 'react';

/**
 * Igual que useState, pero persiste el valor en localStorage bajo `key`.
 * Si localStorage no está disponible (modo privado, iframe restringido,
 * etc.) el hook sigue funcionando normalmente, solo que sin persistir.
 */
export function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage no disponible: seguimos sin persistir, sin romper la app.
    }
  }, [key, value]);

  return [value, setValue];
}
