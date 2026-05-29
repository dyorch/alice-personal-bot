import { useQuery } from '@tanstack/react-query';

import { Skeleton } from '@/components/ui/skeleton';
import { ActivityView } from '@/components/activity-view';
import { api, queryKeys } from '@/lib/api-client';

export function ActivityPage() {
  const messagesQuery = useQuery({
    queryKey: queryKeys.messages.list({ limit: 200 }),
    queryFn: () => api.messages.list({ limit: 200 }),
  });
  const statsQuery = useQuery({
    queryKey: queryKeys.messages.stats(),
    queryFn: () => api.messages.stats(),
  });

  if (!messagesQuery.data || !statsQuery.data) {
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </>
    );
  }

  const incoming = messagesQuery.data.filter((m) => m.direction === 'in');
  return <ActivityView messages={incoming} stats={statsQuery.data} />;
}
