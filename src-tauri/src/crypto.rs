use base64::{engine::general_purpose, Engine};
use chacha20poly1305::{
    aead::{Aead, OsRng},
    AeadCore, ChaCha20Poly1305, Key, KeyInit, Nonce,
};
use keyring::Entry;

use std::fs;
use std::path::Path;

use crate::constants::{APP_ID, FILE_KEY};

const NONCE_SIZE: usize = 12;

pub fn crypto_encrypt_text_to_file_with_key(
    plaintext: &str,
    directory: &str,
    file: &str,
    key: &[u8; 32],
) -> Result<(), String> {
    let cipher = ChaCha20Poly1305::new(key.into());

    let nonce = generate_nonce();

    let ciphertext = cipher
        .encrypt(&nonce, plaintext.as_ref())
        .map_err(|e| format!("Encryption failed: {}", e))?;

    let mut output = Vec::new();
    output.extend_from_slice(&nonce);
    output.extend_from_slice(&ciphertext);

    let dir = Path::new(directory);
    if !dir.exists() {
        fs::create_dir_all(dir).map_err(|e| format!("Couldn't create store directory {}", e))?;
    }
    fs::write(Path::new(directory).join(file), output)
        .map_err(|e| format!("Encryption failed: {}", e))?;

    Ok(())
}

pub fn crypto_decrypt_file_with_key(
    directory: &str,
    file: &str,
    key: &[u8; 32],
) -> Result<Vec<u8>, String> {
    let dir = Path::new(directory);
    if !dir.exists() {
        fs::create_dir_all(dir).map_err(|e| format!("Couldn't create store directory {}", e))?;
    }
    let data = fs::read(Path::new(directory).join(file))
        .map_err(|e| format!("Error reading store file: {}", e))?;

    if data.len() < NONCE_SIZE {
        return Err("File too small to be valid encrypted file".into());
    }

    let (nonce_bytes, ciphertext) = data.split_at(NONCE_SIZE);
    let cipher = ChaCha20Poly1305::new(key.into());
    #[allow(deprecated)]
    let nonce = Nonce::from_slice(nonce_bytes);

    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| "Decryption failed: wrong key or corrupted file")?;

    Ok(plaintext)
}
pub fn crypto_get_app_store_key() -> Result<[u8; 32], String> {
    let entry =
        Entry::new(APP_ID, FILE_KEY).map_err(|e| format!("Error accessing keystore: {}", e))?;

    if let Ok(key_b64) = entry.get_password() {
        let key_bytes = general_purpose::STANDARD
            .decode(&key_b64)
            .map_err(|e| e.to_string())?;
        if key_bytes.len() != 32 {
            return Err("Stored key has invalid length".into());
        }
        let mut key = [0u8; 32];
        key.copy_from_slice(&key_bytes);
        Ok(key)
    } else {
        let key: Key = ChaCha20Poly1305::generate_key(&mut OsRng);
        let key_bytes: [u8; 32] = key.into();
        let key_b64 = general_purpose::STANDARD.encode(&key_bytes);
        entry.set_password(&key_b64).map_err(|e| e.to_string())?;
        Ok(key_bytes)
    }
}

fn generate_nonce() -> Nonce {
    ChaCha20Poly1305::generate_nonce(&mut OsRng)
}
