export async function fetchResource(url: string, init?: RequestInit) {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`Unable to load remote resource: ${response.status}`);
  }

  return response;
}
