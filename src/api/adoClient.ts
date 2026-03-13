const API_VERSION = "7.1";

interface FetchOptions {
  preview?: boolean;
  skipVersion?: boolean;
  apiVersion?: string;
}

export async function adoGet<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  let url = `/api/ado/${path}`;
  if (!opts.skipVersion) {
    const separator = path.includes("?") ? "&" : "?";
    const base = opts.apiVersion || API_VERSION;
    const version = opts.preview ? `${base}-preview` : base;
    url += `${separator}api-version=${version}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`ADO API error: ${res.status} ${res.statusText} — ${url}`);
  }
  return res.json();
}

export async function adoPost<T>(path: string, body: unknown, opts: FetchOptions = {}): Promise<T> {
  let url = `/api/ado/${path}`;
  if (!opts.skipVersion) {
    const separator = path.includes("?") ? "&" : "?";
    const base = opts.apiVersion || API_VERSION;
    const version = opts.preview ? `${base}-preview` : base;
    url += `${separator}api-version=${version}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`ADO API error: ${res.status} ${res.statusText} — ${url}`);
  }
  return res.json();
}
