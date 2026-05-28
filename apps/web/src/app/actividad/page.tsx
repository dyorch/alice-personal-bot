import { ActivityView } from '@/components/activity-view';
import { incomingMessages, messageLogStats } from '@/lib/mock-data';

export default function ActividadPage() {
  return <ActivityView messages={incomingMessages()} stats={messageLogStats()} />;
}
