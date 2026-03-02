import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { CountriesService } from '../../../../core/services/countries.service';
import { Country } from '../../../../core/models/country.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PopulationPipe } from '../../../../shared/pipes/population.pipe';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-detail-page',
  standalone: true,
  imports: [RouterLink, LoadingComponent, ErrorStateComponent, PopulationPipe, DecimalPipe],
  template: `
    <div class="detail-page">
      <div class="detail-nav">
        <a routerLink="/" class="back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Voltar
        </a>
      </div>

      @if (loading()) {
        <app-loading />
      } @else if (error()) {
        <app-error-state [message]="error()!" [showRetry]="false" />
      } @else if (country()) {
        <div class="detail-content">
          <div class="flag-section">
            <img
              [src]="country()!.flags.svg || country()!.flags.png"
              [alt]="country()!.flags.alt || country()!.name.common + ' flag'"
              class="detail-flag"
            />
          </div>

          <div class="info-section">
            <div class="info-header">
              <h1 class="country-name">{{ country()!.name.common }}</h1>
              <p class="country-official">{{ country()!.name.official }}</p>
            </div>

            <div class="info-grid">
              <div class="info-block">
                <h2 class="block-title">Informações Gerais</h2>
                <div class="info-rows">
                  <div class="info-row">
                    <span class="info-label">Capital</span>
                    <span class="info-value">{{ country()!.capital?.join(', ') || '—' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Região</span>
                    <span class="info-value">{{ country()!.region }}</span>
                  </div>
                  @if (country()!.subregion) {
                    <div class="info-row">
                      <span class="info-label">Sub-região</span>
                      <span class="info-value">{{ country()!.subregion }}</span>
                    </div>
                  }
                  <div class="info-row">
                    <span class="info-label">Continente(s)</span>
                    <span class="info-value">{{ country()!.continents?.join(', ') || '—' }}</span>
                  </div>
                </div>
              </div>

              <div class="info-block">
                <h2 class="block-title">Estatísticas</h2>
                <div class="info-rows">
                  <div class="info-row">
                    <span class="info-label">População</span>
                    <span class="info-value">{{ country()!.population | number:'1.0-0':'pt-BR' }}</span>
                  </div>
                  @if (country()!.area) {
                    <div class="info-row">
                      <span class="info-label">Área</span>
                      <span class="info-value">{{ country()!.area! | number:'1.0-0':'pt-BR' }} km²</span>
                    </div>
                  }
                  @if (country()!.timezones?.length) {
                    <div class="info-row">
                      <span class="info-label">Fuso Horário</span>
                      <span class="info-value">{{ country()!.timezones![0] }}</span>
                    </div>
                  }
                </div>
              </div>

              @if (country()!.currencies && objectKeys(country()!.currencies!).length > 0) {
                <div class="info-block">
                  <h2 class="block-title">Moedas</h2>
                  <div class="tag-list">
                    @for (key of objectKeys(country()!.currencies!); track key) {
                      <span class="tag tag-currency">
                        {{ country()!.currencies![key].name }}
                        @if (country()!.currencies![key].symbol) {
                          <span class="tag-symbol">({{ country()!.currencies![key].symbol }})</span>
                        }
                      </span>
                    }
                  </div>
                </div>
              }

              @if (country()!.languages && objectKeys(country()!.languages!).length > 0) {
                <div class="info-block">
                  <h2 class="block-title">Idiomas</h2>
                  <div class="tag-list">
                    @for (key of objectKeys(country()!.languages!); track key) {
                      <span class="tag">{{ country()!.languages![key] }}</span>
                    }
                  </div>
                </div>
              }
            </div>

            @if (borderCountries().length > 0) {
              <div class="borders-section">
                <h2 class="block-title">Países Fronteiriços</h2>
                <div class="borders-grid">
                  @for (border of borderCountries(); track border.cca3) {
                    <a [routerLink]="['/country', border.cca3]" class="border-card">
                      <img [src]="border.flags.svg || border.flags.png" [alt]="border.name.common" class="border-flag" />
                      <span class="border-name">{{ border.name.common }}</span>
                    </a>
                  }
                </div>
              </div>
            }

            @if (country()!.maps?.googleMaps) {
              <a [href]="country()!.maps!.googleMaps" target="_blank" rel="noopener" class="map-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
                Ver no Google Maps
              </a>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-page {
      min-height: 100vh;
      background: var(--bg);
      padding: 1.5rem var(--page-padding) 3rem;
    }
    .detail-nav { margin-bottom: 2rem; }
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface);
      transition: all 0.2s;
    }
    .back-btn:hover { border-color: var(--accent); color: var(--accent); }
    .back-btn svg { width: 16px; height: 16px; }
    .detail-content {
      display: grid;
      grid-template-columns: minmax(280px, 420px) 1fr;
      gap: 3rem;
      align-items: start;
      max-width: 1100px;
    }
    .flag-section {
      position: sticky;
      top: 1.5rem;
    }
    .detail-flag {
      width: 100%;
      border-radius: 12px;
      border: 1px solid var(--border);
      box-shadow: 0 8px 32px var(--shadow);
    }
    .info-header { margin-bottom: 2rem; }
    .country-name {
      font-family: var(--font-display);
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.25rem;
      letter-spacing: -0.03em;
    }
    .country-official {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin: 0;
      font-style: italic;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .info-block { display: flex; flex-direction: column; gap: 0.75rem; }
    .block-title {
      font-family: var(--font-display);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent);
      margin: 0;
    }
    .info-rows { display: flex; flex-direction: column; gap: 0.5rem; }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border);
    }
    .info-label {
      font-size: 0.78rem;
      color: var(--text-muted);
      white-space: nowrap;
    }
    .info-value {
      font-size: 0.85rem;
      color: var(--text-primary);
      font-weight: 500;
      text-align: right;
    }
    .tag-list { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .tag {
      padding: 0.3rem 0.7rem;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 999px;
      font-size: 0.78rem;
      color: var(--text-secondary);
    }
    .tag-currency { border-color: var(--accent-muted); color: var(--accent); }
    .tag-symbol { opacity: 0.7; }
    .borders-section {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      grid-column: 1 / -1;
    }
    .borders-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .border-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      text-decoration: none;
      padding: 0.5rem;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--surface);
      transition: all 0.2s;
      width: 80px;
    }
    .border-card:hover { border-color: var(--accent); transform: translateY(-2px); }
    .border-flag { width: 60px; height: 40px; object-fit: cover; border-radius: 4px; }
    .border-name { font-size: 0.65rem; text-align: center; color: var(--text-secondary); line-height: 1.2; }
    .map-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 2rem;
      padding: 0.65rem 1.25rem;
      background: var(--accent);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      transition: opacity 0.2s;
      grid-column: 1 / -1;
      width: fit-content;
    }
    .map-link:hover { opacity: 0.85; }
    .map-link svg { width: 16px; height: 16px; }
    @media (max-width: 768px) {
      .detail-content { grid-template-columns: 1fr; gap: 1.5rem; }
      .flag-section { position: static; }
      .info-grid { grid-template-columns: 1fr; }
      .country-name { font-size: 1.75rem; }
    }
  `]
})
export class DetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private countriesService = inject(CountriesService);

  country = signal<Country | null>(null);
  borderCountries = signal<Country[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  objectKeys = Object.keys;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const code = params.get('code')!;
          this.loading.set(true);
          this.error.set(null);
          this.borderCountries.set([]);
          return this.countriesService.getByCode(code);
        })
      )
      .subscribe({
        next: (c) => {
          this.country.set(c);
          this.loading.set(false);
          if (c.borders?.length) {
            this.loadBorders(c.borders);
          }
        },
        error: (err) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  private loadBorders(borders: string[]): void {
    this.countriesService.getByCodesBulk(borders).subscribe({
      next: (countries) => this.borderCountries.set(countries),
      error: () => {},
    });
  }
}
