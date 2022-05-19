use mongodb::{Client, Database};
use rocket::{Rocket, State};
use std::error::Error;

#[macro_use]
extern crate rocket;

const DB_CONN_URL: &'static str =
    "mongodb+srv://treatviewersdbusr:48MtSlonDyPbazuq@treatviewers.deppn.mongodb.net/treatviewers";
const DB_NAME: &'static str = "treatviewers";

#[get("/")]
async fn index(state: &State<DBConnPool>) -> &'static str {
    let collections = state.mongo.list_collection_names(None).await.unwrap();
    for coll_name in collections {
        println!("collection: {:?}", coll_name);
    }
    "Hello, world!"
}

struct DBConnPool {
    mongo: Database,
}

#[rocket::main]
async fn main() -> Result<(), rocket::Error> {
    let client = Client::with_uri_str(DB_CONN_URL).await;
    let client = client.unwrap();
    let db = client.database(DB_NAME);
    let pool = DBConnPool { mongo: db };
    let _rocket = rocket::build()
        .manage(pool)
        .mount("/", routes![index])
        .launch()
        .await?;

    Ok(())
}
