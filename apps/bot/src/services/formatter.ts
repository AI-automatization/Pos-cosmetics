// ─── Telegram message formatters (MarkdownV2) ─────────────────

function esc(text: string | number): string {
  return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

function money(amount: number): string {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(amount)) + " so'm";
}

// ─── /report — bugungi savdo xulosasi ─────────────────────────

export function formatDailyReport(data: {
  date: string;
  orders: { count: number; revenue: number; totalDiscount: number };
  returns: { count: number; total: number };
  netRevenue: number;
  payments: { method: string; amount: number }[];
  topProducts: { name: string; qty: number; revenue: number }[];
}): string {
  const paymentLines = data.payments
    .map((p) => `  • ${esc(p.method)}: ${esc(money(p.amount))}`)
    .join('\n') || '  _(yo\'q)_';

  const topLines = data.topProducts
    .map((p, i) => `  ${i + 1}\\. ${esc(p.name)} — ${esc(money(p.revenue))}`)
    .join('\n') || '  _(yo\'q)_';

  return `
📊 *Kunlik hisobot* — ${esc(data.date)}

🛒 *Buyurtmalar*
  Soni: ${esc(data.orders.count)} ta
  Jami: ${esc(money(data.orders.revenue))}
  Chegirma: ${esc(money(data.orders.totalDiscount))}

↩️ *Qaytarishlar*
  Soni: ${esc(data.returns.count)} ta
  Summa: ${esc(money(data.returns.total))}

💰 *Sof daromad: ${esc(money(data.netRevenue))}*

💳 *To'lov usullari*
${paymentLines}

🏆 *Top mahsulotlar*
${topLines}
`.trim();
}

// ─── Low stock alert ───────────────────────────────────────────

export function formatLowStockAlert(items: {
  tenantName: string;
  productName: string;
  sku: string | null;
  currentStock: number;
  minLevel: number;
}[]): string {
  if (items.length === 0) return '✅ Kam qolgan mahsulot yo\'q';

  const grouped = new Map<string, typeof items>();
  for (const item of items) {
    if (!grouped.has(item.tenantName)) grouped.set(item.tenantName, []);
    grouped.get(item.tenantName)!.push(item);
  }

  const lines: string[] = ['⚠️ *KAM QOLGAN MAHSULOTLAR*\n'];
  for (const [tenant, list] of grouped) {
    lines.push(`🏪 *${esc(tenant)}*`);
    for (const item of list) {
      const icon = item.currentStock <= 0 ? '🔴' : '🟡';
      lines.push(
        `  ${icon} ${esc(item.productName)}` +
        (item.sku ? ` \\(${esc(item.sku)}\\)` : '') +
        ` — ${esc(item.currentStock)} qoldi \\(min: ${esc(item.minLevel)}\\)`,
      );
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

// ─── Expiry alert ──────────────────────────────────────────────

export function formatExpiryAlert(items: {
  tenantName: string;
  productName: string;
  batchNumber: string | null;
  expiryDate: Date;
  daysLeft: number;
  qty: number;
}[]): string {
  if (items.length === 0) return '✅ Muddati yaqin mahsulot yo\'q';

  const lines: string[] = ['🗓 *MUDDATI YAQIN MAHSULOTLAR*\n'];

  for (const item of items) {
    const icon = item.daysLeft <= 7 ? '🔴' : item.daysLeft <= 14 ? '🟠' : '🟡';
    const date = item.expiryDate.toLocaleDateString('uz-UZ');
    lines.push(
      `${icon} ${esc(item.tenantName)} — *${esc(item.productName)}*\n` +
      `   Muddat: ${esc(date)} \\(${esc(item.daysLeft)} kun\\) | Qoldiq: ${esc(item.qty)}` +
      (item.batchNumber ? ` | Partiya: ${esc(item.batchNumber)}` : ''),
    );
  }

  return lines.join('\n').trim();
}

// ─── Suspicious refund alert ───────────────────────────────────

export function formatRefundAlert(item: {
  tenantName: string;
  returnId: string;
  amount: number;
  cashier: string;
  createdAt: Date;
}): string {
  const time = item.createdAt.toLocaleTimeString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    `🚨 *KATTA QAYTARISH ANIQLANDI*\n\n` +
    `🏪 Do'kon: ${esc(item.tenantName)}\n` +
    `💸 Summa: *${esc(money(item.amount))}*\n` +
    `👤 Kassir: ${esc(item.cashier)}\n` +
    `🕐 Vaqt: ${esc(time)}\n` +
    `🆔 ID: \`${esc(item.returnId)}\``
  );
}

// ─── /stock — mahsulot stok ma'lumoti ─────────────────────────

export function formatStockInfo(info: {
  productName: string;
  sku: string | null;
  barcode: string | null;
  sellPrice: number;
  costPrice: number;
  totalStock: number;
  warehouseBreakdown: { warehouseName: string; stock: number }[];
}): string {
  const wLines = info.warehouseBreakdown
    .map((w) => `  📦 ${esc(w.warehouseName)}: ${esc(w.stock)} dona`)
    .join('\n') || '  _(ma\'lumot yo\'q)_';

  return (
    `📦 *${esc(info.productName)}*\n\n` +
    (info.sku ? `🔖 SKU: \`${esc(info.sku)}\`\n` : '') +
    (info.barcode ? `🏷 Barcode: \`${esc(info.barcode)}\`\n` : '') +
    `\n💰 Narx: *${esc(money(info.sellPrice))}*\n` +
    `📊 Jami qoldiq: *${esc(info.totalStock)} dona*\n\n` +
    `🏪 Omborlar bo'yicha:\n${wLines}`
  );
}

// ─── /debt — mijoz qarzi ───────────────────────────────────────

export function formatDebtInfo(info: {
  customerName: string;
  phone: string;
  totalDebt: number;
  debtCount: number;
  overdueCount: number;
  debts: { remaining: number; dueDate: Date | null; status: string }[];
}): string {
  const icon = info.overdueCount > 0 ? '🔴' : '🟡';
  const debtLines = info.debts
    .slice(0, 5)
    .map((d) => {
      const due = d.dueDate ? d.dueDate.toLocaleDateString('uz-UZ') : '—';
      const statusIcon = d.status === 'OVERDUE' ? '🔴' : '🟡';
      return `  ${statusIcon} ${esc(money(d.remaining))} | Muddat: ${esc(due)}`;
    })
    .join('\n');

  return (
    `${icon} *${esc(info.customerName)}*\n` +
    `📱 Tel: ${esc(info.phone)}\n\n` +
    `💸 Jami qarz: *${esc(money(info.totalDebt))}*\n` +
    `📋 Qarzlar: ${esc(info.debtCount)} ta` +
    (info.overdueCount > 0 ? ` \\(${esc(info.overdueCount)} muddati o'tgan\\)` : '') +
    `\n\n${debtLines}`
  );
}

// ─── /shift — aktiv smenalar ───────────────────────────────────

export function formatShiftList(shifts: {
  tenantName: string;
  cashierName: string;
  openedAt: Date;
  ordersCount: number;
  revenue: number;
  hoursOpen: number;
}[]): string {
  if (shifts.length === 0) return '😴 Hozir ochiq smena yo\'q';

  const lines = shifts.map((s) => {
    const time = s.openedAt.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    return (
      `🏪 *${esc(s.tenantName)}*\n` +
      `  👤 ${esc(s.cashierName)} \\| ⏰ ${esc(time)} \\(${esc(s.hoursOpen)}h\\)\n` +
      `  🛒 ${esc(s.ordersCount)} buyurtma \\| 💰 ${esc(money(s.revenue))}`
    );
  });

  return `🔄 *AKTIV SMENALAR* \\(${esc(shifts.length)} ta\\)\n\n` + lines.join('\n\n');
}

export { money, esc };
