import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { teamSlugs } from "../src/gameData.js";

const projectRoot = resolve(import.meta.dirname, "..");
const distDirectory = join(projectRoot, "dist");
const indexHtml = await readFile(join(distDirectory, "index.html"), "utf8");

const routes = [
  "game",
  ...teamSlugs,
  ...teamSlugs.map((slug) => `${slug}/riddle`),
];

for (const route of routes) {
  const depth = route.split("/").length;
  const assetPrefix = "../".repeat(depth);
  const routeHtml = indexHtml.replaceAll("./assets/", `${assetPrefix}assets/`);
  const outputPath = join(distDirectory, route, "index.html");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, routeHtml);
}

console.log(`Materialized ${routes.length} direct game routes.`);
