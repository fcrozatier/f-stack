import typeStrip from "@fcrozatier/type-strip";
import { ensureDirSync, existsSync, walkSync } from "@std/fs";
import { dirname, globToRegExp, join } from "@std/path";

export const buildPath = (path: string) => {
  console.log(path);
  const mod = Deno.readTextFileSync(path);
  const js = typeStrip(mod, { pathRewriting: true, removeComments: true });
  const dest = join("build", path.replace(".ts", ".js"));
  ensureDirSync(dirname(dest));
  Deno.writeTextFileSync(dest, js);
};

const build = () => {
  console.log("Building...");

  if (existsSync("build")) {
    Deno.removeSync("build", { recursive: true });
  }

  const allEntries = Array.from(walkSync(".", {
    exts: [".ts"],
    includeFiles: true,
    includeDirs: false,
    includeSymlinks: false,
    skip: [/(\.d|\.test|\.spec)\.ts$/],
  }));

  const matcher = globToRegExp("+(client|components|pages)/**");
  const entries = allEntries.filter((e) => matcher.test(e.path));

  for (const entry of entries) {
    buildPath(entry.path);
  }
};

if (import.meta.main) build();
