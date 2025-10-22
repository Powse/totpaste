use std::time::{SystemTime, UNIX_EPOCH};

use keyring::Entry;
use serde::{Deserialize, Serialize};
use totp_rs::{Secret, TOTP};

use crate::{
    constants::{ACCOUNT_LIST_DIR, ACCOUNT_LIST_FILE, APP_ID},
    crypto::{
        crypto_decrypt_file_with_key, crypto_encrypt_text_to_file_with_key,
        crypto_get_app_store_key,
    },
};

#[derive(Serialize)]
pub struct AccountDto {
    pub id: String,
    pub name: String,
    pub code: String,
    pub expires_at: u64, // unix ms
}

#[derive(Serialize, Deserialize)]
pub struct Account {
    pub id: String,
    pub name: String,
    pub secret: Option<String>,
}

pub fn accounts_get_valid_secret(secret_b32: String) -> String {
    let mut secret = secret_b32.clone();
    if secret.len() < 26 {
        // Repeat until at least 26 chars long
        while secret.len() < 26 {
            secret.push('A'); // 'A' decodes to 0 bits in Base32
        }
    }

    secret
}

pub fn get_saved_accounts() -> Result<Vec<Account>, String> {
    let app_key = crypto_get_app_store_key()?;
    let saved_accounts: Vec<Account> =
        match crypto_decrypt_file_with_key(ACCOUNT_LIST_DIR, ACCOUNT_LIST_FILE, &app_key) {
            Ok(json) => serde_json::from_slice(&json).unwrap_or_default(),
            Err(_) => vec![],
        };
    Ok(saved_accounts)
}

pub fn accounts_update_store_with(accounts: Vec<Account>) -> Result<(), String> {
    let app_key = crypto_get_app_store_key()?;

    crypto_encrypt_text_to_file_with_key(
        &serde_json::to_string(&accounts).map_err(|e| e.to_string())?,
        ACCOUNT_LIST_DIR,
        ACCOUNT_LIST_FILE,
        &app_key,
    )?;

    Ok(())
}

pub fn accounts_map_to_dto(accounts: Vec<Account>) -> Result<Vec<AccountDto>, String> {
    let mut results = Vec::new();
    let now = SystemTime::now();
    let now_secs = now
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs();
    let step = 30;
    let elapsed_in_step = now_secs % step;
    let expires_in = step - elapsed_in_step;
    let expires_at = now_secs + expires_in;
    for account in accounts {
        let entry = Entry::new(APP_ID, &account.id).map_err(|e| e.to_string())?;
        let secret = Secret::Encoded(entry.get_password().map_err(|e| e.to_string())?)
            .to_bytes()
            .expect("Invalid Base32 secret");
        let totp =
            TOTP::new(totp_rs::Algorithm::SHA1, 6, 1, step, secret).map_err(|e| e.to_string())?;
        let code = totp.generate(now_secs);
        results.push(AccountDto {
            id: account.id,
            name: account.name,
            code,
            expires_at,
        })
    }

    Ok(results)
}
