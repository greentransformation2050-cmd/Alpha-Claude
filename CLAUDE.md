## GBrain Configuration (configured by /setup-gbrain)

- Mode: local-stdio (registered as MCP server `gbrain`)
- Engine: pglite (no remote database)
- Config file: `~/.gbrain/config.json`
- Database path: `~/.gbrain/brain.pglite`
- Embedding provider: none configured (no `OPENAI_API_KEY` / `VOYAGE_API_KEY` /
  `ZEROENTROPY_API_KEY` set) — search runs in full-text/keyword mode only.
  Run `gbrain config set embedding_model <id>` once a provider key is
  available to enable semantic search.
- Setup date: 2026-06-27
- MCP registered: yes (`claude mcp list` shows `gbrain` connected)
- Artifacts sync: off
- Current repo policy (`greentransformation2050-cmd/Alpha-Claude`): unset
  (skipped during setup; no code import was performed). Set later with
  `~/.claude/skills/gstack/bin/gstack-gbrain-repo-policy set <remote> <read-write|read-only|deny>`.
- Brain trust policy: personal (auto-set; local PGLite is single-tenant by
  construction)

## GBrain Search Guidance

- Smoke test passed: a test page was written and found via
  `gbrain put` / `gbrain search`.
- `gbrain doctor` reports overall status `warnings` (expected — no
  embeddings yet, since no embedding provider key is configured). DB
  connectivity, schema, and write/search paths are healthy.
