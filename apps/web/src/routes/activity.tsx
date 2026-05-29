import { createFileRoute } from '@tanstack/react-router';

import { ActivityPage } from '@/pages/activity-page';

export const Route = createFileRoute('/activity')({
  component: ActivityPage,
});
