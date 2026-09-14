# Plugin Manifest Schemas

## catalog.json

Root of the `aether-app-plugins` repository. Fetched by the app at startup and on refresh.

```json
{
  "catalogVersion": "1.0.0",
  "plugins": [
    {
      "id": "calendar-sync",
      "name": "Calendar Sync",
      "version": "1.0.0",
      "category": "integration",
      "icon": "📅",
      "description": "Sync tasks and journal entries with external calendar providers.",
      "author": "Aether",
      "permissions": ["network:outbound"],
      "downloadUrl": "https://github.com/RadioMan18/aether-app-plugins/releases/download/v1.0.0/calendar-sync.zip",
      "checksum": "sha256:abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
      "changelog": "Initial release."
    }
  ]
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| catalogVersion | string | yes | Semantic version of the catalog schema itself |
| plugins | array | yes | List of available plugins |
| plugins[].id | string | yes | Unique plugin identifier (kebab-case) |
| plugins[].name | string | yes | Display name |
| plugins[].version | string | yes | Semantic version of the plugin release |
| plugins[].category | string | yes | One of: productivity, security, integration, developer-tools |
| plugins[].icon | string | yes | Emoji or short text icon |
| plugins[].description | string | yes | Short description shown in the store |
| plugins[].author | string | yes | Plugin author or maintainer |
| plugins[].permissions | string[] | yes | Required permissions (e.g. db:read, network:outbound) |
| plugins[].downloadUrl | string | yes | Direct URL to the plugin zip asset |
| plugins[].checksum | string | yes | SHA-256 checksum prefixed with `sha256:` |
| plugins[].changelog | string | no | Release notes for this version |

## plugin-manifest.json

Embedded at the root of each plugin zip. Validated during install.

```json
{
  "id": "calendar-sync",
  "name": "Calendar Sync",
  "version": "1.0.0",
  "permissions": ["network:outbound"],
  "entry": "index.html"
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Must match the catalog entry id |
| name | string | yes | Display name |
| version | string | yes | Semantic version |
| permissions | string[] | yes | Declared permissions |
| entry | string | yes | Entry HTML file (relative to zip root) |
