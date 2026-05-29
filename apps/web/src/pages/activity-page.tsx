import { Skeleton } from '@/components/ui/skeleton';
import { ActivityView } from '@/components/activity-view';
import { useMessagesList, useMessagesStats } from '@/hooks/use-messages';

export function ActivityPage() {
  const messagesQuery = useMessagesList({ limit: 200 });
  const statsQuery = useMessagesStats();

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
