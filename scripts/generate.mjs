import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const catalog = [];

const write = (relative, content) => {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content.trimStart().replace(/\s+$/, "") + "\n");
};

const json = (value) => JSON.stringify(value, null, 2);
const title = (value) => value.replace(/(^|-)([a-z])/g, (_, dash, char) => `${dash ? " " : ""}${char.toUpperCase()}`);

function add(language, slug, metadata, files) {
  const directory = `${language}/${slug}`;
  const meta = {
    id: `${language}/${slug}`,
    name: metadata.name ?? title(slug),
    language,
    framework: metadata.framework ?? slug,
    type: metadata.type,
    runtime: metadata.runtime,
    packageManager: metadata.packageManager ?? null,
    port: metadata.port ?? null,
    healthPath: metadata.type === "api" || metadata.type === "fullstack" ? "/health" : null,
    outputDirectory: metadata.outputDirectory ?? null,
    description: metadata.description,
  };
  catalog.push(meta);
  write(`${directory}/boilerplate.json`, json(meta));
  for (const [filename, content] of Object.entries(files)) write(`${directory}/${filename}`, content);
  write(`${directory}/README.md`, `# ${meta.name}

${meta.description}

## Deploy on Pxxl

Select \`${directory}\` as the base directory. Pxxl detects **${meta.language} / ${meta.framework}** from the committed project files.${meta.healthPath ? ` The health check is available at \`${meta.healthPath}\`.` : ""}${meta.outputDirectory ? ` The static output is written to \`${meta.outputDirectory}\`.` : ""}

\`\`\`text
Type: ${meta.type}
Runtime: ${meta.runtime}
Port: ${meta.port ?? "static"}
\`\`\`
`);
}

const uiCss = `
:root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #080808; color: #f5f5f5; }
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #080808; }
main { width: min(680px, calc(100% - 32px)); padding: 48px; border: 1px solid #2d2d2d; border-radius: 18px; background: #111; }
.eyebrow { color: #aaa; font-size: 13px; letter-spacing: .12em; text-transform: uppercase; }
h1 { margin: 14px 0 10px; font-size: clamp(36px, 7vw, 64px); letter-spacing: -.05em; }
p { color: #aaa; line-height: 1.7; }
a { color: #fff; }
.status { display: inline-flex; align-items: center; gap: 8px; margin-top: 20px; padding: 8px 12px; border: 1px solid #333; border-radius: 999px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #42d392; }
`;

const staticHtml = (label, script = "") => `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${label} starter on Pxxl"><title>${label} · Pxxl</title><link rel="stylesheet" href="./styles.css"></head>
<body><main><span class="eyebrow">Pxxl boilerplate</span><h1>${label}</h1><p>A small, production-shaped starter ready for Pxxl static deployment.</p><div class="status"><span class="dot"></span><span id="status">Static edge ready</span></div></main>${script}</body>
</html>`;

add("static", "html", { type: "static", runtime: "static", framework: "html", description: "Zero-build semantic HTML starter." }, {
  "index.html": staticHtml("HTML"),
  "styles.css": uiCss,
});
add("static", "html-css-js", { type: "static", runtime: "static", framework: "vanilla", description: "Zero-build HTML, CSS, and JavaScript starter." }, {
  "index.html": staticHtml("Vanilla JavaScript", '<script type="module" src="./app.js"></script>'),
  "styles.css": uiCss,
  "app.js": `document.querySelector("#status").textContent = \`Ready at \${new Date().toLocaleTimeString()}\`;`,
});
add("static", "multipage", { type: "static", runtime: "static", framework: "html", description: "Zero-build multi-page website with a custom 404 page." }, {
  "index.html": staticHtml("Multi-page HTML", '<p><a href="./about.html">About this starter →</a></p>'),
  "about.html": staticHtml("About"),
  "404.html": staticHtml("Page not found"),
  "styles.css": uiCss,
});

const nodePackage = (name, dependencies, scripts = {}) => json({
  name: `pxxl-${name}`,
  private: true,
  version: "1.0.0",
  type: "module",
  engines: { node: ">=22" },
  scripts,
  dependencies,
});
const nodeApi = (imports, setup, listen) => `${imports}
const port = Number(process.env.PORT || 3000);
${setup}
${listen}
`;

add("javascript", "node-api", { type: "api", runtime: "node", framework: "node", packageManager: "npm", port: 3000, description: "Dependency-free Node.js HTTP API." }, {
  "package.json": nodePackage("node-api", {}, { start: "node server.js" }),
  "server.js": nodeApi(`import http from "node:http";`, `const server = http.createServer((req, res) => {
  res.setHeader("content-type", "application/json");
  if (req.url === "/health") return res.end(JSON.stringify({ status: "ok" }));
  if (req.url === "/api") return res.end(JSON.stringify({ message: "Hello from Node.js" }));
  res.end(JSON.stringify({ service: "Pxxl Node API" }));
});`, `server.listen(port, "0.0.0.0", () => console.log(\`Listening on :\${port}\`));`),
});
add("javascript", "express", { type: "api", runtime: "node", framework: "express", packageManager: "npm", port: 3000, description: "Express REST API with health and example routes." }, {
  "package.json": nodePackage("express", { express: "^5.1.0" }, { start: "node server.js" }),
  "server.js": nodeApi(`import express from "express";`, `const app = express();
app.use(express.json());
app.get("/", (_req, res) => res.json({ service: "Pxxl Express API" }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api", (_req, res) => res.json({ message: "Hello from Express" }));`, `app.listen(port, "0.0.0.0", () => console.log(\`Listening on :\${port}\`));`),
});
add("javascript", "fastify", { type: "api", runtime: "node", framework: "fastify", packageManager: "npm", port: 3000, description: "Fastify API with structured routing." }, {
  "package.json": nodePackage("fastify", { fastify: "^5.4.0" }, { start: "node server.js" }),
  "server.js": nodeApi(`import Fastify from "fastify";`, `const app = Fastify({ logger: true });
app.get("/", async () => ({ service: "Pxxl Fastify API" }));
app.get("/health", async () => ({ status: "ok" }));
app.get("/api", async () => ({ message: "Hello from Fastify" }));`, `await app.listen({ port, host: "0.0.0.0" });`),
});
add("javascript", "hono", { type: "api", runtime: "node", framework: "hono", packageManager: "npm", port: 3000, description: "Hono API running on Node.js." }, {
  "package.json": nodePackage("hono", { "@hono/node-server": "^1.14.0", hono: "^4.8.0" }, { start: "node server.js" }),
  "server.js": nodeApi(`import { serve } from "@hono/node-server";\nimport { Hono } from "hono";`, `const app = new Hono();
app.get("/", (c) => c.json({ service: "Pxxl Hono API" }));
app.get("/health", (c) => c.json({ status: "ok" }));
app.get("/api", (c) => c.json({ message: "Hello from Hono" }));`, `serve({ fetch: app.fetch, port, hostname: "0.0.0.0" });`),
});
add("javascript", "koa", { type: "api", runtime: "node", framework: "koa", packageManager: "npm", port: 3000, description: "Minimal Koa API." }, {
  "package.json": nodePackage("koa", { koa: "^2.16.0" }, { start: "node server.js" }),
  "server.js": nodeApi(`import Koa from "koa";`, `const app = new Koa();
app.use((ctx) => {
  ctx.type = "application/json";
  ctx.body = ctx.path === "/health" ? { status: "ok" } : ctx.path === "/api" ? { message: "Hello from Koa" } : { service: "Pxxl Koa API" };
});`, `app.listen(port, "0.0.0.0");`),
});
add("javascript", "nestjs", { type: "api", runtime: "node", framework: "nestjs", packageManager: "npm", port: 3000, description: "NestJS API using the Express adapter." }, {
  "package.json": nodePackage("nestjs", { "@nestjs/common": "^11.1.0", "@nestjs/core": "^11.1.0", "@nestjs/platform-express": "^11.1.0", "reflect-metadata": "^0.2.2", rxjs: "^7.8.2" }, { build: "nest build", start: "node dist/main.js" }),
  "tsconfig.json": json({ compilerOptions: { module: "commonjs", target: "ES2022", outDir: "dist", experimentalDecorators: true, emitDecoratorMetadata: true, strict: true }, include: ["src/**/*.ts"] }),
  "src/main.ts": `import "reflect-metadata";\nimport { Controller, Get, Module } from "@nestjs/common";\nimport { NestFactory } from "@nestjs/core";\n@Controller() class AppController { @Get() root() { return { service: "Pxxl NestJS API" }; } @Get("health") health() { return { status: "ok" }; } @Get("api") api() { return { message: "Hello from NestJS" }; } }\n@Module({ controllers: [AppController] }) class AppModule {}\nasync function bootstrap() { const app = await NestFactory.create(AppModule); await app.listen(Number(process.env.PORT || 3000), "0.0.0.0"); }\nbootstrap();`,
});

const viteFiles = (framework, dependencies, devDependencies, main, app) => ({
  "package.json": nodePackage(framework, dependencies, { dev: "vite", build: "vite build", start: "vite preview --host 0.0.0.0 --port $PORT" }).replace('"dependencies": {', '"devDependencies": ' + json(devDependencies) + ',\n  "dependencies": {'),
  "index.html": `<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title(framework)} · Pxxl</title></head><body><div id="app"></div><script type="module" src="${main}"></script></body></html>`,
  [main.replace("./", "")]: app,
  "src/style.css": uiCss,
});
add("javascript", "react-vite", { type: "static", runtime: "node", framework: "react", packageManager: "npm", outputDirectory: "dist", description: "React SPA built with Vite." }, viteFiles("react-vite", { react: "^19.1.0", "react-dom": "^19.1.0" }, { "@vitejs/plugin-react": "^4.5.0", vite: "^7.0.0" }, "/src/main.jsx", `import React from "react"; import { createRoot } from "react-dom/client"; import "./style.css";\nfunction App(){return <main><span className="eyebrow">Pxxl boilerplate</span><h1>React + Vite</h1><p>A fast static React starter.</p><div className="status"><span className="dot"/>Static edge ready</div></main>}; createRoot(document.getElementById("app")).render(<App/>);`));
add("javascript", "vue-vite", { type: "static", runtime: "node", framework: "vue", packageManager: "npm", outputDirectory: "dist", description: "Vue SPA built with Vite." }, {
  "package.json": nodePackage("vue-vite", { vue: "^3.5.0", vite: "^7.0.0", "@vitejs/plugin-vue": "^6.0.0" }, { dev: "vite", build: "vite build", start: "vite preview --host 0.0.0.0 --port $PORT" }),
  "vite.config.js": `import { defineConfig } from "vite"; import vue from "@vitejs/plugin-vue"; export default defineConfig({ plugins: [vue()] });`,
  "index.html": `<div id="app"></div><script type="module" src="/src/main.js"></script>`,
  "src/main.js": `import { createApp } from "vue"; import "./style.css"; import App from "./App.vue"; createApp(App).mount("#app");`,
  "src/App.vue": `<template><main><span class="eyebrow">Pxxl boilerplate</span><h1>Vue + Vite</h1><p>A fast static Vue starter.</p><div class="status"><span class="dot"/>Static edge ready</div></main></template>`,
  "src/style.css": uiCss,
});
add("javascript", "svelte-vite", { type: "static", runtime: "node", framework: "svelte", packageManager: "npm", outputDirectory: "dist", description: "Svelte SPA built with Vite." }, {
  "package.json": nodePackage("svelte-vite", { svelte: "^5.35.0", vite: "^6.0.0", "@sveltejs/vite-plugin-svelte": "^5.1.0" }, { dev: "vite", build: "vite build", start: "vite preview --host 0.0.0.0 --port $PORT" }),
  "vite.config.js": `import { defineConfig } from "vite"; import { svelte } from "@sveltejs/vite-plugin-svelte"; export default defineConfig({ plugins: [svelte()] });`,
  "index.html": `<div id="app"></div><script type="module" src="/src/main.js"></script>`,
  "src/main.js": `import { mount } from "svelte"; import App from "./App.svelte"; import "./style.css"; mount(App, { target: document.getElementById("app") });`,
  "src/App.svelte": `<main><span class="eyebrow">Pxxl boilerplate</span><h1>Svelte + Vite</h1><p>A fast static Svelte starter.</p><div class="status"><span class="dot"></span>Static edge ready</div></main>`,
  "src/style.css": uiCss,
});
add("javascript", "solid-vite", { type: "static", runtime: "node", framework: "solidjs", packageManager: "npm", outputDirectory: "dist", description: "SolidJS SPA built with Vite." }, {
  "package.json": nodePackage("solid-vite", { "solid-js": "^1.9.0", vite: "^7.0.0", "vite-plugin-solid": "^2.11.0" }, { dev: "vite", build: "vite build", start: "vite preview --host 0.0.0.0 --port $PORT" }),
  "index.html": `<div id="app"></div><script type="module" src="/src/main.jsx"></script>`,
  "src/main.jsx": `import { render } from "solid-js/web"; import "./style.css"; const App=()=> <main><span class="eyebrow">Pxxl boilerplate</span><h1>Solid + Vite</h1><p>A fast static Solid starter.</p><div class="status"><span class="dot"/>Static edge ready</div></main>; render(App, document.getElementById("app"));`,
  "src/style.css": uiCss,
});
add("javascript", "preact-vite", { type: "static", runtime: "node", framework: "preact", packageManager: "npm", outputDirectory: "dist", description: "Preact SPA built with Vite." }, {
  "package.json": nodePackage("preact-vite", { preact: "^10.26.0", vite: "^7.0.0", "@preact/preset-vite": "^2.10.0" }, { dev: "vite", build: "vite build", start: "vite preview --host 0.0.0.0 --port $PORT" }),
  "index.html": `<div id="app"></div><script type="module" src="/src/main.jsx"></script>`,
  "src/main.jsx": `import { render } from "preact"; import "./style.css"; const App=()=> <main><span class="eyebrow">Pxxl boilerplate</span><h1>Preact + Vite</h1><p>A tiny static Preact starter.</p><div class="status"><span class="dot"/>Static edge ready</div></main>; render(<App/>, document.getElementById("app"));`,
  "src/style.css": uiCss,
});
add("javascript", "astro-static", { type: "static", runtime: "node", framework: "astro", packageManager: "npm", outputDirectory: "dist", description: "Astro static site starter." }, {
  "package.json": nodePackage("astro-static", { astro: "^5.10.0" }, { dev: "astro dev", build: "astro build", start: "astro preview --host 0.0.0.0 --port $PORT" }),
  "src/pages/index.astro": `---\nimport "../styles.css";\n---\n<main><span class="eyebrow">Pxxl boilerplate</span><h1>Astro</h1><p>Content-first and static by default.</p><div class="status"><span class="dot"></span>Static edge ready</div></main>`,
  "src/styles.css": uiCss,
});
add("javascript", "tanstack-router-static", { type: "static", runtime: "node", framework: "tanstack-router", packageManager: "npm", outputDirectory: "dist", description: "TanStack Router client-side application built with Vite." }, {
  "package.json": nodePackage("tanstack-router-static", { "@tanstack/react-router": "^1.130.0", "@tanstack/router-plugin": "^1.130.0", "@vitejs/plugin-react": "^4.5.0", react: "^19.1.0", "react-dom": "^19.1.0", vite: "^7.0.0" }, { dev: "vite", build: "vite build", start: "vite preview --host 0.0.0.0 --port $PORT" }),
  "index.html": `<div id="app"></div><script type="module" src="/src/main.jsx"></script>`,
  "src/main.jsx": `import React from "react"; import { createRoot } from "react-dom/client"; import { createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from "@tanstack/react-router"; import "./style.css"; const root=createRootRoute({component:()=> <main><span className="eyebrow">Pxxl boilerplate</span><h1>TanStack Router</h1><p>Type-safe client routing with static output.</p><Outlet/></main>}); const index=createRoute({getParentRoute:()=>root,path:"/",component:()=> <div className="status"><span className="dot"/>Static edge ready</div>}); const router=createRouter({routeTree:root.addChildren([index])}); createRoot(document.getElementById("app")).render(<RouterProvider router={router}/>);`,
  "src/style.css": uiCss,
});
add("javascript", "nextjs", { type: "fullstack", runtime: "node", framework: "nextjs", packageManager: "npm", port: 3000, description: "Next.js App Router full-stack starter with standalone output." }, {
  "package.json": nodePackage("nextjs", { next: "^15.4.0", react: "^19.1.0", "react-dom": "^19.1.0" }, { dev: "next dev", build: "next build", start: "next start -H 0.0.0.0 -p $PORT" }),
  "next.config.mjs": `export default { output: "standalone" };`,
  "app/layout.jsx": `import "./style.css"; export const metadata={title:"Next.js · Pxxl"}; export default function Layout({children}){return <html><body>{children}</body></html>}`,
  "app/page.jsx": `export default function Page(){return <main><span className="eyebrow">Pxxl boilerplate</span><h1>Next.js</h1><p>App Router full-stack deployment.</p><div className="status"><span className="dot"/>Runtime ready</div></main>}`,
  "app/health/route.js": `export function GET(){return Response.json({status:"ok"})}`,
  "app/api/route.js": `export function GET(){return Response.json({message:"Hello from Next.js"})}`,
  "app/style.css": uiCss,
});
add("javascript", "nuxt", { type: "fullstack", runtime: "node", framework: "nuxt", packageManager: "npm", port: 3000, description: "Nuxt full-stack starter with Nitro." }, {
  "package.json": nodePackage("nuxt", { nuxt: "3.17.5", vue: "3.5.17" }, { dev: "nuxt dev", build: "nuxt build", start: "node .output/server/index.mjs" }),
  "nuxt.config.ts": `export default defineNuxtConfig({ compatibilityDate: "2025-05-15", devtools: { enabled: false } });`,
  "app.vue": `<template><main><span class="eyebrow">Pxxl boilerplate</span><h1>Nuxt</h1><p>Vue full-stack deployment.</p><div class="status"><span class="dot"/>Runtime ready</div></main></template><style>${uiCss}</style>`,
  "server/routes/health.get.ts": `export default defineEventHandler(() => ({ status: "ok" }));`,
  "server/routes/api.get.ts": `export default defineEventHandler(() => ({ message: "Hello from Nuxt" }));`,
});
add("javascript", "sveltekit", { type: "fullstack", runtime: "node", framework: "sveltekit", packageManager: "npm", port: 3000, description: "SvelteKit server application using the Node adapter." }, {
  "package.json": nodePackage("sveltekit", { "@sveltejs/adapter-node": "^5.2.0", "@sveltejs/kit": "2.22.0", "@sveltejs/vite-plugin-svelte": "^5.1.0", svelte: "^5.35.0", vite: "^6.0.0" }, { dev: "vite dev", build: "vite build", start: "node build" }),
  "svelte.config.js": `import adapter from "@sveltejs/adapter-node"; export default { kit: { adapter: adapter() } };`,
  "vite.config.js": `import { defineConfig } from "vite"; import { sveltekit } from "@sveltejs/kit/vite"; export default defineConfig({ plugins: [sveltekit()] });`,
  "src/routes/+page.svelte": `<svelte:head><title>SvelteKit · Pxxl</title></svelte:head><main><span class="eyebrow">Pxxl boilerplate</span><h1>SvelteKit</h1><p>A server-rendered Svelte starter.</p><div class="status"><span class="dot"></span>Runtime ready</div></main><style>${uiCss}</style>`,
  "src/routes/health/+server.js": `export function GET(){return Response.json({status:"ok"})}`,
  "src/routes/api/+server.js": `export function GET(){return Response.json({message:"Hello from SvelteKit"})}`,
});
add("javascript", "tanstack-start", { type: "fullstack", runtime: "node", framework: "tanstack-start", packageManager: "npm", port: 3000, description: "TanStack Start full-stack React starter." }, {
  "package.json": nodePackage("tanstack-start", { "@tanstack/react-router": "^1.130.0", "@tanstack/react-start": "^1.130.0", "@tanstack/router-plugin": "^1.130.0", react: "^19.1.0", "react-dom": "^19.1.0", vite: "^7.0.0" }, { dev: "vite dev", build: "vite build", start: "node .output/server/index.mjs" }),
  "vite.config.ts": `import { defineConfig } from "vite"; import { tanstackStart } from "@tanstack/react-start/plugin/vite"; export default defineConfig({ plugins: [tanstackStart()] });`,
  "src/router.tsx": `import { createRouter } from "@tanstack/react-router"; import { routeTree } from "./routeTree.gen"; export function getRouter(){return createRouter({routeTree,scrollRestoration:true});}`,
  "src/routes/__root.tsx": `import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router"; import "../style.css"; export const Route=createRootRoute({component:()=> <html><head><HeadContent/></head><body><Outlet/><Scripts/></body></html>});`,
  "src/routes/index.tsx": `import { createFileRoute } from "@tanstack/react-router"; export const Route=createFileRoute("/")({component:()=> <main><span className="eyebrow">Pxxl boilerplate</span><h1>TanStack Start</h1><p>Full-stack, type-safe React.</p><div className="status"><span className="dot"/>Runtime ready</div></main>});`,
  "src/routes/health.ts": `import { createFileRoute } from "@tanstack/react-router"; export const Route=createFileRoute("/health")({server:{handlers:{GET:()=>Response.json({status:"ok"})}}});`,
  "src/routes/api.ts": `import { createFileRoute } from "@tanstack/react-router"; export const Route=createFileRoute("/api")({server:{handlers:{GET:()=>Response.json({message:"Hello from TanStack Start"})}}});`,
  "src/style.css": uiCss,
});
add("javascript", "angular", { type: "static", runtime: "node", framework: "angular", packageManager: "npm", outputDirectory: "dist/browser", description: "Angular standalone application." }, {
  "package.json": nodePackage("angular", { "@angular/animations": "22.0.8", "@angular/common": "22.0.8", "@angular/compiler": "22.0.8", "@angular/compiler-cli": "22.0.8", "@angular/core": "22.0.8", "@angular/platform-browser": "22.0.8", "@angular/router": "22.0.8", rxjs: "^7.8.0", tslib: "^2.8.0", "zone.js": "^0.15.0", "@angular-devkit/build-angular": "22.0.8", "@angular/cli": "22.0.8", typescript: "~6.0.0" }, { dev: "ng serve", build: "ng build", start: "ng serve --host 0.0.0.0 --port $PORT" }),
  "angular.json": json({ version: 1, projects: { app: { projectType: "application", root: "", sourceRoot: "src", architect: { build: { builder: "@angular-devkit/build-angular:application", options: { outputPath: "dist", index: "src/index.html", browser: "src/main.ts", styles: ["src/styles.css"] } } } } } }),
  "tsconfig.json": json({ compilerOptions: { target: "ES2022", module: "ES2022", moduleResolution: "bundler", experimentalDecorators: true }, angularCompilerOptions: { strictTemplates: true } }),
  "src/index.html": `<div id="app"></div>`,
  "src/main.ts": `import { Component } from "@angular/core"; import { bootstrapApplication } from "@angular/platform-browser"; @Component({selector:"app-root",standalone:true,template:\`<main><span class="eyebrow">Pxxl boilerplate</span><h1>Angular</h1><p>A standalone Angular starter.</p><div class="status"><span class="dot"></span>Static edge ready</div></main>\`}) class App{} bootstrapApplication(App);`,
  "src/styles.css": uiCss,
});

const pyProject = (name, dependencies) => `[project]\nname = "pxxl-${name}"\nversion = "1.0.0"\nrequires-python = ">=3.12"\ndependencies = [${dependencies.map((d) => `"${d}"`).join(", ")}]\n`;
add("python", "fastapi", { type: "api", runtime: "python", framework: "fastapi", port: 8000, description: "Async FastAPI service." }, {
  "requirements.txt": `fastapi>=0.115\nuvicorn[standard]>=0.34`,
  "main.py": `from fastapi import FastAPI\napp=FastAPI(title="Pxxl FastAPI")\n@app.get("/")\ndef root(): return {"service":"Pxxl FastAPI"}\n@app.get("/health")\ndef health(): return {"status":"ok"}\n@app.get("/api")\ndef api(): return {"message":"Hello from FastAPI"}`,
  "pxxl.toml": `[build]\nstartCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"`,
});
add("python", "flask", { type: "api", runtime: "python", framework: "flask", port: 8000, description: "Flask API served by Gunicorn." }, {
  "requirements.txt": `Flask>=3.1\ngunicorn>=23`,
  "app.py": `from flask import Flask, jsonify\napp=Flask(__name__)\n@app.get("/")\ndef root(): return jsonify(service="Pxxl Flask API")\n@app.get("/health")\ndef health(): return jsonify(status="ok")\n@app.get("/api")\ndef api(): return jsonify(message="Hello from Flask")`,
  "pxxl.toml": `[build]\nstartCommand = "gunicorn --bind 0.0.0.0:$PORT app:app"`,
});
add("python", "django", { type: "api", runtime: "python", framework: "django", port: 8000, description: "Django API starter served by Gunicorn." }, {
  "requirements.txt": `Django>=5.2\ngunicorn>=23`,
  "manage.py": `#!/usr/bin/env python3\nimport os,sys\nos.environ.setdefault("DJANGO_SETTINGS_MODULE","config.settings")\nfrom django.core.management import execute_from_command_line\nexecute_from_command_line(sys.argv)`,
  "config/settings.py": `SECRET_KEY="development-only-change-me"\nDEBUG=False\nALLOWED_HOSTS=["*"]\nROOT_URLCONF="config.urls"\nMIDDLEWARE=[]\nINSTALLED_APPS=[]`,
  "config/urls.py": `from django.http import JsonResponse\nfrom django.urls import path\nurlpatterns=[path("",lambda r:JsonResponse({"service":"Pxxl Django API"})),path("health",lambda r:JsonResponse({"status":"ok"})),path("api",lambda r:JsonResponse({"message":"Hello from Django"}))]`,
  "config/wsgi.py": `import os\nos.environ.setdefault("DJANGO_SETTINGS_MODULE","config.settings")\nfrom django.core.wsgi import get_wsgi_application\napplication=get_wsgi_application()`,
  "pxxl.toml": `[build]\nstartCommand = "gunicorn --bind 0.0.0.0:$PORT config.wsgi:application"`,
});
add("python", "litestar", { type: "api", runtime: "python", framework: "litestar", port: 8000, description: "Litestar async API." }, {
  "requirements.txt": `litestar[standard]>=2.16`,
  "app.py": `from litestar import Litestar, get\n@get("/")\nasync def root(): return {"service":"Pxxl Litestar API"}\n@get("/health")\nasync def health(): return {"status":"ok"}\n@get("/api")\nasync def api(): return {"message":"Hello from Litestar"}\napp=Litestar([root,health,api])`,
  "pxxl.toml": `[build]\nstartCommand = "litestar run --host 0.0.0.0 --port $PORT"`,
});
add("python", "starlette", { type: "api", runtime: "python", framework: "starlette", port: 8000, description: "Small ASGI API with Starlette." }, {
  "requirements.txt": `starlette>=0.47\nuvicorn[standard]>=0.34`,
  "app.py": `from starlette.applications import Starlette\nfrom starlette.responses import JSONResponse\nfrom starlette.routing import Route\nasync def root(request): return JSONResponse({"service":"Pxxl Starlette API"})\nasync def health(request): return JSONResponse({"status":"ok"})\nasync def api(request): return JSONResponse({"message":"Hello from Starlette"})\napp=Starlette(routes=[Route("/",root),Route("/health",health),Route("/api",api)])`,
  "pxxl.toml": `[build]\nstartCommand = "uvicorn app:app --host 0.0.0.0 --port $PORT"`,
});
add("python", "sanic", { type: "api", runtime: "python", framework: "sanic", port: 8000, description: "High-throughput Sanic API." }, {
  "requirements.txt": `sanic>=25.3`,
  "app.py": `from sanic import Sanic\nfrom sanic.response import json\napp=Sanic("pxxl")\n@app.get("/")\nasync def root(request): return json({"service":"Pxxl Sanic API"})\n@app.get("/health")\nasync def health(request): return json({"status":"ok"})\n@app.get("/api")\nasync def api(request): return json({"message":"Hello from Sanic"})`,
  "pxxl.toml": `[build]\nstartCommand = "sanic app:app --host=0.0.0.0 --port=$PORT --single-process"`,
});

const goMod = (name, deps = "") => `module pxxl.dev/${name}\n\ngo 1.24\n${deps}`;
add("go", "standard-library", { type: "api", runtime: "go", framework: "net-http", port: 8080, description: "Dependency-free Go HTTP API." }, {
  "go.mod": goMod("stdlib"),
  "main.go": `package main\nimport("encoding/json";"log";"net/http";"os")\nfunc out(w http.ResponseWriter,v any){w.Header().Set("Content-Type","application/json");json.NewEncoder(w).Encode(v)}\nfunc main(){http.HandleFunc("/",func(w http.ResponseWriter,r *http.Request){out(w,map[string]string{"service":"Pxxl Go API"})});http.HandleFunc("/health",func(w http.ResponseWriter,r *http.Request){out(w,map[string]string{"status":"ok"})});http.HandleFunc("/api",func(w http.ResponseWriter,r *http.Request){out(w,map[string]string{"message":"Hello from Go"})});p:=os.Getenv("PORT");if p==""{p="8080"};log.Fatal(http.ListenAndServe("0.0.0.0:"+p,nil))}`,
});
const goFramework = (slug, module, importPath, body) => add("go", slug, { type: "api", runtime: "go", framework: slug, port: 8080, description: `${title(slug)} Go API starter.` }, {
  "go.mod": goMod(slug, `require ${importPath} ${module}`),
  "main.go": body,
});
goFramework("gin", "v1.10.1", "github.com/gin-gonic/gin", `package main\nimport("os";"github.com/gin-gonic/gin")\nfunc main(){r:=gin.Default();r.GET("/",func(c *gin.Context){c.JSON(200,gin.H{"service":"Pxxl Gin API"})});r.GET("/health",func(c *gin.Context){c.JSON(200,gin.H{"status":"ok"})});r.GET("/api",func(c *gin.Context){c.JSON(200,gin.H{"message":"Hello from Gin"})});p:=os.Getenv("PORT");if p==""{p="8080"};r.Run("0.0.0.0:"+p)}`);
goFramework("fiber", "v2.52.8", "github.com/gofiber/fiber/v2", `package main\nimport("os";"github.com/gofiber/fiber/v2")\nfunc main(){a:=fiber.New();a.Get("/",func(c *fiber.Ctx)error{return c.JSON(fiber.Map{"service":"Pxxl Fiber API"})});a.Get("/health",func(c *fiber.Ctx)error{return c.JSON(fiber.Map{"status":"ok"})});a.Get("/api",func(c *fiber.Ctx)error{return c.JSON(fiber.Map{"message":"Hello from Fiber"})});p:=os.Getenv("PORT");if p==""{p="8080"};a.Listen("0.0.0.0:"+p)}`);
goFramework("echo", "v4.13.4", "github.com/labstack/echo/v4", `package main\nimport("os";"github.com/labstack/echo/v4")\nfunc main(){e:=echo.New();e.GET("/",func(c echo.Context)error{return c.JSON(200,map[string]string{"service":"Pxxl Echo API"})});e.GET("/health",func(c echo.Context)error{return c.JSON(200,map[string]string{"status":"ok"})});e.GET("/api",func(c echo.Context)error{return c.JSON(200,map[string]string{"message":"Hello from Echo"})});p:=os.Getenv("PORT");if p==""{p="8080"};e.Start("0.0.0.0:"+p)}`);
goFramework("chi", "v5.2.2", "github.com/go-chi/chi/v5", `package main\nimport("encoding/json";"net/http";"os";"github.com/go-chi/chi/v5")\nfunc main(){r:=chi.NewRouter();send:=func(v map[string]string)http.HandlerFunc{return func(w http.ResponseWriter,_ *http.Request){w.Header().Set("Content-Type","application/json");json.NewEncoder(w).Encode(v)}};r.Get("/",send(map[string]string{"service":"Pxxl Chi API"}));r.Get("/health",send(map[string]string{"status":"ok"}));r.Get("/api",send(map[string]string{"message":"Hello from Chi"}));p:=os.Getenv("PORT");if p==""{p="8080"};http.ListenAndServe("0.0.0.0:"+p,r)}`);
goFramework("gorilla-mux", "v1.8.1", "github.com/gorilla/mux", `package main\nimport("encoding/json";"net/http";"os";"github.com/gorilla/mux")\nfunc main(){r:=mux.NewRouter();send:=func(v map[string]string)http.HandlerFunc{return func(w http.ResponseWriter,_ *http.Request){w.Header().Set("Content-Type","application/json");json.NewEncoder(w).Encode(v)}};r.HandleFunc("/",send(map[string]string{"service":"Pxxl Gorilla API"}));r.HandleFunc("/health",send(map[string]string{"status":"ok"}));r.HandleFunc("/api",send(map[string]string{"message":"Hello from Gorilla"}));p:=os.Getenv("PORT");if p==""{p="8080"};http.ListenAndServe("0.0.0.0:"+p,r)}`);

const phpComposer = (name, require) => json({ name: `pxxl/${name}`, type: "project", require });
add("php", "vanilla-api", { type: "api", runtime: "php", framework: "php", port: 8080, description: "Dependency-free PHP JSON API." }, {
  "index.php": `<?php\nheader("Content-Type: application/json");\n$path=parse_url($_SERVER["REQUEST_URI"],PHP_URL_PATH);\nif($path==="/health") echo json_encode(["status"=>"ok"]);\nelseif($path==="/api") echo json_encode(["message"=>"Hello from PHP"]);\nelse echo json_encode(["service"=>"Pxxl PHP API"]);`,
});
add("php", "slim", { type: "api", runtime: "php", framework: "slim", port: 8080, description: "Slim Framework JSON API." }, {
  "composer.json": phpComposer("slim", { "slim/slim": "^4.14", "slim/psr7": "^1.7" }),
  "public/index.php": `<?php\nrequire __DIR__."/../vendor/autoload.php";\nuse Slim\\Factory\\AppFactory;\n$app=AppFactory::create();\n$app->get("/",fn($q,$r)=>$r->withHeader("Content-Type","application/json")->write(json_encode(["service"=>"Pxxl Slim API"])));\n$app->get("/health",fn($q,$r)=>$r->withHeader("Content-Type","application/json")->write(json_encode(["status"=>"ok"])));\n$app->get("/api",fn($q,$r)=>$r->withHeader("Content-Type","application/json")->write(json_encode(["message"=>"Hello from Slim"])));\n$app->run();`,
  "pxxl.toml": `[build]\nstartCommand = "php -S 0.0.0.0:$PORT -t public"`,
});
add("php", "laravel", { type: "api", runtime: "php", framework: "laravel", port: 8080, description: "Minimal Laravel API skeleton." }, {
  "composer.json": phpComposer("laravel", { php: "^8.3", "laravel/framework": "^12.0" }),
  "artisan": `#!/usr/bin/env php\n<?php\nuse Illuminate\\Foundation\\Application;\ndefine("LARAVEL_START",microtime(true));require __DIR__."/vendor/autoload.php";$app=require_once __DIR__."/bootstrap/app.php";$status=$app->handleCommand(new Symfony\\Component\\Console\\Input\\ArgvInput);exit($status);`,
  "bootstrap/app.php": `<?php\nuse Illuminate\\Foundation\\Application;use Illuminate\\Foundation\\Configuration\\Exceptions;use Illuminate\\Foundation\\Configuration\\Middleware;return Application::configure(basePath:dirname(__DIR__))->withRouting(api:__DIR__."/../routes/api.php",health:"/health")->withMiddleware(fn(Middleware $m)=>null)->withExceptions(fn(Exceptions $e)=>null)->create();`,
  "routes/api.php": `<?php\nuse Illuminate\\Support\\Facades\\Route;Route::get("/",fn()=>["service"=>"Pxxl Laravel API"]);Route::get("/api",fn()=>["message"=>"Hello from Laravel"]);`,
  "public/index.php": `<?php\nuse Illuminate\\Http\\Request;define("LARAVEL_START",microtime(true));require __DIR__."/../vendor/autoload.php";(require_once __DIR__."/../bootstrap/app.php")->handleRequest(Request::capture());`,
  ".env.example": `APP_NAME=Pxxl\nAPP_ENV=production\nAPP_KEY=\nAPP_DEBUG=false\nAPP_URL=http://localhost`,
});
add("php", "symfony", { type: "api", runtime: "php", framework: "symfony", port: 8080, description: "Symfony HTTP kernel API starter." }, {
  "composer.json": phpComposer("symfony", { php: "^8.3", "symfony/framework-bundle": "^7.3", "symfony/runtime": "^7.3", "symfony/yaml": "^7.3" }),
  "public/index.php": `<?php\nuse App\\Kernel;require_once dirname(__DIR__)."/vendor/autoload_runtime.php";return fn(array $context)=>new Kernel($context["APP_ENV"],(bool)$context["APP_DEBUG"]);`,
  "src/Kernel.php": `<?php\nnamespace App;use Symfony\\Bundle\\FrameworkBundle\\Kernel\\MicroKernelTrait;use Symfony\\Component\\HttpKernel\\Kernel as BaseKernel;class Kernel extends BaseKernel{use MicroKernelTrait;}`,
  "src/Controller.php": `<?php\nnamespace App;use Symfony\\Component\\HttpFoundation\\JsonResponse;use Symfony\\Component\\Routing\\Attribute\\Route;class Controller{#[Route("/")]public function root(){return new JsonResponse(["service"=>"Pxxl Symfony API"]);}#[Route("/health")]public function health(){return new JsonResponse(["status"=>"ok"]);}#[Route("/api")]public function api(){return new JsonResponse(["message"=>"Hello from Symfony"]);}}`,
  "config/routes.yaml": `controllers:\n  resource: ../src/Controller.php\n  type: attribute`,
  "config/packages/framework.yaml": `framework:\n  secret: '%env(APP_SECRET)%'\n  router:\n    utf8: true`,
  ".env": `APP_ENV=prod\nAPP_DEBUG=0\nAPP_SECRET=change-me`,
});
add("php", "codeigniter", { type: "api", runtime: "php", framework: "codeigniter", port: 8080, description: "CodeIgniter 4 API starter." }, {
  "composer.json": phpComposer("codeigniter", { "codeigniter4/framework": "^4.6" }),
  "public/index.php": `<?php\nrequire FCPATH."../vendor/codeigniter4/framework/system/Boot.php";exit(CodeIgniter\\Boot::bootWeb(new Config\\Paths()));`,
  "app/Config/Paths.php": `<?php\nnamespace Config;class Paths{public string $systemDirectory=__DIR__."/../../vendor/codeigniter4/framework/system";public string $appDirectory=__DIR__."/..";public string $writableDirectory=__DIR__."/../../writable";public string $testsDirectory=__DIR__."/../../tests";public string $viewDirectory=__DIR__."/../Views";}`,
  "app/Config/Routes.php": `<?php\nuse CodeIgniter\\Router\\RouteCollection;/** @var RouteCollection $routes */$routes->get("/",fn()=>service("response")->setJSON(["service"=>"Pxxl CodeIgniter API"]));$routes->get("health",fn()=>service("response")->setJSON(["status"=>"ok"]));$routes->get("api",fn()=>service("response")->setJSON(["message"=>"Hello from CodeIgniter"]));`,
});

add("ruby", "sinatra", { type: "api", runtime: "ruby", framework: "sinatra", port: 4567, description: "Sinatra JSON API." }, {
  "Gemfile": `source "https://rubygems.org"\ngem "sinatra", "~> 4.1"\ngem "puma", "~> 6.6"`,
  "app.rb": `require "sinatra";require "json";set :bind,"0.0.0.0";set :port,ENV.fetch("PORT",4567);before{content_type :json};get("/"){{service:"Pxxl Sinatra API"}.to_json};get("/health"){{status:"ok"}.to_json};get("/api"){{message:"Hello from Sinatra"}.to_json}`,
  "pxxl.toml": `[build]\nstartCommand = "ruby app.rb"`,
});
add("ruby", "rails-api", { type: "api", runtime: "ruby", framework: "rails", port: 3000, description: "Rails API-only starter." }, {
  "Gemfile": `source "https://rubygems.org"\ngem "rails", "~> 8.0"\ngem "puma", ">= 6.0"`,
  "config.ru": `require_relative "config/environment";run Rails.application`,
  "config/application.rb": `require_relative "boot";require "rails/all";Bundler.require(*Rails.groups);module PxxlApi;class Application<Rails::Application;config.load_defaults 8.0;config.api_only=true;end;end`,
  "config/boot.rb": `ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile",__dir__);require "bundler/setup"`,
  "config/environment.rb": `require_relative "application";Rails.application.initialize!`,
  "config/routes.rb": `Rails.application.routes.draw do\nget "/",to:proc{|_|[200,{"content-type"=>"application/json"},['{"service":"Pxxl Rails API"}']]};get "/health",to:proc{|_|[200,{"content-type"=>"application/json"},['{"status":"ok"}']]};get "/api",to:proc{|_|[200,{"content-type"=>"application/json"},['{"message":"Hello from Rails"}']]};end`,
  "pxxl.toml": `[build]\nstartCommand = "bundle exec rails server -b 0.0.0.0 -p $PORT"`,
});
add("ruby", "roda", { type: "api", runtime: "ruby", framework: "roda", port: 9292, description: "Small Roda web API." }, {
  "Gemfile": `source "https://rubygems.org"\ngem "roda", "~> 3.90"\ngem "puma", "~> 6.6"`,
  "app.rb": `require "roda";require "json";class App<Roda;plugin :json;route do|r|r.root{{service:"Pxxl Roda API"}};r.get("health"){{status:"ok"}};r.get("api"){{message:"Hello from Roda"}};end;end`,
  "config.ru": `require_relative "app";run App.freeze.app`,
  "pxxl.toml": `[build]\nstartCommand = "bundle exec puma -b tcp://0.0.0.0:$PORT"`,
});

const rustCargo = (name, deps) => `[package]\nname = "pxxl-${name}"\nversion = "1.0.0"\nedition = "2024"\n\n[dependencies]\n${deps}`;
add("rust", "axum", { type: "api", runtime: "rust", framework: "axum", port: 8080, description: "Tokio and Axum async API." }, {
  "Cargo.toml": rustCargo("axum", `axum = "0.8"\ntokio = { version = "1", features = ["full"] }\nserde_json = "1"`),
  "src/main.rs": `use axum::{routing::get,Json,Router};use serde_json::{json,Value};#[tokio::main]async fn main(){let app=Router::new().route("/",get(||async{Json(json!({"service":"Pxxl Axum API"}))})).route("/health",get(||async{Json(json!({"status":"ok"}))})).route("/api",get(||async{Json(json!({"message":"Hello from Axum"}))}));let port=std::env::var("PORT").unwrap_or("8080".into());let listener=tokio::net::TcpListener::bind(format!("0.0.0.0:{port}")).await.unwrap();axum::serve(listener,app).await.unwrap();}`,
});
add("rust", "actix-web", { type: "api", runtime: "rust", framework: "actix-web", port: 8080, description: "Actix Web JSON API." }, {
  "Cargo.toml": rustCargo("actix", `actix-web = "4"\nserde_json = "1"`),
  "src/main.rs": `use actix_web::{get,App,HttpServer,Responder,web::Json};use serde_json::{json,Value};#[get("/")]async fn root()->impl Responder{Json(json!({"service":"Pxxl Actix API"}))}#[get("/health")]async fn health()->impl Responder{Json(json!({"status":"ok"}))}#[get("/api")]async fn api()->impl Responder{Json(json!({"message":"Hello from Actix"}))}#[actix_web::main]async fn main()->std::io::Result<()>{let port=std::env::var("PORT").unwrap_or("8080".into()).parse().unwrap();HttpServer::new(||App::new().service(root).service(health).service(api)).bind(("0.0.0.0",port))?.run().await}`,
});
add("rust", "rocket", { type: "api", runtime: "rust", framework: "rocket", port: 8080, description: "Rocket JSON API." }, {
  "Cargo.toml": rustCargo("rocket", `rocket = { version = "0.5", features = ["json"] }\nserde_json = "1"`),
  "src/main.rs": `#[macro_use]extern crate rocket;use rocket::serde::json::{json,Value};#[get("/")]fn root()->Value{json!({"service":"Pxxl Rocket API"})}#[get("/health")]fn health()->Value{json!({"status":"ok"})}#[get("/api")]fn api()->Value{json!({"message":"Hello from Rocket"})}#[launch]fn rocket()->_{let port=std::env::var("PORT").ok().and_then(|v|v.parse().ok()).unwrap_or(8080);rocket::custom(rocket::Config{address:"0.0.0.0".parse().unwrap(),port,..Default::default()}).mount("/",routes![root,health,api])}`,
});
add("rust", "warp", { type: "api", runtime: "rust", framework: "warp", port: 8080, description: "Warp filter-based API." }, {
  "Cargo.toml": rustCargo("warp", `warp = "0.3"\ntokio = { version = "1", features = ["full"] }\nserde_json = "1"`),
  "src/main.rs": `use serde_json::json;use warp::Filter;#[tokio::main]async fn main(){let root=warp::path::end().map(||warp::reply::json(&json!({"service":"Pxxl Warp API"})));let health=warp::path("health").map(||warp::reply::json(&json!({"status":"ok"})));let api=warp::path("api").map(||warp::reply::json(&json!({"message":"Hello from Warp"})));let port=std::env::var("PORT").unwrap_or("8080".into()).parse().unwrap();warp::serve(root.or(health).or(api)).run(([0,0,0,0],port)).await}`,
});

add("jvm", "spring-boot-java", { type: "api", runtime: "jvm", framework: "spring-boot", port: 8080, description: "Spring Boot Java REST API." }, {
  "pom.xml": `<project xmlns="http://maven.apache.org/POM/4.0.0"><modelVersion>4.0.0</modelVersion><parent><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-parent</artifactId><version>3.5.3</version></parent><groupId>dev.pxxl</groupId><artifactId>spring-api</artifactId><version>1.0.0</version><properties><java.version>21</java.version></properties><dependencies><dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency><dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-actuator</artifactId></dependency></dependencies><build><plugins><plugin><groupId>org.springframework.boot</groupId><artifactId>spring-boot-maven-plugin</artifactId></plugin></plugins></build></project>`,
  "src/main/java/dev/pxxl/Application.java": `package dev.pxxl;import java.util.Map;import org.springframework.boot.SpringApplication;import org.springframework.boot.autoconfigure.SpringBootApplication;import org.springframework.web.bind.annotation.*;@SpringBootApplication@RestController public class Application{@GetMapping("/")Map<String,String>root(){return Map.of("service","Pxxl Spring API");}@GetMapping("/health")Map<String,String>health(){return Map.of("status","ok");}@GetMapping("/api")Map<String,String>api(){return Map.of("message","Hello from Spring");}public static void main(String[]args){SpringApplication.run(Application.class,args);}}`,
});
add("jvm", "ktor-kotlin", { type: "api", runtime: "jvm", framework: "ktor", port: 8080, description: "Ktor Kotlin REST API." }, {
  "settings.gradle.kts": `rootProject.name = "pxxl-ktor"`,
  "build.gradle.kts": `plugins { kotlin("jvm") version "2.1.21"; application }\nrepositories { mavenCentral() }\ndependencies { implementation("io.ktor:ktor-server-netty:3.1.3"); implementation("io.ktor:ktor-server-content-negotiation:3.1.3"); implementation("io.ktor:ktor-serialization-kotlinx-json:3.1.3") }\napplication { mainClass.set("dev.pxxl.ApplicationKt") }`,
  "src/main/kotlin/dev/pxxl/Application.kt": `package dev.pxxl\nimport io.ktor.server.application.*\nimport io.ktor.server.engine.*\nimport io.ktor.server.netty.*\nimport io.ktor.server.response.*\nimport io.ktor.server.routing.*\nfun main(){val port=System.getenv("PORT")?.toIntOrNull()?:8080;embeddedServer(Netty,port=port,host="0.0.0.0"){routing{get("/"){call.respondText("""{"service":"Pxxl Ktor API"}""")};get("/health"){call.respondText("""{"status":"ok"}""")};get("/api"){call.respondText("""{"message":"Hello from Ktor"}""")}}}.start(wait=true)}`,
});
add("jvm", "quarkus-java", { type: "api", runtime: "jvm", framework: "quarkus", port: 8080, description: "Quarkus REST API." }, {
  "pom.xml": `<project xmlns="http://maven.apache.org/POM/4.0.0"><modelVersion>4.0.0</modelVersion><groupId>dev.pxxl</groupId><artifactId>quarkus-api</artifactId><version>1.0.0</version><properties><quarkus.platform.version>3.24.2</quarkus.platform.version><maven.compiler.release>21</maven.compiler.release></properties><dependencyManagement><dependencies><dependency><groupId>io.quarkus.platform</groupId><artifactId>quarkus-bom</artifactId><version>\${quarkus.platform.version}</version><type>pom</type><scope>import</scope></dependency></dependencies></dependencyManagement><dependencies><dependency><groupId>io.quarkus</groupId><artifactId>quarkus-rest-jackson</artifactId></dependency></dependencies><build><plugins><plugin><groupId>io.quarkus</groupId><artifactId>quarkus-maven-plugin</artifactId><version>\${quarkus.platform.version}</version><extensions>true</extensions><executions><execution><goals><goal>build</goal></goals></execution></executions></plugin></plugins></build></project>`,
  "src/main/java/dev/pxxl/Resource.java": `package dev.pxxl;import jakarta.ws.rs.*;import jakarta.ws.rs.core.MediaType;import java.util.Map;@Path("/")@Produces(MediaType.APPLICATION_JSON)public class Resource{@GET public Map<String,String>root(){return Map.of("service","Pxxl Quarkus API");}@GET@Path("health")public Map<String,String>health(){return Map.of("status","ok");}@GET@Path("api")public Map<String,String>api(){return Map.of("message","Hello from Quarkus");}}`,
});
add("jvm", "micronaut-java", { type: "api", runtime: "jvm", framework: "micronaut", port: 8080, description: "Micronaut Java REST API." }, {
  "settings.gradle": `pluginManagement { repositories { gradlePluginPortal(); mavenCentral() } }\nrootProject.name="pxxl-micronaut"`,
  "build.gradle": `plugins { id("io.micronaut.application") version "4.5.4" }\nrepositories { mavenCentral() }\nmicronaut { runtime("netty"); testRuntime("junit5"); processing { incremental(true); annotations("dev.pxxl.*") } }\napplication { mainClass="dev.pxxl.Application" }\njava { sourceCompatibility=JavaVersion.toVersion("21") }\ndependencies { annotationProcessor("io.micronaut:micronaut-http-validation"); implementation("io.micronaut:micronaut-http-server-netty"); runtimeOnly("ch.qos.logback:logback-classic") }`,
  "src/main/java/dev/pxxl/Application.java": `package dev.pxxl;import io.micronaut.runtime.Micronaut;public class Application{public static void main(String[]args){Micronaut.run(Application.class,args);}}`,
  "src/main/java/dev/pxxl/Controller.java": `package dev.pxxl;import io.micronaut.http.annotation.*;import java.util.Map;@Controller public class Controller{@Get("/")Map<String,String>root(){return Map.of("service","Pxxl Micronaut API");}@Get("/health")Map<String,String>health(){return Map.of("status","ok");}@Get("/api")Map<String,String>api(){return Map.of("message","Hello from Micronaut");}}`,
});
add("jvm", "vertx-java", { type: "api", runtime: "jvm", framework: "vertx", port: 8080, description: "Vert.x reactive Java API." }, {
  "pom.xml": `<project xmlns="http://maven.apache.org/POM/4.0.0"><modelVersion>4.0.0</modelVersion><groupId>dev.pxxl</groupId><artifactId>vertx-api</artifactId><version>1.0.0</version><properties><maven.compiler.release>21</maven.compiler.release></properties><dependencies><dependency><groupId>io.vertx</groupId><artifactId>vertx-web</artifactId><version>4.5.16</version></dependency></dependencies><build><plugins><plugin><groupId>org.apache.maven.plugins</groupId><artifactId>maven-shade-plugin</artifactId><version>3.6.0</version><executions><execution><phase>package</phase><goals><goal>shade</goal></goals><configuration><transformers><transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer"><mainClass>dev.pxxl.Application</mainClass></transformer></transformers></configuration></execution></executions></plugin></plugins></build></project>`,
  "src/main/java/dev/pxxl/Application.java": `package dev.pxxl;import io.vertx.core.*;import io.vertx.ext.web.Router;public class Application{public static void main(String[]args){Vertx v=Vertx.vertx();Router r=Router.router(v);r.get("/").handler(c->c.json(new JsonObject().put("service","Pxxl Vertx API")));r.get("/health").handler(c->c.json(new JsonObject().put("status","ok")));r.get("/api").handler(c->c.json(new JsonObject().put("message","Hello from Vertx")));int p=Integer.parseInt(System.getenv().getOrDefault("PORT","8080"));v.createHttpServer().requestHandler(r).listen(p,"0.0.0.0");}}`,
});

const csproj = (sdk = "Microsoft.NET.Sdk.Web") => `<Project Sdk="${sdk}"><PropertyGroup><TargetFramework>net9.0</TargetFramework><Nullable>enable</Nullable><ImplicitUsings>enable</ImplicitUsings></PropertyGroup></Project>`;
add("dotnet", "minimal-api", { type: "api", runtime: "dotnet", framework: "aspnetcore", port: 8080, description: "ASP.NET Core Minimal API." }, {
  "Pxxl.Api.csproj": csproj(),
  "Program.cs": `var builder=WebApplication.CreateBuilder(args);var app=builder.Build();app.MapGet("/",()=>Results.Ok(new{service="Pxxl .NET Minimal API"}));app.MapGet("/health",()=>Results.Ok(new{status="ok"}));app.MapGet("/api",()=>Results.Ok(new{message="Hello from .NET"}));app.Run();`,
});
add("dotnet", "controllers-api", { type: "api", runtime: "dotnet", framework: "aspnetcore", port: 8080, description: "ASP.NET Core controller-based API." }, {
  "Pxxl.Controllers.csproj": csproj(),
  "Program.cs": `var builder=WebApplication.CreateBuilder(args);builder.Services.AddControllers();var app=builder.Build();app.MapControllers();app.Run();`,
  "Controllers/HomeController.cs": `using Microsoft.AspNetCore.Mvc;[ApiController]public class HomeController:ControllerBase{[HttpGet("/")]public object Root()=>new{service="Pxxl .NET Controllers API"};[HttpGet("/health")]public object Health()=>new{status="ok"};[HttpGet("/api")]public object Api()=>new{message="Hello from .NET"};}`,
});
add("dotnet", "mvc", { type: "fullstack", runtime: "dotnet", framework: "aspnetcore-mvc", port: 8080, description: "ASP.NET Core MVC web application." }, {
  "Pxxl.Mvc.csproj": csproj(),
  "Program.cs": `var builder=WebApplication.CreateBuilder(args);builder.Services.AddControllersWithViews();var app=builder.Build();app.UseStaticFiles();app.MapGet("/health",()=>Results.Ok(new{status="ok"}));app.MapGet("/api",()=>Results.Ok(new{message="Hello from ASP.NET MVC"}));app.MapDefaultControllerRoute();app.Run();`,
  "Controllers/HomeController.cs": `using Microsoft.AspNetCore.Mvc;public class HomeController:Controller{public IActionResult Index()=>View();}`,
  "Views/Home/Index.cshtml": `<main><span class="eyebrow">Pxxl boilerplate</span><h1>ASP.NET MVC</h1><p>A server-rendered .NET starter.</p><div class="status"><span class="dot"></span>Runtime ready</div></main>`,
  "wwwroot/style.css": uiCss,
  "Views/Shared/_Layout.cshtml": `<!doctype html><html><head><title>ASP.NET · Pxxl</title><link rel="stylesheet" href="/style.css"></head><body>@RenderBody()</body></html>`,
  "Views/_ViewStart.cshtml": `@{Layout="_Layout";}`,
});
add("dotnet", "blazor-server", { type: "fullstack", runtime: "dotnet", framework: "blazor", port: 8080, description: "Blazor interactive server application." }, {
  "Pxxl.Blazor.csproj": csproj(),
  "Program.cs": `using Pxxl.Blazor.Components;var builder=WebApplication.CreateBuilder(args);builder.Services.AddRazorComponents().AddInteractiveServerComponents();var app=builder.Build();app.UseStaticFiles();app.MapGet("/health",()=>Results.Ok(new{status="ok"}));app.MapGet("/api",()=>Results.Ok(new{message="Hello from Blazor"}));app.MapRazorComponents<App>().AddInteractiveServerRenderMode();app.Run();`,
  "Components/App.razor": `<!doctype html><html><head><title>Blazor · Pxxl</title><link rel="stylesheet" href="/style.css"><HeadOutlet/></head><body><Routes/><script src="_framework/blazor.web.js"></script></body></html>`,
  "Components/Routes.razor": `<Router AppAssembly="typeof(Program).Assembly"><Found Context="routeData"><RouteView RouteData="routeData"/></Found></Router>`,
  "Components/Pages/Home.razor": `@page "/"<main><span class="eyebrow">Pxxl boilerplate</span><h1>Blazor</h1><p>Interactive .NET on the server.</p><div class="status"><span class="dot"></span>Runtime ready</div></main>`,
  "Components/_Imports.razor": `@using Microsoft.AspNetCore.Components.Routing\n@using Microsoft.AspNetCore.Components.Web\n@using static Microsoft.AspNetCore.Components.Web.RenderMode`,
  "wwwroot/style.css": uiCss,
});

add("dart", "shelf", { type: "api", runtime: "dart", framework: "shelf", port: 8080, description: "Dart Shelf HTTP API." }, {
  "pubspec.yaml": `name: pxxl_shelf\nenvironment:\n  sdk: ^3.8.0\ndependencies:\n  shelf: ^1.4.2\n  shelf_router: ^1.1.4`,
  "bin/server.dart": `import 'dart:convert';import 'dart:io';import 'package:shelf/shelf.dart';import 'package:shelf/shelf_io.dart' as io;import 'package:shelf_router/shelf_router.dart';Response out(Map<String,String> data)=>Response.ok(jsonEncode(data),headers:{'content-type':'application/json'});void main()async{final r=Router();r.get('/',(Request _)=>out({'service':'Pxxl Shelf API'}));r.get('/health',(Request _)=>out({'status':'ok'}));r.get('/api',(Request _)=>out({'message':'Hello from Dart'}));final p=int.tryParse(Platform.environment['PORT']??'8080')??8080;await io.serve(r.call,InternetAddress.anyIPv4,p);}`,
  "pxxl.toml": `[build]\nstartCommand = "dart run bin/server.dart"`,
});
add("dart", "dart-frog", { type: "api", runtime: "dart", framework: "dart-frog", port: 8080, description: "Dart Frog file-based API starter." }, {
  "pubspec.yaml": `name: pxxl_dart_frog\nenvironment:\n  sdk: ^3.8.0\ndependencies:\n  dart_frog: ^1.2.0\ndev_dependencies:\n  dart_frog_cli: ^1.2.0`,
  "routes/index.dart": `import 'package:dart_frog/dart_frog.dart';Response onRequest(RequestContext context)=>Response.json(body:{'service':'Pxxl Dart Frog API'});`,
  "routes/health.dart": `import 'package:dart_frog/dart_frog.dart';Response onRequest(RequestContext context)=>Response.json(body:{'status':'ok'});`,
  "routes/api.dart": `import 'package:dart_frog/dart_frog.dart';Response onRequest(RequestContext context)=>Response.json(body:{'message':'Hello from Dart Frog'});`,
  "pxxl.toml": `[build]\nbuildCommand = "dart_frog build"\nstartCommand = "dart build/bin/server.dart --port $PORT --hostname 0.0.0.0"`,
});
add("dart", "flutter-web", { type: "static", runtime: "dart", framework: "flutter", outputDirectory: "build/web", description: "Flutter web static application." }, {
  "pubspec.yaml": `name: pxxl_flutter_web\ndescription: Flutter web starter for Pxxl\npublish_to: none\nversion: 1.0.0+1\nenvironment:\n  sdk: ^3.8.0\ndependencies:\n  flutter:\n    sdk: flutter\nflutter:\n  uses-material-design: true`,
  "lib/main.dart": `import 'package:flutter/material.dart';void main()=>runApp(const App());class App extends StatelessWidget{const App({super.key});@override Widget build(BuildContext context)=>MaterialApp(debugShowCheckedModeBanner:false,darkTheme:ThemeData.dark(),themeMode:ThemeMode.dark,home:const Scaffold(body:Center(child:Column(mainAxisSize:MainAxisSize.min,children:[Text('Pxxl boilerplate'),SizedBox(height:12),Text('Flutter Web',style:TextStyle(fontSize:52,fontWeight:FontWeight.bold)),SizedBox(height:12),Text('Static edge ready')]))));}`,
  "web/index.html": `<!doctype html><html><head><base href="$FLUTTER_BASE_HREF"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Flutter · Pxxl</title></head><body><script src="flutter_bootstrap.js" async></script></body></html>`,
  "pxxl.toml": `[build]\nbuildCommand = "flutter build web --release"\noutputDirectory = "build/web"`,
});

catalog.sort((a, b) => a.language.localeCompare(b.language) || a.name.localeCompare(b.name));
const grouped = Map.groupBy(catalog, (item) => item.language);
const sections = [...grouped.entries()].map(([language, items]) => `## ${title(language)} (${items.length})

| Starter | Type | Framework | Runtime |
|---|---|---|---|
${items.map((item) => `| [${item.name}](./${item.id}) | ${item.type} | ${item.framework} | ${item.runtime} |`).join("\n")}`).join("\n\n");

write("catalog.json", json({ schemaVersion: 1, total: catalog.length, languages: grouped.size, templates: catalog }));
write("README.md", `# Pxxl Boilerplates

Production-shaped starter projects for every language family supported by the Pxxl build system.

## What every starter guarantees

- A minimal, understandable project with no demo secrets.
- APIs expose \`/\`, \`/health\`, and \`/api\`.
- Server projects bind to \`0.0.0.0\` and use the injected \`PORT\`.
- Static projects emit a Pxxl-compatible output directory or need no build.
- \`boilerplate.json\` provides machine-readable catalog metadata.
- \`pxxl.toml\` is included only when the framework needs an explicit command.

## Catalog

**${catalog.length} starters across ${grouped.size} supported language families.**

${sections}

## Repository layout

\`\`\`text
<language>/<framework>/
├── boilerplate.json
├── README.md
├── dependency manifest
└── application source
\`\`\`

Run \`npm test\` at the repository root to validate catalog metadata, JSON manifests, expected entrypoints, API health declarations, and duplicate IDs.
`);
write("package.json", json({
  name: "@pxxlspace/boilerplates",
  private: true,
  version: "1.0.0",
  type: "module",
  scripts: {
    generate: "node scripts/generate.mjs",
    test: "node scripts/validate.mjs",
  },
}));
write(".gitignore", `.DS_Store\nnode_modules/\n.env\n.env.*\n!.env.example\n`);
for (const [extension, tool, args] of [[".go", "gofmt", ["-w"]], [".rs", "rustfmt", ["--edition", "2024"]]]) {
  const files = catalog.flatMap((item) => {
    const directory = path.join(root, item.id);
    return fs.readdirSync(directory, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
      .map((entry) => path.join(entry.parentPath, entry.name));
  });
  if (files.length) spawnSync(tool, [...args, ...files], { stdio: "ignore" });
}
console.log(`Generated ${catalog.length} boilerplates across ${grouped.size} languages.`);
