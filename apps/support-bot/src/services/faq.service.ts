import { FAQ_ENTRIES, FAQ_CATEGORIES, type FaqEntry } from '../data/faq-entries';

interface FaqMatch {
  entry: FaqEntry;
  score: number;
}

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Zа-яА-ЯёЁa-zA-Z0-9\s']/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

export function matchFaq(query: string): FaqMatch | null {
  const words = normalize(query);
  if (words.length === 0) return null;

  let best: FaqMatch | null = null;

  for (const entry of FAQ_ENTRIES) {
    const entryKeywords = entry.keywords.map((k) => k.toLowerCase());
    let matchCount = 0;

    for (const word of words) {
      for (const kw of entryKeywords) {
        if (kw.includes(word) || word.includes(kw)) {
          matchCount++;
          break;
        }
      }
    }

    const score = matchCount / Math.max(words.length, 1);
    if (score >= 0.4 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }

  return best;
}

export function getFaqByCategory(categoryId: string): FaqEntry[] {
  return FAQ_ENTRIES.filter((e) => e.category === categoryId);
}

export function getCategories() {
  return FAQ_CATEGORIES;
}

export function getFaqById(id: string): FaqEntry | undefined {
  return FAQ_ENTRIES.find((e) => e.id === id);
}

export function formatFaqAnswer(entry: FaqEntry, lang: 'uz' | 'ru' = 'ru'): string {
  const q = lang === 'uz' ? entry.question_uz : entry.question_ru;
  const a = lang === 'uz' ? entry.answer_uz : entry.answer_ru;
  return `❓ *${escMd(q)}*\n\n${escMd(a)}`;
}

function escMd(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}
