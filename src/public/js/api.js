async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("bsh_token");

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": "Bearer " + token } : {})
    }
  });

  const text = await res.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    throw new Error(data?.message || "API Error");
  }

  return data;
}
