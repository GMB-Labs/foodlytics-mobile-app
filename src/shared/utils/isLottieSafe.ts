export function isLottieSafe(lottieJson: any): boolean {
  if (!lottieJson) return false;

  const raw = JSON.stringify(lottieJson);

  // ❌ Tiene expresiones (Android NO soporta esto)
  if (raw.includes('"x":') || raw.includes('$bm_rt')) return false;

  // ❌ Tiene comp() (Android falla)
  if (raw.includes('comp(')) return false;

  // ❌ Tiene efectos de AE
  if (raw.includes('effect(')) return false;

  return true;
}
