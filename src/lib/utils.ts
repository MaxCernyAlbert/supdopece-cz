// Pomocné funkce

// Formátování ceny s mezerami jako oddělovači tisíců (1 000 Kč místo 1000 Kč)
// Používá nezlomitelnou mezeru, aby se částka a měna nedělily na nový řádek
export function formatPrice(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}

// Formátování data z "2025-11-28" na "28.11.2025"
export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}

// Formátování ISO data na "28.11.2025"
export function formatISODate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

// Formátování ISO data včetně času "28.11.2025 v 14:30"
export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}.${month}.${year} v ${hours}:${minutes}`;
}
