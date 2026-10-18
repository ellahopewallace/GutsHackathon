// The checked-in guest lives in sessionStorage, so each browser tab is its own
// guest (handy for demoing multiplayer with two tabs) and a reload rejoins.
// The last cat is remembered in localStorage so a returning traveller starts
// from it in the picker.
const SESSION_KEY = "purr-inn:session";
const LAST_KEY = "purr-inn:last";

function read(storage, key) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(storage, key, value) {
  try {
    if (value == null) storage.removeItem(key);
    else storage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or storage disabled: the app still works, it just forgets.
  }
}

export const loadSession = () => read(sessionStorage, SESSION_KEY);
export const loadLast = () => read(localStorage, LAST_KEY);

export function saveSession(profile) {
  write(sessionStorage, SESSION_KEY, profile);
  if (profile) write(localStorage, LAST_KEY, { cat: profile.cat });
}

export function clearSession() {
  write(sessionStorage, SESSION_KEY, null);
}

// An anonymous id for multiplayer. It is never shown to anyone.
export function newGuestId() {
  return `g-${Math.random().toString(36).slice(2, 10)}`;
}
