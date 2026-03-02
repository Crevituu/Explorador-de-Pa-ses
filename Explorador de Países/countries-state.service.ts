import { Injectable, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Country, Region, SortField, SortOrder } from '../models/country.model';
import { CountriesService } from './countries.service';

interface CountriesState {
  allCountries: Country[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedRegion: Region;
  sortField: SortField;
  sortOrder: SortOrder;
}

@Injectable({
  providedIn: 'root',
})
export class CountriesStateService {
  private state = signal<CountriesState>({
    allCountries: [],
    loading: false,
    error: null,
    searchQuery: '',
    selectedRegion: '',
    sortField: 'name',
    sortOrder: 'asc',
  });

  // Public readable signals
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);
  searchQuery = computed(() => this.state().searchQuery);
  selectedRegion = computed(() => this.state().selectedRegion);
  sortField = computed(() => this.state().sortField);
  sortOrder = computed(() => this.state().sortOrder);

  filteredCountries = computed(() => {
    const { allCountries, sortField, sortOrder } = this.state();
    return [...allCountries].sort((a, b) => {
      let valA: string | number;
      let valB: string | number;

      if (sortField === 'name') {
        valA = a.name.common.toLowerCase();
        valB = b.name.common.toLowerCase();
      } else if (sortField === 'population') {
        valA = a.population;
        valB = b.population;
      } else {
        valA = a.area ?? 0;
        valB = b.area ?? 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  });

  private searchSubject = new Subject<string>();

  constructor(private countriesService: CountriesService) {
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((query) => {
          this.patchState({ loading: true, error: null });
          if (!query.trim()) {
            const region = this.state().selectedRegion;
            const obs$ = region
              ? this.countriesService.getByRegion(region)
              : this.countriesService.getAllCountries();
            return obs$.pipe(catchError((err) => {
              this.patchState({ error: err.message, loading: false });
              return of([]);
            }));
          }
          return this.countriesService.searchByName(query).pipe(
            catchError((err) => {
              this.patchState({ error: err.message, loading: false });
              return of([]);
            })
          );
        })
      )
      .subscribe((countries) => {
        this.patchState({ allCountries: countries, loading: false });
      });

    this.loadCountries();
  }

  loadCountries(): void {
    this.patchState({ loading: true, error: null });
    const region = this.state().selectedRegion;
    const obs$ = region
      ? this.countriesService.getByRegion(region)
      : this.countriesService.getAllCountries();

    obs$.pipe(
      catchError((err) => {
        this.patchState({ error: err.message, loading: false });
        return of([]);
      })
    ).subscribe((countries) => {
      this.patchState({ allCountries: countries, loading: false });
    });
  }

  setSearch(query: string): void {
    this.patchState({ searchQuery: query });
    this.searchSubject.next(query);
  }

  setRegion(region: Region): void {
    this.patchState({ selectedRegion: region, searchQuery: '' });
    this.loadCountries();
  }

  setSort(field: SortField): void {
    const current = this.state();
    if (current.sortField === field) {
      this.patchState({ sortOrder: current.sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      this.patchState({ sortField: field, sortOrder: 'asc' });
    }
  }

  private patchState(partial: Partial<CountriesState>): void {
    this.state.update((s) => ({ ...s, ...partial }));
  }
}
