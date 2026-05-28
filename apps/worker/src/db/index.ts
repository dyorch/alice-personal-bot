import { createDb, type Db } from './client.js';
import { expenseRepo } from './repositories/expense.js';
import { messageLogRepo } from './repositories/message-log.js';
import { reminderRepo } from './repositories/reminder.js';
import { watchlistRepo } from './repositories/watchlist.js';

export { createDb };
export type { Db };
export { expenseRepo, reminderRepo, watchlistRepo, messageLogRepo };
export { nowIso } from './client.js';

/** Factory que devuelve los repositorios listos para usar. */
export function createRepos(d1: D1Database) {
  const db = createDb(d1);
  return {
    db,
    expenses: expenseRepo(db),
    reminders: reminderRepo(db),
    watchlist: watchlistRepo(db),
    messages: messageLogRepo(db),
  };
}

export type Repos = ReturnType<typeof createRepos>;
