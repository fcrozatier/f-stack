import { basename, dirname, extname, fromFileUrl, join } from "@std/path";

const moduleDir = dirname(fromFileUrl(import.meta.url));
const rootDir = join(moduleDir, "..", "..", "..");

const template = (path: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playground</title>
    <script type="importmap">
      {
        "imports": {
          "@f-stack/functorial": "/packages/reactive.ts",
          "@f-stack/reflow": "/packages/html.js"
        }
      }
    </script>
  </head>
  <body>
    <script type="module">
      import test from "${path}/index.js";
      document.body.append(test().fragment);
    </script>
  </body>
</html>
`;

const build: Record<string, string> = {};

const entrypoints = [
  join(rootDir, "packages/functorial/src/reactive.ts"),
  join(rootDir, "packages/reflow/src/html.js"),
];

for (const entrypoint of entrypoints) {
  const filename = basename(entrypoint);
  console.log("building", filename);

  // @ts-ignore FUTUR `Deno.bundle` types missing
  const result = await Deno.bundle({
    entrypoints: [entrypoint],
    format: "esm",
    minify: false,
    codeSplitting: false,
    inlineImports: false,
    packages: "external",
    platform: "browser",
    write: false,
  });

  const [file] = result.outputFiles;
  build[filename] = file.text();
}

/**
 * Test server
 */
export default {
  fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const extension = extname(path);

    if (extension === ".html") {
      const templateDir = dirname(path);
      return new Response(template(templateDir), {
        headers: { "content-type": "text/html" },
      });
    }

    if (extension === ".js" || extension === ".ts") {
      if (path.startsWith("/packages")) {
        const filename = basename(path);
        const file = build[filename];

        if (!file) throw new Deno.errors.NotFound(`Not found: ${path}`);

        return new Response(file, {
          headers: { "content-type": "application/javascript" },
        });
      }

      const dest = join(moduleDir, path);
      const file = Deno.readTextFileSync(dest);

      return new Response(file, {
        headers: { "content-type": "application/javascript" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
} satisfies Deno.ServeDefaultExport;
