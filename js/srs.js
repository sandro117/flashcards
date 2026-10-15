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

// Etapas curtas (em minutos) para cartões novos ou errados, como no Anki.
export const STEPS_MIN = { AGAIN: 5, HARD: 10 };

const addMinutes = (date, min) => new Date(date.getTime() + min * 60000);

// Calcula o novo estado do cartão sem alterá-lo.
// Cartão em aprendizado (novo ou errado): Errei 5 min, Difícil 10 min, Bom 1 dia, Fácil 2 dias.
// Cartão em revisão: SM-2 da seção 7, com Difícil < Bom < Fácil sempre distintos.
export function schedule(card, grade, now = new Date()) {
  const c = { ...card };
  const learning = c.repetitions === 0;
  let due;
  switch (grade) {
    case GRADES.AGAIN:
      c.lapses += 1;
      c.easeFactor = Math.max(1.3, c.easeFactor - 0.2);
      c.repetitions = 0;
      c.intervalDays = 0;
      due = addMinutes(now, STEPS_MIN.AGAIN);
      break;
    case GRADES.HARD:
      if (learning) {
        c.intervalDays = 0;
        due = addMinutes(now, STEPS_MIN.HARD);
      } else {
        const good = goodInterval(c);
        c.intervalDays = Math.max(1, Math.min(Math.round(c.intervalDays * 1.2), good - 1));
        c.easeFactor = Math.max(1.3, c.easeFactor - 0.15);
        c.repetitions += 1;
      }
      break;
    case GRADES.GOOD:
      c.intervalDays = goodInterval(c);
      c.repetitions += 1;
      break;
    case GRADES.EASY: {
      const good = goodInterval(c);
      c.intervalDays = learning ? 2 : Math.max(good + 1, Math.round(good * 1.3));
      c.easeFactor += 0.15;
      c.repetitions += 1;
      break;
    }
    default:
      throw new Error('Nota inválida: ' + grade);
  }
  c.easeFactor = Math.round(c.easeFactor * 100) / 100;
  c.dueDate = (due || addDays(startOfDay(now), c.intervalDays)).toISOString();
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
