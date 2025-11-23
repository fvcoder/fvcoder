# @fvcoder/cli

Generador de proyectos para Fernando Ticona

## Instalación

### Global

```bash
npm install -g @fvcoder/cli
# o
pnpm add -g @fvcoder/cli
```

Después de la instalación global, puedes usar el comando `fvcoder` desde cualquier lugar:

```bash
fvcoder hello
```

### Con npx

Puedes ejecutar la CLI sin instalarla globalmente usando npx:

```bash
npx @fvcoder/cli hello
```

## Comandos

### hello

Comando de prueba que imprime "Hello World"

```bash
fvcoder hello
# o con npx
npx @fvcoder/cli hello
```

## Desarrollo

### Compilar

```bash
pnpm build
```

### Modo desarrollo (watch)

```bash
pnpm dev
```

### Probar localmente

Para probar el CLI localmente antes de publicarlo:

```bash
# En el directorio del paquete
pnpm link --global

# Ahora puedes usar el comando fvcoder
fvcoder hello
```

## Publicación

```bash
pnpm release
```
