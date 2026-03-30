/** Lista de origens CORS ou `true` se `CORS_ORIGIN` não estiver definido. */
export function parseCorsOrigins(): string[] | boolean {
  const raw = process.env.CORS_ORIGIN;
  if (!raw?.trim()) {
    return true;
  }
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length > 0 ? list : true;
}
