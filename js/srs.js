// Repetição espaçada: SM-2 simplificado (seção 7 do contexto).
export const GRADES = { AGAIN: 0, HARD: 3, GOOD: 4, EASY: 5 };

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isDue(card, now = new Date()) {
  return new Date(card.dueDate).getTime() <= endOfDay(now).getTime();
}

function goodInterval(card) {
  if (card.repetitions === 0) return 1;
  if (card.repetitions === 1) return 3;
  return Math.round(card.intervalDays * card.easeFactor);
}

// Calcula o novo estado do cartão sem alterá-lo.
export function schedule(card, grade, now = new Date()) {
  const c = { ...card };
  switch (grade) {
    case GRADES.AGAIN:
      c.repetitions = 0;
      c.intervalDays = 0;
      c.lapses += 1;
      c.easeFactor = Math.max(1.3, c.easeFactor - 0.2);
      break;
    case GRADES.HARD:
      c.intervalDays = c.repetitions === 0 ? 1 : Math.max(1, Math.round(c.intervalDays * 1.2));
      c.easeFactor = Math.max(1.3, c.easeFactor - 0.15);
      c.repetitions += 1;
      break;
    case GRADES.GOOD:
      c.intervalDays = goodInterval(c);
      c.repetitions += 1;
      break;
    case GRADES.EASY:
      c.intervalDays = Math.max(1, Math.round(goodInterval(c) * 1.3));
      c.easeFactor += 0.15;
      c.repetitions += 1;
      break;
    default:
      throw new Error('Nota inválida: ' + grade);
  }
  c.easeFactor = Math.round(c.easeFactor * 100) / 100;
  c.dueDate = addDays(startOfDay(now), c.intervalDays).toISOString();
  c.lastReviewedAt = now.toISOString();
  return c;
}

// Texto curto do intervalo para mostrar nos botões ("agora", "1d", "3d", "2m").
export function formatInterval(days) {
  if (days <= 0) return 'agora';
  if (days < 30) return days + 'd';
  if (days < 365) return Math.round(days / 30) + 'm';
  return (Math.round((days / 365) * 10) / 10).toString().replace('.', ',') + 'a';
}
