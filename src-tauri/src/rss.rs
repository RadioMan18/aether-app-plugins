use super::database::Database;
use feed_rs::parser;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct Feed {
    pub id: String,
    pub url: String,
    pub title: Option<String>,
    pub site_url: Option<String>,
    pub description: Option<String>,
    pub last_fetched_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FeedItem {
    pub id: String,
    pub feed_id: String,
    pub title: Option<String>,
    pub url: String,
    pub author: Option<String>,
    pub summary: Option<String>,
    pub content: Option<String>,
    pub published_at: Option<String>,
    pub fetched_at: String,
    pub is_read: bool,
    pub is_starred: bool,
}

pub struct RssService<'a> {
    db: &'a Database,
    http: Client,
}

impl<'a> RssService<'a> {
    pub fn new(db: &'a Database) -> Self {
        Self {
            db,
            http: Client::new(),
        }
    }

    pub async fn add_feed(&self, url: &str) -> Result<Feed, String> {
        let response = self
            .http
            .get(url)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch feed: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("Feed URL returned status: {}", response.status()));
        }

        let content = response
            .bytes()
            .await
            .map_err(|e| format!("Failed to read feed bytes: {}", e))?;
        let parsed =
            parser::parse(&content[..]).map_err(|e| format!("Failed to parse feed: {}", e))?;

        let title = parsed.title.as_ref().map(|t| t.content.clone());
        let description = parsed.description.as_ref().map(|d| d.content.clone());
        let site_url = parsed.links.first().map(|l| l.href.clone());

        let id = generate_id(url);
        let now = chrono::Utc::now().to_rfc3339();

        self.db.with_connection(|conn| {
            conn.execute(
                "INSERT OR REPLACE INTO rss_feeds (id, url, title, site_url, description, last_fetched_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                rusqlite::params![id, url, title, site_url, description, now, now],
            )
            .map_err(|e| e.to_string())?;
            Ok(())
        })?;

        self.store_items(&id, parsed).await?;

        self.get_feed(&id)
    }

    pub async fn refresh_feed(&self, feed_id: &str) -> Result<(), String> {
        let feed = self.get_feed(feed_id)?;
        self.refresh_feed_by_url(feed_id, &feed.url).await
    }

    pub async fn refresh_all_feeds(&self) -> Result<usize, String> {
        let feeds = self.list_feeds()?;
        let mut count = 0;
        for feed in feeds {
            if let Err(e) = self.refresh_feed_by_url(&feed.id, &feed.url).await {
                log::warn!("Failed to refresh feed {}: {}", feed.id, e);
            } else {
                count += 1;
            }
        }
        Ok(count)
    }

    pub fn get_feed(&self, feed_id: &str) -> Result<Feed, String> {
        self.db.with_connection(|conn| {
            let mut stmt = conn
                .prepare("SELECT id, url, title, site_url, description, last_fetched_at, created_at, updated_at FROM rss_feeds WHERE id = ?1")
                .map_err(|e| e.to_string())?;
            let feed = stmt
                .query_row(rusqlite::params![feed_id], |row| {
                    Ok(Feed {
                        id: row.get(0)?,
                        url: row.get(1)?,
                        title: row.get(2)?,
                        site_url: row.get(3)?,
                        description: row.get(4)?,
                        last_fetched_at: row.get(5)?,
                        created_at: row.get(6)?,
                        updated_at: row.get(7)?,
                    })
                })
                .map_err(|e| e.to_string())?;
            Ok(feed)
        })
    }

    pub fn list_feeds(&self) -> Result<Vec<Feed>, String> {
        self.db.with_connection(|conn| {
            let mut stmt = conn
                .prepare("SELECT id, url, title, site_url, description, last_fetched_at, created_at, updated_at FROM rss_feeds ORDER BY updated_at DESC")
                .map_err(|e| e.to_string())?;
            let feeds = stmt
                .query_map([], |row| {
                    Ok(Feed {
                        id: row.get(0)?,
                        url: row.get(1)?,
                        title: row.get(2)?,
                        site_url: row.get(3)?,
                        description: row.get(4)?,
                        last_fetched_at: row.get(5)?,
                        created_at: row.get(6)?,
                        updated_at: row.get(7)?,
                    })
                })
                .map_err(|e| e.to_string())?
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e| e.to_string())?;
            Ok(feeds)
        })
    }

    pub fn list_items(
        &self,
        feed_id: Option<&str>,
        unread_only: bool,
        limit: Option<usize>,
    ) -> Result<Vec<FeedItem>, String> {
        let mut sql = "SELECT id, feed_id, title, url, author, summary, content, published_at, fetched_at, is_read, is_starred FROM rss_items WHERE 1=1".to_string();
        let mut params: Vec<rusqlite::types::Value> = Vec::new();

        if let Some(feed_id) = feed_id {
            sql.push_str(" AND feed_id = ?");
            params.push(rusqlite::types::Value::Text(feed_id.to_string()));
        }
        if unread_only {
            sql.push_str(" AND is_read = 0");
        }
        sql.push_str(" ORDER BY published_at DESC");
        if let Some(limit) = limit {
            sql.push_str(" LIMIT ?");
            params.push(rusqlite::types::Value::Integer(limit as i64));
        }

        self.db.with_connection(|conn| {
            let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
            let items = stmt
                .query_map(rusqlite::params_from_iter(params), |row| {
                    Ok(FeedItem {
                        id: row.get(0)?,
                        feed_id: row.get(1)?,
                        title: row.get(2)?,
                        url: row.get(3)?,
                        author: row.get(4)?,
                        summary: row.get(5)?,
                        content: row.get(6)?,
                        published_at: row.get(7)?,
                        fetched_at: row.get(8)?,
                        is_read: row.get::<_, i64>(9)? != 0,
                        is_starred: row.get::<_, i64>(10)? != 0,
                    })
                })
                .map_err(|e| e.to_string())?
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e| e.to_string())?;
            Ok(items)
        })
    }

    pub fn mark_item_read(&self, item_id: &str, is_read: bool) -> Result<(), String> {
        self.db.with_connection(|conn| {
            conn.execute(
                "UPDATE rss_items SET is_read = ?1 WHERE id = ?2",
                rusqlite::params![if is_read { 1 } else { 0 }, item_id],
            )
            .map_err(|e| e.to_string())?;
            Ok(())
        })
    }

    pub fn mark_item_starred(&self, item_id: &str, is_starred: bool) -> Result<(), String> {
        self.db.with_connection(|conn| {
            conn.execute(
                "UPDATE rss_items SET is_starred = ?1 WHERE id = ?2",
                rusqlite::params![if is_starred { 1 } else { 0 }, item_id],
            )
            .map_err(|e| e.to_string())?;
            Ok(())
        })
    }

    pub fn delete_feed(&self, feed_id: &str) -> Result<(), String> {
        self.db.with_connection(|conn| {
            conn.execute(
                "DELETE FROM rss_feeds WHERE id = ?1",
                rusqlite::params![feed_id],
            )
            .map_err(|e| e.to_string())?;
            Ok(())
        })
    }

    async fn refresh_feed_by_url(&self, feed_id: &str, url: &str) -> Result<(), String> {
        let response = self
            .http
            .get(url)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch feed: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("Feed URL returned status: {}", response.status()));
        }

        let content = response
            .bytes()
            .await
            .map_err(|e| format!("Failed to read feed bytes: {}", e))?;
        let parsed =
            parser::parse(&content[..]).map_err(|e| format!("Failed to parse feed: {}", e))?;

        let now = chrono::Utc::now().to_rfc3339();
        self.db.with_connection(|conn| {
            conn.execute(
                "UPDATE rss_feeds SET last_fetched_at = ?1, updated_at = ?2 WHERE id = ?3",
                rusqlite::params![now, now, feed_id],
            )
            .map_err(|e| e.to_string())?;
            Ok(())
        })?;

        self.store_items(feed_id, parsed).await
    }

    async fn store_items(&self, feed_id: &str, feed: feed_rs::model::Feed) -> Result<(), String> {
        let mut seen_urls = HashMap::new();
        self.db.with_connection(|conn| {
            let mut stmt = conn
                .prepare("SELECT url FROM rss_items WHERE feed_id = ?1")
                .map_err(|e| e.to_string())?;
            let existing_urls: Vec<String> = stmt
                .query_map(rusqlite::params![feed_id], |row| row.get(0))
                .map_err(|e| e.to_string())?
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e| e.to_string())?;
            for url in existing_urls {
                seen_urls.insert(url, true);
            }
            Ok(())
        })?;

        for entry in feed.entries {
            let url = entry
                .links
                .first()
                .map(|l| l.href.clone())
                .unwrap_or_default();
            if url.is_empty() || seen_urls.contains_key(&url) {
                continue;
            }
            seen_urls.insert(url.clone(), true);

            let id = generate_id(&format!("{}-{}", feed_id, url));
            let title = entry.title.map(|t| t.content);
            let author = entry.authors.first().map(|a| a.name.clone());
            let summary = entry.summary.map(|s| s.content);
            let content = entry.content.as_ref().and_then(|c| c.body.clone());
            let published_at = entry.published.map(|d| d.to_rfc3339());

            self.db.with_connection(|conn| {
                conn.execute(
                    "INSERT OR IGNORE INTO rss_items (id, feed_id, title, url, author, summary, content, published_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                    rusqlite::params![id, feed_id, title, url, author, summary, content, published_at],
                )
                .map_err(|e| e.to_string())?;
                Ok(())
            })?;
        }

        Ok(())
    }
}

fn generate_id(seed: &str) -> String {
    use std::hash::{Hash, Hasher};
    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    seed.hash(&mut hasher);
    format!("{:x}", hasher.finish())
}
