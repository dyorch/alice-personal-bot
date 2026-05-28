import { SettingsView } from '@/components/settings-view';
import { EXPENSE_CATEGORIES, incomingMessages } from '@/lib/data';

export default async function ConfiguracionPage() {
  const messages = await incomingMessages();
  const last = messages[0];
  return (
    <SettingsView
      initialCategories={[...EXPENSE_CATEGORIES]}
      botPhone={process.env.ALLOWED_PHONE ?? '51987654321'}
      lastMessageIso={last?.createdAt ?? new Date().toISOString()}
    />
  );
}
