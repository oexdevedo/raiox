// Encode/decode helpers to obfuscate user data in localStorage
const encode = (data: string): string => btoa(unescape(encodeURIComponent(data)));
const decode = (data: string): string => decodeURIComponent(escape(atob(data)));

export const setSecureItem = (key: string, value: unknown): void => {
  localStorage.setItem(key, encode(JSON.stringify(value)));
};

export const getSecureItem = <T>(key: string): T | null => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(decode(raw)) as T;
  } catch {
    // Fallback: try reading as plain JSON (migration from old format)
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
};
