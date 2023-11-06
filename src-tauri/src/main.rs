// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate base64;

use base64::encode;

#[tauri::command]
async fn download_data_checksum() -> Result<String, String> {
    let res = reqwest::get(
        "https://github.com/VicarTeam/VicarData/releases/latest/download/checksum.sha256",
    )
    .await;
    if res.is_err() {
        return Err("Failed to download checksum".to_string());
    }

    let data = res.unwrap().text().await;
    if data.is_err() {
        return Err("Failed to read checksum".to_string());
    }

    Ok(data.unwrap())
}

#[tauri::command]
async fn download_data_bundle() -> Result<String, String> {
    let res =
        reqwest::get("https://github.com/VicarTeam/VicarData/releases/latest/download/bundle.zip")
            .await;
    if res.is_err() {
        return Err("Failed to download bundle".to_string());
    }

    let data = res.unwrap().bytes().await;
    if data.is_err() {
        return Err("Failed to read bundle".to_string());
    }

    let encoded = encode(&data.unwrap());
    Ok(encoded)
}

#[tauri::command]
async fn post_request(url: String, json: String) -> Result<(u16, String), String> {
    let res = reqwest::Client::builder().build().unwrap()
        .post(&url)
        .header("Content-Type", "application/json")
        .body(json)
        .send()
        .await;
    if res.is_err() {
        return Err("Failed to send POST request".to_string());
    }

    let response = res.unwrap();
    let status = response.status().as_u16();
    let body = response.text().await;
    if body.is_err() {
        return Err("Failed to read POST response body".to_string());
    }

    Ok((status, body.unwrap()))
}

#[tauri::command]
async fn get_request(url: String) -> Result<(u16, String), String> {
    let res = reqwest::get(&url).await;
    if res.is_err() {
        return Err("Failed to send GET request".to_string());
    }

    let response = res.unwrap();
    let status = response.status().as_u16();
    let body = response.text().await;
    if body.is_err() {
        return Err("Failed to read GET response body".to_string());
    }

    Ok((status, body.unwrap()))
}

#[tauri::command]
async fn patch_request(url: String, json: String) -> Result<(u16, String), String> {
    let res = reqwest::Client::builder().build().unwrap()
        .patch(&url)
        .header("Content-Type", "application/json")
        .body(json)
        .send()
        .await;
    if res.is_err() {
        return Err("Failed to send PATCH request".to_string());
    }

    let response = res.unwrap();
    let status = response.status().as_u16();
    let body = response.text().await;
    if body.is_err() {
        return Err("Failed to read PATCH response body".to_string());
    }

    Ok((status, body.unwrap()))
}

#[tauri::command]
async fn put_request(url: String, json: String) -> Result<(u16, String), String> {
    let res = reqwest::Client::builder().build().unwrap()
        .put(&url)
        .header("Content-Type", "application/json")
        .body(json)
        .send()
        .await;
    if res.is_err() {
        return Err("Failed to send PUT request".to_string());
    }

    let response = res.unwrap();
    let status = response.status().as_u16();
    let body = response.text().await;
    if body.is_err() {
        return Err("Failed to read PUT response body".to_string());
    }

    Ok((status, body.unwrap()))
}

#[tauri::command]
async fn delete_request(url: String) -> Result<(u16, String), String> {
    let res = reqwest::Client::builder().build().unwrap().delete(&url).send().await;
    if res.is_err() {
        return Err("Failed to send DELETE request".to_string());
    }

    let response = res.unwrap();
    let status = response.status().as_u16();
    let body = response.text().await;
    if body.is_err() {
        return Err("Failed to read DELETE response body".to_string());
    }

    Ok((status, body.unwrap()))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            download_data_checksum,
            download_data_bundle,
            post_request,
            get_request,
            patch_request,
            put_request,
            delete_request
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
