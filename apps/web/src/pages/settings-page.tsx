import { SettingsView } from '@/components/settings-view';
import { Skeleton } from '@/components/ui/skeleton';
import { useMessagesList } from '@/hooks/use-messages';

export function SettingsPage() {
  const messagesQuery = useMessagesList({ limit: 200 });

  if (!messagesQuery.data) {
    return <Skeleton className="h-96" />;
  }
  const last = messagesQuery.data.find((m) => m.direction === 'in');
  return (
    <SettingsView
      botPhone={(import.meta.env.VITE_BOT_PHONE as string | undefined) ?? '51987654321'}
      lastMessageIso={last?.createdAt ?? new Date().toISOString()}
    />
  );
}
