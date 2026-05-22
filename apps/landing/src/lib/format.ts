/** Serverda ham, clientda ham bir xil natija — toLocaleString ishlatmaydi */
export function formatNumber(n: number): string {
  return Math.floor(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
