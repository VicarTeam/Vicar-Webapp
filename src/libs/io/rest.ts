import {invoke} from "@tauri-apps/api/tauri";
import {SettingsData} from "@/libs/io/settings";

export async function get<T>(url: string, headers?: {[key: string]: string}): Promise<[number, T]> {
  const response = await invoke<[number, string]>("get_request", {url: buildUrl(url), headers: buildHeaders(headers)});
  return [response[0], JSON.parse(response[1])];
}

export async function post<T>(url: string, body?: any, headers?: {[key: string]: string}): Promise<[number, T]> {
  const response = await invoke<[number, string]>("post_request", {url: buildUrl(url), json: JSON.stringify(body || {}), headers: buildHeaders(headers)});
  return [response[0], JSON.parse(response[1])];
}

export async function patch<T>(url: string, body?: any, headers?: {[key: string]: string}): Promise<[number, T]> {
  const response = await invoke<[number, string]>("patch_request", {url: buildUrl(url), json: JSON.stringify(body || {}), headers: buildHeaders(headers)});
  return [response[0], JSON.parse(response[1])];
}

export async function put<T>(url: string, body?: any): Promise<[number, T]> {
  const response = await invoke<[number, string]>("put_request", {url: buildUrl(url), json: JSON.stringify(body || {})});
  return [response[0], JSON.parse(response[1])];
}

export async function del<T>(url: string, headers?: {[key: string]: string}): Promise<[number, T]> {
  const response = await invoke<[number, string]>("delete_request", {url: buildUrl(url), headers: buildHeaders(headers)});
  return [response[0], JSON.parse(response[1])];
}

function buildUrl(url: string) {
  const baseUrl = SettingsData.getVicarNetUrl();
  return `${baseUrl}${url}`;
}

function buildHeaders(headers?: {[key: string]: string}): ([string, string])[] {
  if (!headers) {
    return [];
  }

  return Object.entries(headers);
}