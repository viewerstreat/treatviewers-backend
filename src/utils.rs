use chrono::Utc;
use mongodb::Database;
use mongodb::options::ReturnDocument;
use mongodb::{bson::doc, options::FindOneAndUpdateOptions};
use rocket::serde::{Deserialize, Serialize};

use crate::database::COLL_SEQUENCES;


pub fn get_unix_ts() -> i64 {
    Utc::now().timestamp_millis()
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct Sequences {
    _id: String,
    val: u64,
}

pub async fn get_seq_next(seq_id: &str, db: &Database) -> Option<u64> {
    let filter = doc! {
        "_id": seq_id
    };

    let update = doc! {
        "$inc": { "val": 1 }
    };

    let options = FindOneAndUpdateOptions::builder()
        .upsert(true)
        .return_document(ReturnDocument::After)
        .build();

    let update_result = db
        .collection::<Sequences>(COLL_SEQUENCES)
        .find_one_and_update(filter, update, options)
        .await.unwrap_or(None)?;

    Some(update_result.val)
}

#[cfg(test)]
mod tests {
    use super::*;
    use rocket::tokio;

    #[test]
    fn check_get_unix_ts() {
        let ts = get_unix_ts();
        assert!(ts > 0);
    }

    #[tokio::test]
    async fn check_get_seq_next() {
        use mongodb::Client;
        use std::env;

        let conn_url = env::var("APP_DB_CONN_URL").unwrap();
        let db_name = env::var("APP_DB_NAME").unwrap();
        let client = Client::with_uri_str(conn_url).await;
        let client = client.expect("Not able to connect to database");
        let db = client.database(&db_name);
        let seq_id = "TEMP_SEQ_TEST_ONLY";
        let r = get_seq_next(seq_id, &db).await.unwrap();
        let r1 = get_seq_next(seq_id, &db).await.unwrap();
        assert_eq! {r + 1, r1};
    }
}
