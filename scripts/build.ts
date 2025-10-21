import stripTypes from "@fcrozatier/type-strip";
import { ensureDirSync, existsSync, walkSync } from "@std/fs";
import { dirname, extname, globToRegExp, join } from "@std/path";

/**
 * Config options used for builds
 *
 * @prop {string[]} exts List of file extensions used to filter entries
 * @prop {RegExp} matcher Regular expression pattern used to match entries
 * @prop {RegExp} skip Regular expression pattern used to skip entries
 */
export const buildConfig = {
  exts: [".ts", ".css"],
  matcher: globToRegExp("+(packages|playground)/**"),
  skip: /(\.d|\.test|\.spec)\.ts$/,
};

/**
 * Builds a source file
 *
 * @param path Path to the source file to build
 */
export const buildPath = (path: string) => {
  console.log(path);

  let content = Deno.readTextFileSync(path);
  switch (extname(path)) {
    case ".ts":
      content = stripTypes(content, {
        pathRewriting: true,
        removeComments: true,
        remapSpecifiers: {
          filePath: path,
          imports: {
            "@f-stack/reflow/": "./packages/reflow/src/",
            "@f-stack/reflow": "./packages/reflow/src/mod.js",
            "@f-stack/functorial/": "./packages/functorial/src/",
            "@f-stack/functorial": "./packages/functorial/src/mod.js",
          },
        },
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
