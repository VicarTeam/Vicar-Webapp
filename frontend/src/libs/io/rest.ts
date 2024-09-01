import { SettingsData } from "@/libs/io/settings";

export async function get<T>(url: string, headers?: { [key: string]: string }): Promise<[number, T]> {
  const response = await fetch(buildUrl(url), {
    method: "GET",
    headers: buildHeaders(headers),
  });
  return [response.status, await response.json()];
}

export async function post<T>(url: string, body?: any, headers?: { [key: string]: string }): Promise<[number, T]> {
  const response = await fetch(buildUrl(url), {
    method: "POST",
    headers: buildHeaders(headers),
    body: JSON.stringify(body || {}),
  });
  return [response.status, await response.json()];
}

export async function patch<T>(url: string, body?: any, headers?: { [key: string]: string }): Promise<[number, T]> {
  const response = await fetch(buildUrl(url), {
    method: "PATCH",
    headers: buildHeaders(headers),
    body: JSON.stringify(body || {}),
  });
  return [response.status, await response.json()];
}

export async function put<T>(url: string, body?: any, headers?: { [key: string]: string }): Promise<[number, T]> {
  const response = await fetch(buildUrl(url), {
    method: "PUT",
    headers: buildHeaders(headers),
    body: JSON.stringify(body || {}),
  });
  return [response.status, await response.json()];
}

export async function del<T>(url: string, headers?: { [key: string]: string }): Promise<[number, T]> {
  const response = await fetch(buildUrl(url), {
    method: "DELETE",
    headers: buildHeaders(headers),
  });
  return [response.status, await response.json()];
}

function buildUrl(url: string) {
  const baseUrl = SettingsData.getVicarNetUrl();
  return `${baseUrl}${url}`;
}

function buildHeaders(headers?: { [key: string]: string }): Headers {
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  return new Headers({
    ...defaultHeaders,
    ...headers,
  });
}
