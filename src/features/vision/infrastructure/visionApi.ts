/* infrastructure/visionApi.ts
   Encapsula la llamada HTTP multipart/form-data al endpoint de reconocimiento.
*/

const API_BASE = (process.env.EXPO_PUBLIC_API_BASE as string) || "https://foodlytics-api-production.up.railway.app";

export async function analyzeImage(photoUri: string, signal?: AbortSignal) {
  if (!photoUri) throw new Error("photoUri is required");

  console.log("[visionApi] analyzeImage start", { photoUri });

  const form = new FormData();

  // In React Native / Expo you pass an object with uri/name/type
  form.append("image", {
    uri: photoUri,
    name: "meal.jpg",
    type: "image/jpeg",
  } as any);

  const url = `${API_BASE}/recognition/analyze`;

  const resp = await fetch(url, {
    method: "POST",
    body: form,
    signal,
    // NOTE: Do not set Content-Type for FormData in RN — fetch will add the boundary
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    console.error("[visionApi] analyzeImage error", { status: resp.status, text });
    throw new Error(`Vision API error ${resp.status}: ${text}`);
  }

  const json = await resp.json();
  console.log("[visionApi] analyzeImage response", { url, jsonSample: json && typeof json === 'object' ? (Array.isArray(json.items) ? { itemsLength: json.items.length } : {}) : {} });
  return json;
}
