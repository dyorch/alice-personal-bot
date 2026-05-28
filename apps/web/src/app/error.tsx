'use client';

import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="size-5" /> Error al cargar
        </CardTitle>
        <CardDescription>
          No se pudo obtener datos del worker. Asegúrate de que <code>wrangler dev</code>{' '}
          esté corriendo en el puerto 8787 y que <code>.env.local</code> esté completo.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-3 text-xs">
          {error.message}
        </pre>
        <div>
          <Button onClick={reset} variant="outline">
            Reintentar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
