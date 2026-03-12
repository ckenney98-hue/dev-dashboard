const API_VERSION = "7.1";

export async function adoGet<T>(path: string, preview = false): Promise<T> {
  const separator = path.includes("?") ? "&" : "?";
  const version = preview ? `${API_VERSION}-preview` : API_VERSION;
  const url = `/api/ado/${path}${separator}api-version=${version}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`ADO API error: ${res.status} ${res.statusText} — ${url}`);
  }
  return res.json();
}

export async function adoPost<T>(path: string, body: unknown, preview = false): Promise<T> {
  const separator = path.includes("?") ? "&" : "?";
  const version = preview ? `${API_VERSION}-preview` : API_VERSION;
  const url = `/api/ado/${path}${separator}api-version=${version}`;

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
