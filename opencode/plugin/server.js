import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const extractAndStripFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of frontmatterStr.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, "");
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: body };
};

const getBootstrapContent = (skillsDir) => {
  const skillPath = path.join(skillsDir, "karpathy-guidelines", "SKILL.md");
  if (!fs.existsSync(skillPath)) return null;

  const fullContent = fs.readFileSync(skillPath, "utf8");
  const { content } = extractAndStripFrontmatter(fullContent);

  const toolMapping = `**Tool Mapping for OpenCode:**
When skills reference Claude Code tools, substitute OpenCode equivalents:
- \`TodoWrite\` -> \`todowrite\`
- \`Task\` with subagents -> Use OpenCode's subagent system (@mention)
- \`Skill\` tool -> OpenCode's native \`skill\` tool
- \`Read\`, \`Write\`, \`Edit\`, \`Bash\` -> Your native tools

Use OpenCode's native \`skill\` tool to list and load skills.`;

  return `<IMPORTANT_GUIDELINES>
You have karpathy-guidelines loaded.

**These behavioral guidelines are ALREADY ACTIVE - follow them in your work.**

${content}

${toolMapping}
</IMPORTANT_GUIDELINES>`;
};

export const KarpathyGuidelinesPlugin = async () => {
  const skillsDir = path.resolve(__dirname, "../skills");

  return {
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }
    },

    "experimental.chat.messages.transform": async (_input, output) => {
      const bootstrap = getBootstrapContent(skillsDir);
      if (!bootstrap || !output.messages.length) return;
      const firstUser = output.messages.find((m) => m.info.role === "user");
      if (!firstUser || !firstUser.parts.length) return;
      if (firstUser.parts.some((p) => p.type === "text" && p.text.includes("IMPORTANT_GUIDELINES"))) return;
      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: "text", text: bootstrap });
    },
  };
};

const pluginModule = {
  id: "karpathy-guidelines",
  server: KarpathyGuidelinesPlugin,
};

export default pluginModule;
