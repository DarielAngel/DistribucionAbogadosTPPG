# Aplicación auxiliar de administración de BD

Este módulo proporciona endpoints administrativos seguros para revisiones rápidas (estado de BD, conteos, exportación CSV) pensados para uso por administradores.

Buenas prácticas y recomendaciones de despliegue
- Autenticación: usar siempre JWT con rol `admin`. El middleware existente `authenticate` + `authorize('admin')` protege las rutas.
- Red y acceso: desplegar la app administrativa solo en una red de administración (VPN) o en una instancia dentro de la VPC; no exponerla públicamente.
- IP Whitelist: utilice la variable de entorno `ADMIN_ALLOWED_IPS` con IPs confiables separadas por comas. Si está vacía, el middleware no filtra (control externo obligatorio).
- TLS: servir siempre detrás de un proxy con TLS (NGINX, ALB). No enviar tokens por HTTP sin TLS.
- Principio de mínimo privilegio: usar un usuario de BD con permisos limitados para tareas de sólo lectura/export. Operaciones destructivas deben requerir herramientas separadas y procesos manuales.
- Logs y auditoría: habilite registros de acceso y auditoría para todas las llamadas administrativas. Mantenga los logs fuera de la propia máquina (SIEM/Stack de logs).
- Rate limiting y WAF: aplique límites de tasa y reglas WAF para mitigar abuso.
- Backups: no dependa de esta interfaz para backups; utilice procesos de backup automáticos y probados.

Endpoints añadidos
- `GET /api/admin/db-status` — check básico de conexión a la BD.
- `GET /api/admin/tables` — conteo de registros por tabla (`users`, `lawyers`, `schedules`).
- `GET /api/admin/export/:table` — descarga CSV de tablas permitidas (solo lectura).
- `GET /api/admin/maintenance/actions` — lista de acciones soportadas (actualmente solo `ping`).

Notas de seguridad
- No añadir endpoints que ejecuten SQL arbitrario ni migraciones destructivas sin protección adicional (hardware auth / manual approval).
- En producción se recomienda deshabilitar `export` si no es necesario y siempre exigir conexión desde la red administrativa.

Variables de entorno útiles
- `ADMIN_ALLOWED_IPS` — lista de IPs confiables para acceso administrativo.

Si quieres, puedo:
- Añadir una UI administrativa separada (frontend) restringida por autenticación.
- Añadir auditoría de acciones (tabla `admin_logs`) para registrar quién hizo qué.
- Integrar con backups o tasks seguras ejecutadas por cron jobs fuera del servidor de app.
