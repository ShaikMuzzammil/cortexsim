/**
 * storage.js — Persistence via localStorage (configs/presets) with an
 * IndexedDB helper for larger recordings. Enables offline save/load and the
 * PWA experience.
 */
const KEY = "cortexsim.savedConfigs.v1";

export function listSaved() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveConfig(name, config) {
  const all = listSaved();
  all[name] = { config, savedAt: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(all));
  return all;
}

export function deleteConfig(name) {
  const all = listSaved();
  delete all[name];
  localStorage.setItem(KEY, JSON.stringify(all));
  return all;
}

export function loadConfig(name) {
  const all = listSaved();
  return all[name]?.config || null;
}

/** IndexedDB key/value for larger payloads (recordings). */
export function idbSet(key, value) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open("cortexsim", 1);
    open.onupgradeneeded = () => open.result.createObjectStore("kv");
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const tx = open.result.transaction("kv", "readwrite");
      tx.objectStore("kv").put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    };
  });
}

export function idbGet(key) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open("cortexsim", 1);
    open.onupgradeneeded = () => open.result.createObjectStore("kv");
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const tx = open.result.transaction("kv", "readonly");
      const req = tx.objectStore("kv").get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    };
  });
}
