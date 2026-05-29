import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, type RenderOptions } from '@testing-library/react';
import { createElement, type ReactElement, type ReactNode } from 'react';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function makeWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

export function renderWithClient(ui: ReactElement, options?: RenderOptions) {
  const client = createTestQueryClient();
  return { client, ...render(ui, { wrapper: makeWrapper(client), ...options }) };
}

export function renderHookWithClient<TResult, TProps>(
  hook: (initialProps: TProps) => TResult,
  options?: { initialProps?: TProps },
) {
  const client = createTestQueryClient();
  const result = renderHook(hook, { wrapper: makeWrapper(client), ...options });
  return { client, ...result };
}
