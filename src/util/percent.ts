export function percent(part: number, whole: number, fixedWidth: number = 3) {
  return `${((part / whole) * 100).toFixed(fixedWidth)}%`;
}
