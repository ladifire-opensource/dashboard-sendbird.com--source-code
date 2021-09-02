export function getPageItemRange(page: number, pageSize: number, total: number): [number, number] | undefined {
  if (!total) {
    return [0, 0];
  }
  const startIndex = pageSize * (page - 1) + 1;
  if (startIndex > total || startIndex < 1) {
    return undefined;
  }
  return [startIndex, Math.min(total, pageSize * page)];
}
