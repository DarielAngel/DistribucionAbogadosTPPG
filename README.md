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

Despliegue con Docker:
1. `cp .env.example .env` y editar `JWT_SECRET`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` con valores reales de producción.
2. `docker compose build`
3. `docker compose up -d` — levanta `db` (Postgres 16, con volumen persistente `db_data` y healthcheck), `backend` (espera a que `db` esté healthy antes de arrancar y crea el esquema vía `sequelize.sync()`) y `frontend` (Nginx sirviendo el build y haciendo proxy de `/api/` al backend).
4. Verificar: `docker compose ps` (los 3 servicios en estado healthy/running) y `curl http://localhost/api/config/blocked-days` (tras iniciar sesión) o revisar `docker compose logs backend`.
5. Para reiniciar desde cero: `docker compose down -v` elimina también el volumen de datos.
