export function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

export function generateOrderNumber(sequence: number): string {
  return `SW-${sequence.toString().padStart(6, '0')}`;
}
