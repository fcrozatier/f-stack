import typeStrip from "@fcrozatier/type-strip";
import { ensureDirSync, existsSync, walkSync } from "@std/fs";
import { dirname, extname, globToRegExp, join } from "@std/path";

export const buildConfig = {
  exts: [".ts", ".css"],
  matcher: globToRegExp("+(client|components|pages)/**"),
  skip: /(\.d|\.test|\.spec)\.ts$/,
};

export const buildPath = (path: string) => {
  console.log(path);

  let content = Deno.readTextFileSync(path);
  switch (extname(path)) {
    case ".ts":
      content = typeStrip(content, {
        pathRewriting: true,
        removeComments: true,
      });
      break;

    case ".css":
    default:
      break;
  }

  const dest = join("build", path.replace(".ts", ".js"));
  ensureDirSync(dirname(dest));
  Deno.writeTextFileSync(dest, content);
};

const build = () => {
  console.log("Building...");

  if (existsSync("build")) {
    Deno.removeSync("build", { recursive: true });
  }

  const allEntries = Array.from(walkSync(".", {
    exts: buildConfig.exts,
    includeFiles: true,
    includeDirs: false,
    includeSymlinks: false,
    skip: [buildConfig.skip],
  }));

  const entries = allEntries.filter((e) => buildConfig.matcher.test(e.path));

  for (const entry of entries) {
    buildPath(entry.path);
  }
};

if (import.meta.main) build();
