<template><main><span class="eyebrow">Pxxl boilerplate</span><h1>Nuxt</h1><p>Vue full-stack deployment.</p><div class="status"><span class="dot"/>Runtime ready</div></main></template><style>
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
</style>
