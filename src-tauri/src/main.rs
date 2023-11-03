// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate base64;

use base64::encode;

#[tauri::command]
async fn download_data_checksum() -> String {
  let data = reqwest::get("https://github.com/VicarTeam/VicarData/releases/latest/download/checksum.sha256")
    .await.unwrap().text().await.unwrap();
   data
}

#[tauri::command]
async fn download_data_bundle() -> String {
  let data = reqwest::get("https://github.com/VicarTeam/VicarData/releases/latest/download/bundle.zip")
    .await.unwrap().bytes().await.unwrap();
  let encoded = encode(&data);
  encoded
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      download_data_checksum,
      download_data_bundle
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
