// frontend/src/test/setup.ts
import '@testing-library/jest-dom';

// localStorage mock (jsdom puede no proveerlo según la versión)
const store: Record<string, string> = {};
globalThis.localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = String(v); },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { for (const k in store) delete store[k]; },
    key: (i: number) => Object.keys(store)[i] ?? null,
    get length() { return Object.keys(store).length; },
};
