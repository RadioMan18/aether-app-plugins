# Construction: Build and Test

## Objective

Verify that generated code compiles, passes tests, and meets quality gates before phase transition.

## Validation Steps

1. **Rust Checks:**
   - `cargo fmt -- --check` — formatting
   - `cargo clippy --all-targets --all-features` — linting
   - `cargo test` — unit/integration tests

2. **Frontend Checks:**
   - `npm run lint` — ESLint
   - `npm run typecheck` — TypeScript compiler
   - `npm run test` — unit tests

3. **Security Checks:**
   - `cargo audit` — Rust dependency vulnerabilities
   - `npm audit` — Node dependency vulnerabilities

4. **Manual Verification:**
   - Tauri dev server launches without console errors
   - UI renders correctly at expected window sizes
   - Sandbox iframe loads plugin assets successfully

## Gate Criteria

All checks must pass with zero errors and zero warnings before the phase is considered complete.

## Rollback

If tests fail after a task commit:
1. Do not proceed to the next task.
2. Diagnose and fix the failure.
3. Amend or create a new commit with the fix.
4. Re-run validation before continuing.
