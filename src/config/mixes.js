import { API_BASE_URL } from "../config/api";

export async function uploadMix(formData) {
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  return res.json();
}
