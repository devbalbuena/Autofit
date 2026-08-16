const KEY = 'autofit_history';
const MAX = 10;

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch { return []; }
}

export function saveToHistory(entry) {
  // entry: { id, name, dataUrl, savedAt }
  const list = loadHistory().filter(e => e.id !== entry.id);
  list.unshift(entry);
  if (list.length > MAX) list.length = MAX;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) {
    // Storage full — drop oldest and retry
    list.pop();
    localStorage.setItem(KEY, JSON.stringify(list));
  }
  return list;
}

export function removeFromHistory(id) {
  const list = loadHistory().filter(e => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
  return list;
}

export function clearHistory() {
  localStorage.removeItem(KEY);
  return [];
}
