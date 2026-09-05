import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCoordinate(value: number, type: 'lat' | 'lon'): string {
  const abs = Math.abs(value);
  const direction = type === 'lat' ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
  return `${abs.toFixed(2)}° ${direction}`;
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getSafetyColor(status: string): string {
  switch (status) {
    case 'SAFE': return '#10b981';
    case 'MODERATE': return '#f59e0b';
    case 'DANGEROUS': return '#ef4444';
    case 'CRITICAL': return '#dc2626';
    default: return '#6b7280';
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'LOW': return '#3b82f6';
    case 'MEDIUM': return '#f59e0b';
    case 'HIGH': return '#ef4444';
    case 'CRITICAL': return '#dc2626';
    default: return '#6b7280';
  }
}

export function getMetricStatusColor(status: string): string {
  switch (status) {
    case 'good': return 'text-emerald-400';
    case 'moderate': return 'text-amber-400';
    case 'warning': return 'text-orange-400';
    case 'danger': return 'text-red-400';
    default: return 'text-slate-400';
  }
}

export function getMetricBgColor(status: string): string {
  switch (status) {
    case 'good': return 'bg-emerald-500/10 border-emerald-500/20';
    case 'moderate': return 'bg-amber-500/10 border-amber-500/20';
    case 'warning': return 'bg-orange-500/10 border-orange-500/20';
    case 'danger': return 'bg-red-500/10 border-red-500/20';
    default: return 'bg-slate-500/10 border-slate-500/20';
  }
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: NodeJS.Timeout;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function validateCoordinate(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}
