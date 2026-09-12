use serde::{Deserialize, Serialize};
use serde_json::Value;

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
        let permissions = self.db.get_plugin_permissions(plugin_id)?;
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
            "db:query" => self.handle_db_query(request),
            "db:execute" => self.handle_db_execute(request, &permissions),
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
