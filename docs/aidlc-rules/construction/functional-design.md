# Construction: Functional Design

## Objective

For complex tasks, define interfaces, data models, and security considerations before writing implementation code.

## When Required

- New IPC message types or schema changes (TSK-006)
- Database schema modifications (TSK-002, TSK-004)
- Plugin manifest schema changes (TSK-007)
- Security-sensitive integrations (TSK-003, TSK-004)

## Design Artifacts

- Interface definitions (TypeScript types, Rust structs)
- Data flow diagrams
- Security review notes
- Updated module specs in `docs/aidlc-docs/inception/tech_spec.md`

## Completion Criteria

- Design reviewed and approved by user
- Interfaces frozen before code generation begins
- All security implications documented
