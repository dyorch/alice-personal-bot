import { createFileRoute } from '@tanstack/react-router';

import { RemindersPage } from '@/pages/reminders-page';

export const Route = createFileRoute('/reminders/')({
  component: RemindersPage,
});
