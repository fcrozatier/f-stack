import { debounce } from "@std/async";
import { extname, relative, SEPARATOR } from "@std/path";
import { buildPath } from "./build.ts";

const rebuild = debounce(buildPath, 200);
const watcher = Deno.watchFs(".");

Deno.addSignalListener("SIGINT", () => watcher.close());
Deno.addSignalListener("SIGTERM", () => watcher.close());

console.log("Watching files...");

for await (const event of watcher) {
  if (event.kind === "modify") {
    for (const path of event.paths) {
      if (extname(path) === ".ts") {
        const isRootModule =
          relative(Deno.cwd(), path).split(SEPARATOR).length === 1;

        if (isRootModule) {
          rebuild(path);
        }
      }
    }
  }
}
