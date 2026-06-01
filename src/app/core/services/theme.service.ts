import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  readonly isDark = signal<boolean>(this.readPreference());

  constructor() {
    effect(() => {
      const dark = this.isDark();
      this.doc.documentElement.classList.toggle('app-dark', dark);
      try {
        localStorage.setItem('theme', dark ? 'dark' : 'light');
      } catch {}
    });
  }

  toggle(): void {
    this.isDark.update(v => !v);
  }

  private readPreference(): boolean {
    try {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  }
}
