use std::collections::HashMap;

use google_authenticator_converter::process_data;
use url::Url;

use crate::Account;

pub fn parsing_qr_string_to_accounts(code: &str) -> Result<Vec<Account>, String> {
    if code.starts_with("otpauth-migration") {
        let mut results = Vec::new();
        let accounts =
            process_data(code).map_err(|e| format!("Google Authenticator parse error: {}", e))?;
        for account in accounts {
            let display_name = match &account.issuer {
                issuer if !issuer.is_empty() && !account.name.contains(issuer) => {
                    format!("{}:{}", issuer, account.name)
                }
                _ => account.name.clone(),
            };
            results.push(Account {
                id: String::new(),
                name: display_name,
                secret: Some(account.secret),
            });
        }
        Ok(results)
    } else if code.starts_with("otpauth://totp") {
        let account = parse_totp_url(code)?;
        let secret = account
            .secret
            .ok_or("Error while parsing account".to_string())?;

        Ok(vec![Account {
            id: account.id,
            name: account.name,
            secret: Some(secret),
        }])
    } else {
        Err("Unsupported format.".to_string())
    }
}
fn parse_totp_url(url_str: &str) -> Result<Account, String> {
    let url = Url::parse(url_str).map_err(|e| format!("Error parsing OTP Auth  string: {}", e))?;

    let label = url.path().trim_start_matches('/').to_string();

    let query: HashMap<_, _> = url.query_pairs().into_owned().collect();
    let secret = query.get("secret").ok_or("Missing secret parameter")?;

    Ok(Account {
        id: String::new(),
        name: label,
        secret: Some(secret.to_string()),
    })
}
