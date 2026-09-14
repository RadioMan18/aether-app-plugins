use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginRequest {
    pub id: String,
    pub plugin_id: String,
    pub request_type: String,
    pub payload: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginResponse {
    pub id: String,
    pub success: bool,
    pub data: Option<Value>,
    pub error: Option<String>,
}

pub struct PluginBroker<'a> {
    db: &'a crate::database::Database,
}

impl<'a> PluginBroker<'a> {
    pub fn new(db: &'a crate::database::Database) -> Self {
        Self { db }
    }

    pub fn handle(
        &self,
        plugin_id: &str,
        request: PluginRequest,
    ) -> Result<PluginResponse, String> {
        log::info!("Plugin broker loading permissions: plugin={}", plugin_id);
        let permissions = self.db.get_plugin_permissions(plugin_id)?;
        log::info!("Plugin broker permissions loaded: plugin={}", plugin_id);
        let required = required_permission(&request.request_type);

        if !permissions.contains(&required.to_string()) {
            return Ok(PluginResponse {
                id: request.id,
                success: false,
                data: None,
                error: Some(format!("Permission denied: requires '{}'", required)),
            });
        }

        match request.request_type.as_str() {
            "db:query" => {
                log::info!("Plugin broker executing query: plugin={}", plugin_id);
                self.handle_db_query(request)
            }
            "db:execute" => {
                log::info!("Plugin broker executing statement: plugin={}", plugin_id);
                self.handle_db_execute(request, &permissions)
            }
            "todo:get_tasks" => self.handle_schema_query(request, "todo_get_tasks.json"),
            "goals:get_milestones" => {
                self.handle_schema_query(request, "goals_get_milestones.json")
            }
            _ => Err(format!("Unknown request type: {}", request.request_type)),
        }
    }

    fn handle_db_query(&self, request: PluginRequest) -> Result<PluginResponse, String> {
        let sql = request
            .payload
            .get("sql")
            .and_then(|v| v.as_str())
            .ok_or("Missing 'sql' in payload")?;

        let params: Vec<rusqlite::types::Value> = request
            .payload
            .get("params")
            .and_then(|v| v.as_array())
            .map(|arr| arr.iter().map(json_to_sql_value).collect())
            .unwrap_or_default();

        self.db.with_connection(|conn| {
            let mut stmt = conn.prepare(sql).map_err(|e| e.to_string())?;
            let column_count = stmt.column_count();
            let column_names: Vec<String> = (0..column_count)
                .map(|i| Ok(stmt.column_name(i)?.to_string()))
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e: rusqlite::Error| e.to_string())?;

            let rows: Vec<Vec<Value>> = stmt
                .query_map(rusqlite::params_from_iter(params), |row| {
                    let mut values = Vec::new();
                    for i in 0..column_count {
                        let raw = row.get_ref(i)?;
                        values.push(value_ref_to_json(raw));
                    }
                    Ok(values)
                })
                .map_err(|e| e.to_string())?
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e| e.to_string())?;

            let mut data = serde_json::Map::new();
            data.insert(
                "columns".to_string(),
                Value::Array(column_names.into_iter().map(Value::String).collect()),
            );
            data.insert(
                "rows".to_string(),
                Value::Array(rows.into_iter().map(Value::Array).collect()),
            );
            log::info!(
                "Plugin query result: columns={}, rows={}",
                column_count,
                data["rows"].as_array().map_or(0, Vec::len)
            );

            Ok(PluginResponse {
                id: request.id,
                success: true,
                data: Some(Value::Object(data)),
                error: None,
            })
        })
    }

    fn handle_db_execute(
        &self,
        request: PluginRequest,
        permissions: &[String],
    ) -> Result<PluginResponse, String> {
        if !permissions.contains(&"db:write".to_string()) {
            return Ok(PluginResponse {
                id: request.id,
                success: false,
                data: None,
                error: Some("Permission denied: requires 'db:write'".to_string()),
            });
        }

        let sql = request
            .payload
            .get("sql")
            .and_then(|v| v.as_str())
            .ok_or("Missing 'sql' in payload")?;
        let params: Vec<rusqlite::types::Value> = request
            .payload
            .get("params")
            .and_then(|v| v.as_array())
            .map(|arr| arr.iter().map(json_to_sql_value).collect())
            .unwrap_or_default();

        self.db.with_connection(|conn| {
            let changes = conn
                .execute(sql, rusqlite::params_from_iter(params))
                .map_err(|e| e.to_string())?;

            let mut data = serde_json::Map::new();
            data.insert("changes".to_string(), Value::Number(changes.into()));
            log::info!("Plugin execute result: changes={}", changes);

            Ok(PluginResponse {
                id: request.id,
                success: true,
                data: Some(Value::Object(data)),
                error: None,
            })
        })
    }

    fn handle_schema_query(
        &self,
        request: PluginRequest,
        schema_name: &str,
    ) -> Result<PluginResponse, String> {
        let schema = load_schema(schema_name)?;
        if let Err(errors) = jsonschema::validate(&schema, &request.payload) {
            return Ok(PluginResponse {
                id: request.id,
                success: false,
                data: None,
                error: Some(format!("Invalid payload: {}", errors)),
            });
        }

        match request.request_type.as_str() {
            "todo:get_tasks" => self.handle_todo_get_tasks(request),
            "goals:get_milestones" => self.handle_goals_get_milestones(request),
            _ => unreachable!(),
        }
    }

    fn handle_todo_get_tasks(&self, request: PluginRequest) -> Result<PluginResponse, String> {
        let completed = request.payload.get("completed").and_then(|v| v.as_bool());
        let priority = request.payload.get("priority").and_then(|v| v.as_i64());
        let due_before = request.payload.get("due_before").and_then(|v| v.as_str());
        let due_after = request.payload.get("due_after").and_then(|v| v.as_str());
        let limit = request.payload.get("limit").and_then(|v| v.as_u64());

        let mut sql = String::from("SELECT id, title, completed, priority, due_date, created_at, updated_at FROM todos WHERE 1=1");
        let mut params: Vec<rusqlite::types::Value> = Vec::new();

        if let Some(c) = completed {
            sql.push_str(" AND completed = ?");
            params.push(rusqlite::types::Value::Integer(if c { 1 } else { 0 }));
        }
        if let Some(p) = priority {
            sql.push_str(" AND priority = ?");
            params.push(rusqlite::types::Value::Integer(p));
        }
        if let Some(d) = due_before {
            sql.push_str(" AND due_date <= ?");
            params.push(rusqlite::types::Value::Text(d.to_string()));
        }
        if let Some(d) = due_after {
            sql.push_str(" AND due_date >= ?");
            params.push(rusqlite::types::Value::Text(d.to_string()));
        }
        sql.push_str(" ORDER BY created_at DESC");
        if let Some(l) = limit {
            sql.push_str(" LIMIT ?");
            params.push(rusqlite::types::Value::Integer(l as i64));
        }

        self.db.with_connection(|conn| {
            let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
            let column_count = stmt.column_count();
            let column_names: Vec<String> = (0..column_count)
                .map(|i| Ok(stmt.column_name(i)?.to_string()))
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e: rusqlite::Error| e.to_string())?;

            let rows: Vec<Vec<Value>> = stmt
                .query_map(rusqlite::params_from_iter(params), |row| {
                    let mut values = Vec::new();
                    for i in 0..column_count {
                        let raw = row.get_ref(i)?;
                        values.push(value_ref_to_json(raw));
                    }
                    Ok(values)
                })
                .map_err(|e| e.to_string())?
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e| e.to_string())?;

            let mut data = serde_json::Map::new();
            data.insert(
                "columns".to_string(),
                Value::Array(column_names.into_iter().map(Value::String).collect()),
            );
            data.insert(
                "rows".to_string(),
                Value::Array(rows.into_iter().map(Value::Array).collect()),
            );

            Ok(PluginResponse {
                id: request.id,
                success: true,
                data: Some(Value::Object(data)),
                error: None,
            })
        })
    }

    fn handle_goals_get_milestones(
        &self,
        request: PluginRequest,
    ) -> Result<PluginResponse, String> {
        let status = request.payload.get("status").and_then(|v| v.as_str());
        let target_before = request
            .payload
            .get("target_before")
            .and_then(|v| v.as_str());
        let target_after = request.payload.get("target_after").and_then(|v| v.as_str());
        let limit = request.payload.get("limit").and_then(|v| v.as_u64());

        let mut sql = String::from("SELECT id, title, description, status, target_date, created_at, updated_at FROM goals WHERE 1=1");
        let mut params: Vec<rusqlite::types::Value> = Vec::new();

        if let Some(s) = status {
            sql.push_str(" AND status = ?");
            params.push(rusqlite::types::Value::Text(s.to_string()));
        }
        if let Some(d) = target_before {
            sql.push_str(" AND target_date <= ?");
            params.push(rusqlite::types::Value::Text(d.to_string()));
        }
        if let Some(d) = target_after {
            sql.push_str(" AND target_date >= ?");
            params.push(rusqlite::types::Value::Text(d.to_string()));
        }
        sql.push_str(" ORDER BY created_at DESC");
        if let Some(l) = limit {
            sql.push_str(" LIMIT ?");
            params.push(rusqlite::types::Value::Integer(l as i64));
        }

        self.db.with_connection(|conn| {
            let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
            let column_count = stmt.column_count();
            let column_names: Vec<String> = (0..column_count)
                .map(|i| Ok(stmt.column_name(i)?.to_string()))
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e: rusqlite::Error| e.to_string())?;

            let rows: Vec<Vec<Value>> = stmt
                .query_map(rusqlite::params_from_iter(params), |row| {
                    let mut values = Vec::new();
                    for i in 0..column_count {
                        let raw = row.get_ref(i)?;
                        values.push(value_ref_to_json(raw));
                    }
                    Ok(values)
                })
                .map_err(|e| e.to_string())?
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e| e.to_string())?;

            let mut data = serde_json::Map::new();
            data.insert(
                "columns".to_string(),
                Value::Array(column_names.into_iter().map(Value::String).collect()),
            );
            data.insert(
                "rows".to_string(),
                Value::Array(rows.into_iter().map(Value::Array).collect()),
            );

            Ok(PluginResponse {
                id: request.id,
                success: true,
                data: Some(Value::Object(data)),
                error: None,
            })
        })
    }
}

fn required_permission(request_type: &str) -> &'static str {
    match request_type {
        "db:query" => "db:read",
        "db:execute" => "db:write",
        "todo:get_tasks" => "db:read",
        "goals:get_milestones" => "db:read",
        "clipboard:subscribe" => "clipboard:subscribe",
        _ => "unknown",
    }
}

fn json_to_sql_value(value: &Value) -> rusqlite::types::Value {
    match value {
        Value::Null => rusqlite::types::Value::Null,
        Value::Bool(b) => rusqlite::types::Value::Integer(if *b { 1 } else { 0 }),
        Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                rusqlite::types::Value::Integer(i)
            } else if let Some(f) = n.as_f64() {
                rusqlite::types::Value::Real(f)
            } else {
                rusqlite::types::Value::Text(n.to_string())
            }
        }
        Value::String(s) => rusqlite::types::Value::Text(s.clone()),
        Value::Array(_) | Value::Object(_) => rusqlite::types::Value::Text(value.to_string()),
    }
}

fn value_ref_to_json(value: rusqlite::types::ValueRef<'_>) -> Value {
    match value {
        rusqlite::types::ValueRef::Null => Value::Null,
        rusqlite::types::ValueRef::Integer(i) => Value::Number(i.into()),
        rusqlite::types::ValueRef::Real(f) => {
            Value::Number(serde_json::Number::from_f64(f).unwrap_or(0.into()))
        }
        rusqlite::types::ValueRef::Text(s) => {
            Value::String(String::from_utf8_lossy(s).into_owned())
        }
        rusqlite::types::ValueRef::Blob(b) => Value::String(format!("<blob:{} bytes>", b.len())),
    }
}

fn load_schema(name: &str) -> Result<serde_json::Value, String> {
    let path: PathBuf = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("schemas")
        .join(name);
    let content = std::fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read schema {}: {}", name, e))?;
    serde_json::from_str(&content).map_err(|e| format!("Failed to parse schema {}: {}", name, e))
}
