use std::env;

use mongodb::{Client, Database};

pub struct DBConnPool {
    db: Database,
}

impl DBConnPool {
    pub async fn new() -> Self {
        let conn_url =
            env::var("APP_DB_CONN_URL").expect("APP_DB_CONN_URL environment variable is not set");
        let db_name = env::var("APP_DB_NAME").expect("APP_DB_NAME environment variable is not set");
        let client = Client::with_uri_str(conn_url).await;
        let client = client.expect("Not able to connect to database");
        let db = client.database(&db_name);
        Self { db }
    }

    pub fn get_db(&self) -> &Database {
        &self.db
    }
}

pub const COLL_SEQUENCES: &str = "sequences";
pub const COLL_USERS: &str = "users";

