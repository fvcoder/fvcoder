# Release Guide

Este monorepo usa `release-it` para gestionar los releases de los paquetes.

## Configuración

- **Raíz del monorepo**: Configuración global en `.release-it.json`
- **Paquete CLI**: Configuración específica en `packages/cli/.release-it.json`

## Características

- ✅ Versionado automático
- ✅ Generación de CHANGELOG usando conventional commits
- ✅ Creación de tags en Git
- ✅ Creación de releases en GitHub
- ✅ Build automático antes del release
- ✅ Publicación en npm (configurable por paquete)

## Comandos

### Desde la raíz del monorepo

```bash
# Dry run - ver qué haría sin ejecutar
pnpm release --dry-run

# Release del proyecto principal
pnpm release
```

### Desde un paquete específico

```bash
cd packages/cli

# Dry run del paquete CLI
pnpm release --dry-run

# Release del paquete CLI
pnpm release
```

## Conventional Commits

Para que el CHANGELOG se genere correctamente, usa conventional commits:

- `feat:` - Nueva funcionalidad (incrementa versión MINOR)
- `fix:` - Corrección de bug (incrementa versión PATCH)
- `chore:` - Cambios que no afectan el código
- `docs:` - Cambios en documentación
- `style:` - Cambios de formato
- `refactor:` - Refactorización de código
- `perf:` - Mejoras de rendimiento
- `test:` - Añadir o corregir tests

### Breaking Changes

Para incrementar la versión MAJOR:

```bash
git commit -m "feat!: cambio que rompe compatibilidad"
# o
git commit -m "feat: nueva funcionalidad

BREAKING CHANGE: descripción del cambio que rompe compatibilidad"
```

## Workflow recomendado

1. **Hacer cambios y commits** usando conventional commits
2. **Compilar el proyecto**: `pnpm build`
3. **Probar el release**: `pnpm release --dry-run`
4. **Ejecutar el release**: `pnpm release`
5. El sistema automáticamente:
   - Compila el código (hook before:init)
   - Genera el CHANGELOG
   - Actualiza la versión en package.json
   - Crea un commit de release
   - Crea un tag
   - Hace push a GitHub
   - Crea un release en GitHub
   - Publica en npm (si está configurado)

## Configuración específica por paquete

### @fvcoder/cli

- **Tag format**: `@fvcoder/cli@{version}`
- **Commit message**: `chore: release @fvcoder/cli v{version}`
- **npm publish**: Habilitado
- **Pre-release hook**: Compila el código TypeScript

## Notas

- Asegúrate de tener acceso a GitHub y npm antes de hacer un release
- Los releases se publican automáticamente en GitHub
- El CHANGELOG se actualiza automáticamente con cada release
