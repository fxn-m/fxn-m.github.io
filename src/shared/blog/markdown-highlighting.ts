import he from "he";
import hljs from "highlight.js";
import type { ShowdownExtension } from "showdown";

const languageAliases: Record<string, string> = {
  "ascii art": "plaintext",
  "c#": "csharp",
  "c++": "cpp",
  "f#": "fsharp",
  "java/c/c++/c#": "plaintext",
  "llvm ir": "llvm",
  "notion formula": "plaintext",
  "objective-c": "objectivec",
  "plain text": "plaintext",
  "vb.net": "vbnet",
  "visual basic": "vbnet",
  webassembly: "wasm",
};

const resolveLanguage = (sourceLanguage: string): string => {
  const normalized = sourceLanguage.trim().toLowerCase();
  const language = languageAliases[normalized] ?? normalized;
  return hljs.getLanguage(language) ? language : "plaintext";
};

const normalizeFencedCodeLanguages: ShowdownExtension = {
  type: "lang",
  filter(markdown) {
    return markdown.replace(
      /^(\s{0,3})(`{3,}|~{3,})[ \t]*([^\r\n`]*)$/gm,
      (line, indentation: string, fence: string, sourceLanguage: string) => {
        if (!sourceLanguage.trim()) {
          return line;
        }

        return `${indentation}${fence}${resolveLanguage(sourceLanguage)}`;
      },
    );
  },
};

const highlightFencedCode: ShowdownExtension = {
  type: "output",
  filter(html) {
    return html.replace(
      /<pre><code class="([^"]+)">([\s\S]*?)<\/code><\/pre>/g,
      (codeBlock, className: string, encodedCode: string) => {
        const classes = className.split(/\s+/);
        const languageClass = classes.find((candidate) => candidate.startsWith("language-"));

        if (!languageClass) {
          return codeBlock;
        }

        const language = resolveLanguage(languageClass.slice("language-".length));
        const highlighted = hljs.highlight(he.decode(encodedCode), {
          ignoreIllegals: true,
          language,
        });
        const highlightedClasses = [...new Set(["hljs", ...classes])].join(" ");

        return `<pre><code class="${highlightedClasses}">${highlighted.value}</code></pre>`;
      },
    );
  },
};

export const blogSyntaxHighlighting = [normalizeFencedCodeLanguages, highlightFencedCode];
