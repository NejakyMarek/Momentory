export function saveProject(data: any) {
  try { localStorage.setItem("hajlajts:lastProject", JSON.stringify(data)); } catch {}
}
export function loadProject<T = any>() {
  try { const s = localStorage.getItem("hajlajts:lastProject"); return s ? JSON.parse(s) as T : null; } catch { return null; }
}