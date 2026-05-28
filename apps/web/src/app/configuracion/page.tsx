import { SettingsView } from '@/components/settings-view';
import { EXPENSE_CATEGORIES, incomingMessages } from '@/lib/mock-data';

export default function ConfiguracionPage() {
  const last = incomingMessages()[0];
  return (
    <SettingsView
      initialCategories={[...EXPENSE_CATEGORIES]}
      botPhone="51987654321"
      lastMessageIso={last?.createdAt ?? new Date().toISOString()}
    />
  );
}
