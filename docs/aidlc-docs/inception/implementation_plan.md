---
project_name: "Technical Architecture Plan: Aether App Suite (Tauri + Windows 11)"
critical_path: "TSK-001 → TSK-002 → TSK-003 → TSK-005 → TSK-010 → TSK-012 → TSK-016"
total_cost: 286.15
bottlenecks: "TSK-002, TSK-010, TSK-012"
shortest_path: "TSK-001 → TSK-004 → TSK-011 → TSK-016"
total_tasks: 16
phases: 4
---

# Technical Architecture Plan: Aether App Suite (Tauri + Windows 11)

## 1. Project Overview

This document establishes the complete technical architecture and dependency-aware execution plan for the Aether App Suite — a world-class, secure, extensible desktop application platform. It is optimized for direct ingestion by the downstream pipeline (Task Extractor, Graph Engine, and AIDLC Generator).

### UI Architecture Reference

The UI follows best practices from VS Code, Obsidian, Backstage, Raycast, Linear, Notion, Figma, and Arc Browser. See `docs/aidlc-docs/inception/ui_architecture.md` for the complete design system specification.

---

**Technology Stack:**

- TypeScript
- React
- Tailwind CSS
- shadcn/ui + Radix UI primitives
- Lucide React icons
- Framer Motion
- SQLite (via rusqlite with bundled-sqlcipher)
- Tauri v2

## 2. Graph-Based Task Analysis

### 2.1 Task Decomposition

The project is decomposed into 16 discrete tasks. Each task is assigned a weight using the formula:
$$\text{Weight} = \text{Estimated Hours} \times \text{Complexity Factor} \times \text{Risk Factor}$$

| Task ID | Task Name | Est. Hours | Complexity | Risk | Weight | Dependencies |
|---------|-----------|:----------:|:----------:|:----:|:------:|--------------|
| TSK-001 | Design System Foundation (shadcn/ui + Theme Tokens) | 12.0 | 1.2 | 1.0 | 14.40 | None |
| TSK-002 | Three-Pane Shell: Activity Bar + Sidebar + Status Bar | 14.0 | 1.5 | 1.0 | 21.00 | None |
| TSK-003 | Command Palette & Keyboard-First Navigation | 10.0 | 1.3 | 1.0 | 13.00 | None |
| TSK-004 | Plugin Store UI & Discovery Experience | 8.0 | 1.2 | 1.0 | 9.60 | None |
| TSK-005 | Tauri Host Setup & Shell Integration | 12.0 | 1.5 | 1.0 | 18.00 | TSK-001, TSK-002 |
| TSK-006 | SQLCipher Database Integration | 16.0 | 2.0 | 1.8 | 57.60 | None |
| TSK-007 | Windows Hello Biometric Integration | 14.0 | 2.2 | 2.0 | 61.60 | None |
| TSK-008 | Secure Key Release & DB Decryption | 10.0 | 2.0 | 1.5 | 30.00 | TSK-006, TSK-007 |
| TSK-009 | Custom URI Scheme & Sandboxed Plugin Iframe | 15.0 | 2.5 | 1.5 | 56.25 | TSK-005 |
| TSK-010 | Secure IPC Bridge & Permission-Gated Data Broker | 20.0 | 2.5 | 1.8 | 90.00 | TSK-009 |
| TSK-011 | Plugin Installer & Manager | 12.0 | 1.8 | 1.2 | 25.92 | TSK-005, TSK-006 |
| TSK-012 | Core Plugin SDK & React Template | 10.0 | 1.5 | 1.2 | 18.00 | TSK-010 |
| TSK-013 | Journaling Plugin (Encrypted, Native-Feel UI) | 16.0 | 1.8 | 1.2 | 34.56 | TSK-008, TSK-012 |
| TSK-014 | Todo List Plugin (with Activity Bar Integration) | 10.0 | 1.2 | 1.0 | 12.00 | TSK-012 |
| TSK-015 | Goals Tracker Plugin (Cross-Plugin Data Sharing) | 14.0 | 2.0 | 1.5 | 42.00 | TSK-012, TSK-014 |
| TSK-016 | Windows Installer Packaging (NSIS) | 8.0 | 1.5 | 1.2 | 14.40 | TSK-011, TSK-013, TSK-015 |

### 2.2 Critical Path Analysis (CPM)

The Critical Path determines the minimum project duration. It is the longest path through the DAG.

- **Critical Path:** TSK-001 → TSK-002 → TSK-003 → TSK-005 → TSK-010 → TSK-012 → TSK-016
- **Total Weighted Duration:** 286.15 hours
- **Bottleneck Nodes:** TSK-010 (highest weight, IPC gateway), TSK-012 (out-degree 3, SDK contract), TSK-016 (highest in-degree on critical path)

Using Dijkstra's algorithm to find the path of least resistance (minimum weight) to the integration milestone:

- **Shortest Path:** TSK-001 → TSK-004 → TSK-011 → TSK-016
- **Weighted Cost:** 67.92 hours

## 3. Execution Strategy

> **Phase Gate Policy:** Each phase concludes with a mandatory **Testing Gate**.
> The gate must return **ALL GREEN** (zero errors, zero warnings) before the next phase may begin.
> If any check fails, the current phase must be remediated and the gate re-run.

### Phase 1: UI Foundation & Design System (TSK-001, TSK-002, TSK-003, TSK-004)

**Tasks:** TSK-001, TSK-002, TSK-003, TSK-004

#### `TSK-001`: Design System Foundation (shadcn/ui + Theme Tokens)

| Attribute | Value |
|-----------|-------|
| Estimated Hours | 12.0 |
| Complexity | 1.2 |
| Risk | 1.0 |
| Weight | 14.40 |
| Module | `src/lib/design-system/` |
| Dependencies | None |

**Objective:**

Initialize the design system foundation using shadcn/ui, Tailwind CSS, and CSS custom properties. Create the theme token system that will be inherited by all plugins. Establish typography, color palette, spacing, and motion guidelines per the UI architecture spec.

**Technical Approach:**

Install shadcn/ui CLI and configure with React + TypeScript. Create a `design-system` folder with token files for colors, typography, spacing, and motion. Configure Tailwind CSS with custom theme extensions. Set up CSS custom properties as the public API contract between host and plugins. Create foundational components: Button, Input, Card, Badge, Separator, ScrollArea.

**Files to Create/Modify:**

- `src/lib/design-system/tokens.css`
- `src/lib/design-system/typography.css`
- `src/lib/design-system/components.tsx`
- `tailwind.config.js`
- `src/index.css`
- `components.json` (shadcn config)

**Acceptance Criteria:**

- [ ] shadcn/ui is installed and configured with custom theme.
- [ ] CSS custom properties are defined for all design tokens.
- [ ] Foundation components (Button, Input, Card, Badge) render correctly with theme tokens.
- [ ] Dark mode is the default theme with correct token values.
- [ ] Typography scale matches spec (Inter font, correct weights and sizes).

**Testing Requirements:**

Visual regression tests for foundation components. Verify theme tokens are correctly applied. Test dark/light mode switching.

**Integration Notes:**

No upstream dependencies — this is the foundational UI task. All subsequent UI tasks depend on these tokens.

---

#### `TSK-002`: Three-Pane Shell: Activity Bar + Sidebar + Status Bar

| Attribute | Value |
|-----------|-------|
| Estimated Hours | 14.0 |
| Complexity | 1.5 |
| Risk | 1.0 |
| Weight | 21.00 |
| Module | `src/components/Shell/` |
| Dependencies | None |

**Objective:**

Build the main application shell with three panes: Activity Bar (left), Sidebar (left, collapsible), Main Content (center), and Status Bar (bottom). Implement responsive behavior, collapse/expand animations, and plugin-aware navigation.

**Technical Approach:**

Create Shell component hierarchy: `Shell.tsx` → `ActivityBar.tsx`, `Sidebar.tsx`, `MainContent.tsx`, `StatusBar.tsx`. Use Framer Motion for collapse/expand animations. Implement state management for active plugin, sidebar visibility, and selected item. Activity Bar renders plugin icons from manifest registry. Sidebar shows context-aware navigation based on active plugin.

**Files to Create/Modify:**

- `src/components/Shell/Shell.tsx`
- `src/components/Shell/ActivityBar.tsx`
- `src/components/Shell/Sidebar.tsx`
- `src/components/Shell/MainContent.tsx`
- `src/components/Shell/StatusBar.tsx`
- `src/hooks/useShellState.ts`
- `src/App.tsx`

**Acceptance Criteria:**

- [ ] Three-pane layout renders correctly with proper proportions.
- [ ] Activity Bar shows plugin icons, active state with accent color highlight.
- [ ] Sidebar collapses/expands with smooth animation.
- [ ] Status Bar shows encryption status, sync status, plugin count.
- [ ] Layout is responsive: sidebar auto-collapses at < 800px width.
- [ ] Shell state persists across plugin switches.

**Testing Requirements:**

Unit tests for shell state management. Integration tests for collapse/expand behavior. Visual tests for layout at different window sizes.

**Integration Notes:**

Depends on TSK-001 (design tokens). Shell provides the container for all subsequent UI components.

---

#### `TSK-003`: Command Palette & Keyboard-First Navigation

| Attribute | Value |
|-----------|-------|
| Estimated Hours | 10.0 |
| Complexity | 1.3 |
| Risk | 1.0 |
| Weight | 13.00 |
| Module | `src/components/CommandPalette/` |
| Dependencies | None |

**Objective:**

Implement the universal Command Palette (`Cmd+K`) with fuzzy search, command execution, and keyboard navigation. Register core commands and establish the pattern for plugins to register their own commands.

**Technical Approach:**

Create CommandPalette component with overlay, search input, results list, and action bar. Use a fuzzy matching library (e.g., `fuse.js` or custom implementation). Implement keyboard navigation: arrow keys, Enter to execute, Esc to dismiss. Register core commands: toggle sidebar, new entry, open settings, switch plugin. Establish command registry pattern for plugins.

**Files to Create/Modify:**

- `src/components/CommandPalette/CommandPalette.tsx`
- `src/components/CommandPalette/CommandInput.tsx`
- `src/components/CommandPalette/CommandResults.tsx`
- `src/hooks/useCommandPalette.ts`
- `src/lib/commands/registry.ts`

**Acceptance Criteria:**

- [ ] `Cmd+K` opens Command Palette with smooth animation.
- [ ] Fuzzy search filters commands in real-time as user types.
- [ ] Arrow keys navigate results, Enter executes, Esc dismisses.
- [ ] Core commands are registered and executable.
- [ ] Recent commands are prioritized in results.
- [ ] Keyboard shortcuts are displayed alongside commands.

**Testing Requirements:**

Unit tests for fuzzy search, command execution, keyboard navigation. Integration tests for opening/closing palette.

**Integration Notes:**

Depends on TSK-001 (design tokens). Integrates with TSK-002 (shell) for global keyboard shortcut handling.

---

#### `TSK-004`: Plugin Store UI & Discovery Experience

| Attribute | Value |
|-----------|-------|
| Estimated Hours | 8.0 |
| Complexity | 1.2 |
| Risk | 1.0 |
| Weight | 9.60 |
| Module | `src/components/PluginStore/` |
| Dependencies | None |

**Objective:**

Build the Plugin Store UI for discovering, browsing, and installing plugins. Create card-based grid layout, category filtering, search, detail view, and one-click install experience.

**Technical Approach:**

Create PluginStore component with grid layout, search bar, category filters, and plugin cards. Each card shows icon, name, description, and install button. Detail view expands with screenshots, permissions list, and install button. Implement mock data for initial store. Wire up to plugin manager (TSK-011) for actual installation.

**Files to Create/Modify:**

- `src/components/PluginStore/PluginStore.tsx`
- `src/components/PluginStore/PluginCard.tsx`
- `src/components/PluginStore/PluginDetail.tsx`
- `src/components/PluginStore/CategoryFilter.tsx`
- `src/hooks/usePluginStore.ts`

**Acceptance Criteria:**

- [ ] Plugin Store renders as responsive grid of plugin cards.
- [ ] Search filters plugins in real-time.
- [ ] Category filters work correctly.
- [ ] Plugin detail view shows full information.
- [ ] Install button triggers mock installation flow.
- [ ] Empty state shown when no plugins match search.

**Testing Requirements:**

Unit tests for search, filtering, install flow. Component tests for card and detail views.

**Integration Notes:**

Depends on TSK-001 (design tokens). Will integrate with TSK-011 (Plugin Manager) for actual installation.

---

> **GATE 1 — Validation**
>
> | Check | Tool | Pass Criteria |
> | ----- | ---- | -------------- |
> | Frontend Lint | `npm run lint` | Zero errors |
> | Frontend Typecheck | `npm run typecheck` | Zero type errors |
> | Frontend Tests | `npm run test` | 100% pass rate |
> | Visual Regression | Storybook / Chromatic | All components match design tokens |
> | Accessibility | eslint-plugin-jsx-a11y | Zero critical violations |
>
> **Status:** ⬜ PENDING

---

### Phase 2: Security & Plugin Runtime (TSK-005, TSK-006, TSK-007, TSK-008, TSK-009, TSK-010, TSK-011, TSK-012)

**Tasks:** TSK-005, TSK-006, TSK-007, TSK-008, TSK-009, TSK-010, TSK-011, TSK-012

#### `TSK-005`: Tauri Host Setup & Shell Integration

| Attribute | Value |
|-----------|-------|
| Estimated Hours | 12.0 |
| Complexity | 1.5 |
| Risk | 1.0 |
| Weight | 18.00 |
| Module | `src-tauri/` |
| Dependencies | `TSK-001`, `TSK-002` |

**Objective:**

Initialize Tauri v2 project with React, TypeScript, and Tailwind CSS. Configure window styling, custom title bar, and system integration. Wire up the React shell to Tauri backend APIs.

**Technical Approach:**

Use Tauri CLI to scaffold v2 project. Configure `tauri.conf.json` with window settings, custom protocol, and security policies. Implement custom title bar in React that integrates with Tauri window controls. Set up IPC bridge skeleton. Configure build scripts and development workflow.

**Files to Create/Modify:**

- `src-tauri/src/main.rs`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `src-tauri/src/lib.rs`
- `src/main.tsx`
- `src/App.tsx`

**Acceptance Criteria:**

- [ ] Tauri v2 application compiles and launches on Windows 11.
- [ ] Custom title bar renders with window controls (minimize, maximize, close).
- [ ] React app mounts correctly inside Tauri webview.
- [ ] IPC bridge skeleton is functional (can invoke simple commands).
- [ ] Development workflow (`npm run tauri dev`) works without errors.

**Testing Requirements:**

Manual testing on Windows 11. Verify window controls, IPC communication, and development workflow.

**Integration Notes:**

Depends on TSK-001 (design system), TSK-002 (shell components). This is the bridge between UI and backend.

---

#### `TSK-006`: SQLCipher Database Integration

| Attribute | Value |
|-----------|-------|
| Estimated Hours | 16.0 |
| Complexity | 2.0 |
| Risk | 1.8 |
| Weight | 57.60 |
| Module | `src-tauri/src/database.rs` |
| Dependencies | None |

**Objective:**

Integrate SQLCipher into the Rust backend for encrypted SQLite storage. Set up connection pool, database initialization, and ensure AES-256-GCM encryption.

**Technical Approach:**

Use `rusqlite` with `bundled-sqlcipher` feature. Implement database initialization in `database.rs` with `PRAGMA key`. Configure connection pooling for concurrent access. Store database in local app data directory. Ensure key is passed securely from credential manager.

**Files to Create/Modify:**

- `src-tauri/src/database.rs`
- `src-tauri/Cargo.toml`
- `src-tauri/src/main.rs`

**Acceptance Criteria:**

- [ ] rusqlite with bundled-sqlcipher compiles and links.
- [ ] Database file is created in local app data.
- [ ] Connection pool initializes with encryption key.
- [ ] Direct file access fails without key (high-entropy encrypted data).

**Testing Requirements:**

Rust integration tests for keyed/unkeyed access. Verify encryption at rest.

**Integration Notes:**

No upstream dependencies. Foundation for all data persistence.

---

#### `TSK-007`: Windows Hello Biometric Integration

| Attribute | Value |
|-----------|-------|
| Estimated Hours | 14.0 |
| Complexity | 2.2 |
| Risk | 2.0 |
| Weight | 61.60 |
| Module | `src-tauri/src/biometrics.rs` |
| Dependencies | None |

**Objective:**

Implement Windows Hello biometric authentication using Windows Biometric Framework. Expose Tauri command for biometric challenge with graceful degradation.

**Technical Approach:**

Use `windows` crate to call `UserConsentVerifier::RequestVerificationAsync`. Wrap async WinRT call in Rust future. Map results to app states. Handle unavailable/degraded cases. Expose `invoke_biometric_challenge` command.

**Files to Create/Modify:**

- `src-tauri/src/biometrics.rs`
- `src-tauri/Cargo.toml`

**Acceptance Criteria:**

- [ ] Windows Hello prompt triggers on command.
- [ ] Returns boolean for success/failure.
- [ ] Gracefully handles unavailable Windows Hello.
- [ ] Command is exposed to frontend via Tauri invoke.

**Testing Requirements:**

Mock WinRT API in unit tests. Manual verification on Windows 11 device.

**Integration Notes:**

No upstream dependencies. Merges with TSK-008 for key release.

---

#### `TSK-008`: Secure Key Release & DB Decryption

| Attribute | Value |
|-----------|-------|
| Estimated Hours | 10.0 |
| Complexity | 2.0 |
| Risk | 1.5 |
| Weight | 30.00 |
| Module | `src-tauri/src/database.rs` |
| Dependencies | `TSK-006`, `TSK-007` |

**Objective:**

Implement secure key release: retrieve DB key from Windows Credential Manager after successful biometric auth. Initialize SQLCipher with key and zeroize key in memory.

**Technical Approach:**

Use `keyring` crate or Windows DPAPI bindings. On successful biometric verification, retrieve key, pass to `initialize_db`, use `zeroize` crate to overwrite key buffer. Ensure key is never logged or stored plaintext.

**Files to Create/Modify:**

- `src-tauri/src/database.rs`
- `src-tauri/src/biometrics.rs`
- `src-tauri/src/main.rs`

**Acceptance Criteria:**

- [ ] DB key stored in Windows Credential Manager.
- [ ] Biometric challenge triggers on startup before DB access.
- [ ] Successful auth releases key and initializes DB.
- [ ] Key is zeroized in memory after use.

**Testing Requirements:**

Integration tests for key retrieval and zeroization. Memory inspection to confirm zeroization.

**Integration Notes:**

Depends on TSK-006, TSK-007. Critical gate for Journal plugin.

---

> **GATE 2 — Validation**
>
> | Check | Tool | Pass Criteria |
> | ----- | ---- | -------------- |
> | Rust Lint | `cargo clippy --all-targets --all-features` | Zero warnings |
> | Rust Format | `cargo fmt -- --check` | No unformatted files |
> | Rust Tests | `cargo test` | 100% pass rate |
> | Frontend Lint | `npm run lint` | Zero errors |
> | Frontend Typecheck | `npm run typecheck` | Zero type errors |
>
> **Status:** ⬜ PENDING

---

#### `TSK-009`: Custom URI Scheme & Sandboxed Plugin Iframe

| Attribute | Value |
|-----------|-------|
| Estimated Hours | 15.0 |
| Complexity | 2.5 |
| Risk | 1.5 |
| Weight | 56.25 |
| Module | `src-tauri/src/protocol.rs` |
| Dependencies | `TSK-005` |

**Objective:**

Register `plugin://` URI scheme in Tauri. Serve plugin assets securely with strict path validation and CSP headers. Create React `PluginSandbox` component with sandboxed iframe.

**Technical Approach:**

Use Tauri's `register_uri_scheme_protocol` API. Implement path validation in Rust using `canonicalize` to prevent directory traversal. Create `PluginSandbox.tsx` with iframe using `sandbox="allow-scripts"`. Set CSP via response headers.

**Files to Create/Modify:**

- `src-tauri/src/protocol.rs`
- `src-tauri/src/main.rs`
- `src/components/PluginSandbox.tsx`

**Acceptance Criteria:**

- [ ] `plugin://` scheme registered and serves static assets.
- [ ] Directory traversal attempts are blocked (403/404).
- [ ] PluginSandbox renders iframe with sandbox attributes.
- [ ] CSP headers delivered via protocol handler.

**Testing Requirements:**

Rust unit tests for path validation. Frontend tests for iframe rendering.

**Integration Notes:**

Depends on TSK-005 (Tauri host). Required for all plugins.

---

#### `TSK-010`: Secure IPC Bridge & Permission-Gated Data Broker

| Attribute | Value |
|-----------|-------|
| Estimated Hours | 20.0 |
| Complexity | 2.5 |
| Risk | 1.8 |
| Weight | 90.00 |
| Module | `src/components/PluginSandbox.tsx` |
| Dependencies | `TSK-009` |

**Objective:**

Build secure IPC bridge over `postMessage` between sandboxed iframe and host. Implement permission-gated Data Broker that validates plugin permissions before executing requests.

**Technical Approach:**

Implement `window.addEventListener('message', ...)` in PluginSandbox. Validate event origin. Create permission registry on host. Forward authorized requests to Tauri backend. Return results via `postMessage`. Implement correlation IDs for promise matching.

**Files to Create/Modify:**

- `src/components/PluginSandbox.tsx`
- `src/lib/ipc/broker.ts`
- `src/lib/ipc/permissions.ts`

**Acceptance Criteria:**

- [ ] Message listener intercepts postMessage from iframe.
- [ ] Messages validated against JSON schema and origin.
- [ ] Data Broker verifies permissions before forwarding.
- [ ] Unauthorized requests rejected with error message.
- [ ] Authorized requests round-trip successfully.

**Testing Requirements:**

Frontend integration tests simulating postMessage. Test unauthorized/authorized flows.

**Integration Notes:**

Depends on TSK-009 (sandbox). Critical gateway for all plugin communication.

---

#### `TSK-011`: Plugin Installer & Manager

| Attribute | Value |
|-----------|-------|
| Estimated Hours | 12.0 |
| Complexity | 1.8 |
| Risk | 1.2 |
| Weight | 25.92 |
| Module | `src/hooks/usePluginManager.ts` |
| Dependencies | `TSK-005`, `TSK-006` |

**Objective:**

Implement plugin installer and manager. Rust backend extracts plugin zips, validates manifest, and registers in database. React hook manages installed plugin list and integrates with Plugin Store UI.

**Technical Approach:**

Use `zip` crate in Rust for extraction. Validate `manifest.json` with `serde_json`. Store plugin metadata in SQLCipher. Create `usePluginManager` hook with CRUD operations. Wire up to Plugin Store UI from TSK-004.

**Files to Create/Modify:**

- `src/hooks/usePluginManager.ts`
- `src-tauri/src/main.rs`
- `src-tauri/src/database.rs`

**Acceptance Criteria:**

- [ ] `install_plugin` Tauri command extracts and validates zip.
- [ ] Invalid plugins rejected and cleaned up.
- [ ] Installed plugins registered in SQLCipher.
- [ ] `usePluginManager` hook fetches and lists plugins.

**Testing Requirements:**

Rust tests for zip extraction and manifest validation. Frontend tests for hook with mock IPC.

**Integration Notes:**

Depends on TSK-005, TSK-006. Integrates with TSK-004 (Plugin Store UI).

---

#### `TSK-012`: Core Plugin SDK & React Template

| Attribute | Value |
|-----------|-------|
| Estimated Hours | 10.0 |
| Complexity | 1.5 |
| Risk | 1.2 |
| Weight | 18.00 |
| Module | `packages/sdk/src/index.ts` |
| Dependencies | `TSK-010` |

**Objective:**

Develop TypeScript SDK for plugin-to-host communication. Create React template with SDK pre-configured and standard build pipeline.

**Technical Approach:**

Implement SDK with promise-based API for DB operations and broker requests. Use correlation IDs for request/response matching. Package as local workspace package. Create Vite-based React template with SDK dependency.

**Files to Create/Modify:**

- `packages/sdk/src/index.ts`
- `packages/sdk/package.json`
- `packages/sdk/tsconfig.json`
- `packages/template/` (React template)

**Acceptance Criteria:**

- [ ] SDK provides `sdk.db.get`, `sdk.db.set`, `sdk.broker.requestData`.
- [ ] Promise-based API with correlation ID matching.
- [ ] React template compiles with SDK as dependency.
- [ ] SDK fully typed with TypeScript.

**Testing Requirements:**

Unit tests for SDK with mocked window.parent.postMessage.

**Integration Notes:**

Depends on TSK-010 (IPC bridge). All plugins depend on this SDK.

---

> **GATE 3 — Validation**
>
> | Check | Tool | Pass Criteria |
> | ----- | ---- | -------------- |
> | Rust Lint | `cargo clippy --all-targets --all-features` | Zero warnings |
> | Rust Format | `cargo fmt -- --check` | No unformatted files |
> | Rust Tests | `cargo test` | 100% pass rate |
> | Frontend Lint | `npm run lint` | Zero errors |
> | Frontend Typecheck | `npm run typecheck` | Zero type errors |
> | Frontend Tests | `npm run test` | 100% pass rate |
>
> **Status:** ⬜ PENDING

---

### Phase 3: Plugin Implementation (TSK-013, TSK-014, TSK-015)

**Tasks:** TSK-013, TSK-014, TSK-015

#### `TSK-013`: Journaling Plugin (Encrypted, Native-Feel UI)

| Attribute | Value |
|-----------|-------|
| Estimated Hours | 16.0 |
| Complexity | 1.8 |
| Risk | 1.2 |
| Weight | 34.56 |
| Module | `plugins/journal/src/` |
| Dependencies | `TSK-008`, `TSK-012` |

**Objective:**

Build Journaling plugin using React template and Plugin SDK. Clean, minimalist UI with rich text editing. All data encrypted via host DB.

**Technical Approach:**

Develop React app in `plugins/journal`. Use Plugin SDK for persistence. Implement rich text editor (e.g., Tiptap or Lexical). Design follows shell theme tokens. Ensure no plaintext caching. Register Activity Bar icon and sidebar section.

**Files to Create/Modify:**

- `plugins/journal/package.json`
- `plugins/journal/src/App.tsx`
- `plugins/journal/src/Editor.tsx`
- `plugins/journal/src/components/EntryList.tsx`

**Acceptance Criteria:**

- [ ] Plugin renders in sandbox with native-feel UI.
- [ ] CRUD operations for journal entries via SDK.
- [ ] Rich text editor functional.
- [ ] Activity Bar icon and sidebar navigation registered.
- [ ] No plaintext data in local storage or logs.

**Testing Requirements:**

Unit tests for components. Mock SDK for persistence tests.

**Integration Notes:**

Depends on TSK-008 (key release), TSK-012 (SDK).

---

#### `TSK-014`: Todo List Plugin (with Activity Bar Integration)

| Attribute | Value |
|-----------|-------|
| Estimated Hours | 10.0 |
| Complexity | 1.2 |
| Risk | 1.0 |
| Weight | 12.00 |
| Module | `plugins/todo/src/` |
| Dependencies | `TSK-012` |

**Objective:**

Build Todo List plugin with native-feel UI. CRUD for tasks. Expose active task count for cross-plugin data sharing.

**Technical Approach:**

Develop React app in `plugins/todo`. Use Plugin SDK for persistence. Implement task list with add/toggle/delete. Register handler for `GET_ACTIVE_TASKS` broker requests. Register Activity Bar icon and sidebar section.

**Files to Create/Modify:**

- `plugins/todo/package.json`
- `plugins/todo/src/App.tsx`
- `plugins/todo/src/TaskList.tsx`
- `plugins/todo/src/hooks/useBroker.ts`

**Acceptance Criteria:**

- [ ] Plugin renders in sandbox with native-feel UI.
- [ ] Users can add, toggle, delete tasks.
- [ ] Tasks persisted via SDK.
- [ ] Broker handler responds to `GET_ACTIVE_TASKS`.
- [ ] Activity Bar icon registered.

**Testing Requirements:**

Unit tests for components. Mock SDK and broker requests.

**Integration Notes:**

Depends on TSK-012 (SDK). Used by TSK-015 (Goals plugin).

---

#### `TSK-015`: Goals Tracker Plugin (Cross-Plugin Data Sharing)

| Attribute | Value |
|-----------|-------|
| Estimated Hours | 14.0 |
| Complexity | 2.0 |
| Risk | 1.5 |
| Weight | 42.00 |
| Module | `plugins/goals/src/` |
| Dependencies | `TSK-012`, `TSK-014` |

**Objective:**

Build Goals Tracker plugin that demonstrates cross-plugin data sharing. Display active task count from Todo plugin alongside goals.

**Technical Approach:**

Develop React app in `plugins/goals`. Use Plugin SDK for persistence. Implement goal CRUD. Use `sdk.broker.requestData('todo', { action: 'GET_ACTIVE_TASKS' })` to fetch tasks. Display linked tasks with real-time updates. Register Activity Bar icon and sidebar section.

**Files to Create/Modify:**

- `plugins/goals/package.json`
- `plugins/goals/src/App.tsx`
- `plugins/goals/src/GoalList.tsx`
- `plugins/goals/src/hooks/useTodoData.ts`

**Acceptance Criteria:**

- [ ] Plugin renders in sandbox with native-feel UI.
- [ ] Users can create and manage goals.
- [ ] Successfully queries Todo plugin via broker.
- [ ] UI displays linked tasks with updates.
- [ ] Activity Bar icon registered.

**Testing Requirements:**

Unit tests for components. Mock broker to return predefined tasks.

**Integration Notes:**

Depends on TSK-012 (SDK), TSK-014 (Todo plugin). Demonstrates plugin ecosystem.

---

> **GATE 4 — Validation**
>
> | Check | Tool | Pass Criteria |
> | ----- | ---- | -------------- |
> | Rust Lint | `cargo clippy --all-targets --all-features` | Zero warnings |
> | Rust Format | `cargo fmt -- --check` | No unformatted files |
> | Rust Tests | `cargo test` | 100% pass rate |
> | Frontend Lint | `npm run lint` | Zero errors |
> | Frontend Typecheck | `npm run typecheck` | Zero type errors |
> | Frontend Tests | `npm run test` | 100% pass rate |
> | Plugin Integration | Manual + Automated | All 3 plugins load, run, and share data |
>
> **Status:** ⬜ PENDING

---

### Phase 4: Packaging & Release (TSK-016)

**Tasks:** TSK-016

#### `TSK-016`: Windows Installer Packaging (NSIS)

| Attribute | Value |
|-----------|-------|
| Estimated Hours | 8.0 |
| Complexity | 1.5 |
| Risk | 1.2 |
| Weight | 14.40 |
| Module | `src-tauri/tauri.conf.json` |
| Dependencies | `TSK-011`, `TSK-013`, `TSK-015` |

**Objective:**

Configure and build production Windows installer using Tauri's NSIS bundler. Package app with security configs, custom protocols, and default plugins.

**Technical Approach:**

Configure `tauri.conf.json` with NSIS bundle settings. Define custom protocol registration in installer. Create build script that compiles plugins, copies assets, and runs `tauri build`. Test on clean Windows 11 VM.

**Files to Create/Modify:**

- `src-tauri/tauri.conf.json`
- `scripts/build-installer.ps1`

**Acceptance Criteria:**

- [ ] `npm run tauri build` compiles without errors.
- [ ] NSIS installer (.exe) generated successfully.
- [ ] Installer registers custom protocol and installs plugins.
- [ ] Installed app launches and functions on clean Windows 11.

**Testing Requirements:**

Clean install test on Windows 11 VM. Verify biometrics, plugin import, local storage.

**Integration Notes:**

Depends on TSK-011, TSK-013, TSK-015. Final delivery milestone.

---

> **GATE 5 — Validation**
>
> | Check | Tool | Pass Criteria |
> | ----- | ---- | -------------- |
> | Release Build | `npm run tauri build` | Compiles without errors |
> | Installer Generation | NSIS via Tauri bundler | .exe generated |
> | Clean Install | Windows 11 VM | App installs, launches, functions |
> | Functional Verification | Manual | Biometrics, plugins, storage work |
>
> **Status:** ⬜ PENDING

---

## 4. Technical Components

- **Backend:** Rust, Tauri v2
- **Frontend:** TypeScript, React, Tailwind CSS, shadcn/ui, Framer Motion
- **Icons:** Lucide React
- **Search:** Fuse.js (fuzzy search)
- **Database:** SQLite (rusqlite bundled-sqlcipher)
- **Security:** Windows Hello (windows crate), DPAPI, zeroize
- **Build:** Tauri CLI, Vite

## 5. Deliverables

- `TSK-001`: Design System Foundation
- `TSK-002`: Three-Pane Shell
- `TSK-003`: Command Palette
- `TSK-004`: Plugin Store UI
- `TSK-005`: Tauri Host Setup
- `TSK-006`: SQLCipher Database Integration
- `TSK-007`: Windows Hello Biometric Integration
- `TSK-008`: Secure Key Release & DB Decryption
- `TSK-009`: Custom URI Scheme & Sandboxed Iframe
- `TSK-010`: Secure IPC Bridge & Data Broker
- `TSK-011`: Plugin Installer & Manager
- `TSK-012`: Core Plugin SDK & React Template
- `TSK-013`: Journaling Plugin
- `TSK-014`: Todo List Plugin
- `TSK-015`: Goals Tracker Plugin
- `TSK-016`: Windows Installer Packaging
