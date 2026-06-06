#!/usr/bin/env node
/**
 * RAOS Database Backup — Full export to JSON.gz
 * Usage: cd apps/api && node ../../scripts/backup-db.js
 */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL env required. Usage: DATABASE_URL=postgresql://... node backup-db.js'); process.exit(1); }
const BACKUP_DIR = path.join(require('os').homedir(), 'Desktop', 'RAOS_Backups');
const MAX_BACKUPS = 10;

const prisma = new PrismaClient({ datasourceUrl: DB_URL });

async function main() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const now = new Date();
  const ts = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);

  console.log('╔══════════════════════════════════════════╗');
  console.log('║     RAOS Database Backup                 ║');
  console.log('╚══════════════════════════════════════════╝\n');

  await prisma.$connect();
  console.log('  Connected to database\n');

  const data = {};
  const stats = [];
  let totalRows = 0;

  // Export each model explicitly
  const models = [
    'tenant', 'branch', 'user', 'unit', 'category', 'supplier',
    'product', 'productBarcode', 'productVariant', 'productPrice', 'productSupplier', 'productCertificate',
    'warehouse', 'stockMovement', 'stockSnapshot',
    'customer', 'shift', 'order', 'orderItem',
    'return', 'returnItem', 'paymentIntent',
    'debtRecord', 'debtPayment', 'expense',
    'promotion', 'property', 'rentalContract', 'rentalPayment',
    'task', 'notification', 'exchangeRate',
    'loyaltyAccount', 'loyaltyTransaction', 'loyaltyConfig',
    'tenantSettings', 'tenantSubscription', 'subscriptionPlan',
    'warehouseInvoice', 'warehouseInvoiceItem',
    'stockTransfer', 'stockTransferItem',
    'priceChange', 'bundleItem', 'featureFlag',
    'auditLog', 'eventLog', 'journalEntry', 'journalLine',
    'session', 'fcmToken', 'reminderLog',
    'adminUser', 'loginAttempt', 'userLock', 'pinAttempt',
    'zReport', 'syncOutbox', 'apiKey',
    'supportTicket', 'ticketMessage',
    'telegramLinkToken', 'botOtpToken', 'clientErrorLog',
  ];

  for (const m of models) {
    try {
      const rows = await prisma[m].findMany();
      data[m] = rows;
      stats.push({ name: m, count: rows.length });
      totalRows += rows.length;
      console.log(`  ${m.padEnd(28)} ${String(rows.length).padStart(6)} rows`);
    } catch {
      console.log(`  ${m.padEnd(28)}   SKIP`);
    }
  }

  console.log(`  ${'─'.repeat(36)}`);
  console.log(`  ${'TOTAL'.padEnd(28)} ${String(totalRows).padStart(6)} rows\n`);

  // Build backup object
  const backup = {
    _meta: { version: '1.0', timestamp: now.toISOString(), tables: stats },
    data,
  };

  // Serialize (handle BigInt/Decimal)
  const json = JSON.stringify(backup, (k, v) => {
    if (typeof v === 'bigint') return v.toString();
    if (v && typeof v === 'object' && v.constructor?.name === 'Decimal') return v.toString();
    return v;
  }, 2);

  // Save uncompressed JSON
  const jsonPath = path.join(BACKUP_DIR, `raos-backup-${ts}.json`);
  fs.writeFileSync(jsonPath, json, 'utf-8');
  console.log(`  JSON: ${jsonPath} (${(json.length / 1024).toFixed(0)} KB)`);

  // Save compressed
  const gzPath = path.join(BACKUP_DIR, `raos-backup-${ts}.json.gz`);
  const compressed = zlib.gzipSync(Buffer.from(json), { level: 6 });
  fs.writeFileSync(gzPath, compressed);
  console.log(`  GZIP: ${gzPath} (${(compressed.length / 1024).toFixed(0)} KB)`);

  // Rotate old backups
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('raos-backup-') && f.endsWith('.json.gz'))
    .sort().reverse();
  if (files.length > MAX_BACKUPS) {
    const old = files.slice(MAX_BACKUPS);
    for (const f of old) {
      fs.unlinkSync(path.join(BACKUP_DIR, f));
      const j = f.replace('.json.gz', '.json');
      if (fs.existsSync(path.join(BACKUP_DIR, j))) fs.unlinkSync(path.join(BACKUP_DIR, j));
    }
    console.log(`  Rotated: ${old.length} old backups removed`);
  }

  await prisma.$disconnect();

  console.log('\n╔══════════════════════════════════════════╗');
  console.log(`║  Backup complete: ${totalRows} rows, ${(compressed.length / 1024).toFixed(0)} KB`.padEnd(44) + '║');
  console.log('╚══════════════════════════════════════════╝');
}

main().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
