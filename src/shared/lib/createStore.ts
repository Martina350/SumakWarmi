import { useSyncExternalStore } from 'react';
export const storageWarnings: string[] = [];

export function createStore<T>(initialState: T, storageKey?: string) {
  let state = initialState;

  if (storageKey && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        state = JSON.parse(stored);
      }
    } catch {
      storageWarnings.push(
        `No se pudieron leer los datos de ${storageKey}. El contenido anterior sigue en el almacenamiento; descarga un respaldo antes de restablecer.`,
      );
    }
  }

  const listeners = new Set<() => void>();

  const getState = () => state;

  const setState = (updater: T | ((prev: T) => T)) => {
    const nextState =
      typeof updater === 'function'
        ? (updater as (prev: T) => T)(state)
        : updater;
    if (storageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(nextState));
      } catch {
        throw new Error(
          'No se pudieron guardar los datos. Libera espacio de almacenamiento y vuelve a intentar.',
        );
      }
    }
    state = nextState;
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  function useStore(): T;
  function useStore<U>(selector: (state: T) => U): U;
  function useStore<U>(selector?: (state: T) => U): U | T {
    return useSyncExternalStore(
      subscribe,
      () => (selector ? selector(state) : state),
      () => (selector ? selector(initialState) : initialState),
    );
  }

  return { getState, setState, subscribe, useStore };
}
