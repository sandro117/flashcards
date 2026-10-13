import * as db from './db.js';
import { GRADES, schedule, isDue, formatInterval, startOfDay } from './srs.js';

const $app = document.getElementById('app');
const $title = document.getElementById('title');
const $back = document.getElementById('back');

// ---------- Utilidades ----------
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 2200);
}

function setHeader(title, backHref) {
  $title.textContent = title;
  $back.hidden = !backHref;
  $back.onclick = () => (location.hash = backHref);
  document.querySelectorAll('.tabbar a').forEach((a) => {
    a.classList.toggle('active', location.hash.startsWith(a.getAttribute('href')) || (a.getAttribute('href') === '#/' && (location.hash === '' || location.hash === '#/')));
  });
}

function dueLabel(card) {
  if (isDue(card)) return card.repetitions === 0 && card.lastReviewedAt === null ? 'novo' : 'hoje';
  const days = Math.round((startOfDay(new Date(card.dueDate)) - startOfDay()) / 86400000);
  return days === 1 ? 'amanhã' : `em ${days} dias`;
}

function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const today = () => new Date().toISOString().slice(0, 10);

// ---------- Telas ----------
async function viewHome() {
  setHeader('Flashcards');
  const [decks, cards] = await Promise.all([db.getDecks(), db.getCards()]);
  const stats = new Map(decks.map((d) => [d.id, { total: 0, due: 0 }]));
  let totalDue = 0;
  for (const c of cards) {
    const s = stats.get(c.deckId);
    if (!s) continue;
    s.total++;
    if (isDue(c)) {
      s.due++;
      totalDue++;
    }
  }
  $app.innerHTML = `
    <section class="hero">
      <div class="hero-num">${totalDue}</div>
      <div class="hero-label">${totalDue === 1 ? 'cartão para revisar hoje' : 'cartões para revisar hoje'}</div>
      <a class="btn btn-primary btn-big" href="#/review/all" ${totalDue ? '' : 'aria-disabled="true"'}>Revisar agora</a>
    </section>
    <div class="section-head">
      <h2>Baralhos</h2>
      <button class="btn btn-small" id="add-deck">+ Baralho</button>
    </div>
    <ul class="list">
      ${decks
        .map((d) => {
          const s = stats.get(d.id);
          return `<li>
            <a class="row" href="#/deck/${d.id}">
              <span class="row-main">${esc(d.name)}<small>${s.total} ${s.total === 1 ? 'cartão' : 'cartões'}</small></span>
              <span class="badge ${s.due ? '' : 'badge-zero'}">${s.due}</span>
            </a>
          </li>`;
        })
        .join('') || '<li class="empty">Nenhum baralho ainda.</li>'}
    </ul>`;
  document.getElementById('add-deck').onclick = async () => {
    const name = prompt('Nome do novo baralho:');
    if (!name || !name.trim()) return;
    await db.putDeck(db.newDeck(name));
    render();
  };
}

async function viewDeck(id) {
  const deck = await db.getDeck(id);
  if (!deck) return (location.hash = '#/');
  setHeader(deck.name, '#/');
  const cards = await db.getCards(id);
  cards.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const due = cards.filter((c) => isDue(c)).length;
  $app.innerHTML = `
    <div class="actions">
      <a class="btn btn-primary" href="#/review/${id}" ${due ? '' : 'aria-disabled="true"'}>Revisar (${due})</a>
      <a class="btn" href="#/new/${id}">+ Cartão</a>
    </div>
    <div class="actions actions-secondary">
      <button class="btn btn-small" id="rename">Renomear</button>
      <button class="btn btn-small" id="export">Exportar</button>
      <button class="btn btn-small btn-danger-text" id="delete">Excluir</button>
    </div>
    <ul class="list">
      ${cards
        .map(
          (c) => `<li><a class="row" href="#/card/${c.id}">
            <span class="row-main clamp">${esc(c.front)}</span>
            <span class="due">${dueLabel(c)}</span>
          </a></li>`
        )
        .join('') || '<li class="empty">Nenhum cartão neste baralho.</li>'}
    </ul>`;
  document.getElementById('rename').onclick = async () => {
    const name = prompt('Novo nome do baralho:', deck.name);
    if (!name || !name.trim()) return;
    await db.putDeck({ ...deck, name: name.trim() });
    render();
  };
  document.getElementById('export').onclick = async () => {
    const data = await db.exportCards(id);
    download(`flashcards-${deck.name}-${today()}.json`, JSON.stringify(data, null, 2));
  };
  document.getElementById('delete').onclick = async () => {
    if (!confirm(`Excluir o baralho "${deck.name}" e seus ${cards.length} cartões?`)) return;
    await db.deleteDeck(id);
    toast('Baralho excluído');
    location.hash = '#/';
  };
}

async function viewCardForm(cardId, deckId) {
  const card = cardId ? await db.getCard(cardId) : null;
  if (cardId && !card) return (location.hash = '#/');
  const decks = await db.getDecks();
  const currentDeck = card ? card.deckId : deckId;
  setHeader(card ? 'Editar cartão' : 'Novo cartão', currentDeck ? `#/deck/${currentDeck}` : '#/');
  $app.innerHTML = `
    <form class="form" id="card-form">
      <label>Baralho
        <select name="deck">${decks
          .map((d) => `<option value="${d.id}" ${d.id === currentDeck ? 'selected' : ''}>${esc(d.name)}</option>`)
          .join('')}</select>
      </label>
      <label>Frente (pergunta)
        <textarea name="front" rows="4" required>${esc(card?.front)}</textarea>
      </label>
      <label>Verso (resposta)
        <textarea name="back" rows="6" required>${esc(card?.back)}</textarea>
      </label>
      <button class="btn btn-primary btn-big" type="submit">Salvar</button>
      ${card ? '<button class="btn btn-danger-text" type="button" id="del">Excluir cartão</button>' : ''}
      ${card ? `<p class="meta">Revisões seguidas: ${card.repetitions} · Erros: ${card.lapses} · Intervalo: ${card.intervalDays}d · Próxima: ${dueLabel(card)}</p>` : ''}
    </form>`;
  const form = document.getElementById('card-form');
  if (!card) form.front.focus();
  form.onsubmit = async (e) => {
    e.preventDefault();
    const front = form.front.value.trim();
    const back = form.back.value.trim();
    if (!front || !back) return;
    const deck = form.deck.value;
    if (card) {
      await db.putCard({ ...card, front, back, deckId: deck });
      toast('Cartão salvo');
      location.hash = `#/deck/${deck}`;
    } else {
      await db.putCard(db.newCard(deck, front, back));
      toast('Cartão criado');
      form.front.value = '';
      form.back.value = '';
      form.front.focus();
    }
  };
  if (card) {
    document.getElementById('del').onclick = async () => {
      if (!confirm('Excluir este cartão?')) return;
      await db.deleteCard(card.id);
      toast('Cartão excluído');
      location.hash = `#/deck/${card.deckId}`;
    };
  }
}

// Sessão de revisão: sem limite diário. "Errei" volta para o fim da fila.
let session = null;

async function viewReview(scope) {
  const deck = scope === 'all' ? null : await db.getDeck(scope);
  if (scope !== 'all' && !deck) return (location.hash = '#/');
  const backHref = deck ? `#/deck/${deck.id}` : '#/';
  setHeader(deck ? deck.name : 'Revisar tudo', backHref);

  if (!session || session.scope !== scope) {
    const [cards, decks] = await Promise.all([db.getCards(deck?.id), db.getDecks()]);
    const queue = cards.filter((c) => isDue(c));
    // Atrasados primeiro, depois embaralha os do mesmo dia.
    queue.sort((a, b) => startOfDay(new Date(a.dueDate)) - startOfDay(new Date(b.dueDate)) || Math.random() - 0.5);
    session = { scope, queue, done: 0, deckNames: new Map(decks.map((d) => [d.id, d.name])) };
  }
  renderReviewCard(backHref);
}

function renderReviewCard(backHref) {
  const { queue } = session;
  if (!queue.length) {
    $app.innerHTML = `
      <section class="hero">
        <div class="hero-num">✓</div>
        <div class="hero-label">${session.done ? `Revisão concluída! ${session.done} ${session.done === 1 ? 'resposta' : 'respostas'}.` : 'Nada para revisar agora.'}</div>
        <a class="btn btn-primary btn-big" href="${backHref}">Voltar</a>
      </section>`;
    session = null;
    return;
  }
  const card = queue[0];
  const preview = (g) => formatInterval(schedule(card, g).intervalDays);
  $app.innerHTML = `
    <div class="review">
      <div class="progress">${queue.length} ${queue.length === 1 ? 'restante' : 'restantes'} · ${esc(session.deckNames.get(card.deckId) || '')}</div>
      <div class="flip" id="flip">
        <div class="flip-inner">
          <div class="face face-front"><div class="text">${esc(card.front)}</div></div>
          <div class="face face-back">
            <div class="text small">${esc(card.front)}</div>
            <hr>
            <div class="text">${esc(card.back)}</div>
          </div>
        </div>
      </div>
      <a class="edit-link" href="#/card/${card.id}">Editar cartão</a>
    </div>
    <div class="bottom-bar" id="bar">
      <button class="btn btn-primary btn-big" id="show">Mostrar resposta</button>
    </div>`;
  const reveal = () => {
    document.getElementById('flip').classList.add('flipped');
    document.getElementById('bar').innerHTML = `
      <div class="grades">
        <button class="grade g-again" data-g="${GRADES.AGAIN}">Errei<small>${preview(GRADES.AGAIN)}</small></button>
        <button class="grade g-hard" data-g="${GRADES.HARD}">Difícil<small>${preview(GRADES.HARD)}</small></button>
        <button class="grade g-good" data-g="${GRADES.GOOD}">Bom<small>${preview(GRADES.GOOD)}</small></button>
        <button class="grade g-easy" data-g="${GRADES.EASY}">Fácil<small>${preview(GRADES.EASY)}</small></button>
      </div>`;
    document.querySelectorAll('.grade').forEach((b) => (b.onclick = () => answer(Number(b.dataset.g))));
    session.revealed = true;
  };
  const s = session;
  const answer = async (grade) => {
    if (s.busy) return;
    s.busy = true;
    const updated = schedule(card, grade);
    await db.putCard(updated);
    queue.shift();
    if (grade === GRADES.AGAIN) queue.push(updated);
    s.done++;
    s.busy = false;
    s.revealed = false;
    if (session === s) renderReviewCard(backHref);
  };
  session.revealed = false;
  session.reveal = reveal;
  session.answer = answer;
  document.getElementById('show').onclick = reveal;
  document.getElementById('flip').onclick = () => !session.revealed && reveal();
}

// Atalhos de teclado (útil no computador): espaço mostra, 1–4 avaliam.
document.addEventListener('keydown', (e) => {
  if (!session || !location.hash.startsWith('#/review') || e.target.closest('input,textarea,select')) return;
  if (!session.revealed && (e.key === ' ' || e.key === 'Enter')) {
    e.preventDefault();
    session.reveal();
  } else if (session.revealed && ['1', '2', '3', '4'].includes(e.key)) {
    session.answer([GRADES.AGAIN, GRADES.HARD, GRADES.GOOD, GRADES.EASY][Number(e.key) - 1]);
  }
});

async function viewSearch() {
  setHeader('Buscar');
  const q = sessionStorage.getItem('search') || '';
  $app.innerHTML = `
    <input class="search" id="q" type="search" placeholder="Buscar na frente ou no verso" value="${esc(q)}" autocomplete="off">
    <ul class="list" id="results"></ul>`;
  const [cards, decks] = await Promise.all([db.getCards(), db.getDecks()]);
  const names = new Map(decks.map((d) => [d.id, d.name]));
  const indexed = cards.map((c) => ({ c, t: fold(c.front + '\n' + c.back) }));
  const $q = document.getElementById('q');
  const $r = document.getElementById('results');
  const run = () => {
    const term = fold($q.value.trim());
    try { sessionStorage.setItem('search', $q.value); } catch (_) {}
    if (!term) return ($r.innerHTML = `<li class="empty">${cards.length} cartões no total.</li>`);
    const hits = indexed.filter((x) => x.t.includes(term)).slice(0, 200);
    $r.innerHTML =
      hits
        .map(
          ({ c }) => `<li><a class="row" href="#/card/${c.id}">
            <span class="row-main clamp">${esc(c.front)}<small>${esc(names.get(c.deckId))} · ${esc(c.back.slice(0, 80))}</small></span>
          </a></li>`
        )
        .join('') || '<li class="empty">Nada encontrado.</li>';
  };
  $q.oninput = run;
  run();
  if (!q) $q.focus();
}

async function viewImportExport() {
  setHeader('Importar e exportar');
  const decks = await db.getDecks();
  $app.innerHTML = `
    <section class="card-box">
      <h2>Importar</h2>
      <p class="hint">Cole uma lista JSON no formato <code>[{"deck": "Português", "front": "pergunta", "back": "resposta"}]</code>. Baralhos novos são criados; cartões repetidos (mesmo baralho e mesma frente) são ignorados.</p>
      <textarea id="json" rows="8" placeholder='[ { "deck": "Português", "front": "...", "back": "..." } ]'></textarea>
      <div class="actions">
        <button class="btn btn-primary" id="import-text">Importar texto</button>
        <label class="btn">Escolher arquivo<input type="file" id="file" accept=".json,application/json,text/plain" hidden></label>
      </div>
    </section>
    <section class="card-box">
      <h2>Exportar</h2>
      <label>Baralho
        <select id="exp-deck"><option value="">Todos os baralhos</option>${decks
          .map((d) => `<option value="${d.id}">${esc(d.name)}</option>`)
          .join('')}</select>
      </label>
      <div class="actions">
        <button class="btn" id="exp-file">Baixar arquivo</button>
        <button class="btn" id="exp-copy">Copiar JSON</button>
      </div>
      <p class="hint">A exportação leva só baralho, frente e verso (sem o progresso da revisão).</p>
    </section>`;

  const doImport = async (text) => {
    try {
      const items = db.parseImport(text);
      const r = await db.importCards(items);
      toast(`${r.added} importados, ${r.skipped} repetidos ignorados${r.newDecks ? `, ${r.newDecks} baralho(s) novo(s)` : ''}`);
      return true;
    } catch (e) {
      alert(e.message);
      return false;
    }
  };
  document.getElementById('import-text').onclick = async () => {
    const ta = document.getElementById('json');
    if (!ta.value.trim()) return ta.focus();
    if (await doImport(ta.value)) ta.value = '';
  };
  document.getElementById('file').onchange = async (e) => {
    const file = e.target.files[0];
    if (file) await doImport(await file.text());
    e.target.value = '';
  };
  const getExport = async () => {
    const deckId = document.getElementById('exp-deck').value || undefined;
    return JSON.stringify(await db.exportCards(deckId), null, 2);
  };
  document.getElementById('exp-file').onclick = async () => download(`flashcards-${today()}.json`, await getExport());
  document.getElementById('exp-copy').onclick = async () => {
    const text = await getExport();
    try {
      await navigator.clipboard.writeText(text);
      toast('JSON copiado');
    } catch (_) {
      document.getElementById('json').value = text;
      toast('Não deu para copiar; o JSON foi colocado no campo acima');
    }
  };
}

// ---------- Rotas ----------
async function render() {
  const [, route, arg] = (location.hash || '#/').split('/');
  if (route !== 'review') session = null;
  window.scrollTo(0, 0);
  switch (route) {
    case 'deck': return viewDeck(arg);
    case 'card': return viewCardForm(arg);
    case 'new': return viewCardForm(null, arg);
    case 'review': return viewReview(arg || 'all');
    case 'search': return viewSearch();
    case 'io': return viewImportExport();
    default: return viewHome();
  }
}

window.addEventListener('hashchange', render);

(async () => {
  await db.ensureSeeded();
  db.requestPersistence();
  render();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
})();
