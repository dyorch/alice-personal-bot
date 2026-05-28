import { ActivityView } from '@/components/activity-view';
import { incomingMessages, messageLogStats } from '@/lib/data';

export default async function ActividadPage() {
  const [messages, stats] = await Promise.all([incomingMessages(), messageLogStats()]);
  return <ActivityView messages={messages} stats={stats} />;
}
