import { debounce } from "@std/async";
import { extname, relative } from "@std/path";
import { buildConfig, buildPath } from "./build.ts";

const rebuild = debounce(buildPath, 200);
const watcher = Deno.watchFs(".");

Deno.addSignalListener("SIGINT", () => watcher.close());
Deno.addSignalListener("SIGTERM", () => watcher.close());

console.log("Watching files...");

for await (const event of watcher) {
  if (event.kind === "modify") {
    for (const absolutePath of event.paths) {
      const relativePath = relative(Deno.cwd(), absolutePath);
      if (
        buildConfig.exts.includes(extname(relativePath)) &&
        !buildConfig.skip.test(relativePath) &&
        buildConfig.matcher.test(relativePath)
      ) {
        rebuild(relativePath);
      }
    }
  }
}
