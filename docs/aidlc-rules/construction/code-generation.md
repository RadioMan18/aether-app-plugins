# Construction: Code Generation

## Objective

Implement tasks from the approved plan sequentially, maintaining strict adherence to the tech spec and coding standards.

## Execution Rules

1. **One task at a time:** Complete the current task fully before advancing.
2. **Status updates:** Mark task `[/]` before starting, `[x]` after completion.
3. **Commits:** Commit after each task with a descriptive message referencing the task ID (e.g., `feat: TSK-001 - Tauri host setup`).
4. **Testing:** Run relevant tests/linters before marking a task complete.
5. **No scope creep:** Do not implement unplanned features.

## Tech Stack Commands

- **Rust:** `cargo clippy`, `cargo fmt -- --check`, `cargo test`
- **Frontend:** `npm run lint`, `npm run typecheck`, `npm run test`
- **Tauri:** `npm run tauri dev` (development), `npm run tauri build` (release)

## Blockers

If blocked:
1. Update `docs/aidlc-state.md` blocker JSON with `status: "BLOCKED"`
2. Commit with message `blocker: TSK-XXX - <description>`
3. Notify user with specific details
