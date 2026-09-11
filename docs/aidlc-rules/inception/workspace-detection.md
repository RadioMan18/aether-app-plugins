# Inception: Workspace Detection

## Objective

Detect and classify the project workspace to determine the appropriate execution strategy.

## Detection Checklist

- [ ] Verify project root contains `docs/aidlc-state.md` and `docs/AIDLC_STEERING.md`
- [ ] Detect tech stack from config files:
  - `src-tauri/Cargo.toml` → Rust backend
  - `package.json` → Node.js/React frontend
  - `tailwind.config.js` → Tailwind CSS
- [ ] Check Git status and active branch
- [ ] Verify Tauri v2 CLI availability
- [ ] Identify existing source directories: `src-tauri/`, `src/`, `packages/`, `plugins/`

## Expected Output

```text
🔍 Running workspace detection...
   → Project classified as greenfield
   → Detected: Tauri v2, React 18+, TypeScript, Tailwind CSS, Rusqlite + SQLCipher
   → Active branch: main
```

## Edge Cases

- If `src-tauri/` exists but `Cargo.toml` is missing → flag as incomplete scaffold
- If no `package.json` in root → check for monorepo structure under `packages/`
