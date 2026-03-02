import { Component, inject } from '@angular/core';
import { CountriesStateService } from '../../../../core/services/countries-state.service';
import { CountryCardComponent } from '../../components/country-card/country-card.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { RegionFilterComponent } from '../../components/region-filter/region-filter.component';
import { SortControlComponent } from '../../components/sort-control/sort-control.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-list-page',
  standalone: true,
  imports: [
    CountryCardComponent,
    SearchBarComponent,
    RegionFilterComponent,
    SortControlComponent,
    LoadingComponent,
    ErrorStateComponent,
  ],
  template: `
    <div class="page">
      <header class="page-header">
        <div class="header-top">
          <div class="brand">
            <span class="brand-globe">🌍</span>
            <div>
              <h1 class="brand-title">World Explorer</h1>
              <p class="brand-sub">{{ state.filteredCountries().length }} países</p>
            </div>
          </div>
          <app-search-bar />
        </div>
        <div class="header-filters">
          <app-region-filter />
          <app-sort-control />
        </div>
      </header>

      <main class="page-main">
        @if (state.loading()) {
          <app-loading />
        } @else if (state.error()) {
          <app-error-state
            [message]="state.error()!"
            (retry)="state.loadCountries()"
          />
        } @else if (state.filteredCountries().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">🔍</span>
            <p>Nenhum país encontrado para "<strong>{{ state.searchQuery() }}</strong>"</p>
          </div>
        } @else {
          <div class="country-grid">
            @for (country of state.filteredCountries(); track country.cca3) {
              <app-country-card [country]="country" />
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      background: var(--bg);
    }
    .page-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--bg);
      border-bottom: 1px solid var(--border);
      padding: 1.25rem var(--page-padding);
      display: flex;
      flex-direction: column;
      gap: 1rem;
      backdrop-filter: blur(12px);
    }
    .header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .brand-globe { font-size: 2rem; line-height: 1; }
    .brand-title {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -0.02em;
    }
    .brand-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin: 0;
    }
    .header-filters {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
      justify-content: space-between;
    }
    .page-main {
      padding: 2rem var(--page-padding);
    }
    .country-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.25rem;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 4rem 2rem;
      color: var(--text-muted);
      text-align: center;
    }
    .empty-icon { font-size: 3rem; }
    @media (max-width: 600px) {
      .country-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
      .header-filters { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class ListPageComponent {
  state = inject(CountriesStateService);
}
