import type { FileSystemTree } from "@webcontainer/api";

export interface FlatFile {
  name: string;
  content: string;
}

// Standard Next.js scaffold files v0's API doesn't return (identical across projects).
const BOILERPLATE: FlatFile[] = [
  {
    name: "tsconfig.json",
    content: JSON.stringify(
      {
        compilerOptions: {
          target: "ES2017",
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
          plugins: [{ name: "next" }],
          paths: { "@/*": ["./*"] },
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        exclude: ["node_modules"],
      },
      null,
      2
    ),
  },
  {
    name: "next.config.mjs",
    content: `/** @type {import('next').NextConfig} */\nconst nextConfig = {};\nexport default nextConfig;\n`,
  },
  {
    name: "postcss.config.mjs",
    content: `const config = {\n  plugins: {\n    "@tailwindcss/postcss": {},\n  },\n};\nexport default config;\n`,
  },
  {
    name: "next-env.d.ts",
    content: `/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n`,
  },
];

export function buildFileSystemTree(v0Files: FlatFile[]): FileSystemTree {
  const tree: FileSystemTree = {};
  const allFiles = [...v0Files, ...BOILERPLATE];

  for (const { name, content } of allFiles) {
    const parts = name.split("/");
    let cursor = tree;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const existing = cursor[part];
      if (!existing || !("directory" in existing)) {
        cursor[part] = { directory: {} };
      }
      cursor = (cursor[part] as { directory: FileSystemTree }).directory;
    }
    cursor[parts[parts.length - 1]] = { file: { contents: content } };
  }

  return tree;
}
