import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export async function generateRender(prompt) {
  const { data } = await api.post("/generate", { prompt });
  return data; // { job_id, status, message }
}

export async function pollStatus(jobId) {
  const { data } = await api.get(`/status/${jobId}`);
  return data; // { job_id, status, image_url, error, params, elapsed }
}

export async function checkHealth() {
  const { data } = await api.get("/health");
  return data;
}

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}
