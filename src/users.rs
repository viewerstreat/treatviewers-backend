use crate::{
    database::{DBConnPool, COLL_USERS},
    utils::get_seq_next,
};
use mongodb::bson::{doc, Document};
use rocket::{
    serde::{json::Json, Deserialize, Serialize},
    State,
};

#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct User {
    id: Option<u32>,
    name: Option<String>,
    phone: Option<String>,
    email: Option<String>,
    #[serde(rename = "profilePic")]
    profile_pic: Option<String>,
    #[serde(rename = "hasUsedReferrelCode")]
    has_used_referral_code: Option<bool>,
    #[serde(rename = "referralCode")]
    referral_code: Option<String>,
    #[serde(rename = "referredBy")]
    referred_by: Option<u32>,
    otp: Option<String>,
    #[serde(rename = "upiId")]
    upi_id: Option<String>,
    #[serde(rename = "walletBalance")]
    wallet_balance: Option<i32>,
    #[serde(rename = "ticketsEarned")]
    tickets_earned: Option<i32>,
    #[serde(rename = "lastLoginTime")]
    last_login_time: Option<i64>,
    #[serde(rename = "isActive")]
    is_active: Option<bool>,
    #[serde(rename = "createdTimestamp")]
    created_timestamp: Option<i64>,
    #[serde(rename = "updatedTimestamp")]
    updated_timestamp: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct CreateUserPayload {
    name: String,
    phone: Option<String>,
    email: Option<String>,
    #[serde(rename = "hasUsedReferrelCode")]
    has_used_referral_code: Option<bool>,
    #[serde(rename = "referralCode")]
    referral_code: Option<String>,
    #[serde(rename = "referredBy")]
    referred_by: Option<u32>,
}

#[post("/user", format = "application/json", data = "<payload>")]
pub async fn create_user(
    state: &State<DBConnPool>,
    payload: Json<CreateUserPayload>,
) -> &'static str {
    println!("{:?}", payload);
    let seq_val = get_seq_next("USER_ID_SEQ", state.get_db()).await.unwrap();
    let seq_val = seq_val as i64;
    let name = payload.name.clone();
    let email = match &payload.email {
        Some(s) => s.clone(),
        _ => String::new(),
    };
    let phone = match &payload.phone {
        Some(s) => s.clone(),
        _ => String::new(),
    };
    let has_used_referral_code = match &payload.has_used_referral_code {
        Some(v) => v.clone(),
        _ => false,
    };
    let referral_code = match &payload.referral_code {
        Some(v) => v.clone(),
        _ => String::new(),
    };
    let referred_by = match &payload.referred_by {
        Some(v) => v.clone(),
        _ => 0u32,
    };

    let d = doc! {
        "id": seq_val,
        "name": name,
        "email": email,
        "phone": phone,
        "isActive": true,
        "hasUsedReferralCode": has_used_referral_code,
        "referralCode": referral_code,
        "referredBy": referred_by,

    };

    println!("{:?}", d);
    let result = state
        .get_db()
        .collection::<Document>(COLL_USERS)
        .insert_one(d, None)
        .await;

    "Hello create user"
}

#[get("/users")]
pub async fn find_users(state: &State<DBConnPool>) -> &'static str {
    let collections = state.get_db().list_collection_names(None).await.unwrap();
    for coll_name in collections {
        println!("collection: {:?}", coll_name);
    }
    "Hello, users!"
}
