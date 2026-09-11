---
project_name: "Technical Architecture Plan: Modular Desktop App Platform (Tauri + Windows 11)"
critical_path: "TSK-001 → TSK-005 → TSK-006 → TSK-008 → TSK-010 → TSK-011 → TSK-012"
total_cost: 250.65
bottlenecks: "TSK-006, TSK-008, TSK-012"
shortest_path: "TSK-001 → TSK-007 → TSK-012"
total_tasks: 12
phases: 5
---

# Technical Architecture Plan: Modular Desktop App Platform (Tauri + Windows 11) — Implementation Plan

## 1. Project Overview

This document establishes the complete technical architecture and dependency-aware execution plan for the modular desktop application platform. It is optimized for direct ingestion by the downstream pipeline (Task Extractor, Graph Engine, and AIDLC Generator).

---

**Technology Stack:**

- TypeScript
- React
- Tailwind CSS
- Mermaid.js
- SQLite (via rusqlite with bundled-sqlcipher)
- Tauri v2

## 2. Graph-Based Task Analysis

### 2.1 Task Decomposition

The project is decomposed into 12 discrete tasks. Each task is assigned a weight using the formula:
$$\text{Weight} = \text{Estimated Hours} \times \text{Complexity Factor} \times \text{Risk Factor}$$

| Task ID | Task Name | Est. Hours | Complexity | Risk | Weight | Dependencies |
| --------- | --------- | ---------- | ---------- | ---- | ------ | ------------ |
| TSK-001 | Tauri Host Setup & Fluent UI Shell | 12.0 | 1.5 | 1.0 | 18.00 | None |
| TSK-002 | SQLCipher Database Integration | 16.0 | 2.0 | 1.8 | 57.60 | None |
| TSK-003 | Windows Hello Biometric Integration | 14.0 | 2.2 | 2.0 | 61.60 | None |
| TSK-004 | Secure Key Release & DB Decryption | 10.0 | 2.0 | 1.5 | 30.00 | TSK-002, TSK-003 |
| TSK-005 | Custom URI Scheme & Sandboxed Iframe | 15.0 | 2.5 | 1.5 | 56.25 | TSK-001 |
| TSK-006 | Secure IPC Bridge & Data Broker | 20.0 | 2.5 | 1.8 | 90.00 | TSK-005 |
| TSK-007 | Plugin Installer & Manager | 12.0 | 1.8 | 1.2 | 25.92 | TSK-001, TSK-002 |
| TSK-008 | Core Plugin SDK & React Template | 10.0 | 1.5 | 1.2 | 18.00 | TSK-006 |
| TSK-009 | Journaling Plugin (Encrypted) | 16.0 | 1.8 | 1.2 | 34.56 | TSK-004, TSK-008 |
| TSK-010 | Todo List Plugin | 10.0 | 1.2 | 1.0 | 12.00 | TSK-008 |
| TSK-011 | Goals Tracker Plugin (Data Sharing) | 14.0 | 2.0 | 1.5 | 42.00 | TSK-008, TSK-010 |
| TSK-012 | Windows Installer Packaging (NSIS) | 8.0 | 1.5 | 1.2 | 14.40 | TSK-007, TSK-009, TSK-011 |

### 2.2 Critical Path Analysis (CPM)

The Critical Path determines the minimum project duration. It is the longest path through the DAG.

- **Critical Path:** TSK-001 → TSK-005 → TSK-006 → TSK-008 → TSK-010 → TSK-011 → TSK-012
- **Total Weighted Duration:** 250.65 hours
- **Bottleneck Nodes:** TSK-006 (highest weight, IPC gateway), TSK-008 (out-degree 3, SDK contract), TSK-012 (highest in-degree on critical path)

Using Dijkstra's algorithm to find the path of least resistance (minimum weight) to the integration milestone:

- **Shortest Path:** TSK-001 → TSK-007 → TSK-012
- **Weighted Cost:** 40.32 hours

## 3. Execution Strategy

> **Phase Gate Policy:** Each phase concludes with a mandatory **Testing Gate**.
> The gate must return **ALL GREEN** (zero errors, zero warnings) before the next phase may begin.
> If any check fails, the current phase must be remediated and the gate re-run.

### Phase 1: Foundation & Frontend (TSK-001, TSK-005)

**Tasks:** TSK-001, TSK-005

#### `TSK-001`: Tauri Host Setup & Fluent UI Shell

| Attribute | Value |
| --------- | ----- |
| Estimated Hours | 12.0 |
| Complexity | 1.5 |
| Risk | 1.0 |
| Weight | 18.00 |
| Module | `src/App.tsx` |
| Dependencies | None |

**Objective:**

Initialize Tauri v2 project with React, TypeScript, and Tailwind CSS. Create the main application shell styled according to Windows 11 Fluent Design guidelines, including a sidebar, header, and a dashboard grid for launching plugins.

**Technical Approach:**

Use Tauri CLI to scaffold a v2 project. Configure Tailwind CSS with Fluent UI colors and rounded corners. Implement a responsive layout in React using TypeScript. Use Tauri's window APIs to handle window controls (minimize, maximize, close) styled natively.

**Files to Create/Modify:**

- `src-tauri/src/main.rs`
- `src-tauri/Cargo.toml`
- `src/main.tsx`
- `src/App.tsx`
- `src/components/Dashboard.tsx`
- `src/index.css`
- `tailwind.config.js`

**Acceptance Criteria:**

- [ ] Tauri v2 application compiles and launches successfully on Windows 11.
- [ ] The UI displays a Fluent Design-compliant layout with a sidebar, header, and main content area.
- [ ] Tailwind CSS is configured and styles are applied correctly without layout shifts.
- [ ] Dashboard grid renders placeholder cards for plugins.

**Testing Requirements:**

Verify UI rendering across different window sizes. Run Tauri dev server and ensure no console errors. Write unit tests for Dashboard component rendering using React Testing Library.

**Integration Notes:**

No upstream dependencies — this is a foundational task.

#### `TSK-005`: Custom URI Scheme & Sandboxed Iframe — depends on TSK-001

| Attribute | Value |
| --------- | ----- |
| Estimated Hours | 15.0 |
| Complexity | 2.5 |
| Risk | 1.5 |
| Weight | 56.25 |
| Module | `src-tauri/src/protocol.rs` |
| Dependencies | `TSK-001` |

**Objective:**

Register a custom Tauri URI scheme (plugin://) to securely serve local plugin assets. Implement a React component PluginSandbox that renders an iframe with strict sandboxing attributes to load plugins via this custom scheme.

**Technical Approach:**

Use Tauri's register_uri_scheme_protocol API. Implement strict path validation in Rust using canonicalize to prevent directory traversal (e.g., checking that the path starts with the plugins directory). In React, create PluginSandbox.tsx using an iframe with sandbox='allow-scripts' and set CSP headers on the custom protocol response.

**Files to Create/Modify:**

- `src-tauri/src/protocol.rs`
- `src-tauri/src/main.rs`
- `src/components/PluginSandbox.tsx`

**Acceptance Criteria:**

- [ ] Custom URI scheme plugin:// is registered in Tauri backend.
- [ ] The protocol handler restricts file access strictly to the designated plugins directory, preventing directory traversal.
- [ ] The PluginSandbox component renders an iframe with sandbox='allow-scripts' and a strict Content Security Policy (CSP) delivered via response headers or plugin HTML `<meta>` tags.
- [ ] Static HTML/JS assets loaded via plugin:// execute successfully inside the iframe.

**Testing Requirements:**

Write unit tests in Rust to verify that directory traversal attempts (e.g., plugin://foo/../../etc/passwd) are blocked and return a 403/404 error. Verify iframe rendering and sandbox restrictions in the frontend.

**Integration Notes:**

Depends on completion of `TSK-001` (TSK-001). This task's output must be compatible with those modules before proceeding.

> **GATE 1 — Validation**
>
> | Check | Tool | Pass Criteria |
> | ----- | ---- | -------------- |
> | Rust Lint | `cargo clippy --all-targets --all-features` | Zero warnings |
> | Rust Format | `cargo fmt -- --check` | No unformatted files |
> | Rust Tests | `cargo test` | 100% pass rate |
> | Frontend Lint | `npm run lint` | Zero errors |
> | Frontend Typecheck | `npm run typecheck` | Zero type errors |
> | Frontend Tests | `npm run test` | 100% pass rate |
> | Dependency Audit | `cargo audit` / `npm audit` | No known vulnerabilities |
>
> **Status:** ⬜ PENDING

### Phase 2: Security & Storage (TSK-002, TSK-003, TSK-004)

**Tasks:** TSK-002, TSK-003, TSK-004

#### `TSK-002`: SQLCipher Database Integration

| Attribute | Value |
| --------- | ----- |
| Estimated Hours | 16.0 |
| Complexity | 2.0 |
| Risk | 1.8 |
| Weight | 57.60 |
| Module | `src-tauri/src/database.rs` |
| Dependencies | None |

**Objective:**

Integrate SQLCipher into the Rust backend to provide an encrypted SQLite database. Set up the connection pool and database initialization logic, ensuring that the database is encrypted using AES-256-GCM.

**Technical Approach:**

Use rusqlite with the bundled-sqlcipher feature to provide an encrypted SQLite database. Implement database initialization in database.rs that executes PRAGMA key = '...' immediately after opening the connection. Ensure connection pooling is configured for concurrent access.

**Files to Create/Modify:**

- `src-tauri/src/database.rs`
- `src-tauri/Cargo.toml`

**Acceptance Criteria:**

- [ ] rusqlite with the bundled-sqlcipher feature is successfully compiled and linked in Cargo.toml.
- [ ] Database file is created in the local app data directory.
- [ ] Database connection pool is initialized with a temporary key for testing.
- [ ] Attempts to read the database file directly using standard SQLite tools fail with an encryption error.

**Testing Requirements:**

Write Rust integration tests that attempt to open the database with and without the correct key. Verify that queries fail when an incorrect key is provided. Assert that the database file on disk contains high-entropy encrypted data.

**Integration Notes:**

No upstream dependencies — this is a foundational task.

#### `TSK-003`: Windows Hello Biometric Integration

| Attribute | Value |
| --------- | ----- |
| Estimated Hours | 14.0 |
| Complexity | 2.2 |
| Risk | 2.0 |
| Weight | 61.60 |
| Module | `src-tauri/src/biometrics.rs` |
| Dependencies | None |

**Objective:**

Implement Windows Hello biometric authentication in the Rust backend using the Windows Biometric Framework. Expose a Tauri command to trigger the biometric challenge and return the authentication result.

**Technical Approach:**

Use the windows crate in Rust to call UserConsentVerifier::RequestVerificationAsync. Wrap the asynchronous WinRT call in a Rust future. Handle different verification results such as Verified, DeviceNotPresent, NotConfigured, or Canceled and map them to appropriate application states. The application must gracefully degrade if Windows Hello is unavailable.

**Files to Create/Modify:**

- `src-tauri/src/biometrics.rs`
- `src-tauri/Cargo.toml`

**Acceptance Criteria:**

- [ ] The windows crate is configured to access the Security::Credentials::UI namespace.
- [ ] A Tauri command invoke_biometric_challenge triggers the native Windows Hello prompt.
- [ ] The command returns a boolean indicating success or failure of the biometric check.
- [ ] Gracefully handles cases where Windows Hello is unavailable or configured incorrectly on the host machine.

**Testing Requirements:**

Mock the WinRT UserConsentVerifier API in unit tests to simulate success, failure, and cancellation. Manually verify the native prompt on a Windows 11 device with Windows Hello enabled.

**Integration Notes:**

No upstream dependencies — this is a foundational task.

#### `TSK-004`: Secure Key Release & DB Decryption — depends on TSK-002, TSK-003

| Attribute | Value |
| --------- | ----- |
| Estimated Hours | 10.0 |
| Complexity | 2.0 |
| Risk | 1.5 |
| Weight | 30.00 |
| Module | `src-tauri/src/database.rs` |
| Dependencies | `TSK-002`, `TSK-003` |

**Objective:**

Implement the secure key release mechanism. Retrieve the database decryption key from the Windows Credential Manager (via DPAPI) only after a successful Windows Hello biometric challenge. Initialize the SQLCipher database connection pool with this key and securely wipe the key from memory.

**Technical Approach:**

Use the keyring crate or direct Windows DPAPI bindings to store and retrieve the database key. Upon successful biometric verification from biometrics.rs, retrieve the key, pass it to initialize_db in database.rs, and use the zeroize crate to overwrite the key buffer in memory. Ensure the key is never logged or stored in plaintext.

**Files to Create/Modify:**

- `src-tauri/src/database.rs`
- `src-tauri/src/biometrics.rs`
- `src-tauri/src/main.rs`

**Acceptance Criteria:**

- [ ] The database key is securely stored in Windows Credential Manager.
- [ ] Biometric challenge is triggered on application startup before database access.
- [ ] Successful authentication releases the key, decrypts the database, and initializes the connection pool.
- [ ] The decryption key is securely zeroed out in memory immediately after use.

**Testing Requirements:**

Write integration tests verifying the key retrieval and zeroization flow. Use memory inspection tools or unit tests to assert that the key buffer is zeroed out after database initialization.

**Integration Notes:**

Depends on completion of `TSK-002` (TSK-002), `TSK-003` (TSK-003). This task's output must be compatible with those modules before proceeding.

> **GATE 2 — Validation**
>
> | Check | Tool | Pass Criteria |
> | ----- | ---- | -------------- |
> | Rust Lint | `cargo clippy --all-targets --all-features` | Zero warnings |
> | Rust Format | `cargo fmt -- --check` | No unformatted files |
> | Rust Tests | `cargo test` | 100% pass rate |
> | Frontend Lint | `npm run lint` | Zero errors |
> | Frontend Typecheck | `npm run typecheck` | Zero type errors |
> | Frontend Tests | `npm run test` | 100% pass rate |
> | Dependency Audit | `cargo audit` / `npm audit` | No known vulnerabilities |
>
> **Status:** ⬜ PENDING

### Phase 3: Plugin Runtime & SDK (TSK-006, TSK-007, TSK-008)

**Tasks:** TSK-006, TSK-007, TSK-008

#### `TSK-006`: Secure IPC Bridge & Data Broker — depends on TSK-005

| Attribute | Value |
| --------- | ----- |
| Estimated Hours | 20.0 |
| Complexity | 2.5 |
| Risk | 1.8 |
| Weight | 90.00 |
| Module | `src/components/PluginSandbox.tsx` |
| Dependencies | `TSK-005` |

**Objective:**

Build a secure, permission-gated IPC bridge over postMessage between the sandboxed plugin iframe and the host frontend. Implement a Data Broker on the host side that validates plugin permissions before executing database or cross-plugin requests.

**Technical Approach:**

Implement a window.addEventListener('message', ...) listener in PluginSandbox.tsx. Validate the event origin to ensure it matches the custom plugin:// scheme. Implement a permission registry on the host. When a plugin requests data (e.g., DB_READ), check its manifest permissions. If approved, forward the request to Tauri via invoke and return the result via iframe.contentWindow.postMessage.

**Files to Create/Modify:**

- `src/components/PluginSandbox.tsx`
- `src-tauri/src/main.rs`

**Acceptance Criteria:**

- [ ] A message listener on the host frontend intercepts postMessage events from the iframe.
- [ ] Messages are validated against a strict JSON schema and origin check.
- [ ] The Data Broker verifies that the requesting plugin has the required permissions in its manifest.
- [ ] Unauthorized requests are rejected with a clear error message sent back to the iframe.

**Testing Requirements:**

Write frontend integration tests simulating postMessage events. Test unauthorized requests to ensure they are blocked. Test authorized requests to ensure they successfully round-trip to the mock backend and back.

**Integration Notes:**

Depends on completion of `TSK-005` (TSK-005). This task's output must be compatible with those modules before proceeding.

#### `TSK-007`: Plugin Installer & Manager — depends on TSK-001, TSK-002

| Attribute | Value |
| --------- | ----- |
| Estimated Hours | 12.0 |
| Complexity | 1.8 |
| Risk | 1.2 |
| Weight | 25.92 |
| Module | `src/hooks/usePluginManager.ts` |
| Dependencies | `TSK-001`, `TSK-002` |

**Objective:**

Implement the plugin installer and manager. Create a Rust backend command to extract plugin zip files, validate their manifest.json structure, and save them to the local app data directory. Create a React hook to manage the list of installed plugins. Plugin packages must contain all files needed to run, at minimum pre-built static assets and a manifest.json.

**Technical Approach:**

Use the zip crate in Rust to extract files. Validate the manifest.json using serde_json. Store plugin metadata (ID, name, version, permissions) in the SQLite database. Implement the usePluginManager hook in React to invoke Tauri commands for listing, installing, and uninstalling plugins.

**Files to Create/Modify:**

- `src/hooks/usePluginManager.ts`
- `src-tauri/src/main.rs`
- `src-tauri/src/database.rs`

**Acceptance Criteria:**

- [ ] A Tauri command install_plugin accepts a zip file path, extracts it, and validates the manifest.
- [ ] Invalid plugins (missing manifest, invalid structure) are rejected and cleaned up.
- [ ] Installed plugins are registered in the SQLCipher database.
- [ ] The usePluginManager hook correctly fetches and lists installed plugins on the dashboard.

**Testing Requirements:**

Write Rust unit tests for the zip extraction and manifest validation logic. Test with valid and malformed zip files. Write frontend tests for the usePluginManager hook using mock Tauri IPC.

**Integration Notes:**

Depends on completion of `TSK-001` (TSK-001), `TSK-002` (TSK-002). This task's output must be compatible with those modules before proceeding.

#### `TSK-008`: Core Plugin SDK & React Template — depends on TSK-006

| Attribute | Value |
| --------- | ----- |
| Estimated Hours | 10.0 |
| Complexity | 1.5 |
| Risk | 1.2 |
| Weight | 18.00 |
| Module | `packages/sdk/src/index.ts` |
| Dependencies | `TSK-006` |

**Objective:**

Develop a lightweight, strongly-typed TypeScript SDK that plugins use to communicate with the host. Create a React template that pre-configures this SDK and provides a standard build pipeline for plugins.

**Technical Approach:**

Implement the SDK in TypeScript. Use a Map to store pending promises, matching them with incoming postMessage responses using a unique correlation ID. Package the SDK as an NPM module or a local workspace package. Create a simple Vite-based React template for plugins.

**Files to Create/Modify:**

- `packages/sdk/src/index.ts`
- `packages/sdk/package.json`
- `packages/sdk/tsconfig.json`

**Acceptance Criteria:**

- [ ] The SDK provides a promise-based API for database operations (sdk.db.get, sdk.db.set) and cross-plugin requests.
- [ ] The SDK handles postMessage communication, request serialization, and response matching using unique IDs.
- [ ] A React plugin template compiles successfully and includes the SDK as a dependency.
- [ ] The SDK is fully typed with TypeScript.

**Testing Requirements:**

Write unit tests for the SDK using Jest/Vitest. Mock the window.parent.postMessage and simulate host responses to verify that promises resolve or reject correctly.

**Integration Notes:**

Depends on completion of `TSK-006` (TSK-006). This task's output must be compatible with those modules before proceeding.

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
> | Dependency Audit | `cargo audit` / `npm audit` | No known vulnerabilities |
>
> **Status:** ⬜ PENDING

### Phase 4: Plugin Implementation (TSK-009, TSK-010, TSK-011)

**Tasks:** TSK-009, TSK-010, TSK-011

#### `TSK-009`: Journaling Plugin (Encrypted) — depends on TSK-004, TSK-008

| Attribute | Value |
| --------- | ----- |
| Estimated Hours | 16.0 |
| Complexity | 1.8 |
| Risk | 1.2 |
| Weight | 34.56 |
| Module | `plugins/journal/src/index.tsx` |
| Dependencies | `TSK-004`, `TSK-008` |

**Objective:**

Build the Journaling plugin using the React template and Plugin SDK. The plugin allows users to write and view journal entries, which are securely stored in the host's SQLCipher database. Ensure no plaintext data is cached or logged.

**Technical Approach:**

Develop a React application inside plugins/journal. Use the Plugin SDK (sdk.db.get, sdk.db.set) to persist journal entries. Design a clean, minimalist UI using Tailwind CSS. Ensure all state is kept in memory and persisted immediately to the host database.

**Files to Create/Modify:**

- `plugins/journal/package.json`
- `plugins/journal/src/index.tsx`
- `plugins/journal/src/App.tsx`

**Acceptance Criteria:**

- [ ] The Journaling plugin renders correctly inside the sandboxed iframe.
- [ ] Users can create, read, update, and delete journal entries.
- [ ] All data operations go through the Plugin SDK and are stored in the host's encrypted database.
- [ ] No journal data is stored in local storage or logged in plaintext.

**Testing Requirements:**

Write unit tests for the Journaling plugin components. Mock the Plugin SDK to verify that database read/write operations are triggered with the correct payloads.

**Integration Notes:**

Depends on completion of `TSK-004` (TSK-004), `TSK-008` (TSK-008). This task's output must be compatible with those modules before proceeding.

#### `TSK-010`: Todo List Plugin — depends on TSK-008

| Attribute | Value |
| --------- | ----- |
| Estimated Hours | 10.0 |
| Complexity | 1.2 |
| Risk | 1.0 |
| Weight | 12.00 |
| Module | `plugins/todo/src/index.tsx` |
| Dependencies | `TSK-008` |

**Objective:**

Build the Todo List plugin using the React template and Plugin SDK. The plugin allows users to manage tasks (add, complete, delete) and exposes its active task count for other plugins to query.

**Technical Approach:**

Develop a React application inside plugins/todo. Use the Plugin SDK for persistence. Implement a message listener within the plugin to handle incoming broker requests (e.g., GET_ACTIVE_TASKS) and reply with the current task count.

**Files to Create/Modify:**

- `plugins/todo/package.json`
- `plugins/todo/src/index.tsx`
- `plugins/todo/src/App.tsx`

**Acceptance Criteria:**

- [ ] The Todo List plugin renders correctly inside the sandboxed iframe.
- [ ] Users can add, toggle, and delete todo items.
- [ ] Todo items are persisted to the host database via the SDK.
- [ ] The plugin registers a handler to respond to external queries for active tasks.

**Testing Requirements:**

Write unit tests for the Todo List plugin. Mock the SDK and verify that todo items are correctly saved and retrieved. Test the message handler with mock broker requests.

**Integration Notes:**

Depends on completion of `TSK-008` (TSK-008). This task's output must be compatible with those modules before proceeding.

#### `TSK-011`: Goals Tracker Plugin (Data Sharing) — depends on TSK-008, TSK-010

| Attribute | Value |
| --------- | ----- |
| Estimated Hours | 14.0 |
| Complexity | 2.0 |
| Risk | 1.5 |
| Weight | 42.00 |
| Module | `plugins/goals/src/index.tsx` |
| Dependencies | `TSK-008`, `TSK-010` |

**Objective:**

Build the Goals Tracker plugin using the React template and Plugin SDK. The plugin allows users to set goals and dynamically links them to active tasks from the Todo List plugin using the host's secure data broker.

**Technical Approach:**

Develop a React application inside plugins/goals. Use the Plugin SDK to persist goals. Implement a feature that calls sdk.broker.requestData('todo', { action: 'GET_ACTIVE_TASKS' }) to fetch tasks from the Todo List plugin. Display this data in the goals UI to show progress.

**Files to Create/Modify:**

- `plugins/goals/package.json`
- `plugins/goals/src/index.tsx`
- `plugins/goals/src/App.tsx`

**Acceptance Criteria:**

- [ ] The Goals Tracker plugin renders correctly inside the sandboxed iframe.
- [ ] Users can create and manage goals.
- [ ] The plugin successfully requests active task data from the Todo List plugin via sdk.broker.requestData.
- [ ] The UI displays linked todo items alongside goals, updating dynamically.

**Testing Requirements:**

Write unit tests for the Goals Tracker plugin. Mock the SDK's broker request to return a predefined list of todo items and verify that the UI renders them correctly.

**Integration Notes:**

Depends on completion of `TSK-008` (TSK-008), `TSK-010` (TSK-010). This task's output must be compatible with those modules before proceeding.

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
> | Dependency Audit | `cargo audit` / `npm audit` | No known vulnerabilities |
>
> **Status:** ⬜ PENDING

### Phase 5: Packaging & Release (TSK-012)

**Tasks:** TSK-012

#### `TSK-012`: Windows Installer Packaging (NSIS) — depends on TSK-007, TSK-009, TSK-011

| Attribute | Value |
| --------- | ----- |
| Estimated Hours | 8.0 |
| Complexity | 1.5 |
| Risk | 1.2 |
| Weight | 14.40 |
| Module | `src-tauri/tauri.conf.json` |
| Dependencies | `TSK-007`, `TSK-009`, `TSK-011` |

**Objective:**

Configure and build the production Windows installer using Tauri's NSIS bundler. Ensure all security configurations, custom protocols, and default plugins are packaged correctly. Use a separate build script to handle pre-build steps including compiling core plugins and copying assets.

**Technical Approach:**

Configure tauri.conf.json with the NSIS bundle settings. Define the custom protocol registration in the installer configuration. Set up a separate build script that compiles the core plugins, copies them to the resources directory, and runs tauri build.

**Files to Create/Modify:**

- `src-tauri/tauri.conf.json`
- `scripts/build-installer.{sh,ps1}` (or equivalent)

**Acceptance Criteria:**

- [ ] Tauri build command compiles the application in release mode without errors.
- [ ] An NSIS installer (.exe) is generated successfully.
- [ ] The installer correctly installs the application, registers the custom protocol, and places default plugins in the app data directory.
- [ ] The installed application launches and runs correctly on a clean Windows 11 environment.

**Testing Requirements:**

Run the generated installer on a clean Windows 11 virtual machine. Verify that the application installs, launches, and that the custom protocol and default plugins are fully functional.

**Integration Notes:**

Depends on completion of `TSK-007` (TSK-007), `TSK-009` (TSK-009), `TSK-011` (TSK-011). This task's output must be compatible with those modules before proceeding.

> **GATE 5 — Validation**
>
> | Check | Tool | Pass Criteria |
> | ----- | ---- | -------------- |
> | Release Build | `npm run tauri build` | Compiles without errors |
> | Installer Generation | NSIS via Tauri bundler | .exe generated successfully |
> | Clean Install | Manual/VM | Application installs and launches |
> | Functional Verification | Manual | Biometrics, plugin import, and local storage work |
>
> **Status:** ⬜ PENDING

## 4. Technical Components

- **Backend:** Rust, Tauri v2
- **Frontend:** TypeScript, React, Tailwind CSS, Mermaid.js
- **Infrastructure:** SQLite (rusqlite bundled-sqlcipher), Windows Hello (windows crate)

## 5. Deliverables

- `TSK-001`: Tauri Host Setup & Fluent UI Shell
- `TSK-002`: SQLCipher Database Integration
- `TSK-003`: Windows Hello Biometric Integration
- `TSK-004`: Secure Key Release & DB Decryption
- `TSK-005`: Custom URI Scheme & Sandboxed Iframe
- `TSK-006`: Secure IPC Bridge & Data Broker
- `TSK-007`: Plugin Installer & Manager
- `TSK-008`: Core Plugin SDK & React Template
- `TSK-009`: Journaling Plugin (Encrypted)
- `TSK-010`: Todo List Plugin
- `TSK-011`: Goals Tracker Plugin (Data Sharing)
- `TSK-012`: Windows Installer Packaging (NSIS)
