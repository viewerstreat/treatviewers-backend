use database::DBConnPool;
use rocket::State;
use utils::get_seq_next;

mod database;
mod users;
mod utils;

#[macro_use]
extern crate rocket;

#[get("/")]
async fn index(state: &State<DBConnPool>) -> &'static str {
    // let collections = state.get_db().list_collection_names(None).await.unwrap();
    // for coll_name in collections {
    //     println!("collection: {:?}", coll_name);
    // }
    let seq_id = "TEMP_SEQ_TEST_ONLY";
    let r = get_seq_next(seq_id, state.get_db()).await;

    println!("r is {:?}", r);
    "Hello, world!"
}

#[rocket::main]
async fn main() -> Result<(), rocket::Error> {
    let pool = DBConnPool::new().await;
    let _rocket = rocket::build()
        .manage(pool)
        .mount("/", routes![index, users::find_users, users::create_user])
        .launch()
        .await?;

    Ok(())
}




