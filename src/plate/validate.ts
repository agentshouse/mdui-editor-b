/** Structural validation only. Unknown node types and metadata remain untouched. */
export function validatePlateValue(value: unknown): value is import('platejs').Value {
  let count = 0;
  const seen = new Set<object>();
  function node(item: unknown, depth: number, root = false): boolean {
    if (++count > 50000 || depth > 100 || !item || typeof item !== 'object' || Array.isArray(item) || seen.has(item)) return false;
    seen.add(item);
    const n = item as Record<string, unknown>;
    if (n.type === 'a' && typeof n.url !== 'string') return false;
    if ('text' in n) return !root && typeof n.text === 'string' && !('children' in n);
    return typeof n.type === 'string' && n.type.length > 0 && Array.isArray(n.children) && n.children.length > 0 && n.children.every(child => node(child, depth + 1));
  }
  if (!Array.isArray(value) || value.length === 0 || !value.every(item => node(item, 0, true))) return false;
  try { JSON.stringify(value); return true; } catch { return false; }
}
