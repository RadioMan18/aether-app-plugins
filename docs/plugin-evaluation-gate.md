# Plugin Evaluation Gate

Before any plugin is added to `catalog.json`, it must pass the following review:

## 1. Value Add
- Does it solve a problem not already solved by existing plugins (journal, todo, goals)?
- Does it provide unique functionality that users have requested?
- Is it a tech demo with no clear user value?

## 2. No Duplication
- Does it overlap with existing or planned plugins?
- Can its functionality be achieved by combining existing plugins?
- Does it duplicate features in the host app itself?

## 3. Predicted Demand
- Is there a clear user need or use case?
- Does it fill a gap in the productivity/security/integration/developer-tools categories?
- Is it a niche tool with limited audience, or broadly applicable?

## 4. Security
- Permissions are minimal and justified for the plugin's functionality
- No unnecessary `network:outbound`, `fs:write`, or biometric permissions
- All external data flows are documented
- Code review completed for common vulnerabilities (XSS, injection, etc.)

## 5. Build Quality
- `npm run build` succeeds without errors
- Zip package is under size limit (recommended < 500KB compressed)
- `plugin-manifest.json` is valid and matches `package.json` metadata
- No console errors or warnings in production build
- Tested on Windows with Tauri runtime

## 6. Documentation
- README.md explains the plugin's purpose and usage
- CHANGELOG.md documents version history
- LICENSE file included

## Evaluation Template

```markdown
### Plugin: [name]

**Evaluator:** [name/date]

| Criterion | Pass | Fail | Notes |
|-----------|------|------|-------|
| Value Add | ☐ | ☐ | |
| No Duplication | ☐ | ☐ | |
| Predicted Demand | ☐ | ☐ | |
| Security | ☐ | ☐ | |
| Build Quality | ☐ | ☐ | |
| Documentation | ☐ | ☐ | |

**Decision:** ☐ Approved ☐ Rejected

**Rationale:**
```

## Post-Approval Checklist

1. Add entry to `catalog.json` with correct `downloadUrl`, `checksum`, and `changelog`
2. Create GitHub Release with zip asset
3. Verify raw `catalog.json` URL is accessible
4. Update plugin README with evaluation results
5. Add plugin to `package.json` `build:plugins` script if it needs local dev support
