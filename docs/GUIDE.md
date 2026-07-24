# Pxxl Boilerplates Guide

This repository contains 57 starter applications across every language family currently supported by the Pxxl build system. Use this guide to select, run, modify, and deploy a starter.

## Quick start

1. Choose a starter from the catalog below.
2. Copy its directory into a new repository, or select that directory as the base directory of a monorepo deployment.
3. Run it locally using the command documented for its language.
4. Push the repository to GitHub or GitLab.
5. Create a project in Pxxl and select the repository, branch, and base directory.
6. Leave commands empty when the framework can be detected automatically. Pxxl reads `pxxl.toml` when a starter needs an explicit command.

Each API and full-stack starter provides:

- `/` — service information or the application page.
- `/api` — a small example JSON response.
- `/health` — a fast JSON health response used for runtime checks.

All server applications listen on `0.0.0.0` and read their port from the `PORT` environment variable.

## Project types

### Static

Static projects produce files rather than a continuously running server.

- Plain HTML starters are deployed without an install or build step.
- Built frontend starters run their install and build commands first.
- The final output is uploaded to Pxxl's R2-backed static release storage.
- Pxxl updates the active route after the release is ready.
- No application runtime container, runtime RAM, or runtime CPU is required.

Typical static outputs are `dist`, `dist/browser`, and `build/web`.

### API

API starters produce a long-running HTTP service.

- Dependencies and source are built on the Pxxl build worker.
- The packaged application runs inside a gVisor-isolated runtime container.
- The runtime receives `PORT` and project environment variables.
- Pxxl checks `/health` before switching traffic.

### Full-stack

Full-stack starters render pages on the server and may also expose API routes.

- They follow the same runtime-container flow as API projects.
- They include a framework-specific production start command.
- Static assets are built with the application, while server rendering runs in the container.

## Repository structure

```text
<language>/<starter>/
├── boilerplate.json
├── README.md
├── dependency manifest
├── pxxl.toml             # only when an explicit Pxxl command is needed
└── application source
```

Important repository files:

| File | Purpose |
|---|---|
| `README.md` | Short catalog with links to every starter. |
| `docs/GUIDE.md` | This complete usage and framework guide. |
| `catalog.json` | Machine-readable catalog consumed by tooling and UI integrations. |
| `scripts/generate.mjs` | Reproducibly generates all starters and their metadata. |
| `scripts/validate.mjs` | Checks metadata, routes, JSON, Pxxl configuration, and catalog integrity. |
| `.github/workflows/validate.yml` | Builds the main JavaScript, Go, and Rust starters in CI. |

## Static starters

### HTML

Directory: `static/html`

Use it for a single landing page, documentation splash page, status notice, or other zero-build site.

```bash
cd static/html
python3 -m http.server 3000
```

Pxxl finds `index.html` and publishes the directory directly.

### HTML, CSS, and JavaScript

Directory: `static/html-css-js`

Use it for browser applications that do not need a package manager or bundler.

```bash
cd static/html-css-js
python3 -m http.server 3000
```

The starter includes `index.html`, `styles.css`, and `app.js`.

### Multipage HTML

Directory: `static/multipage`

Use it for a traditional multi-page static website. It contains an index, an about page, and a custom `404.html`.

```bash
cd static/multipage
python3 -m http.server 3000
```

## JavaScript and TypeScript

Node-based projects require Node.js 22 or newer. The default package manager is npm.

### Static frontend frameworks

| Starter | Directory | Build output | Best for |
|---|---|---:|---|
| React + Vite | `javascript/react-vite` | `dist` | General React SPAs and dashboards. |
| Vue + Vite | `javascript/vue-vite` | `dist` | Vue SPAs and interactive frontend applications. |
| Svelte + Vite | `javascript/svelte-vite` | `dist` | Small, compiled Svelte frontends. |
| Solid + Vite | `javascript/solid-vite` | `dist` | Fine-grained reactive SPAs. |
| Preact + Vite | `javascript/preact-vite` | `dist` | Lightweight React-compatible frontends. |
| Astro | `javascript/astro-static` | `dist` | Content sites, blogs, and mostly-static marketing sites. |
| Angular | `javascript/angular` | `dist/browser` | Structured enterprise frontend applications. |
| TanStack Router | `javascript/tanstack-router-static` | `dist` | Type-safe client-side React routing without a server runtime. |

Run any Vite-based starter:

```bash
cd javascript/react-vite
npm install
npm run dev
npm run build
```

Run Astro:

```bash
cd javascript/astro-static
npm install
npm run dev
npm run build
```

Run Angular:

```bash
cd javascript/angular
npm install
npm run dev
npm run build
```

Pxxl uploads the declared build output to R2 and serves it as a static release.

### Node API frameworks

| Starter | Directory | Port | Best for |
|---|---|---:|---|
| Node HTTP | `javascript/node-api` | 3000 | Dependency-free services and learning the platform contract. |
| Express | `javascript/express` | 3000 | Familiar REST APIs and middleware-heavy services. |
| Fastify | `javascript/fastify` | 3000 | High-throughput APIs with structured plugins and schemas. |
| Hono | `javascript/hono` | 3000 | Small web-standard APIs with a portable request model. |
| Koa | `javascript/koa` | 3000 | Minimal middleware-based Node services. |
| NestJS | `javascript/nestjs` | 3000 | Structured TypeScript APIs with modules, controllers, and dependency injection. |

Run Node, Express, Fastify, Hono, or Koa:

```bash
cd javascript/express
npm install
npm start
curl http://localhost:3000/health
```

Run NestJS:

```bash
cd javascript/nestjs
npm install
npm run build
PORT=3000 npm start
```

### JavaScript full-stack frameworks

| Starter | Directory | Production command | Best for |
|---|---|---|---|
| Next.js | `javascript/nextjs` | `next start` | React server rendering, route handlers, and App Router applications. |
| Nuxt | `javascript/nuxt` | Nitro server output | Vue server rendering and full-stack Vue applications. |
| SvelteKit | `javascript/sveltekit` | Node adapter output | Server-rendered Svelte applications and API routes. |
| TanStack Start | `javascript/tanstack-start` | Nitro server output | Type-safe full-stack React applications using TanStack Router. |

Run a full-stack starter:

```bash
cd javascript/nextjs
npm install
npm run dev
npm run build
PORT=3000 npm start
```

Do not deploy Next.js, Nuxt, SvelteKit, or TanStack Start as a static project unless the application has explicitly been configured for static export. These starters use server features and therefore require a runtime container.

## Python

Python starters target Python 3.12 or newer.

Create a local environment:

```bash
cd python/fastapi
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

| Starter | Directory | Local command | Best for |
|---|---|---|---|
| FastAPI | `python/fastapi` | `uvicorn main:app --reload --port 8000` | Typed async APIs and OpenAPI-driven services. |
| Flask | `python/flask` | `flask --app app run --port 8000` | Small APIs and simple web services. |
| Django | `python/django` | `python manage.py runserver 0.0.0.0:8000` | Larger applications using Django's ecosystem. |
| Litestar | `python/litestar` | `litestar run --reload --port 8000` | Typed asynchronous APIs. |
| Starlette | `python/starlette` | `uvicorn app:app --reload --port 8000` | Lightweight ASGI services. |
| Sanic | `python/sanic` | `sanic app:app --dev --port 8000` | Async services optimized for throughput. |

Production commands are declared in each starter's `pxxl.toml`. Flask and Django use Gunicorn; ASGI applications use their framework CLI or Uvicorn.

## Go

Go starters target Go 1.24 and compile to a native application binary.

| Starter | Directory | Best for |
|---|---|---|
| Standard library | `go/standard-library` | Minimal services with no third-party dependency. |
| Gin | `go/gin` | Popular, productive REST APIs. |
| Fiber | `go/fiber` | Express-like APIs built for speed. |
| Echo | `go/echo` | Structured HTTP APIs with middleware. |
| Chi | `go/chi` | Idiomatic composable routing around `net/http`. |
| Gorilla Mux | `go/gorilla-mux` | Traditional router-based Go applications. |

Run any Go starter:

```bash
cd go/gin
go mod tidy
PORT=8080 go run .
curl http://localhost:8080/health
```

Pxxl downloads modules, builds the binary, and copies only the runtime application into the final image.

## PHP

PHP starters target PHP 8.3 or newer. Framework projects use Composer.

| Starter | Directory | Best for |
|---|---|---|
| Vanilla PHP API | `php/vanilla-api` | Dependency-free PHP endpoints. |
| Slim | `php/slim` | Small PSR-based APIs and microservices. |
| Laravel | `php/laravel` | Full-featured application and API development. |
| Symfony | `php/symfony` | Component-oriented enterprise applications. |
| CodeIgniter | `php/codeigniter` | Lightweight MVC and API applications. |

Run the vanilla API:

```bash
cd php/vanilla-api
php -S 0.0.0.0:8080
```

Run Composer projects:

```bash
cd php/slim
composer install
PORT=8080 php -S 0.0.0.0:8080 -t public
```

For Laravel, copy `.env.example` to `.env`, configure the environment, and generate an application key before local development. Store production values in Pxxl environment variables; never commit `.env`.

## Ruby

Ruby projects use Bundler and a `Gemfile`.

| Starter | Directory | Port | Best for |
|---|---|---:|---|
| Sinatra | `ruby/sinatra` | 4567 | Small APIs and webhook services. |
| Rails API | `ruby/rails-api` | 3000 | Convention-driven, larger Ruby APIs. |
| Roda | `ruby/roda` | 9292 | Small, routing-tree-based web services. |

Run a starter:

```bash
cd ruby/sinatra
bundle install
PORT=4567 bundle exec ruby app.rb
```

The production command is declared in `pxxl.toml`.

## Rust

Rust starters use the 2024 edition and Cargo.

| Starter | Directory | Best for |
|---|---|---|
| Axum | `rust/axum` | Tokio-based typed APIs. |
| Actix Web | `rust/actix-web` | Mature, high-performance HTTP services. |
| Rocket | `rust/rocket` | Ergonomic macro-driven APIs. |
| Warp | `rust/warp` | Composable filter-based services. |

Run any Rust starter:

```bash
cd rust/axum
cargo run
curl http://localhost:8080/health
```

Pxxl performs a release build and uses the compiled binary in the runtime image.

## JVM and Kotlin

JVM starters target Java 21. Maven projects use `pom.xml`; Gradle projects use `build.gradle` or `build.gradle.kts`.

| Starter | Directory | Build system | Best for |
|---|---|---|---|
| Spring Boot | `jvm/spring-boot-java` | Maven | Broad ecosystem, enterprise APIs, and conventional Java services. |
| Quarkus | `jvm/quarkus-java` | Maven | Fast-starting cloud-native Java services. |
| Vert.x | `jvm/vertx-java` | Maven | Reactive and event-driven Java services. |
| Micronaut | `jvm/micronaut-java` | Gradle | Compile-time dependency injection and cloud services. |
| Ktor | `jvm/ktor-kotlin` | Gradle Kotlin | Concise Kotlin APIs and services. |

Run Maven starters:

```bash
cd jvm/spring-boot-java
mvn spring-boot:run
```

Run Gradle starters:

```bash
cd jvm/ktor-kotlin
gradle run
```

All starters listen on port 8080 by default and use the platform `PORT` during deployment.

## .NET

.NET starters target ASP.NET Core and .NET 9.

| Starter | Directory | Type | Best for |
|---|---|---|---|
| Minimal API | `dotnet/minimal-api` | API | Small APIs with minimal ceremony. |
| Controllers API | `dotnet/controllers-api` | API | Structured APIs using MVC controllers. |
| MVC | `dotnet/mvc` | Full-stack | Server-rendered web applications. |
| Blazor Server | `dotnet/blazor-server` | Full-stack | Interactive .NET UI rendered through the server. |

Run any .NET starter:

```bash
cd dotnet/minimal-api
dotnet restore
dotnet run
```

Pxxl configures the ASP.NET Core listener with the injected `PORT`, and the application binds publicly inside the isolated container.

## Dart and Flutter

### Shelf

Directory: `dart/shelf`

Shelf is a small composable Dart HTTP API.

```bash
cd dart/shelf
dart pub get
PORT=8080 dart run bin/server.dart
```

### Dart Frog

Directory: `dart/dart-frog`

Dart Frog provides file-based API routing.

```bash
cd dart/dart-frog
dart pub get
dart_frog dev
```

Pxxl builds the Dart Frog server and starts the generated server on the injected port.

### Flutter Web

Directory: `dart/flutter-web`

Flutter Web is a static frontend deployment.

```bash
cd dart/flutter-web
flutter pub get
flutter run -d chrome
flutter build web --release
```

Pxxl publishes `build/web` to the static R2 release path and does not start a runtime container.

## `boilerplate.json`

Every starter has a machine-readable descriptor:

```json
{
  "id": "javascript/react-vite",
  "name": "React Vite",
  "language": "javascript",
  "framework": "react",
  "type": "static",
  "runtime": "node",
  "packageManager": "npm",
  "port": null,
  "healthPath": null,
  "outputDirectory": "dist",
  "description": "React SPA built with Vite."
}
```

Fields:

| Field | Meaning |
|---|---|
| `id` | Stable repository-relative identifier. |
| `name` | Display name for a UI or catalog. |
| `language` | Top-level language family. |
| `framework` | Framework detector hint. |
| `type` | `static`, `api`, or `fullstack`. |
| `runtime` | Pxxl runtime/buildpack family. |
| `packageManager` | Package manager when applicable. |
| `port` | Default local/runtime port for server projects. |
| `healthPath` | Health endpoint for runtime projects. |
| `outputDirectory` | Directory uploaded for built static projects. |

The root `catalog.json` contains all descriptors and totals.

## `pxxl.toml`

Pxxl automatically detects most commands from dependency manifests and framework files. Use `pxxl.toml` only when a framework needs an explicit command or output directory.

```toml
[build]
installCommand = "npm ci"
buildCommand = "npm run build"
startCommand = "npm start"
outputDirectory = "dist"
port = 3000
```

Supported build keys include:

| Key | Purpose |
|---|---|
| `language` | Overrides language detection. |
| `framework` | Overrides framework detection. |
| `runtime` | Selects a runtime or runtime version. |
| `packageManager` | Selects npm, pnpm, Yarn, or Bun for Node projects. |
| `installCommand` | Overrides dependency installation. |
| `buildCommand` | Overrides compilation/building. |
| `startCommand` | Overrides the production start process. |
| `outputDirectory` | Declares built static files. |
| `baseDirectory` | Selects an application inside a monorepo. |
| `port` | Declares the application port. |

Keep secrets out of this file. Configure them through the Pxxl dashboard, where the values are stored in Vault.

## Pxxl detection

Pxxl analyzes repository files rather than relying only on GitHub's language label.

Examples:

- `package.json` and its dependencies identify Node frameworks.
- `go.mod` identifies Go and its framework dependencies.
- `requirements.txt` identifies Python packages.
- `composer.json` identifies PHP frameworks.
- `Cargo.toml` identifies Rust.
- `.csproj` identifies .NET.
- `pom.xml` or Gradle files identify JVM projects.
- `pubspec.yaml` identifies Dart and Flutter.
- `index.html` without a server manifest identifies a zero-build static project.

The selected base directory is part of detection. In a monorepo, choose the directory containing the application's dependency manifest.

## Environment variables

Use local `.env` files only for local development. Do not commit them.

In Pxxl:

1. Open the project.
2. Add environment variables in project settings.
3. Select the environment where each value applies.
4. Redeploy.

Pxxl stores secret values in Vault and injects them only into the build or runtime that needs them.

Platform-provided variables include:

- `PORT` for runtime HTTP binding.
- Framework runtime variables required by the selected buildpack.
- User-defined project variables from Vault.

## Monorepos

Select the framework directory as the project base directory:

```text
repository/
├── apps/
│   ├── web/        # React, Next.js, or another frontend
│   └── api/        # Go, Python, Node, or another API
└── packages/
```

For the web project, select `apps/web`. For the API project, select `apps/api`. Pxxl analyzes, builds, and deploys each service using the files inside its selected directory.

## Validation

Run the repository validator:

```bash
npm test
```

Regenerate all boilerplates:

```bash
npm run generate
npm test
```

The validator checks:

- Unique IDs.
- Catalog totals.
- Required metadata.
- Valid JSON manifests.
- API and health routes.
- Correct `[build]` sections in `pxxl.toml`.
- Static/runtime type consistency.
- The repository's no-gradient design rule.

GitHub Actions additionally builds the primary JavaScript static/full-stack projects, all Go starters, and all Rust starters.

## Adding a boilerplate

Add new starters through `scripts/generate.mjs` so generated files and catalog metadata remain reproducible.

Every new API or full-stack starter must:

1. Bind to `0.0.0.0`.
2. Read `PORT`.
3. Provide `/`, `/api`, and `/health`.
4. Avoid committed credentials.
5. Include dependency manifests.
6. Include an explicit `pxxl.toml` only when automatic detection is insufficient.

Every static starter must:

1. Produce an `index.html`.
2. Declare the correct output directory.
3. Avoid requiring a runtime server after building.
4. Support direct navigation or document any SPA fallback requirement.

After changing the generator:

```bash
npm run generate
npm test
git diff --check
```

Then extend the GitHub Actions matrix when the framework can be built on the standard CI runner.

## Framework selection summary

Choose:

- Plain HTML for the fastest possible no-build deployment.
- React, Vue, Svelte, Solid, Preact, Angular, Astro, or TanStack Router for static frontend applications.
- Next.js, Nuxt, SvelteKit, TanStack Start, ASP.NET MVC, or Blazor for server-rendered full-stack applications.
- Express, Fastify, Hono, Koa, NestJS, FastAPI, Flask, Django, Gin, Fiber, Spring Boot, Laravel, Rails, Axum, ASP.NET APIs, or Shelf for backend services.
- A dependency-free Node, Go, or PHP starter when you need the smallest possible example of the Pxxl runtime contract.

When uncertain, start with:

- React + Vite for a frontend.
- Next.js for a React full-stack application.
- Express or FastAPI for a general API.
- Go standard library for a small native service.
- ASP.NET Minimal API for .NET.
- Spring Boot for Java.
- Laravel for PHP.
- Rails API for Ruby.
- Axum for Rust.
