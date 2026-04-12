# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server with auto-open (ng serve -o)
npm run build      # Production build (runs tests first via prebuild)
npm test           # Run tests with Vitest (Chromium required)
ng generate component features/<domain>/<name>  # New standalone component
```

> Note: `npm run build` triggers `prebuild`, which runs the full test suite. Use `ng build` directly to skip tests.

## Architecture

**JA-Leilões** is an Angular 21 admin dashboard for a livestock auction (leilão) management system, built on the CoreUI Free Angular template. The backend runs at `http://localhost:8080`.

### App Bootstrap

The app uses **standalone components throughout** — no NgModules. Entry point is `src/main.ts` → `app.config.ts` (providers) → `app.routes.ts` (routes). All routes use lazy `loadComponent()`. Hash-based routing is enabled (`withHashLocation()`).

### Core Layer (`src/app/core/`)

- **`ApiService<T>`** (`services/api.service.ts`) — Abstract base class for all domain services. Extend it and set `endpoint` to get `listar()`, `buscarPorId()`, `salvar()`, `atualizar()`, `deletar()` targeting `${backendUrl}/api/${endpoint}`. Services import directly from `environment.development.ts` (not `environment.ts`).
- **`AuthService`** — JWT stored in `localStorage` as `auth_token`. Decodes payload client-side via `atob`. Exposes `hasPermission(ambiente, acao)` which checks `permissoes` array (format: `"ambiente:acao"`) and short-circuits for admins. Login also connects the WebSocket.
- **`authInterceptor`** — Functional interceptor that attaches `Authorization: Bearer <token>` to all outgoing HTTP requests.
- **Guards**: `authGuard` (requires login), `adminGuard` (requires `isAdmin` in token payload).
- **`LoteWebsocketService`** — STOMP over SockJS connecting to `ws://localhost:8080/ws-leilao?token=<jwt>`. Subscribes to `/topic/lotes` and emits via `novoLoteSubject` (RxJS `Subject`). Connects on login, disconnects on logout.

### Component Structure (Two Parallel Trees)

There are **two component directories** in active use during an ongoing migration:

| Directory | Status | Pattern |
|---|---|---|
| `src/app/components/` | Legacy — being replaced | `<entity>-list` / `<entity>-details` naming |
| `src/app/features/` | Current — new work goes here | `<entity>-lista` / `<entity>-form` naming |

When adding or modifying features, prefer `src/app/features/`. The `features/shared-components/subform/` contains a reusable subform component.

### Evento de Leilão

Componente `evento-leilao` (`src/app/components/leilao/evento-leilao/`) — Tela de execução do leilão em tempo real. Rota: `/leiloes/:id/evento`. Acessível via botão de martelo na lista de leilões e botão "Evento" na visualização do leilão. Ciclo: Aberto → Em Andamento → Finalizado.

### Confirmação Customizável

O `AlertService.confirm()` aceita parâmetros opcionais `confirmLabel` e `confirmColor` para customizar o botão do modal (padrão: "Excluir" vermelho). Exemplo: `this.alert.confirm('Mensagem', callback, 'Confirmar', 'success')`.

### Input Masks

`ngx-mask` is configured globally via `provideNgxMask()`. Masks are applied for CPF, CNPJ, RG, and phone numbers using the `mask` directive.

### Styles

Global styles are in `src/scss/styles.scss`. Components use `.scss` files. CoreUI component library (`@coreui/angular`) provides the layout and UI primitives. FontAwesome is loaded globally via CSS.

### Docker

`docker-compose.yml` builds an nginx container serving the compiled app on port 4200:80. It connects to the external Docker network `erpleilao_default`, which must be created separately (shared with the backend stack).
