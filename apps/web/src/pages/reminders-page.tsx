import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RemindersView } from '@/components/reminders-view';
import { useRemindersList } from '@/hooks/use-reminders';

export function RemindersPage() {
  const remindersQuery = useRemindersList({ status: 'all', limit: 500 });

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Tus recordatorios programados.</p>
        <Button render={<Link to="/reminders/new" />}>
          <Plus /> Nuevo
        </Button>
      </div>
      {remindersQuery.data ? (
        <RemindersView reminders={remindersQuery.data} nowIso={new Date().toISOString()} />
      ) : (
        <Skeleton className="h-96" />
      )}
    </>
  );
}
