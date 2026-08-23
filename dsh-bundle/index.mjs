// DSH Skill Bundle - Andrej Karpathy Coding Guidelines
// Node half entry: Cordis plugin

export const name = 'dsh-skill-andrej-karpathy'

// No runtime logic needed - skills are loaded by dsh-skill-filesystem
// The cordis.patch.yml configures the filesystem provider to scan our skills/ directory
export function apply(ctx) {
  // Skills are declarative - loaded via dsh.skills in package.json
  // and discovered by the skill-filesystem provider
}
