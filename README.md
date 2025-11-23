# Fitness Platform Monorepo

Monorepo inicial para microservicios de autenticación, usuarios, rutinas y mensajería, más frontend React.

## Estructura
- `services/auth`: servicio Go con endpoints `/register`, `/login`, `/refresh` y pruebas unitarias de servicio.
- `services/users`: placeholders para perfil, lista de alumnos y eliminación.
- `services/routines`: stub de CRUD con paginado y hooks para Solr/Memcached.
- `services/messaging`: stub para conversaciones y mensajes.
- `services/common`: middleware JWT reutilizable.
- `web`: frontend React con rutas Home, Login, Registro y Dashboard.
- `db/mysql_schema.sql`: esquema inicial de MySQL (usuarios/roles).
- `db/mongo_collections.json`: definición de colecciones de MongoDB para mensajes.

## Ejecución
```bash
make up  # opcional si se agrega un Makefile
# o
docker-compose up --build
```

Servicios expuestos: auth 8081, users 8082, routines 8083, messaging 8084, frontend 5173, Solr 8983, Memcached 11211, MySQL 3306, MongoDB 27017, RabbitMQ 5672/15672.

Variables de entorno importantes:
- `JWT_SECRET`, `REFRESH_SECRET`, `ADMIN_USER`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (auth-service)
- `SOLR_HOST`, `MEMCACHED_HOST` (routines-service)
- `MONGO_URI`, `RABBITMQ_URI` (messaging-service)
