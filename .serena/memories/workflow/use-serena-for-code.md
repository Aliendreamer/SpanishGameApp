# Use Serena for code search and edits

Read and edit code with Serena's tools, not shell text tools:
- **Reading:** `get_symbols_overview`, `find_symbol`, `search_for_pattern`, `find_referencing_symbols`.
- **Editing:** `replace_symbol_body`, `replace_content`, `insert_after_symbol`, `insert_before_symbol`.
- **Avoid for code:** `sed`, inline `node -e` scripts, and heredocs.

**Why:** CLAUDE.md prefers semantic tools, and on 2026-09-24 the user said "use serena" after many shell-based edits. Shell edits also caused real problems in this project: a `String.replace` with a `` $` `` pattern corrupted a test file, and quoting of apostrophes broke test strings.

**How to apply:**
- Code changes in `src/`, `scripts/`, and tests go through Serena.
- Shell stays for running commands: gates, git, openspec, and pnpm.
- Plain docs and OpenSpec markdown may still use the Write and Edit tools.
