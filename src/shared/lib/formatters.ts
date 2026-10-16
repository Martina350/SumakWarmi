import { businessStore } from '../domain/businessStore.ts';
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return 'Consultar precio';
  }
  return new Intl.NumberFormat(businessStore.getState().settings.locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat(businessStore.getState().settings.locale, {
      timeZone: businessStore.getState().settings.timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatShortDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat(businessStore.getState().settings.locale, {
      timeZone: businessStore.getState().settings.timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return isoString;
  }
}
