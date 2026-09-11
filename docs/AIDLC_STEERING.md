# AIDLC Downstream Steering Rules

## 1. System Role & Scope

You are the execution agent running inside VS Code. Your sole objective is to execute the tasks defined in `docs/aidlc-state.md` sequentially.

- **Strict Boundary:** You are only authorized to modify files within the project workspace. Do not touch system files or out-of-scope directories.
- **Tech Stack Context:** This is a Tauri v2 + React + TypeScript + Rust project. Follow existing code conventions, linting, and testing patterns.

## 2. Three-Phase Adaptive Workflow

This project follows the AIDLC **three-phase adaptive workflow**:

| Phase | Color | Purpose |
| --- | --- | --- |
| **Inception** | 🔵 | Requirements, planning, and design |
| **Construction** | 🟢 | Implementation, code generation, and testing |
| **Operations** | 🟡 | Deployment, monitoring, and maintenance |

Tasks are grouped under these three phases in `docs/aidlc-state.md`. Each phase has a dedicated subdirectory under `docs/aidlc-docs/` for generated artifacts.

```mermaid
graph TB
    subgraph Inception["🔵 Inception"]
        WSD[Workspace Detection] --> RA[Requirements Analysis]
        RA --> WP[Workflow Planning]
    end

    subgraph Construction["🟢 Construction"]
        FD[Functional Design] --> CG[Code Generation]
        CG --> BT[Build & Test]
    end

    subgraph Operations["🟡 Operations"]
        DM[Deploy & Monitor]
    end

    Inception -->|HITL Gate| Construction
    Construction -->|HITL Gate| Operations

    style Inception fill:#1a3a5c,stroke:#4a9eff,color:#fff
    style Construction fill:#1a4a2a,stroke:#4aff6a,color:#fff
    style Operations fill:#5a4a1a,stroke:#ffd04a,color:#fff
```

### Phase Transition Rules

- Complete **all** tasks in the current phase before advancing.
- At phase completion, **HALT** and await human approval (see §8 HITL Gates).
- Do not auto-advance phases.

### Artifact Directories

| Phase | Artifact Path |
| --- | --- |
| 🔵 Inception | `docs/aidlc-docs/inception/` |
| 🟢 Construction | `docs/aidlc-docs/construction/` |
| 🟡 Operations | `docs/aidlc-docs/operations/` |

## 3. Git & Branching Protocol

- You must use **Feature Branching (GitHub Flow)**.
- Before starting a new Phase, ensure you are on a branch named `phase-[N]-development` (e.g., `phase-1-development`).
- For individual tasks within a phase, you may commit directly to your active phase branch. Do not request human approval between tasks.

## 4. State Management Protocol

- **Before starting a task:** Update its status to `[/]` (In Progress) in `docs/aidlc-state.md`.
- **After completing a task:**

    1. Update its status to `[x]` (Completed).
    2. Recalculate the **Overall Completion %** using: `(Completed Tasks / Total Tasks) * 100`.
    3. Append an audit entry to `docs/audit.md` (see §5).
    4. Commit your changes to Git.

- **If Blocked:** If you encounter an unresolvable error or missing requirement, append a structured entry to the JSON block in `docs/aidlc-state.md` with status `"BLOCKED"`, commit, and notify the user.

## 5. Audit Log

Every state transition must be recorded in `docs/audit.md`. Entries are **append-only** and timestamped in ISO-8601 format.

### Entry Format

```markdown
## {Entry Title}
**Timestamp**: 2026-07-23T12:00:00Z
**Stage**: {phase name}
**Action**: {what happened}
**Details**: {additional context}
```

The audit log provides a traceable history of all workflow actions, stage completions, blocker events, and HITL gate crossings.

## 6. Secret & Environment Isolation

- **NEVER** write API keys, passwords, or sensitive credentials into code, markdown files, or steering rules.
- All configuration variables must be read from a local `.env` file.
- Ensure `.env` is added to `.gitignore` and only commit a `.env.template` containing placeholder keys.

## 7. Compliance Guardrails

- **HIPAA Compliance:** Prohibit logging, caching, or transmitting unencrypted PII/PHI. Mandate encryption-at-rest and in-transit.

- **GDPR Compliance:** Enforce data minimization. Prohibit unnecessary data collection. Mandate pseudonymization of user records.

## 8. Human-in-the-Loop (HITL) Gates

- **Phase-End Halt:** When all tasks in a Phase are marked `[x]`, you must:

    1. Commit all outstanding changes.
    2. Push the phase branch to the remote repository (if configured).
    3. **STOP execution immediately.**
    4. Present a summary of completed work to the user and explicitly ask: *"Phase [N] is complete. Please review, merge to main, and approve the transition to Phase [N+1]."*

- **Do not proceed to the next phase until the user explicitly commands you to do so.**
