// Product catalog cache using IndexedDB (with localStorage fallback)
// T-065 — offline-first product catalog

import type { Product } from '@/types/catalog';

const DB_NAME = 'raos-cache';
const DB_VERSION = 1;
const STORE_PRODUCTS = 'products';
const STORE_META = 'meta';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
        db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META);
      }
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(db: IDBDatabase, store: string, mode: IDBTransactionMode) {
  return db.transaction(store, mode).objectStore(store);
}

function promisify<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((res, rej) => {
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

/** Save all products to IndexedDB */
export async function saveProducts(products: Product[]): Promise<void> {
  try {
    const db = await openDB();
    const store = tx(db, STORE_PRODUCTS, 'readwrite');
    await Promise.all(products.map((p) => promisify(store.put(p))));
    // Update last sync time
    const metaStore = db.transaction(STORE_META, 'readwrite').objectStore(STORE_META);
    await promisify(metaStore.put(new Date().toISOString(), 'lastSync'));
  } catch {
    // Fallback to localStorage (limited — only for small catalogs)
    try {
      localStorage.setItem('raos_product_cache', JSON.stringify(products));
      localStorage.setItem('raos_product_cache_sync', new Date().toISOString());
    } catch { /* storage full */ }
  }
}

/** Get all cached products */
export async function getCachedProducts(): Promise<Product[]> {
  try {
    const db = await openDB();
    const store = tx(db, STORE_PRODUCTS, 'readonly');
    const result = await promisify(store.getAll());
    if (result && result.length > 0) return result;
  } catch { /* fall through */ }

  // Fallback: localStorage
  try {
    const raw = localStorage.getItem('raos_product_cache');
    if (raw) return JSON.parse(raw) as Product[];
  } catch { /* ignore */ }

  return [];
}

/** Get last sync time (ISO string or null) */
export async function getLastSyncTime(): Promise<string | null> {
  try {
    const db = await openDB();
    const store = tx(db, STORE_META, 'readonly');
    const result = await promisify(store.get('lastSync'));
    return (result as string) ?? null;
  } catch { /* fall through */ }

  return localStorage.getItem('raos_product_cache_sync');
}

/** Clear cached products */
export async function clearProductCache(): Promise<void> {
  try {
    const db = await openDB();
    await promisify(tx(db, STORE_PRODUCTS, 'readwrite').clear());
    await promisify(tx(db, STORE_META, 'readwrite').clear());
  } catch { /* ignore */ }
  localStorage.removeItem('raos_product_cache');
  localStorage.removeItem('raos_product_cache_sync');
}

/** Check if cache is fresh (< maxAgeMinutes old) */
export async function isCacheFresh(maxAgeMinutes = 60): Promise<boolean> {
  const lastSync = await getLastSyncTime();
  if (!lastSync) return false;
  const ageMs = Date.now() - new Date(lastSync).getTime();
  return ageMs < maxAgeMinutes * 60 * 1000;
}
