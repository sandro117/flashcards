// Persistência local em IndexedDB (100% offline, sem backend).
import { SEED_DECKS, SEED_CARDS, SEED_UPDATES } from './seed.js';

const DB_NAME = 'flashcards';
const DB_VERSION = 1;
let dbPromise;

function open() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      db.createObjectStore('decks', { keyPath: 'id' });
      const cards = db.createObjectStore('cards', { keyPath: 'id' });
      cards.createIndex('deckId', 'deckId');
      db.createObjectStore('meta', { keyPath: 'key' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function promisify(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(stores, mode, fn) {
  const db = await open();
  const t = db.transaction(stores, mode);
  const result = await fn(t);
  await new Promise((resolve, reject) => {
    t.oncomplete = resolve;
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
  return result;
}

const uuid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
        const r = (Math.random() * 16) | 0;
        return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });

export function newDeck(name) {
  return { id: uuid(), name: name.trim(), createdAt: new Date().toISOString() };
}

export function newCard(deckId, front, back) {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    deckId,
    front,
    back,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    lapses: 0,
    dueDate: now,
    createdAt: now,
    lastReviewedAt: null,
  };
}

// ---------- Leitura ----------
export async function getDecks() {
  const decks = await tx(['decks'], 'readonly', (t) => promisify(t.objectStore('decks').getAll()));
  return decks.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export async function getDeck(id) {
  return tx(['decks'], 'readonly', (t) => promisify(t.objectStore('decks').get(id)));
}

export async function getCards(deckId) {
  return tx(['cards'], 'readonly', (t) => {
    const store = t.objectStore('cards');
    return promisify(deckId ? store.index('deckId').getAll(deckId) : store.getAll());
  });
}

export async function getCard(id) {
  return tx(['cards'], 'readonly', (t) => promisify(t.objectStore('cards').get(id)));
}

// ---------- Histórico de estudo (sequência de dias) ----------
// Guarda { "2026-10-15": respostasNoDia } na store "meta"; não mexe nos cartões.
export async function getStudyLog() {
  const row = await tx(['meta'], 'readonly', (t) => promisify(t.objectStore('meta').get('studyLog')));
  return row?.value || {};
}

export async function logStudy(dayKey) {
  return tx(['meta'], 'readwrite', async (t) => {
    const store = t.objectStore('meta');
    const row = await promisify(store.get('studyLog'));
    const value = row?.value || {};
    value[dayKey] = (value[dayKey] || 0) + 1;
    store.put({ key: 'studyLog', value });
  });
}

// ---------- Escrita ----------
export async function putDeck(deck) {
  return tx(['decks'], 'readwrite', (t) => promisify(t.objectStore('decks').put(deck)));
}

export async function putCard(card) {
  return tx(['cards'], 'readwrite', (t) => promisify(t.objectStore('cards').put(card)));
}

export async function deleteCard(id) {
  return tx(['cards'], 'readwrite', (t) => promisify(t.objectStore('cards').delete(id)));
}

export async function deleteDeck(id) {
  return tx(['decks', 'cards'], 'readwrite', async (t) => {
    const cards = t.objectStore('cards');
    const keys = await promisify(cards.index('deckId').getAllKeys(id));
    keys.forEach((k) => cards.delete(k));
    t.objectStore('decks').delete(id);
  });
}

// ---------- Importar / exportar (formato da seção 8) ----------
const norm = (s) => s.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');

export function parseImport(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error('JSON inválido: ' + e.message);
  }
  if (!Array.isArray(data)) throw new Error('O JSON precisa ser uma lista: [ { "deck", "front", "back" } ]');
  const items = [];
  data.forEach((it, i) => {
    if (!it || typeof it.deck !== 'string' || typeof it.front !== 'string' || typeof it.back !== 'string') {
      throw new Error(`Item ${i + 1} precisa ter "deck", "front" e "back" como texto.`);
    }
    if (it.deck.trim() && it.front.trim()) items.push(it);
  });
  return items;
}

// Cria baralhos que não existem e ignora duplicados (mesmo baralho + mesma frente).
export async function importCards(items) {
  const decks = await getDecks();
  const cards = await getCards();
  const deckByName = new Map(decks.map((d) => [norm(d.name), d]));
  const seen = new Set(cards.map((c) => c.deckId + '|' + norm(c.front)));
  const newDecks = [];
  const newCards = [];
  let skipped = 0;
  for (const it of items) {
    let deck = deckByName.get(norm(it.deck));
    if (!deck) {
      deck = newDeck(it.deck);
      deckByName.set(norm(it.deck), deck);
      newDecks.push(deck);
    }
    const key = deck.id + '|' + norm(it.front);
    if (seen.has(key)) {
      skipped++;
      continue;
    }
    seen.add(key);
    newCards.push(newCard(deck.id, it.front.trim(), it.back.trim()));
  }
  await tx(['decks', 'cards'], 'readwrite', (t) => {
    newDecks.forEach((d) => t.objectStore('decks').put(d));
    newCards.forEach((c) => t.objectStore('cards').put(c));
  });
  return { added: newCards.length, skipped, newDecks: newDecks.length };
}

export async function exportCards(deckId) {
  const decks = await getDecks();
  const names = new Map(decks.map((d) => [d.id, d.name]));
  const cards = await getCards(deckId);
  cards.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return cards.map((c) => ({ deck: names.get(c.deckId) || '', front: c.front, back: c.back }));
}

// ---------- Primeira execução e cartões novos ----------
const getMeta = (key) => tx(['meta'], 'readonly', (t) => promisify(t.objectStore('meta').get(key)));
const setMeta = (key, value) => tx(['meta'], 'readwrite', (t) => promisify(t.objectStore('meta').put({ key, value })));

export async function ensureSeeded() {
  if (!(await getMeta('seeded'))) {
    const existing = await getDecks();
    const names = new Set(existing.map((d) => norm(d.name)));
    const decks = SEED_DECKS.filter((n) => !names.has(norm(n))).map(newDeck);
    await tx(['decks'], 'readwrite', (t) => decks.forEach((d) => t.objectStore('decks').put(d)));
    await importCards(SEED_CARDS);
    await setMeta('seeded', true);
  }
  // Atualizações: importa cada lote uma vez só (duplicados são ignorados pelo importCards).
  const done = (await getMeta('seedVersion'))?.value || 1;
  const pending = SEED_UPDATES.filter((u) => u.version > done).sort((a, b) => a.version - b.version);
  for (const u of pending) {
    await importCards(u.cards);
    await setMeta('seedVersion', u.version);
  }
}

// Pede ao navegador para não apagar os dados em caso de pouco espaço.
export async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) await navigator.storage.persist();
  } catch (_) {}
}
