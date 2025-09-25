import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function saveProject<T>(data: T): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("hajlajts:lastProject", JSON.stringify(data)); } catch {}
}

export function loadProject<T>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem("hajlajts:lastProject");
    return s ? (JSON.parse(s) as T) : null;
  } catch {
    return null;
  }
}