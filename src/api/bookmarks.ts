export interface BookmarkEntry {
  name: string;
  url: string;
  folderPath: string;
  visitCount: number;
}

export async function fetchTopBookmarks(): Promise<BookmarkEntry[]> {
  const res = await fetch("/api/local/bookmarks");
  if (!res.ok) {
    throw new Error(`Bookmarks API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
