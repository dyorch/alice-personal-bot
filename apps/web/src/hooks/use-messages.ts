import { useQuery } from '@tanstack/react-query';

import type { MessageLogQuery } from '@alice/shared';

import { queryKeys } from '@/lib/query-keys';
import { messagesService } from '@/services/messages.service';

export function useMessagesList(q: Partial<MessageLogQuery> = {}, opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.messages.list(q),
    queryFn: () => messagesService.list(q),
    enabled: opts?.enabled ?? true,
  });
}

export function useMessagesStats() {
  return useQuery({
    queryKey: queryKeys.messages.stats(),
    queryFn: () => messagesService.stats(),
  });
}

export function useMessage(id: number, opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.messages.detail(id),
    queryFn: () => messagesService.get(id),
    enabled: (opts?.enabled ?? true) && id > 0,
  });
}
