# Process Overview

## AIDLC Workflow Summary

The AI-Driven Development Life Cycle (AIDLC) is a structured, phase-gated methodology for AI-assisted software development.

### Three Phases

1. **🔵 Inception** — Requirements, planning, and design
2. **🟢 Construction** — Implementation, code generation, and testing
3. **🟡 Operations** — Deployment, monitoring, and maintenance

### Key Principles

- **Phase-Gated Execution:** Each phase ends with a mandatory HITL gate. The agent halts and waits for human approval before advancing.
- **State-Driven:** The task board in `docs/aidlc-state.md` is the single source of truth for progress.
- **Audit Trail:** Every state transition is recorded in `docs/audit.md`.
- **Token Efficiency:** Steering rules and state files are optimized for LLM context windows.

### Project Context

This project builds a modular desktop application platform using:
- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Rust + Tauri v2
- **Database:** SQLite with SQLCipher encryption
- **Security:** Windows Hello biometrics via Windows Biometric Framework
- **Plugin System:** Sandboxed iframes with custom `plugin://` URI scheme
