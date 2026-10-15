import * as db from './db.js';
import { GRADES, schedule, isDue, startOfDay, addDays } from './srs.js';

const $app = document.getElementById('app');
const EXAM_DATE = new Date(2027, 1, 21); // Prova PM-PE (AOCP): 21/02/2027
const MASTERED_DAYS = 21; // intervalo a partir do qual o cartão conta como "dominado"

// ---------- Utilidades ----------
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const fold = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Data local no formato AAAA-MM-DD (o toISOString usaria o fuso UTC).
const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const today = () => dayKey();

const ICON = {
  back: '<svg viewBox="0 0 24 24"><path d="M19 12H5m6-7-7 7 7 7"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></svg>',
  target: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
  flame: '<svg viewBox="0 0 24 24"><path d="M12 2c.6 3.3 2.4 5 4.2 6.9C18 10.8 19.5 13 19.5 15.6 19.5 19.7 16.2 23 12 23s-7.5-3.3-7.5-7.4c0-2.3 1-4.1 2.3-5.5.3 1.7 1.2 3 2.6 3.6C9 9.6 10 5.6 12 2Z"/></svg>',
  trophy: '<svg viewBox="0 0 24 24"><path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.4A5 5 0 0 1 13 14.9V18h3v3H8v-3h3v-3.1A5 5 0 0 1 8.4 12H8a4 4 0 0 1-4-4V5h3zm0 4H6v1a2 2 0 0 0 1 1.7zm10 0v2.7A2 2 0 0 0 18 8V7z"/></svg>',
};

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 2200);
}

// Marca a aba ativa e esconde a barra inferior nas telas de foco (estudo).
function setChrome({ focus = false } = {}) {
  document.body.classList.toggle('focus', focus);
  const hash = location.hash || '#/';
  document.querySelectorAll('.tabbar a').forEach((a) => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === '#/' ? !/^#\/(search|io)/.test(hash) : hash.startsWith(href));
  });
}

function navBar(title, backHref, right = '', sub = '') {
  return `<header class="nav">
    ${backHref ? `<a class="icon-btn" href="${backHref}" aria-label="Voltar">${ICON.back}</a>` : '<span></span>'}
    <h1>${esc(title)}${sub ? `<small>${esc(sub)}</small>` : ''}</h1>
    ${right || '<span></span>'}
  </header>`;
}

// Folha de ações no estilo do iOS. options: [{ label, danger, onClick }]
function actionSheet(title, options) {
  const root = document.getElementById('sheet-root');
  root.innerHTML = `
    <div class="sheet-bg" data-close></div>
    <div class="sheet" role="dialog" aria-label="${esc(title)}">
      <div class="sheet-group">
        <div class="sheet-title">${esc(title)}</div>
        ${options.map((o, i) => `<button data-i="${i}" class="${o.danger ? 'danger' : ''}">${esc(o.label)}</button>`).join('')}
      </div>
      <button class="cancel" data-close>Cancelar</button>
    </div>`;
  const close = () => (root.innerHTML = '');
  root.querySelectorAll('[data-close]').forEach((el) => (el.onclick = close));
  root.querySelectorAll('[data-i]').forEach((el) => {
    el.onclick = () => {
      close();
      options[Number(el.dataset.i)].onClick();
    };
  });
}

function cardState(card) {
  if (card.repetitions === 0 && card.lastReviewedAt === null) return 'new';
  if (card.intervalDays >= MASTERED_DAYS) return 'mastered';
  return 'learning';
}

const STATE = {
  new: { label: 'Novo', many: 'Novos', color: 'var(--new)' },
  learning: { label: 'Aprendendo', many: 'Em aprendizado', color: 'var(--learning)' },
  mastered: { label: 'Dominado', many: 'Dominados', color: 'var(--mastered)' },
};

function countStates(cards) {
  const n = { new: 0, learning: 0, mastered: 0, due: 0, dueNew: 0 };
  for (const c of cards) {
    const s = cardState(c);
    n[s]++;
    if (isDue(c)) {
      n.due++;
      if (s === 'new') n.dueNew++;
    }
  }
  return n;
}

function dueLabel(card) {
  if (isDue(card)) return cardState(card) === 'new' ? 'para estudar' : 'revisar hoje';
  const days = Math.round((startOfDay(new Date(card.dueDate)) - startOfDay()) / 86400000);
  return days === 1 ? 'amanhã' : `em ${days} dias`;
}

// Intervalo por extenso para os botões de avaliação.
function intervalText(days) {
  if (days <= 0) return 'minutos';
  if (days === 1) return '1 dia';
  if (days < 30) return `${days} dias`;
  if (days < 365) {
    const m = Math.round(days / 30);
    return m === 1 ? '1 mês' : `${m} meses`;
  }
  const y = (Math.round((days / 365) * 10) / 10).toString().replace('.', ',');
  return y === '1' ? '1 ano' : `${y} anos`;
}

// Cor estável por baralho, a partir do nome.
function deckHue(name) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)) % 360;
  return h;
}

function deckIcon(name) {
  const words = name.split(/\s+/).filter((w) => w.length > 2 || /^[A-Z]{2,}$/.test(w));
  const letters = (words.length > 1 ? words[0][0] + words[words.length - 1][0] : name.slice(0, 2)).toUpperCase();
  const h = deckHue(name);
  return `<span class="deck-icon" style="background:linear-gradient(150deg,hsl(${h} 75% 62%),hsl(${(h + 40) % 360} 70% 48%))">${esc(letters)}</span>`;
}

// Anel de progresso. segments: [{ value, color }]
function ring(segments, size, stroke, label) {
  const r = (size - stroke) / 2;
  const len = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0);
  const gap = segments.filter((s) => s.value).length > 1 ? stroke * 0.9 : 0;
  let offset = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const part = (s.value / total) * len;
      const dash = Math.max(part - gap, 0.01);
      const arc = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${s.color}" stroke-width="${stroke}"
        stroke-dasharray="${dash} ${len}" stroke-dashoffset="${-offset}"/>`;
      offset += part;
      return arc;
    })
    .join('');
  return `<div class="ring ${size > 130 ? 'big' : ''}" style="width:${size}px;height:${size}px">
    <svg viewBox="0 0 ${size} ${size}"><circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"/>${arcs}</svg>
    <div class="label">${label}</div>
  </div>`;
}

function stackedBar(n, total, cls = '') {
  if (!total) return `<div class="bar ${cls}"></div>`;
  return `<div class="bar ${cls}">${['new', 'learning', 'mastered']
    .filter((k) => n[k])
    .map((k) => `<i style="width:${(n[k] / total) * 100}%;background:${STATE[k].color}"></i>`)
    .join('')}</div>`;
}

// Dias com estudo: histórico salvo + último dia de revisão de cada cartão (cobre o que veio antes do histórico).
function studyDays(log, cards) {
  const days = new Set(Object.keys(log).filter((k) => log[k] > 0));
  for (const c of cards) if (c.lastReviewedAt) days.add(dayKey(new Date(c.lastReviewedAt)));
  return days;
}

function streakInfo(days) {
  // A sequência continua viva se hoje ainda não estudou mas estudou ontem.
  let d = days.has(today()) ? new Date() : addDays(new Date(), -1);
  let current = 0;
  while (days.has(dayKey(d))) {
    current++;
    d = addDays(d, -1);
  }
  let best = 0;
  for (const k of days) {
    const [y, m, dd] = k.split('-').map(Number);
    if (days.has(dayKey(new Date(y, m - 1, dd - 1)))) continue; // não é início de sequência
    let len = 0;
    let x = new Date(y, m - 1, dd);
    while (days.has(dayKey(x))) {
      len++;
      x = addDays(x, 1);
    }
    best = Math.max(best, len);
  }
  return { current, best };
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

async function createDeck() {
  const name = prompt('Nome do novo baralho:');
  if (!name || !name.trim()) return;
  const deck = db.newDeck(name);
  await db.putDeck(deck);
  location.hash = `#/deck/${deck.id}`;
}

// ---------- Telas ----------
async function viewHome() {
  setChrome();
  const [decks, cards, log] = await Promise.all([db.getDecks(), db.getCards(), db.getStudyLog()]);
  const byDeck = new Map(decks.map((d) => [d.id, []]));
  for (const c of cards) byDeck.get(c.deckId)?.push(c);
  const all = countStates(cards);
  const days = studyDays(log, cards);
  const { current, best } = streakInfo(days);
  const doneToday = log[today()] || 0;
  const studiedToday = days.has(today());

  const now = new Date();
  const weekStart = addDays(startOfDay(now), -now.getDay());
  const week = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
    .map((letter, i) => {
      const d = addDays(weekStart, i);
      const on = days.has(dayKey(d));
      const isToday = i === now.getDay();
      const future = d > now && !isToday;
      return `<div class="${isToday ? 'today' : ''}"><div class="d">${letter}</div>
        <div class="dot ${on ? 'on' : ''} ${future ? 'future' : ''}">${on ? ICON.flame : ''}</div></div>`;
    })
    .join('');

  const examDays = Math.ceil((startOfDay(EXAM_DATE) - startOfDay()) / 86400000);
  const dateLabel = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, (c) => c.toUpperCase());
  const hour = now.getHours();
  const hello = hour < 12 ? 'Bom dia!' : hour < 18 ? 'Boa tarde!' : 'Boa noite!';

  const streakMsg = studiedToday
    ? `Hoje: ${plural(doneToday || 1, 'resposta', 'respostas')}. Recorde: ${plural(Math.max(best, current), 'dia', 'dias')}.`
    : current
      ? 'Estude hoje para não perder a sequência.'
      : 'Responda um cartão hoje para começar.';

  $app.innerHTML = `
    <header class="home-head">
      <div>
        <p class="eyebrow">${esc(dateLabel)}</p>
        <h1>${hello}</h1>
        ${examDays > 0 ? `<span class="exam-chip">${ICON.target} Prova da PM-PE em ${plural(examDays, 'dia', 'dias')}</span>` : ''}
      </div>
      <a class="icon-btn filled" href="#/search" aria-label="Buscar">${ICON.search}</a>
    </header>

    <section class="panel">
      <div class="streak-top">
        <div class="streak-flame ${current ? '' : 'off'}">${ICON.flame}</div>
        <div>
          <div class="streak-num">${current}<small>${current === 1 ? 'dia seguido' : 'dias seguidos'}</small></div>
          <div class="streak-sub">${streakMsg}</div>
        </div>
      </div>
      <div class="week">${week}</div>
    </section>

    <section class="panel today-panel">
      ${ring(
        all.due
          ? [{ value: all.dueNew, color: 'var(--new)' }, { value: all.due - all.dueNew, color: 'var(--good)' }]
          : [{ value: 1, color: 'var(--good)' }],
        112, 11,
        all.due ? `<b>${all.due}</b><small>para hoje</small>` : `<b style="color:var(--good)">${ICON.check}</b><small>em dia</small>`
      )}
      <div class="info">
        <h3>${all.due ? 'Revisão de hoje' : 'Tudo revisado!'}</h3>
        <p>${all.due ? `${plural(all.dueNew, 'novo', 'novos')} · ${plural(all.due - all.dueNew, 'para revisar', 'para revisar')}` : 'Volte amanhã ou crie cartões novos.'}</p>
        <a class="btn btn-primary btn-block" href="#/review/all" ${all.due ? '' : 'aria-disabled="true"'}>${ICON.play} Revisar tudo</a>
      </div>
    </section>

    <div class="section-head"><h2>Meus baralhos</h2><span>${plural(cards.length, 'cartão', 'cartões')}</span></div>
    <div class="deck-list">
      ${decks
        .map((d) => {
          const list = byDeck.get(d.id);
          const n = countStates(list);
          return `<a class="deck" href="#/deck/${d.id}">
            ${deckIcon(d.name)}
            <span class="deck-main">
              <div class="deck-name">${esc(d.name)}</div>
              <div class="deck-sub">${plural(list.length, 'cartão', 'cartões')}${list.length ? ` · ${Math.round((n.mastered / list.length) * 100)}% dominado` : ''}</div>
              ${stackedBar(n, list.length)}
            </span>
            ${n.due ? `<span class="pill">${n.due}</span>` : `<span class="pill ok">${ICON.check}</span>`}
          </a>`;
        })
        .join('') || '<div class="empty">Nenhum baralho ainda. Toque em + para criar.</div>'}
    </div>
    <button class="fab" id="add-deck" aria-label="Novo baralho">${ICON.plus}</button>`;
  document.getElementById('add-deck').onclick = createDeck;
}

async function viewDeck(id) {
  const deck = await db.getDeck(id);
  if (!deck) return (location.hash = '#/');
  setChrome();
  const cards = await db.getCards(id);
  cards.sort((a, b) => Number(isDue(b)) - Number(isDue(a)) || new Date(a.dueDate) - new Date(b.dueDate));
  const n = countStates(cards);
  const dueReview = n.due - n.dueNew;
  const q = sessionStorage.getItem('deckq:' + id) || '';

  $app.innerHTML = `
    ${navBar(deck.name, '#/', `<button class="icon-btn" id="menu" aria-label="Opções do baralho">${ICON.more}</button>`)}
    <div class="has-cta">
      <section class="panel today-panel">
        ${ring(
          n.due
            ? [{ value: n.dueNew, color: 'var(--new)' }, { value: dueReview, color: 'var(--good)' }]
            : [{ value: 1, color: 'var(--good)' }],
          150, 14,
          n.due ? `<b>${n.due}</b><small>para hoje</small>` : `<b style="color:var(--good)">${ICON.check}</b><small>em dia</small>`
        )}
        <ul class="legend">
          <li><span class="sw" style="background:var(--new)"></span>Novos <b>${n.dueNew}</b></li>
          <li><span class="sw" style="background:var(--good)"></span>Para revisar <b>${dueReview}</b></li>
        </ul>
      </section>

      <section class="panel">
        <h2>${plural(cards.length, 'cartão no baralho', 'cartões no baralho')}</h2>
        ${stackedBar(n, cards.length, 'thick')}
        <ul class="legend inline">
          ${['new', 'learning', 'mastered']
            .map((k) => `<li><span class="sw" style="background:${STATE[k].color}"></span>${STATE[k].many}: <b>${n[k]}</b></li>`)
            .join('')}
        </ul>
      </section>

      <div class="toolbar">
        <label class="searchbox">${ICON.search}<input id="q" type="search" placeholder="Buscar neste baralho" value="${esc(q)}" autocomplete="off"></label>
        <a class="round-btn" href="#/new/${id}" aria-label="Novo cartão">${ICON.plus}</a>
      </div>
      <div class="cards" id="cards"></div>
    </div>
    <div class="sticky-cta">
      <a class="btn btn-primary btn-big" href="#/review/${id}" ${n.due ? '' : 'aria-disabled="true"'}>${n.due ? `${ICON.play} Estudar baralho` : 'Tudo em dia por hoje'}</a>
    </div>`;

  const indexed = cards.map((c) => ({ c, t: fold(c.front + '\n' + c.back) }));
  const $q = document.getElementById('q');
  const $cards = document.getElementById('cards');
  const run = () => {
    const term = fold($q.value.trim());
    try { sessionStorage.setItem('deckq:' + id, $q.value); } catch (_) {}
    const list = term ? indexed.filter((x) => x.t.includes(term)).map((x) => x.c) : cards;
    $cards.innerHTML =
      list
        .map((c) => {
          const s = STATE[cardState(c)];
          return `<a class="citem" href="#/card/${c.id}">
            <div class="citem-head"><span class="tag" style="color:${s.color}"><span class="sw" style="background:${s.color}"></span>${s.label}</span><span>${dueLabel(c)}</span></div>
            <div class="citem-front clamp">${esc(c.front)}</div>
            <div class="citem-back clamp">${esc(c.back)}</div>
          </a>`;
        })
        .join('') || `<div class="empty">${cards.length ? 'Nada encontrado.' : 'Nenhum cartão ainda. Toque em + para criar.'}</div>`;
  };
  $q.oninput = run;
  run();

  document.getElementById('menu').onclick = () =>
    actionSheet(deck.name, [
      {
        label: 'Renomear',
        onClick: async () => {
          const name = prompt('Novo nome do baralho:', deck.name);
          if (!name || !name.trim()) return;
          await db.putDeck({ ...deck, name: name.trim() });
          render();
        },
      },
      {
        label: 'Exportar JSON',
        onClick: async () => {
          const data = await db.exportCards(id);
          download(`flashcards-${deck.name}-${today()}.json`, JSON.stringify(data, null, 2));
        },
      },
      {
        label: 'Excluir baralho',
        danger: true,
        onClick: async () => {
          if (!confirm(`Excluir o baralho "${deck.name}" e seus ${cards.length} cartões?`)) return;
          await db.deleteDeck(id);
          toast('Baralho excluído');
          location.hash = '#/';
        },
      },
    ]);
}

async function viewCardForm(cardId, deckId) {
  const card = cardId ? await db.getCard(cardId) : null;
  if (cardId && !card) return (location.hash = '#/');
  setChrome();
  const decks = await db.getDecks();
  const currentDeck = card ? card.deckId : deckId;
  const backHref = currentDeck ? `#/deck/${currentDeck}` : '#/';
  const s = card ? STATE[cardState(card)] : null;
  $app.innerHTML = `
    ${navBar(card ? 'Editar cartão' : 'Novo cartão', backHref)}
    <form class="form" id="card-form">
      <label class="field">Baralho
        <select name="deck">${decks
          .map((d) => `<option value="${d.id}" ${d.id === currentDeck ? 'selected' : ''}>${esc(d.name)}</option>`)
          .join('')}</select>
      </label>
      <label class="field">Frente (pergunta)
        <textarea name="front" rows="4" required>${esc(card?.front)}</textarea>
      </label>
      <label class="field">Verso (resposta)
        <textarea name="back" rows="6" required>${esc(card?.back)}</textarea>
      </label>
      <button class="btn btn-primary btn-big" type="submit">Salvar</button>
      ${card ? `
        <section class="panel">
          <h2 style="color:${s.color}">${s.label}</h2>
          <p class="meta" style="margin-bottom:12px">Próxima revisão: ${dueLabel(card)}</p>
          <div class="stats-row">
            <div class="stat"><b>${card.repetitions}</b><small>acertos</small></div>
            <div class="stat"><b>${card.lapses}</b><small>erros</small></div>
            <div class="stat"><b>${card.intervalDays ? intervalText(card.intervalDays) : "–"}</b><small>intervalo</small></div>
          </div>
        </section>
        <button class="btn btn-danger" type="button" id="del">Excluir cartão</button>` : ''}
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
  setChrome({ focus: true });
  const backHref = deck ? `#/deck/${deck.id}` : '#/';

  if (!session || session.scope !== scope) {
    const [cards, decks] = await Promise.all([db.getCards(deck?.id), db.getDecks()]);
    const queue = cards.filter((c) => isDue(c));
    // Atrasados primeiro, depois embaralha os do mesmo dia.
    queue.sort((a, b) => startOfDay(new Date(a.dueDate)) - startOfDay(new Date(b.dueDate)) || Math.random() - 0.5);
    session = {
      scope,
      title: deck ? deck.name : 'Revisar tudo',
      queue,
      done: 0,
      correct: 0,
      deckNames: new Map(decks.map((d) => [d.id, d.name])),
    };
  }
  renderReviewCard(backHref);
}

async function renderDone(backHref) {
  const s = session;
  session = null;
  if (!s.done) {
    $app.innerHTML = `${navBar(s.title, backHref)}
      <section class="done"><h2>Nada para revisar agora</h2><p>Todos os cartões estão em dia.</p>
      <a class="btn btn-primary btn-big" href="${backHref}">Voltar</a></section>`;
    return;
  }
  const [log, cards] = await Promise.all([db.getStudyLog(), db.getCards()]);
  const { current } = streakInfo(studyDays(log, cards));
  const pct = Math.round((s.correct / s.done) * 100);
  $app.innerHTML = `${navBar(s.title, backHref)}
    <section class="done">
      <div class="done-badge">${ICON.trophy}</div>
      <h2>Sessão concluída!</h2>
      <p>${pct >= 80 ? 'Mandou muito bem.' : pct >= 50 ? 'Bom trabalho, continue assim.' : 'Os erros voltam logo para você fixar.'}</p>
      <div class="stats-row">
        <div class="stat"><b>${s.done}</b><small>respostas</small></div>
        <div class="stat"><b>${pct}%</b><small>acertos</small></div>
        <div class="stat"><b>${current}</b><small>${current === 1 ? 'dia seguido' : 'dias seguidos'}</small></div>
      </div>
      <a class="btn btn-primary btn-big" href="${backHref}">Concluir</a>
    </section>`;
}

function renderReviewCard(backHref) {
  const { queue } = session;
  if (!queue.length) return renderDone(backHref);
  const card = queue[0];
  const total = session.done + queue.length;
  const now = new Date();
  // Prazo de cada botão: minutos nas etapas de aprendizado, dias nas revisões.
  const preview = (g) => {
    const u = schedule(card, g, now);
    if (u.intervalDays) return intervalText(u.intervalDays);
    const min = Math.round((new Date(u.dueDate) - now) / 60000);
    return min === 1 ? '1 minuto' : `${min} minutos`;
  };
  const deckName = esc(session.deckNames.get(card.deckId) || '');
  const isNew = cardState(card) === 'new';
  $app.innerHTML = `
    <header class="nav">
      <a class="icon-btn" href="${backHref}" aria-label="Fechar">${ICON.close}</a>
      <h1>${session.done + 1}/${total}<small>${esc(session.title)}</small></h1>
      <a class="icon-btn" href="#/card/${card.id}" aria-label="Editar cartão"><svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/></svg></a>
    </header>
    <div class="progress"><i style="width:${(session.done / total) * 100}%"></i></div>
    <div class="review">
      <div class="flip" id="flip">
        <div class="flip-inner">
          <div class="face face-front">
            <div class="face-top"><span class="chip">${deckName}</span><span style="color:${isNew ? 'var(--new)' : 'var(--muted)'}">${isNew ? 'Novo' : 'Revisão'}</span></div>
            <div class="face-body"><div class="text">${esc(card.front)}</div></div>
            <div class="tap-hint">Toque para ver a resposta</div>
          </div>
          <div class="face face-back">
            <div class="face-top"><span class="chip">${deckName}</span><span>Resposta</span></div>
            <div class="face-body">
              <div class="text small">${esc(card.front)}</div>
              <hr>
              <div class="text answer">${esc(card.back)}</div>
            </div>
          </div>
        </div>
      </div>
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
    await db.logStudy(today());
    queue.shift();
    // Etapas em minutos voltam no fim da fila da mesma sessão.
    if (updated.intervalDays === 0) queue.push(updated);
    if (grade !== GRADES.AGAIN) s.correct++;
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
  setChrome();
  const q = sessionStorage.getItem('search') || '';
  $app.innerHTML = `
    ${navBar('Buscar')}
    <label class="searchbox" style="margin-bottom:14px">${ICON.search}<input id="q" type="search" placeholder="Buscar na frente ou no verso" value="${esc(q)}" autocomplete="off"></label>
    <div class="cards" id="results"></div>`;
  const [cards, decks] = await Promise.all([db.getCards(), db.getDecks()]);
  const names = new Map(decks.map((d) => [d.id, d.name]));
  const indexed = cards.map((c) => ({ c, t: fold(c.front + '\n' + c.back) }));
  const $q = document.getElementById('q');
  const $r = document.getElementById('results');
  const run = () => {
    const term = fold($q.value.trim());
    try { sessionStorage.setItem('search', $q.value); } catch (_) {}
    if (!term) return ($r.innerHTML = `<div class="empty">${plural(cards.length, 'cartão', 'cartões')} no total.</div>`);
    const hits = indexed.filter((x) => x.t.includes(term)).slice(0, 200);
    $r.innerHTML =
      hits
        .map(({ c }) => {
          const s = STATE[cardState(c)];
          return `<a class="citem" href="#/card/${c.id}">
            <div class="citem-head"><span class="tag"><span class="sw" style="background:${s.color}"></span>${esc(names.get(c.deckId))}</span><span>${dueLabel(c)}</span></div>
            <div class="citem-front clamp">${esc(c.front)}</div>
            <div class="citem-back clamp">${esc(c.back)}</div>
          </a>`;
        })
        .join('') || '<div class="empty">Nada encontrado.</div>';
  };
  $q.oninput = run;
  run();
  if (!q) $q.focus();
}

async function viewImportExport() {
  setChrome();
  const decks = await db.getDecks();
  $app.innerHTML = `
    ${navBar('Importar e exportar')}
    <section class="panel">
      <h2>Importar</h2>
      <p class="hint">Cole uma lista JSON no formato <code>[{"deck": "Português", "front": "pergunta", "back": "resposta"}]</code>. Baralhos novos são criados; cartões repetidos (mesmo baralho e mesma frente) são ignorados.</p>
      <div class="form">
        <textarea id="json" rows="7" placeholder='[ { "deck": "Português", "front": "...", "back": "..." } ]'></textarea>
        <div class="actions">
          <button class="btn btn-primary" id="import-text">Importar texto</button>
          <label class="btn">Escolher arquivo<input type="file" id="file" accept=".json,application/json,text/plain" hidden></label>
        </div>
      </div>
    </section>
    <section class="panel">
      <h2>Exportar</h2>
      <div class="form">
        <label class="field">Baralho
          <select id="exp-deck"><option value="">Todos os baralhos</option>${decks
            .map((d) => `<option value="${d.id}">${esc(d.name)}</option>`)
            .join('')}</select>
        </label>
        <div class="actions">
          <button class="btn" id="exp-file">Baixar arquivo</button>
          <button class="btn" id="exp-copy">Copiar JSON</button>
        </div>
        <p class="hint">A exportação leva só baralho, frente e verso (sem o progresso da revisão).</p>
      </div>
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
  document.getElementById('sheet-root').innerHTML = '';
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
