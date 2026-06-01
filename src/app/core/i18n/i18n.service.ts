import { Injectable, signal, effect } from '@angular/core';
import { Lang, TranslationKey, translations } from './translations';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(this.readLang());

  constructor() {
    effect(() => {
      try {
        localStorage.setItem('lang', this.lang());
      } catch {}
    });
  }

  t(key: TranslationKey): string {
    return translations[this.lang()][key];
  }

  toggle(): void {
    this.lang.update(l => (l === 'es' ? 'en' : 'es'));
  }

  private readLang(): Lang {
    try {
      const stored = localStorage.getItem('lang');
      if (stored === 'es' || stored === 'en') return stored;
    } catch {}
    return 'es';
  }
}
