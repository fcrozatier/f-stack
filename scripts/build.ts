import typeStrip from "@fcrozatier/type-strip";
import { walkSync } from "@std/fs";
import { extname } from "@std/path";

export const buildPath = (path: string) => {
  if (extname(path) === ".ts") {
    console.log(path);
    const mod = Deno.readTextFileSync(path);
    const js = typeStrip(mod, { pathRewriting: true, removeComments: true });
    const dest = path.replace(".ts", ".js");
    Deno.writeTextFileSync(dest, js);
  }
};

const build = () => {
  console.log("Building...");

  for (
    /**
     * Only build the .ts modules in the root folder
     */
    const entry of walkSync(".", {
      exts: [".ts"],
      includeFiles: true,
      includeDirs: false,
      includeSymlinks: false,
      maxDepth: 1,
    })
  ) {
    buildPath(entry.path);
  }
};

if (import.meta.main) build();
