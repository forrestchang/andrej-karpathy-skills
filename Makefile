.PHONY: help gemini gemini-global antigravity antigravity-global claude claude-global cursor cursor-global install-all install-all-global

# Default target
help:
	@echo "Available Makefile targets:"
	@echo "  make gemini             Install Gemini/Antigravity skill and GEMINI.md in local project"
	@echo "  make gemini-global      Install Gemini/Antigravity skill globally (~/.gemini/config/skills/)"
	@echo "  make antigravity        Alias for 'make gemini'"
	@echo "  make antigravity-global Alias for 'make gemini-global'"
	@echo "  make claude             Copy CLAUDE.md to local project root"
	@echo "  make claude-global      Install global CLAUDE.md (~/.claude/CLAUDE.md)"
	@echo "  make cursor             Copy Cursor rules to .cursor/rules/ in local project"
	@echo "  make cursor-global      Install Cursor rules and skills globally (~/.cursor/rules/ & ~/.cursor/skills/)"
	@echo "  make install-all        Install all local integrations (Gemini, Claude, Cursor)"
	@echo "  make install-all-global Install all global integrations (Gemini, Claude, Cursor)"

# Gemini / Antigravity Local Installation
gemini antigravity:
	@echo "Installing Gemini/Antigravity skill and rules locally..."
	@mkdir -p .agents/skills/karpathy-guidelines
	@cp skills/karpathy-guidelines/SKILL.md .agents/skills/karpathy-guidelines/SKILL.md
	@cp GEMINI.md GEMINI.md 2>/dev/null || true
	@cp AGENTS.md AGENTS.md 2>/dev/null || true
	@echo "Done! Local Antigravity/Gemini installation complete."

# Gemini / Antigravity Global Installation
gemini-global antigravity-global:
	@echo "Installing Gemini/Antigravity skill globally..."
	@mkdir -p ~/.gemini/config/skills/karpathy-guidelines
	@cp skills/karpathy-guidelines/SKILL.md ~/.gemini/config/skills/karpathy-guidelines/SKILL.md
	@echo "Done! Global Antigravity/Gemini skill installed to ~/.gemini/config/skills/karpathy-guidelines/"

# Claude Code Local Installation
claude:
	@echo "Installing Claude Code rules locally..."
	@test -f CLAUDE.md || cp CLAUDE.md CLAUDE.md 2>/dev/null || true
	@echo "Done! CLAUDE.md available at project root."

# Claude Code Global Installation
claude-global:
	@echo "Installing Claude Code rules globally..."
	@mkdir -p ~/.claude
	@if [ -f ~/.claude/CLAUDE.md ]; then \
		echo "" >> ~/.claude/CLAUDE.md; \
		cat CLAUDE.md >> ~/.claude/CLAUDE.md; \
		echo "Appended Karpathy Guidelines to ~/.claude/CLAUDE.md"; \
	else \
		cp CLAUDE.md ~/.claude/CLAUDE.md; \
		echo "Created ~/.claude/CLAUDE.md with Karpathy Guidelines"; \
	fi
	@echo "Done! Global Claude Code instructions updated."

# Cursor Local Installation
cursor:
	@echo "Installing Cursor rules locally..."
	@mkdir -p .cursor/rules
	@test -f .cursor/rules/karpathy-guidelines.mdc || cp .cursor/rules/karpathy-guidelines.mdc .cursor/rules/karpathy-guidelines.mdc 2>/dev/null || true
	@echo "Done! Cursor rule available at .cursor/rules/"

# Cursor Global Installation
cursor-global:
	@echo "Installing Cursor rules and skills globally..."
	@mkdir -p ~/.cursor/rules ~/.cursor/skills/karpathy-guidelines
	@cp .cursor/rules/karpathy-guidelines.mdc ~/.cursor/rules/karpathy-guidelines.mdc
	@cp skills/karpathy-guidelines/SKILL.md ~/.cursor/skills/karpathy-guidelines/SKILL.md
	@echo "Done! Global Cursor rule (~/.cursor/rules/) and skill (~/.cursor/skills/) installed."

# Install all local integrations
install-all: gemini claude cursor
	@echo "All local integrations installed successfully!"

# Install all global integrations
install-all-global: gemini-global claude-global cursor-global
	@echo "All global integrations installed successfully!"
