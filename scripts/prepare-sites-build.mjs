import { mkdir, readdir, rename, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const distDirectory = join(projectRoot, "dist");
const clientDirectory = join(distDirectory, "client");
const serverDirectory = join(distDirectory, "server");

await mkdir(clientDirectory, { recursive: true });

for (const entry of await readdir(distDirectory)) {
  if (["client", "server", ".openai"].includes(entry)) continue;
  await rename(join(distDirectory, entry), join(clientDirectory, entry));
}

await mkdir(serverDirectory, { recursive: true });
await writeFile(
  join(serverDirectory, "index.js"),
  `const worker = {
  async fetch(request, env) {
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) return assetResponse;

    if (request.method !== "GET" && request.method !== "HEAD") {
      return assetResponse;
    }

    const indexUrl = new URL("/index.html", request.url);
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};

export default worker;
`,
);
