export type DetectedItem = {
  name: string;
  qty: number;
  unit: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
};

export type DetectionResponse = {
  items: DetectedItem[];
  totals: { kcal: number; proteinG: number; carbsG: number; fatG: number };
  dishName?: string;
};

export type RawVisionResponse = any; // backend shape may change — normalize in application layer
