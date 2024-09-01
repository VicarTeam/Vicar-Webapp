import { SettingsData } from "@/libs/io/settings";

export async function get<T>(url: string, headers?: { [key: string]: string }): Promise<[number, T]> {
  const response = await fetch(buildUrl(url), {
    method: "GET",
    headers: buildHeaders(headers),
  });
  return [response.status, response.status === 200 ? await response.json() : {message: await response.text()}];
}

export async function post<T>(url: string, body?: any, headers?: { [key: string]: string }): Promise<[number, T]> {
  const response = await fetch(buildUrl(url), {
    method: "POST",
    headers: buildHeaders(headers),
    body: JSON.stringify(body || {}),
  });
  return [response.status, response.status === 200 ? await response.json() : {message: await response.text()}];
}

export async function patch<T>(url: string, body?: any, headers?: { [key: string]: string }): Promise<[number, T]> {
  const response = await fetch(buildUrl(url), {
    method: "PATCH",
    headers: buildHeaders(headers),
    body: JSON.stringify(body || {}),
  });
  return [response.status, response.status === 200 ? await response.json() : {message: await response.text()}];
}

export async function put<T>(url: string, body?: any, headers?: { [key: string]: string }): Promise<[number, T]> {
  const response = await fetch(buildUrl(url), {
    method: "PUT",
    headers: buildHeaders(headers),
    body: JSON.stringify(body || {}),
  });
  return [response.status, response.status === 200 ? await response.json() : {message: await response.text()}];
}

export async function del<T>(url: string, headers?: { [key: string]: string }): Promise<[number, T]> {
  const response = await fetch(buildUrl(url), {
    method: "DELETE",
    headers: buildHeaders(headers),
  });
  return [response.status, response.status === 200 ? await response.json() : {message: await response.text()}];
}

function buildUrl(url: string) {
  return `${process.env.VUE_APP_API_URL}${url}`;
}

function buildHeaders(headers?: { [key: string]: string }): Headers {
  const defaultHeaders: any = {
    "Content-Type": "application/json",
  };

  const session = localStorage.getItem("vicar:session");
  if (session) {
    defaultHeaders["Authorization"] = session;
  }

  return new Headers({
    ...defaultHeaders,
    ...headers,
  });
}
