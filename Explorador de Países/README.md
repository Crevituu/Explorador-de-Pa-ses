# World Explorer — Explorador de Países

Aplicação Angular para explorar informações de países do mundo, consumindo a [REST Countries API](https://restcountries.com).

---

## Como rodar localmente

### Pré-requisitos
- Node.js 18+ e npm

### Passos

```bash
# Clone o repositório
git clone https://github.com/Crevituu/countries-explorer.git
cd countries-explorer

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm start
```

Acesse em `http://localhost:4200`.

---

## Funcionalidades

-  Listagem de todos os países com bandeira, capital, população e região
-  Busca em tempo real por nome (debounce de 400ms)
-  Filtro por região (África, Américas, Ásia, Europa, Oceania)
-  Ordenação por nome, população ou área (asc/desc)
-  Página de detalhe com informações completas
-  Navegação direta para países fronteiriços
-  Estados de loading e erro com opção de retry
-  Design responsivo para mobile
-  Link para o Google Maps de cada país

---

## Decisões técnicas

### Angular 18 com Standalone Components
Optei por standalone components ao invés de NgModules para simplificar a estrutura. Isso é o padrão recomendado no Angular moderno e torna o lazy loading mais direto.

### Signals para gerenciamento de estado (`CountriesStateService`)
Utilizei a API de Signals do Angular (estável desde v17) em vez de NgRx ou BehaviorSubjects para o estado da listagem. Os motivos foram:
- **Reatividade granular**: componentes apenas re-renderizam quando seus signals específicos mudam
- **Zero boilerplate**: sem actions, reducers ou selectors — o estado é uma função simples
- **Leitura síncrona**: sem `async pipe` ou `.subscribe()` no template para estados simples

Para a lógica de busca (debounce + switchMap), mantive RxJS via `Subject`, que é o lugar certo para lidar com eventos de tempo.

### Lazy loading de rotas
Todas as páginas usam `loadComponent()` para lazy loading automático, reduzindo o bundle inicial.

### Separação de responsabilidades
```
core/
  models/     → interfaces TypeScript
  services/   → CountriesService (HTTP) + CountriesStateService (estado)
features/
  countries/  → componentes e páginas da feature principal
shared/       → componentes e pipes reutilizáveis
```

### `CountriesService` vs `CountriesStateService`
- **CountriesService**: puramente HTTP, sem estado. Fácil de testar e reutilizar.
- **CountriesStateService**: toda a lógica de UI (busca, filtro, ordenação). Componentes são "burros" — só projetam o estado.

### Otimizações de performance
- `fields=` na API para requisitar apenas os campos necessários (bundle menor)
- `loading="lazy"` nas imagens de bandeira
- `track by` no `@for` pelo `cca3` (código único)
- `distinctUntilChanged()` para evitar requisições duplicadas na busca

### Design System
Escolhi um tema dark editorial usando:
- **Fraunces** (display serif): personalidade, contraste com dados técnicos
- **DM Sans** (body sans-serif): legibilidade em tabelas de dados
- CSS custom properties para consistência total
- View Transitions API do Angular 18 para navegação suave

---

## O que faria diferente com mais tempo

1. **Testes**: unit tests para `CountriesStateService` e `CountriesService`, e e2e com Playwright para os fluxos principais
2. **Cache HTTP**: interceptor que armazena respostas em memória por sessão para evitar refetch desnecessário
3. **Virtualização**: para a listagem de ~250 países, usar `@angular/cdk`'s virtual scroll melhoraria performance em mobile
4. **PWA**: manifest + service worker para uso offline
5. **i18n**: a API retorna nomes nativos — valeria mostrar o nome no idioma local como secundário
6. **Skeleton loading**: substituir o spinner por skeleton cards para UX mais polida
7. **Favoritos**: persistir países favoritos no localStorage

---

## Estrutura do projeto

```
src/
└── app/
    ├── core/
    │   ├── models/
    │   │   └── country.model.ts
    │   └── services/
    │       ├── countries.service.ts
    │       └── countries-state.service.ts
    ├── features/
    │   ├── countries/
    │   │   ├── components/
    │   │   │   ├── country-card/
    │   │   │   ├── search-bar/
    │   │   │   ├── region-filter/
    │   │   │   └── sort-control/
    │   │   └── pages/
    │   │       ├── list-page/
    │   │       └── detail-page/
    │   └── not-found/
    └── shared/
        ├── components/
        │   ├── loading/
        │   └── error-state/
        └── pipes/
            └── population.pipe.ts
```
