import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "catalog.json"), "utf8"));
const ids = new Set();
const errors = [];
const apiSourceExtensions = new Set([".js", ".mjs", ".jsx", ".ts", ".tsx", ".py", ".go", ".php", ".rb", ".rs", ".java", ".kt", ".cs", ".dart"]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

for (const item of catalog.templates) {
  const directory = path.join(root, item.id);
  const metadataPath = path.join(directory, "boilerplate.json");
  const readmePath = path.join(directory, "README.md");
  if (ids.has(item.id)) errors.push(`duplicate id: ${item.id}`);
  ids.add(item.id);
  if (!fs.existsSync(directory)) errors.push(`missing directory: ${item.id}`);
  if (!fs.existsSync(metadataPath)) errors.push(`missing boilerplate.json: ${item.id}`);
  if (!fs.existsSync(readmePath)) errors.push(`missing README.md: ${item.id}`);
  if (fs.existsSync(metadataPath)) {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
    if (metadata.id !== item.id) errors.push(`metadata id mismatch: ${item.id}`);
    if (!["static", "api", "fullstack"].includes(metadata.type)) errors.push(`invalid type: ${item.id}`);
    if (["api", "fullstack"].includes(metadata.type) && metadata.healthPath !== "/health") errors.push(`missing health path: ${item.id}`);
    if (metadata.type === "static" && metadata.healthPath !== null) errors.push(`static health path must be null: ${item.id}`);
  }
  const packagePath = path.join(directory, "package.json");
  if (fs.existsSync(packagePath)) JSON.parse(fs.readFileSync(packagePath, "utf8"));
  const files = fs.existsSync(directory) ? walk(directory) : [];
  for (const configPath of files.filter((file) => file.endsWith("pxxl.toml"))) {
    const config = fs.readFileSync(configPath, "utf8");
    if (!config.startsWith("[build]\n")) errors.push(`pxxl.toml must use [build]: ${item.id}`);
  }
  if (["api", "fullstack"].includes(item.type)) {
    const sources = files.filter((file) => apiSourceExtensions.has(path.extname(file)));
    const routeEvidence = sources.map((file) => `${path.relative(directory, file)}\n${fs.readFileSync(file, "utf8")}`).join("\n");
    if (!routeEvidence.includes("health")) errors.push(`health route missing from source: ${item.id}`);
    if (!routeEvidence.includes("api")) errors.push(`api route missing from source: ${item.id}`);
  }
  if (files.some((file) => fs.readFileSync(file, "utf8").includes("gradient("))) errors.push(`gradients are not allowed: ${item.id}`);
}

if (catalog.total !== catalog.templates.length) errors.push("catalog total does not match templates");
if (catalog.languages !== new Set(catalog.templates.map((item) => item.language)).size) errors.push("catalog language total is incorrect");
if (catalog.total < 50) errors.push("catalog is not comprehensive enough");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validated ${catalog.total} boilerplates across ${catalog.languages} languages.`);
