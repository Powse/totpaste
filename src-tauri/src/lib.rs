mod accounts;
mod constants;
mod crypto;
mod parsing;

use std::path::PathBuf;

use keyring::Entry;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder},
    Manager,
};

use crate::{
    accounts::{
        accounts_add_account, accounts_get_saved_accounts, accounts_get_valid_secret,
        accounts_map_to_dto, accounts_update_store_with, Account, AccountDto,
    },
    constants::APP_ID,
    parsing::parsing_qr_string_to_accounts,
};

#[tauri::command]
fn add_account(app: tauri::AppHandle, name: String, secret_b32: String) -> Result<(), String> {
    let app_path = get_app_data_dir(&app)?;

    accounts_add_account(&app_path, name, secret_b32)?;

    Ok(())
}

#[tauri::command]
fn delete_account(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let account = Entry::new(APP_ID, &id).map_err(|e| e.to_string())?;
    account.delete_credential().map_err(|e| e.to_string())?;

    let app_path = get_app_data_dir(&app)?;

    let mut accounts = accounts_get_saved_accounts(&app_path)?;
    accounts.retain(|x| x.id != id);

    accounts_update_store_with(&app_path, accounts)?;

    Ok(())
}

#[tauri::command]
fn edit_account(
    app: tauri::AppHandle,
    id: String,
    name: String,
    secret_b32: String,
) -> Result<(), String> {
    let account = Entry::new(APP_ID, &id).map_err(|e| e.to_string())?;
    let secret = accounts_get_valid_secret(secret_b32);
    account.set_password(&secret).map_err(|e| e.to_string())?;

    let app_path = get_app_data_dir(&app)?;

    let mut accounts = accounts_get_saved_accounts(&app_path)?;

    if let Some(account) = accounts.iter_mut().find(|x| x.id == id) {
        account.name = name;
    }

    accounts_update_store_with(&app_path, accounts)?;

    Ok(())
}

#[tauri::command]
fn get_account_secret(id: String) -> Result<String, String> {
    let account = Entry::new(APP_ID, &id).map_err(|e| e.to_string())?;
    let secret = account.get_password().map_err(|e| e.to_string())?;

    Ok(secret)
}

#[tauri::command]
fn get_all_accounts(app: tauri::AppHandle) -> Result<Vec<AccountDto>, String> {
    let app_path = get_app_data_dir(&app)?;
    let accounts = accounts_get_saved_accounts(&app_path).map_err(|e| e.to_string())?;
    let results = accounts_map_to_dto(accounts)?;

    Ok(results)
}
#[tauri::command]
fn import_from_qr_code(app: tauri::AppHandle, code: String) -> Result<(), String> {
    let accounts = parsing_qr_string_to_accounts(&code)?;

    let app_path = get_app_data_dir(&app)?;

    for account in accounts {
        accounts_add_account(&app_path, account.name, account.secret.unwrap())?;
    }
    Ok(())
}

fn get_app_data_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let quit_menu_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_menu_item])?;
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(true)
                .tooltip("totpaste")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| match event {
                    tauri::tray::TrayIconEvent::Click {
                        id: _,
                        position: _,
                        rect: _,
                        button,
                        button_state: _,
                    } => {
                        match button {
                            MouseButton::Left => {
                                let app = tray.app_handle();
                                if let Some(window) = app.get_webview_window("main") {
                                    let _ = window.unminimize();
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                    if let Ok(Some(monitor)) = window.current_monitor() {
                                        let size = monitor.size();
                                        let window_size = window.outer_size().unwrap();

                                        // todo: handle macos
                                        let x = (size.width - window_size.width) as f64;
                                        let y = (size.height - window_size.height) as f64 - 45.0;

                                        window
                                            .set_position(tauri::PhysicalPosition { x, y })
                                            .unwrap();
                                    }
                                }
                            }
                            _ => {}
                        }
                    }
                    _ => {}
                })
                .build(app)?;
            let window = app.get_webview_window("main").unwrap();
            window.show().unwrap();
            let w = window.clone();
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::Focused(false) = event {
                    w.hide().unwrap();
                }
            });
            #[cfg(desktop)]
            {
                use tauri_plugin_autostart::MacosLauncher;
                use tauri_plugin_autostart::ManagerExt;

                app.handle().plugin(tauri_plugin_autostart::init(
                    MacosLauncher::LaunchAgent,
                    None,
                ))?;

                let autostart_manager = app.autolaunch();
                let _ = autostart_manager.enable();
            }
            Ok(())
        })
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            add_account,
            edit_account,
            delete_account,
            get_all_accounts,
            get_account_secret,
            import_from_qr_code
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
