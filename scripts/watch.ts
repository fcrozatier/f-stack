import { debounce } from "@std/async";
import { extname } from "@std/path";
import { buildConfig, buildPath } from "./build.ts";

const rebuild = debounce(buildPath, 200);
const watcher = Deno.watchFs(".");

Deno.addSignalListener("SIGINT", () => watcher.close());
Deno.addSignalListener("SIGTERM", () => watcher.close());

console.log("Watching files...");

for await (const event of watcher) {
  if (event.kind === "modify") {
    for (const path of event.paths) {
      if (
        extname(path) === ".ts" &&
        !buildConfig.skip.test(path) &&
        buildConfig.matcher.test(path)
      ) {
        rebuild(path);
      }
    }
  }
}
