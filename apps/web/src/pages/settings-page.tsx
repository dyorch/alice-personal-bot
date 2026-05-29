import { useQuery } from '@tanstack/react-query';

import { SettingsView } from '@/components/settings-view';
import { Skeleton } from '@/components/ui/skeleton';
import { api, queryKeys } from '@/lib/api-client';
import { EXPENSE_CATEGORIES } from '@/lib/derived';

export function SettingsPage() {
  const messagesQuery = useQuery({
    queryKey: queryKeys.messages.list({ limit: 200 }),
    queryFn: () => api.messages.list({ limit: 200 }),
  });

  if (!messagesQuery.data) {
    return <Skeleton className="h-96" />;
  }
  const last = messagesQuery.data.find((m) => m.direction === 'in');
  return (
    <SettingsView
      initialCategories={[...EXPENSE_CATEGORIES]}
      botPhone={(import.meta.env.VITE_BOT_PHONE as string | undefined) ?? '51987654321'}
      lastMessageIso={last?.createdAt ?? new Date().toISOString()}
    />
  );
}
