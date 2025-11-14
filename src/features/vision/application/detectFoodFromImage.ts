import { analyzeImage } from "../infrastructure/visionApi";
import { saveDetection } from "../infrastructure/detectCache";
import type { DetectionResponse, RawVisionResponse, DetectedItem } from "../domain/detection";

function mapItem(raw: any): DetectedItem {
  // If the backend returns approximate_weight, treat it as grams
  if (raw && (raw.approximate_weight !== undefined && raw.approximate_weight !== null)) {
    const qty = Number(raw.approximate_weight) || 0;
    return {
      name: raw.name ?? raw.label ?? "Desconocido",
      qty,
      unit: "g",
      kcal: Number(raw.kcal ?? raw.calories ?? 0),
      p: Number(raw.p ?? raw.protein ?? 0),
      c: Number(raw.c ?? raw.carbs ?? 0),
      f: Number(raw.f ?? raw.fats ?? 0),
    } as DetectedItem;
  }

  return {
    name: raw.name ?? raw.label ?? "Desconocido",
    qty: Number.isFinite(raw.qty) ? raw.qty : Number(raw.quantity ?? raw.amount ?? 1),
    unit: raw.unit ?? raw.u ?? raw.measure ?? "unidad",
    kcal: Number(raw.kcal ?? raw.calories ?? 0),
    p: Number(raw.p ?? raw.protein ?? 0),
    c: Number(raw.c ?? raw.carbs ?? 0),
    f: Number(raw.f ?? raw.fats ?? 0),
  } as DetectedItem;
}

export async function detectFoodFromImage(photoUri: string, opts?: { timeoutMs?: number }): Promise<{ detection: DetectionResponse; resultId?: string }> {
  const controller = new AbortController();
  const timeout = opts?.timeoutMs ?? 30_000;
  const t = setTimeout(() => controller.abort(), timeout);

  try {
    console.log("[detectFoodFromImage] calling analyzeImage", { photoUri, timeout });
    const raw: RawVisionResponse = await analyzeImage(photoUri, controller.signal);
    console.log("[detectFoodFromImage] raw response sample", { keys: raw && typeof raw === 'object' ? Object.keys(raw).slice(0,6) : typeof raw });

    // Normalización flexible según shape del backend
    // El backend puede devolver:
    // - { items: [...] }
    // - { detected: [...] }
    // - un array en `data`
    // - o directamente un objeto con campos { name, kcal, protein, ... }
    let itemsRaw: any[] = [];
    let dishName: string | undefined = undefined;
    if (Array.isArray(raw?.items)) itemsRaw = raw.items;
    else if (Array.isArray(raw?.detected)) itemsRaw = raw.detected;
    else if (Array.isArray(raw?.data)) itemsRaw = raw.data;
    else if (raw && typeof raw === "object" && (raw.name || raw.label)) itemsRaw = [raw];
    // New backend shape may include dish_name
    if (raw && typeof raw === "object" && raw.dish_name) dishName = String(raw.dish_name);

    // Map raw item entries into DetectedItem. Support two shapes:
    // 1) items with per-gram fields: approximate_weight + *_per_gram
    // 2) items with total fields (kcal, protein, etc.) or previously supported shapes
    const mappedItems: DetectedItem[] = Array.isArray(itemsRaw)
      ? itemsRaw.map((rawItem: any) => {
          // per-gram shape
          const hasPerGram = rawItem && (rawItem.kcal_per_gram !== undefined || rawItem.protein_per_gram !== undefined || rawItem.carbs_per_gram !== undefined || rawItem.fats_per_gram !== undefined);
          if (hasPerGram && rawItem.approximate_weight !== undefined && rawItem.approximate_weight !== null) {
            const qty = Number(rawItem.approximate_weight) || 0;
            const kcalPer = Number(rawItem.kcal_per_gram ?? 0);
            const proteinPer = Number(rawItem.protein_per_gram ?? 0);
            const carbsPer = Number(rawItem.carbs_per_gram ?? 0);
            const fatsPer = Number(rawItem.fats_per_gram ?? 0);
            const kcal = qty * kcalPer;
            const p = qty * proteinPer;
            const c = qty * carbsPer;
            const f = qty * fatsPer;
            return {
              name: rawItem.name ?? rawItem.label ?? "Desconocido",
              qty,
              unit: "g",
              kcal: Number(kcal),
              p: Number(p),
              c: Number(c),
              f: Number(f),
            } as DetectedItem;
          }

          // fallback to previous mapper
          return mapItem(rawItem);
        })
      : [];

    // Ensure totals reflect the sum of mapped items (unless backend provides totals)
    const computedTotals = mappedItems.reduce(
      (acc, it) => {
        acc.kcal += Number(it.kcal ?? 0);
        acc.proteinG += Number(it.p ?? 0);
        acc.carbsG += Number(it.c ?? 0);
        acc.fatG += Number(it.f ?? 0);
        return acc;
      },
      { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
    );

    const totals = {
      kcal: Number(raw?.kcal ?? raw?.totals?.kcal ?? computedTotals.kcal),
      proteinG: Number(raw?.protein ?? raw?.totals?.protein ?? raw?.totals?.proteinG ?? computedTotals.proteinG),
      carbsG: Number(raw?.carbs ?? raw?.totals?.carbsG ?? computedTotals.carbsG),
      fatG: Number(raw?.fats ?? raw?.totals?.fatG ?? computedTotals.fatG),
    };

    const detection: DetectionResponse = { items: mappedItems, totals, dishName };
    console.log("[detectFoodFromImage] mapped result", { itemsCount: mappedItems.length, totals, dishName });

    try {
      const resultId = saveDetection(detection);
      console.log("[detectFoodFromImage] saved detection to cache", { resultId, cacheSize: undefined });
      return { detection, resultId };
    } catch (e) {
      console.warn('[detectFoodFromImage] could not save detection to cache', e);
      return { detection };
    }
  } finally {
    clearTimeout(t);
  }
}
