import { createFileRoute } from '@tanstack/react-router';

import { NewExpensePage } from '@/pages/new-expense-page';

export const Route = createFileRoute('/expenses/new')({
  component: NewExpensePage,
});
