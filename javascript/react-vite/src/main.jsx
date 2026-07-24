import React from "react"; import { createRoot } from "react-dom/client"; import "./style.css";
function App(){return <main><span className="eyebrow">Pxxl boilerplate</span><h1>React + Vite</h1><p>A fast static React starter.</p><div className="status"><span className="dot"/>Static edge ready</div></main>}; createRoot(document.getElementById("app")).render(<App/>);
