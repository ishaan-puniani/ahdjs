//@ts-nocheck

export function normalizeDimension(val: any): string | number | undefined {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed.endsWith('%') ? trimmed : trimmed;
  }
  return typeof val === 'number' ? val : parseInt(val);
}

export function normalizeDimensionToStyle(val: any): string {
  if (val === undefined || val === null) return '';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (/[a-z%]/i.test(trimmed)) {
      return trimmed;
    }
    return `${trimmed}px`;
  }
  return typeof val === 'number' ? `${val}px` : '';
}
