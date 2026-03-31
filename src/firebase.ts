// This project previously used Firebase for authentication.
// The app now uses a local-only mock auth (see `src/contexts/AuthContext.tsx`).
//
// Keeping this module as a stub prevents accidental reintroduction of real auth
// without wiring it intentionally. Importing anything from here will throw.
export const auth = (() => {
  throw new Error('Firebase auth is disabled in this project.');
})();

export const db = (() => {
  throw new Error('Firebase db is disabled in this project.');
})();

export const googleProvider = (() => {
  throw new Error('Firebase auth is disabled in this project.');
})();
