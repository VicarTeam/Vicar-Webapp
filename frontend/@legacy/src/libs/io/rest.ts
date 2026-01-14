import {checkSession, getAccessToken, refreshIfNeeded} from "@/libs/auth";

export async function get<T>(url: string, headers?: { [key: string]: string }): Promise<[number, T]> {
  const h = await buildHeaders(headers);
  const response = await fetch(buildUrl(url), {
    method: "GET",
    headers: h,
  });
  return [response.status, response.status === 200 ? await response.json() : {message: await response.text()}];
}

export async function post<T>(url: string, body?: any, headers?: { [key: string]: string }): Promise<[number, T]> {
  const h = await buildHeaders(headers);
  const response = await fetch(buildUrl(url), {
    method: "POST",
    headers: h,
    body: JSON.stringify(body || {}),
  });
  return [response.status, response.status === 200 ? await response.json() : {message: await response.text()}];
}

export async function patch<T>(url: string, body?: any, headers?: { [key: string]: string }): Promise<[number, T]> {
  const h = await buildHeaders(headers);
  const response = await fetch(buildUrl(url), {
    method: "PATCH",
    headers: h,
    body: JSON.stringify(body || {}),
  });
  return [response.status, response.status === 200 ? await response.json() : {message: await response.text()}];
}

export async function put<T>(url: string, body?: any, headers?: { [key: string]: string }): Promise<[number, T]> {
  const h = await buildHeaders(headers);
  const response = await fetch(buildUrl(url), {
    method: "PUT",
    headers: h,
    body: JSON.stringify(body || {}),
  });
  return [response.status, response.status === 200 ? await response.json() : {message: await response.text()}];
}

export async function del<T>(url: string, headers?: { [key: string]: string }): Promise<[number, T]> {
  const h = await buildHeaders(headers);
  const response = await fetch(buildUrl(url), {
    method: "DELETE",
    headers: h,
  });
  return [response.status, response.status === 200 ? await response.json() : {message: await response.text()}];
}

function buildUrl(url: string) {
  return `${(import.meta as any).env.VITE_APP_API_URL}${url}`;
}

async function buildHeaders(headers?: { [key: string]: string }): Promise<Headers> {
  const defaultHeaders: any = {
    "Content-Type": "application/json",
  };

  const status = await checkSession();
  if (status.status === "needs_refresh") {
    await refreshIfNeeded().catch(() => void 0);
  }

  if (status.status === "ok") {
    defaultHeaders["Authorization"] = `Bearer ${status.accessToken}`;
  } else if (status.status === "needs_refresh") {
    defaultHeaders["Authorization"] = `Bearer ${await getAccessToken()}`;
  }

  return new Headers({
    ...defaultHeaders,
    ...headers,
  });
}
