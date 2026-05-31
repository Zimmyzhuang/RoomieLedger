const FRACTIONS: [number, string][] = [
  [0.125, "\u215B"],
  [0.25, "\u00BC"],
  [0.333, "\u2153"],
  [0.5, "\u00BD"],
  [0.667, "\u2154"],
  [0.75, "\u00BE"],
];

export function formatAmount(num: number): string {
  if (!num || num === 0) return "";
  const whole = Math.floor(num);
  const dec = num - whole;

  if (dec < 0.06) return whole === 0 ? "" : String(whole);

  for (const [val, sym] of FRACTIONS) {
    if (Math.abs(dec - val) < 0.06) {
      return whole > 0 ? `${whole} ${sym}` : sym;
    }
  }

  return num % 1 === 0 ? String(num) : num.toFixed(1).replace(/\.0$/, "");
}
