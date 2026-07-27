# Pxxl Boilerplates

Production-shaped starter projects for every language family supported by the Pxxl build system.

Read the complete [languages, frameworks, local-development, and deployment guide](./docs/GUIDE.md).

## What every starter guarantees

- A minimal, understandable project with no demo secrets.
- APIs expose `/`, `/health`, and `/api`.
- Server projects bind to `0.0.0.0` and use the injected `PORT`.
- Static projects emit a Pxxl-compatible output directory or need no build.
- `boilerplate.json` provides machine-readable catalog metadata.
- `pxxl.toml` is included only when the framework needs an explicit command.

## Catalog

**58 starters across 10 supported language families.**

## Dart (3)

| Starter | Type | Framework | Runtime |
|---|---|---|---|
| [Dart Frog](./dart/dart-frog) | api | dart-frog | dart |
| [Flutter Web](./dart/flutter-web) | static | flutter | dart |
| [Shelf](./dart/shelf) | api | shelf | dart |

## Dotnet (4)

| Starter | Type | Framework | Runtime |
|---|---|---|---|
| [Blazor Server](./dotnet/blazor-server) | fullstack | blazor | dotnet |
| [Controllers Api](./dotnet/controllers-api) | api | aspnetcore | dotnet |
| [Minimal Api](./dotnet/minimal-api) | api | aspnetcore | dotnet |
| [Mvc](./dotnet/mvc) | fullstack | aspnetcore-mvc | dotnet |

## Go (6)

| Starter | Type | Framework | Runtime |
|---|---|---|---|
| [Chi](./go/chi) | api | chi | go |
| [Echo](./go/echo) | api | echo | go |
| [Fiber](./go/fiber) | api | fiber | go |
| [Gin](./go/gin) | api | gin | go |
| [Gorilla Mux](./go/gorilla-mux) | api | gorilla-mux | go |
| [Standard Library](./go/standard-library) | api | net-http | go |

## Javascript (19)

| Starter | Type | Framework | Runtime |
|---|---|---|---|
| [Angular](./javascript/angular) | static | angular | node |
| [Astro Static](./javascript/astro-static) | static | astro | node |
| [Express](./javascript/express) | api | express | node |
| [Fastify](./javascript/fastify) | api | fastify | node |
| [Function](./javascript/function) | api | javascript-function | node |
| [Hono](./javascript/hono) | api | hono | node |
| [Koa](./javascript/koa) | api | koa | node |
| [Nestjs](./javascript/nestjs) | api | nestjs | node |
| [Nextjs](./javascript/nextjs) | fullstack | nextjs | node |
| [Node Api](./javascript/node-api) | api | node | node |
| [Nuxt](./javascript/nuxt) | fullstack | nuxt | node |
| [Preact Vite](./javascript/preact-vite) | static | preact | node |
| [React Vite](./javascript/react-vite) | static | react | node |
| [Solid Vite](./javascript/solid-vite) | static | solidjs | node |
| [Svelte Vite](./javascript/svelte-vite) | static | svelte | node |
| [Sveltekit](./javascript/sveltekit) | fullstack | sveltekit | node |
| [Tanstack Router Static](./javascript/tanstack-router-static) | static | tanstack-router | node |
| [Tanstack Start](./javascript/tanstack-start) | fullstack | tanstack-start | node |
| [Vue Vite](./javascript/vue-vite) | static | vue | node |

## Jvm (5)

| Starter | Type | Framework | Runtime |
|---|---|---|---|
| [Ktor Kotlin](./jvm/ktor-kotlin) | api | ktor | jvm |
| [Micronaut Java](./jvm/micronaut-java) | api | micronaut | jvm |
| [Quarkus Java](./jvm/quarkus-java) | api | quarkus | jvm |
| [Spring Boot Java](./jvm/spring-boot-java) | api | spring-boot | jvm |
| [Vertx Java](./jvm/vertx-java) | api | vertx | jvm |

## Php (5)

| Starter | Type | Framework | Runtime |
|---|---|---|---|
| [Codeigniter](./php/codeigniter) | api | codeigniter | php |
| [Laravel](./php/laravel) | api | laravel | php |
| [Slim](./php/slim) | api | slim | php |
| [Symfony](./php/symfony) | api | symfony | php |
| [Vanilla Api](./php/vanilla-api) | api | php | php |

## Python (6)

| Starter | Type | Framework | Runtime |
|---|---|---|---|
| [Django](./python/django) | api | django | python |
| [Fastapi](./python/fastapi) | api | fastapi | python |
| [Flask](./python/flask) | api | flask | python |
| [Litestar](./python/litestar) | api | litestar | python |
| [Sanic](./python/sanic) | api | sanic | python |
| [Starlette](./python/starlette) | api | starlette | python |

## Ruby (3)

| Starter | Type | Framework | Runtime |
|---|---|---|---|
| [Rails Api](./ruby/rails-api) | api | rails | ruby |
| [Roda](./ruby/roda) | api | roda | ruby |
| [Sinatra](./ruby/sinatra) | api | sinatra | ruby |

## Rust (4)

| Starter | Type | Framework | Runtime |
|---|---|---|---|
| [Actix Web](./rust/actix-web) | api | actix-web | rust |
| [Axum](./rust/axum) | api | axum | rust |
| [Rocket](./rust/rocket) | api | rocket | rust |
| [Warp](./rust/warp) | api | warp | rust |

## Static (3)

| Starter | Type | Framework | Runtime |
|---|---|---|---|
| [Html](./static/html) | static | html | static |
| [Html Css Js](./static/html-css-js) | static | vanilla | static |
| [Multipage](./static/multipage) | static | html | static |

## Repository layout

```text
<language>/<framework>/
├── boilerplate.json
├── README.md
├── dependency manifest
└── application source
```

Run `npm test` at the repository root to validate catalog metadata, JSON manifests, expected entrypoints, API health declarations, and duplicate IDs.
