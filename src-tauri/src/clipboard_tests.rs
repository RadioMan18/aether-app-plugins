use crate::clipboard::{has_clipboard_permission, is_valid_clipboard_content, ClipboardContent};
use serde_json::json;

#[test]
fn test_is_valid_clipboard_content_with_text() {
    let content = ClipboardContent {
        text: Some("hello".to_string()),
        html: None,
    };
    assert!(is_valid_clipboard_content(&content));
}

#[test]
fn test_is_valid_clipboard_content_with_html() {
    let content = ClipboardContent {
        text: None,
        html: Some("<p>hello</p>".to_string()),
    };
    assert!(is_valid_clipboard_content(&content));
}

#[test]
fn test_is_valid_clipboard_content_with_both() {
    let content = ClipboardContent {
        text: Some("hello".to_string()),
        html: Some("<p>hello</p>".to_string()),
    };
    assert!(is_valid_clipboard_content(&content));
}

#[test]
fn test_is_valid_clipboard_content_empty() {
    let content = ClipboardContent {
        text: None,
        html: None,
    };
    assert!(!is_valid_clipboard_content(&content));
}

#[test]
fn test_has_clipboard_permission_present() {
    let permissions = vec!["db:read".to_string(), "clipboard:subscribe".to_string()];
    assert!(has_clipboard_permission(&permissions));
}

#[test]
fn test_has_clipboard_permission_absent() {
    let permissions = vec!["db:read".to_string(), "db:write".to_string()];
    assert!(!has_clipboard_permission(&permissions));
}

#[test]
fn test_has_clipboard_permission_empty() {
    let permissions: Vec<String> = Vec::new();
    assert!(!has_clipboard_permission(&permissions));
}

#[test]
fn test_clipboard_payload_serialization() {
    let payload = crate::clipboard::ClipboardPayload {
        text: Some("hello".to_string()),
        html: Some("<p>hello</p>".to_string()),
        timestamp: "2024-01-01T00:00:00Z".to_string(),
    };
    let serialized = serde_json::to_value(&payload).unwrap();
    assert_eq!(serialized["text"], json!("hello"));
    assert_eq!(serialized["html"], json!("<p>hello</p>"));
    assert_eq!(serialized["timestamp"], json!("2024-01-01T00:00:00Z"));
}
