import { createFileRoute } from '@tanstack/react-router';

import { NewReminderPage } from '@/pages/new-reminder-page';

export const Route = createFileRoute('/reminders/new')({
  component: NewReminderPage,
});
