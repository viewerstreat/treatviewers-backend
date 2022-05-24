use database::DBConnPool;
use rocket::State;

mod database;

#[macro_use]
extern crate rocket;

#[get("/")]
async fn index(state: &State<DBConnPool>) -> &'static str {
    let collections = state.get_db().list_collection_names(None).await.unwrap();
    // let collections = state.db.list_collection_names(None).await.unwrap();
    for coll_name in collections {
        println!("collection: {:?}", coll_name);
    }
    "Hello, world!"
}

#[rocket::main]
async fn main() -> Result<(), rocket::Error> {
    let pool = DBConnPool::new().await;
    let _rocket = rocket::build()
        .manage(pool)
        .mount("/", routes![index])
        .launch()
        .await?;

    Ok(())
}
