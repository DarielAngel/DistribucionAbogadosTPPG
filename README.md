Provincia Abogados

Proyecto demo con backend (Express + Sequelize) y frontend (Vue 3 + Vite).

Estructura:
- backend/: servidor Express, endpoints de auth, lawyers, schedules
- frontend/: app Vue 3 con componentes y pruebas (Vitest, Playwright)

Para desarrollar:
1. Instalar dependencias en cada carpeta: `pnpm install`
2. Iniciar backend: `pnpm --filter backend dev` (o `pnpm --filter backend start`)
3. Iniciar frontend: `pnpm --filter frontend dev`

Tests:
- Backend: `pnpm --filter backend test`
- Frontend unit: `pnpm --filter frontend test`
- E2E: `pnpm --filter frontend exec playwright test --trace=on`
