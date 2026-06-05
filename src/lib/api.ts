async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  get: <T>(url: string) =>
    fetch(url).then((res) => handleResponse<T>(res)),

  post: <T>(url: string, data: unknown) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => handleResponse<T>(res)),

  put: <T>(url: string, data: unknown) =>
    fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => handleResponse<T>(res)),

  delete: <T>(url: string) =>
    fetch(url, { method: "DELETE" }).then((res) => handleResponse<T>(res)),
};
