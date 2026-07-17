import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { __unstable__loadDesignSystem } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(projectRoot, "src");
const stylesheetPath = path.join(sourceRoot, "main.css");
const documentPath = path.join(projectRoot, "index.html");
const supportedExtensions = new Set([".css", ".html", ".js", ".jsx", ".ts", ".tsx"]);
const shouldFix = process.argv.includes("--fix");

type CanonicalClassChange = {
  canonical: string;
  candidate: string;
  column: number;
  line: number;
  offset: number;
};

const collectSourceFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry): Promise<string[]> => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectSourceFiles(entryPath);
      }
      return entry.isFile() && supportedExtensions.has(path.extname(entry.name)) ? [entryPath] : [];
    }),
  );

  return files.flat();
};

const getLocation = (content: string, offset: number) => {
  const prefix = content.slice(0, offset);
  const lines = prefix.split("\n");
  return {
    column: (lines.at(-1)?.length ?? 0) + 1,
    line: lines.length,
  };
};

const stylesheet = await readFile(stylesheetPath, "utf8");
const designSystem = await __unstable__loadDesignSystem(stylesheet, {
  base: path.dirname(stylesheetPath),
});
const scanner = new Scanner({});
const sourceFiles = [documentPath, ...(await collectSourceFiles(sourceRoot))];
const changesByFile = new Map<string, CanonicalClassChange[]>();

for (const filePath of sourceFiles) {
  const content = await readFile(filePath, "utf8");
  const extension = path.extname(filePath).slice(1);
  const candidates = scanner.getCandidatesWithPositions({
    content,
    extension,
  });

  for (const { candidate, position: offset } of candidates) {
    const [canonical] = designSystem.canonicalizeCandidates([candidate], { rem: 16 });
    if (!canonical || canonical === candidate) {
      continue;
    }

    const sourceCandidate = content.slice(offset, offset + candidate.length);
    if (sourceCandidate !== candidate) {
      throw new Error(
        `Tailwind scanner returned an invalid position for "${candidate}" in ${filePath}`,
      );
    }

    const { column, line } = getLocation(content, offset);
    const fileChanges = changesByFile.get(filePath) ?? [];
    fileChanges.push({ canonical, candidate, column, line, offset });
    changesByFile.set(filePath, fileChanges);
  }
}

const changeCount = [...changesByFile.values()].reduce(
  (total, changes) => total + changes.length,
  0,
);

if (changeCount === 0) {
  console.log("All Tailwind classes use their canonical form.");
  process.exit(0);
}

if (!shouldFix) {
  for (const [filePath, changes] of changesByFile) {
    const relativePath = path.relative(projectRoot, filePath);
    for (const { candidate, canonical, column, line } of changes) {
      console.error(
        `${relativePath}:${line}:${column} Tailwind class "${candidate}" can be written as "${canonical}".`,
      );
    }
  }
  console.error(
    `Found ${changeCount} non-canonical Tailwind ${changeCount === 1 ? "class" : "classes"}. Run "bun run lint:tailwind:fix" to fix them.`,
  );
  process.exit(1);
}

for (const [filePath, changes] of changesByFile) {
  let content = await readFile(filePath, "utf8");

  for (const { offset, candidate, canonical } of [...changes].sort(
    (left, right) => right.offset - left.offset,
  )) {
    content = content.slice(0, offset) + canonical + content.slice(offset + candidate.length);
  }

  await writeFile(filePath, content);
}

console.log(
  `Fixed ${changeCount} non-canonical Tailwind ${changeCount === 1 ? "class" : "classes"} in ${changesByFile.size} ${changesByFile.size === 1 ? "file" : "files"}.`,
);
